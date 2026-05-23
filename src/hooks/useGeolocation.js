/**
 * Browser Geolocation Hook
 * 
 * Uses the browser's Geolocation API to detect the user's position.
 * Returns { latitude, longitude, error, loading, refresh }.
 */

import { useCallback, useEffect, useState } from 'react'

export function useGeolocation() {
  const [position, setPosition] = useState({ latitude: null, longitude: null })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const getPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        })
        setLoading(false)
      },
      (err) => {
        let message = 'Unable to detect your location.'
        if (err.code === 1) message = 'Location access denied. Please enable it in your browser settings.'
        if (err.code === 2) message = 'Location unavailable. Please try again.'
        if (err.code === 3) message = 'Location request timed out. Please try again.'
        setError(message)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    )
  }, [])

  useEffect(() => {
    getPosition()
  }, [getPosition])

  return {
    ...position,
    error,
    loading,
    refresh: getPosition,
  }
}
