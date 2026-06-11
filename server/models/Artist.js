/**
 * Artist Model
 * 
 * Stores artist profiles with geospatial location data.
 * Uses MongoDB 2dsphere index on `location` for efficient geo queries.
 * 
 * Each artist has:
 *  - name, avatar, bio
 *  - categories they specialize in (e.g. ["Abstract", "Landscape"])
 *  - GeoJSON Point location (longitude, latitude)
 *  - availability status (online / offline)
 *  - rating and completed order count
 */

import mongoose from 'mongoose'

const artistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    avatar: {
      type: String,
      default: '',
    },

    bio: {
      type: String,
      default: '',
      maxlength: 500,
    },

    /** Art categories this artist specializes in */
    categories: {
      type: [String],
      required: true,
      enum: ['Abstract', 'Calligraphy', 'Landscape', 'Still Life', 'Portrait', 'Modern'],
      validate: {
        validator: (v) => v.length > 0,
        message: 'Artist must have at least one category.',
      },
    },

    /**
     * GeoJSON Point — { type: "Point", coordinates: [longitude, latitude] }
     * MongoDB geo indexes require longitude first, then latitude.
     */
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
        validate: {
          validator: (v) => v.length === 2,
          message: 'Coordinates must be [longitude, latitude].',
        },
      },
    },

    /** Whether the artist is currently accepting orders */
    isOnline: {
      type: Boolean,
      default: false,
    },

    /** Average rating (1-5 scale) */
    rating: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
    },

    /** Total orders completed */
    completedOrders: {
      type: Number,
      default: 0,
    },

    /** Phone and email for contact */
    phone: { type: String, default: '' },
    email: { type: String, default: '' },

    /** Socket.io socket ID for real-time communication */
    socketId: { type: String, default: null },
  },
  {
    timestamps: true,
  }
)

// 2dsphere geospatial index for efficient proximity queries
artistSchema.index({ location: '2dsphere' })

// Compound index: category + online status + location for the matching query
artistSchema.index({ categories: 1, isOnline: 1, location: '2dsphere' })

const ArtistMongoose = mongoose.model('Artist', artistSchema)

// Proxy wrapper to support seamless fallback to Mock database if MongoDB is offline
import { MockArtistModel } from '../lib/fileDb.js'

const Artist = new Proxy(ArtistMongoose, {
  get(target, prop) {
    if (global.isMockDb) {
      return MockArtistModel[prop]
    }
    return Reflect.get(target, prop)
  },
  construct(target, argumentsList) {
    if (global.isMockDb) {
      return new MockArtistModel(...argumentsList)
    }
    return new ArtistMongoose(...argumentsList)
  }
})

export default Artist
