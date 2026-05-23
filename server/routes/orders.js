/**
 * Order API Routes
 * 
 * Endpoints for order creation and matching lifecycle:
 *  POST   /api/orders           — Create order and start matching
 *  GET    /api/orders/:id       — Get order status
 *  POST   /api/orders/:id/accept  — Artist accepts order
 *  POST   /api/orders/:id/reject  — Artist rejects order
 *  POST   /api/orders/:id/cancel  — Customer cancels order
 *  GET    /api/orders            — List orders (optional status filter)
 */

import { Router } from 'express'
import Order from '../models/Order.js'
import { startMatching, acceptOrder, rejectOrder, cancelTimeout } from '../matching/engine.js'

const router = Router()

/** Reference to Socket.io instance — injected from index.js */
let io = null
export function setIo(ioInstance) {
  io = ioInstance
}

/**
 * POST /api/orders
 * Create a new order and begin the matching process
 */
router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      category,
      description,
      size,
      latitude,
      longitude,
      deliveryAddress,
      customerSocketId,
    } = req.body

    // Validate required fields
    if (!customerName || !category || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: customerName, category, latitude, longitude',
      })
    }

    // Create the order
    const order = await Order.create({
      customerName,
      customerEmail: customerEmail || '',
      customerPhone: customerPhone || '',
      category,
      description: description || '',
      size: size || 'Medium',
      customerLocation: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      deliveryAddress: deliveryAddress || '',
      customerSocketId: customerSocketId || null,
      status: 'searching',
    })

    // Start the matching engine
    const updatedOrder = await startMatching(order._id, io)

    res.status(201).json({ success: true, data: updatedOrder })
  } catch (err) {
    console.error('[Orders] Create error:', err.message)
    res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * GET /api/orders/:id
 * Get order details with populated artist info
 */
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('assignedArtist', 'name avatar categories rating completedOrders location')
      .populate('currentOfferArtist', 'name avatar categories rating')
      .lean()

    if (!order) return res.status(404).json({ success: false, error: 'Order not found' })
    res.json({ success: true, data: order })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * GET /api/orders
 * List orders with optional status filter
 */
router.get('/', async (req, res) => {
  try {
    const filter = {}
    if (req.query.status) filter.status = req.query.status

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('assignedArtist', 'name avatar rating')
      .lean()

    res.json({ success: true, data: orders })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * POST /api/orders/:id/accept
 * Artist accepts an order offer
 */
router.post('/:id/accept', async (req, res) => {
  try {
    const { artistId } = req.body
    if (!artistId) {
      return res.status(400).json({ success: false, error: 'artistId is required' })
    }

    const order = await acceptOrder(req.params.id, artistId, io)
    cancelTimeout(req.params.id)

    res.json({ success: true, data: order })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
})

/**
 * POST /api/orders/:id/reject
 * Artist rejects an order offer
 */
router.post('/:id/reject', async (req, res) => {
  try {
    const { artistId, reason } = req.body
    if (!artistId) {
      return res.status(400).json({ success: false, error: 'artistId is required' })
    }

    cancelTimeout(req.params.id)
    const order = await rejectOrder(req.params.id, artistId, reason || '', io)

    res.json({ success: true, data: order })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
})

/**
 * POST /api/orders/:id/cancel
 * Customer cancels their order
 */
router.post('/:id/cancel', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' })

    cancelTimeout(req.params.id)

    order.status = 'cancelled'
    order.currentOfferArtist = null
    order.offerSentAt = null
    await order.save()

    // Notify any artist that had a pending offer
    if (io) {
      io.emit('order:cancelled', { orderId: order._id })
    }

    res.json({ success: true, data: order })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
