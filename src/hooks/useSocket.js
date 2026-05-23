/**
 * Socket.io Client Hook
 * 
 * Provides a singleton Socket.io connection to the matching server.
 * Auto-connects on mount, auto-disconnects on unmount.
 * Exposes the socket instance and connection state.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

/** Backend server URL */
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000'

/**
 * Hook that manages a Socket.io connection.
 * @returns {{ socket, isConnected, emit }}
 */
export function useSocket() {
  const socketRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Create socket connection
    const socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id)
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected')
      setIsConnected(false)
    })

    socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message)
    })

    // Cleanup on unmount
    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  /** Emit an event through the socket */
  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data)
    }
  }, [])

  return {
    socket: socketRef.current,
    isConnected,
    emit,
  }
}

export { SERVER_URL }
