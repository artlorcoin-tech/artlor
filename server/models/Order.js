/**
 * Order Model
 * 
 * Tracks art commission orders through the matching lifecycle:
 *   pending → searching → matched → accepted / rejected / expired
 * 
 * Stores the user's location (GeoJSON) for distance calculations,
 * the requested art category, and the matching state machine.
 */

import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema(
  {
    /** Customer details */
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, default: '' },
    customerPhone: { type: String, default: '' },

    /** Requested art category */
    category: {
      type: String,
      required: true,
      enum: ['Abstract', 'Calligraphy', 'Landscape', 'Still Life', 'Portrait', 'Modern'],
    },

    /** Optional description of what the customer wants */
    description: { type: String, default: '' },

    /** Artwork size preference */
    size: { type: String, default: 'Medium' },

    /** Customer's GeoJSON location for proximity matching */
    customerLocation: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },

    /** Delivery address (text) */
    deliveryAddress: { type: String, default: '' },

    /**
     * Order lifecycle status:
     *  - pending:    order created, not yet searching
     *  - searching:  actively looking for an artist
     *  - offered:    sent to a specific artist, awaiting response
     *  - accepted:   artist accepted the order
     *  - rejected:   all artists rejected / timed out
     *  - cancelled:  customer cancelled
     *  - completed:  work delivered
     */
    status: {
      type: String,
      enum: ['pending', 'searching', 'offered', 'accepted', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },

    /** The artist currently assigned (after acceptance) */
    assignedArtist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artist',
      default: null,
    },

    /** The artist currently being offered (during matching) */
    currentOfferArtist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artist',
      default: null,
    },

    /** Distance to the currently offered artist (in km) */
    currentOfferDistance: { type: Number, default: null },

    /** Timestamp when the current offer was sent (for timeout tracking) */
    offerSentAt: { type: Date, default: null },

    /** Artists who have already been offered and rejected/timed out */
    rejectedArtists: [
      {
        artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist' },
        reason: { type: String, default: '' },
        rejectedAt: { type: Date, default: Date.now },
      },
    ],

    /** Distance between customer and assigned artist (km) */
    matchDistance: { type: Number, default: null },

    /** Socket.io room for real-time updates to the customer */
    customerSocketId: { type: String, default: null },
  },
  {
    timestamps: true,
  }
)

// Index for geo queries on customer location
orderSchema.index({ customerLocation: '2dsphere' })

const Order = mongoose.model('Order', orderSchema)

export default Order
