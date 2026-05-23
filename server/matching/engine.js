/**
 * Matching Engine
 * 
 * Core logic for the Uber-like artist assignment system.
 * 
 * Flow:
 *  1. Customer places order with category + location
 *  2. Engine queries MongoDB for online artists matching the category,
 *     sorted by proximity using $nearSphere (2dsphere index)
 *  3. Sends offer to closest artist first via Socket.io
 *  4. If artist rejects or times out (30s), moves to next nearest
 *  5. Repeats until one accepts or all exhausted
 */

import Artist from '../models/Artist.js'
import Order from '../models/Order.js'

/** Default timeout before auto-reassigning to next artist (ms) */
const MATCH_TIMEOUT_MS = (parseInt(process.env.MATCH_TIMEOUT_SECONDS) || 30) * 1000

/** Max search radius in meters (50 km) */
const MAX_SEARCH_RADIUS = 50_000

/**
 * Haversine formula — calculates distance between two lat/lng points in km.
 * Used as a fallback when MongoDB geo queries aren't available.
 *
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} Distance in kilometres
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Find nearby artists matching a category, sorted by distance.
 * Uses MongoDB $nearSphere with 2dsphere index for optimal performance.
 *
 * @param {number[]} coordinates - [longitude, latitude]
 * @param {string} category - Art category to match
 * @param {string[]} excludeIds - Artist IDs already rejected
 * @returns {Promise<Array>} Artists sorted nearest-first
 */
export async function findNearbyArtists(coordinates, category, excludeIds = []) {
  const artists = await Artist.find({
    categories: category,
    isOnline: true,
    _id: { $nin: excludeIds },
    location: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates, // [lng, lat]
        },
        $maxDistance: MAX_SEARCH_RADIUS,
      },
    },
  }).lean()

  // Attach computed distance to each artist for display
  const [lng, lat] = coordinates
  return artists.map((artist) => {
    const [aLng, aLat] = artist.location.coordinates
    const distance = haversineDistance(lat, lng, aLat, aLng)
    return { ...artist, distance: Math.round(distance * 10) / 10 }
  })
}

/**
 * Start the matching process for an order.
 * Finds nearest artists and offers to the closest one.
 *
 * @param {string} orderId
 * @param {object} io - Socket.io server instance
 * @returns {Promise<object>} Updated order
 */
export async function startMatching(orderId, io) {
  const order = await Order.findById(orderId)
  if (!order) throw new Error('Order not found')

  // Get IDs of previously rejected artists
  const excludeIds = order.rejectedArtists.map((r) => r.artist)

  // Find nearest available artists
  const nearbyArtists = await findNearbyArtists(
    order.customerLocation.coordinates,
    order.category,
    excludeIds
  )

  if (nearbyArtists.length === 0) {
    // No artists available — mark order as rejected
    order.status = 'rejected'
    order.currentOfferArtist = null
    order.currentOfferDistance = null
    await order.save()

    // Notify customer that no artists are available
    if (order.customerSocketId) {
      io.to(order.customerSocketId).emit('match:noArtists', {
        orderId: order._id,
        message: 'No artists available in your area for this category. Please try again later.',
      })
    }

    return order
  }

  // Offer to the closest artist
  const closest = nearbyArtists[0]
  order.status = 'offered'
  order.currentOfferArtist = closest._id
  order.currentOfferDistance = closest.distance
  order.offerSentAt = new Date()
  await order.save()

  // Send real-time notification to the artist
  if (closest.socketId) {
    io.to(closest.socketId).emit('order:newRequest', {
      orderId: order._id,
      category: order.category,
      description: order.description,
      size: order.size,
      customerName: order.customerName,
      distance: closest.distance,
      deliveryAddress: order.deliveryAddress,
    })
  }

  // Notify customer about the current match attempt
  if (order.customerSocketId) {
    io.to(order.customerSocketId).emit('match:searching', {
      orderId: order._id,
      artistName: closest.name,
      distance: closest.distance,
      attemptNumber: order.rejectedArtists.length + 1,
      totalAvailable: nearbyArtists.length + order.rejectedArtists.length,
    })
  }

  // Set timeout for auto-reassignment
  scheduleTimeout(orderId, io)

  return order
}

/**
 * Handle artist accepting an order.
 *
 * @param {string} orderId
 * @param {string} artistId
 * @param {object} io - Socket.io server instance
 * @returns {Promise<object>} Updated order with populated artist
 */
export async function acceptOrder(orderId, artistId, io) {
  const order = await Order.findById(orderId)
  if (!order) throw new Error('Order not found')
  if (order.status !== 'offered') throw new Error('Order is not in offered state')
  if (String(order.currentOfferArtist) !== String(artistId)) {
    throw new Error('This offer is not for you')
  }

  const artist = await Artist.findById(artistId)
  if (!artist) throw new Error('Artist not found')

  // Update order to accepted
  order.status = 'accepted'
  order.assignedArtist = artistId
  order.matchDistance = order.currentOfferDistance
  order.currentOfferArtist = null
  order.offerSentAt = null
  await order.save()

  // Increment artist's completed orders
  artist.completedOrders += 1
  await artist.save()

  // Notify customer of successful match
  if (order.customerSocketId) {
    io.to(order.customerSocketId).emit('match:accepted', {
      orderId: order._id,
      artist: {
        id: artist._id,
        name: artist.name,
        avatar: artist.avatar,
        categories: artist.categories,
        rating: artist.rating,
        completedOrders: artist.completedOrders,
        distance: order.matchDistance,
      },
    })
  }

  return order
}

/**
 * Handle artist rejecting an order. Moves to next nearest artist.
 *
 * @param {string} orderId
 * @param {string} artistId
 * @param {string} reason - Optional rejection reason
 * @param {object} io - Socket.io server instance
 * @returns {Promise<object>} Updated order
 */
export async function rejectOrder(orderId, artistId, reason, io) {
  const order = await Order.findById(orderId)
  if (!order) throw new Error('Order not found')
  if (order.status !== 'offered') throw new Error('Order is not in offered state')

  // Record the rejection
  order.rejectedArtists.push({
    artist: artistId,
    reason: reason || 'No reason provided',
    rejectedAt: new Date(),
  })
  order.currentOfferArtist = null
  order.currentOfferDistance = null
  order.offerSentAt = null
  order.status = 'searching'
  await order.save()

  // Notify customer that we're moving to next artist
  if (order.customerSocketId) {
    io.to(order.customerSocketId).emit('match:rejected', {
      orderId: order._id,
      message: 'Artist declined. Searching for the next nearest artist...',
    })
  }

  // Try next artist
  return startMatching(orderId, io)
}

/**
 * Schedule a timeout for the current offer.
 * If the artist doesn't respond within MATCH_TIMEOUT_MS,
 * automatically move to the next nearest artist.
 */
const activeTimeouts = new Map()

export function scheduleTimeout(orderId, io) {
  // Clear any existing timeout for this order
  if (activeTimeouts.has(orderId)) {
    clearTimeout(activeTimeouts.get(orderId))
  }

  const timeout = setTimeout(async () => {
    activeTimeouts.delete(orderId)

    try {
      const order = await Order.findById(orderId)
      if (!order || order.status !== 'offered') return

      console.log(`[Matching] Offer timed out for order ${orderId}`)

      // Treat timeout as a rejection with reason
      await rejectOrder(
        orderId,
        String(order.currentOfferArtist),
        'No response (timed out)',
        io
      )
    } catch (err) {
      console.error('[Matching] Timeout handler error:', err.message)
    }
  }, MATCH_TIMEOUT_MS)

  activeTimeouts.set(orderId, timeout)
}

/**
 * Cancel the timeout for an order (e.g. when accepted or cancelled).
 */
export function cancelTimeout(orderId) {
  if (activeTimeouts.has(orderId)) {
    clearTimeout(activeTimeouts.get(orderId))
    activeTimeouts.delete(orderId)
  }
}
