/**
 * MongoDB Schema Definitions for the Artlor Artist Matching System
 * 
 * This file documents the MongoDB collections, their schemas,
 * and the indexes used for the Uber-like matching system.
 * These are enforced by Mongoose models in /server/models/.
 *
 * Run `node seed.js` to populate with sample data.
 */

// ═══════════════════════════════════════════════════════════
// COLLECTION: artists
// ═══════════════════════════════════════════════════════════
//
// {
//   _id:              ObjectId,
//   name:             String (required),
//   avatar:           String,
//   bio:              String (max 500 chars),
//   categories:       [String] — enum: Abstract, Calligraphy, Landscape, Still Life, Portrait, Modern
//   location: {
//     type:           "Point",
//     coordinates:    [Number] — [longitude, latitude]
//   },
//   isOnline:         Boolean (default: false),
//   rating:           Number (1-5, default: 4.5),
//   completedOrders:  Number (default: 0),
//   phone:            String,
//   email:            String,
//   socketId:         String (null when offline),
//   createdAt:        Date,
//   updatedAt:        Date
// }
//
// INDEXES:
//   - location: "2dsphere"              → geo proximity queries
//   - { categories: 1, isOnline: 1, location: "2dsphere" }  → compound matching query
//

// ═══════════════════════════════════════════════════════════
// COLLECTION: orders
// ═══════════════════════════════════════════════════════════
//
// {
//   _id:                  ObjectId,
//   customerName:         String (required),
//   customerEmail:        String,
//   customerPhone:        String,
//   category:             String — enum: Abstract, Calligraphy, Landscape, Still Life, Portrait, Modern
//   description:          String,
//   size:                 String (default: "Medium"),
//   customerLocation: {
//     type:               "Point",
//     coordinates:        [Number] — [longitude, latitude]
//   },
//   deliveryAddress:      String,
//   status:               String — enum: pending, searching, offered, accepted, rejected, cancelled, completed
//   assignedArtist:       ObjectId (ref: Artist),
//   currentOfferArtist:   ObjectId (ref: Artist),
//   currentOfferDistance: Number (km),
//   offerSentAt:          Date,
//   rejectedArtists: [{
//     artist:             ObjectId (ref: Artist),
//     reason:             String,
//     rejectedAt:         Date
//   }],
//   matchDistance:         Number (km),
//   customerSocketId:     String,
//   createdAt:            Date,
//   updatedAt:            Date
// }
//
// INDEXES:
//   - customerLocation: "2dsphere"
//
