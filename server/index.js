/**
 * Artlor Matching Server — Entry Point
 * 
 * Express + Socket.io + MongoDB server that powers the
 * Uber-like artist matching system for art commissions.
 * 
 * Architecture:
 *  - Express REST API for orders and artist management
 *  - Socket.io for real-time matching notifications
 *  - MongoDB with 2dsphere indexes for geo queries
 *  - Matching engine with timeout-based fallback queue
 */

import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { createServer } from 'http'
import mongoose from 'mongoose'
import { Server as SocketIOServer } from 'socket.io'

import artistRoutes from './routes/artists.js'
import orderRoutes, { setIo } from './routes/orders.js'
import { initSocketHandlers } from './socket/handler.js'

// Load environment variables
dotenv.config()

const PORT = process.env.PORT || 4000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/artlor'
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

// ─── Express Setup ───────────────────────────────────────────
const app = express()

app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true,
}))

app.use(express.json())

// ─── HTTP + Socket.io Server ─────────────────────────────────
const httpServer = createServer(app)

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingInterval: 25000,
  pingTimeout: 20000,
})

// Inject io into order routes for real-time notifications
setIo(io)

// Initialize Socket.io event handlers
initSocketHandlers(io)

// ─── API Routes ──────────────────────────────────────────────
app.use('/api/artists', artistRoutes)
app.use('/api/orders', orderRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  })
})

// ─── MongoDB Connection + Server Start ───────────────────────
async function start() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log(`[DB] Connected to MongoDB: ${MONGODB_URI}`)

    httpServer.listen(PORT, () => {
      console.log(`[Server] Artlor matching server running on http://localhost:${PORT}`)
      console.log(`[Server] Socket.io ready for real-time connections`)
      console.log(`[Server] CORS allowed: ${CLIENT_URL}`)
    })
  } catch (err) {
    console.error('[Server] Failed to start:', err.message)
    process.exit(1)
  }
}

start()
