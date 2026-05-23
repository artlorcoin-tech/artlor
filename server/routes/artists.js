/**
 * Artist API Routes
 * 
 * Endpoints for artist CRUD and status management:
 *  GET    /api/artists           — List all artists (with optional filters)
 *  GET    /api/artists/nearby    — Find nearby artists by category + location
 *  GET    /api/artists/:id       — Get single artist
 *  POST   /api/artists           — Create artist profile
 *  PATCH  /api/artists/:id       — Update artist profile
 *  PATCH  /api/artists/:id/status — Toggle online/offline
 */

import { Router } from 'express'
import Artist from '../models/Artist.js'
import { findNearbyArtists } from '../matching/engine.js'

const router = Router()

/**
 * GET /api/artists
 * List artists, optionally filtered by category and/or online status
 */
router.get('/', async (req, res) => {
  try {
    const filter = {}
    if (req.query.category) filter.categories = req.query.category
    if (req.query.online === 'true') filter.isOnline = true

    const artists = await Artist.find(filter)
      .sort({ rating: -1, completedOrders: -1 })
      .lean()

    res.json({ success: true, data: artists })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * GET /api/artists/nearby
 * Find nearby artists for a given category and location.
 * Query params: lng, lat, category
 */
router.get('/nearby', async (req, res) => {
  try {
    const { lng, lat, category } = req.query

    if (!lng || !lat || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required params: lng, lat, category',
      })
    }

    const artists = await findNearbyArtists(
      [parseFloat(lng), parseFloat(lat)],
      category
    )

    res.json({ success: true, data: artists, count: artists.length })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * GET /api/artists/:id
 * Get a single artist by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id).lean()
    if (!artist) return res.status(404).json({ success: false, error: 'Artist not found' })
    res.json({ success: true, data: artist })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * POST /api/artists
 * Create a new artist profile
 */
router.post('/', async (req, res) => {
  try {
    const { name, bio, categories, latitude, longitude, phone, email, avatar } = req.body

    if (!name || !categories || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, categories, latitude, longitude',
      })
    }

    const artist = await Artist.create({
      name,
      bio: bio || '',
      avatar: avatar || '',
      categories,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      phone: phone || '',
      email: email || '',
      isOnline: false,
    })

    res.status(201).json({ success: true, data: artist })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * PATCH /api/artists/:id
 * Update artist profile fields
 */
router.patch('/:id', async (req, res) => {
  try {
    const updates = {}
    const { name, bio, categories, latitude, longitude, phone, email, avatar } = req.body

    if (name) updates.name = name
    if (bio !== undefined) updates.bio = bio
    if (avatar !== undefined) updates.avatar = avatar
    if (categories) updates.categories = categories
    if (phone !== undefined) updates.phone = phone
    if (email !== undefined) updates.email = email

    if (latitude && longitude) {
      updates.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      }
    }

    const artist = await Artist.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })

    if (!artist) return res.status(404).json({ success: false, error: 'Artist not found' })
    res.json({ success: true, data: artist })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * PATCH /api/artists/:id/status
 * Toggle artist online/offline status
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { isOnline } = req.body

    const artist = await Artist.findByIdAndUpdate(
      req.params.id,
      { isOnline: Boolean(isOnline) },
      { new: true }
    )

    if (!artist) return res.status(404).json({ success: false, error: 'Artist not found' })
    res.json({ success: true, data: artist })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
