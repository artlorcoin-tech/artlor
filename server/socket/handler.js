/**
 * Socket.io Event Handler
 * 
 * Manages real-time WebSocket connections for:
 *  - Artists going online/offline
 *  - Live order request notifications
 *  - Accept/reject events
 *  - Customer match status updates
 */

import Artist from '../models/Artist.js'
import Order from '../models/Order.js'
import { acceptOrder, rejectOrder, cancelTimeout } from '../matching/engine.js'

/**
 * Initialize Socket.io event listeners.
 * @param {import('socket.io').Server} io
 */
export function initSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`)

    /**
     * Artist goes online — registers their socket ID and sets status.
     * Payload: { artistId: string }
     */
    socket.on('artist:online', async ({ artistId }) => {
      try {
        const artist = await Artist.findByIdAndUpdate(
          artistId,
          { isOnline: true, socketId: socket.id },
          { new: true }
        )
        if (artist) {
          socket.join(`artist:${artistId}`)
          console.log(`[Socket] Artist online: ${artist.name} (${socket.id})`)
          socket.emit('artist:statusUpdated', { isOnline: true, artist })
        }
      } catch (err) {
        console.error('[Socket] artist:online error:', err.message)
        socket.emit('error', { message: err.message })
      }
    })

    /**
     * Artist goes offline
     * Payload: { artistId: string }
     */
    socket.on('artist:offline', async ({ artistId }) => {
      try {
        await Artist.findByIdAndUpdate(artistId, {
          isOnline: false,
          socketId: null,
        })
        socket.leave(`artist:${artistId}`)
        console.log(`[Socket] Artist offline: ${artistId}`)
        socket.emit('artist:statusUpdated', { isOnline: false })
      } catch (err) {
        console.error('[Socket] artist:offline error:', err.message)
      }
    })

    /**
     * Customer joins their order room for real-time updates.
     * Payload: { orderId: string }
     */
    socket.on('customer:joinOrder', async ({ orderId }) => {
      try {
        socket.join(`order:${orderId}`)

        // Update the customer's socket ID on the order
        await Order.findByIdAndUpdate(orderId, { customerSocketId: socket.id })

        console.log(`[Socket] Customer joined order room: ${orderId}`)
      } catch (err) {
        console.error('[Socket] customer:joinOrder error:', err.message)
      }
    })

    /**
     * Artist accepts an order via WebSocket (real-time path).
     * Payload: { orderId: string, artistId: string }
     */
    socket.on('order:accept', async ({ orderId, artistId }) => {
      try {
        cancelTimeout(orderId)
        const order = await acceptOrder(orderId, artistId, io)
        socket.emit('order:acceptConfirmed', { orderId, status: order.status })
      } catch (err) {
        console.error('[Socket] order:accept error:', err.message)
        socket.emit('error', { message: err.message })
      }
    })

    /**
     * Artist rejects an order via WebSocket.
     * Payload: { orderId: string, artistId: string, reason?: string }
     */
    socket.on('order:reject', async ({ orderId, artistId, reason }) => {
      try {
        cancelTimeout(orderId)
        await rejectOrder(orderId, artistId, reason || '', io)
        socket.emit('order:rejectConfirmed', { orderId })
      } catch (err) {
        console.error('[Socket] order:reject error:', err.message)
        socket.emit('error', { message: err.message })
      }
    })

    /**
     * Handle disconnect — mark artist as offline if they had a registered socket.
     */
    socket.on('disconnect', async () => {
      try {
        const artist = await Artist.findOneAndUpdate(
          { socketId: socket.id },
          { isOnline: false, socketId: null }
        )
        if (artist) {
          console.log(`[Socket] Artist disconnected: ${artist.name}`)
        }
      } catch (err) {
        console.error('[Socket] disconnect error:', err.message)
      }
      console.log(`[Socket] Client disconnected: ${socket.id}`)
    })
  })
}
