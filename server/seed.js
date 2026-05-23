/**
 * Seed Script — Populates MongoDB with sample artist data
 * 
 * Run: node seed.js
 * 
 * Creates 12 artists spread across various Indian cities
 * with different categories, so the matching system can
 * be tested immediately.
 */

import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Artist from './models/Artist.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/artlor'

const sampleArtists = [
  {
    name: 'Hammad Riyaz',
    bio: 'Founder of Artlor. Specializes in scenic landscapes and vintage themes.',
    categories: ['Landscape', 'Still Life'],
    location: { type: 'Point', coordinates: [77.5946, 12.9716] }, // Bangalore
    isOnline: true,
    rating: 4.9,
    completedOrders: 47,
    phone: '9876543210',
    email: 'hammad@artlor.co',
    avatar: '',
  },
  {
    name: 'Muntaza Shaheen',
    bio: 'Calligraphy artist with a passion for gold-leaf and abstract expressions.',
    categories: ['Calligraphy', 'Abstract'],
    location: { type: 'Point', coordinates: [77.6101, 12.9352] }, // Bangalore - Koramangala
    isOnline: true,
    rating: 4.8,
    completedOrders: 38,
    phone: '9876543211',
    email: 'muntaza@artlor.co',
    avatar: '',
  },
  {
    name: 'Maryam Khan',
    bio: 'Islamic calligraphy and spiritual art. Each piece tells a story.',
    categories: ['Calligraphy', 'Abstract'],
    location: { type: 'Point', coordinates: [72.8777, 19.076] }, // Mumbai
    isOnline: true,
    rating: 4.7,
    completedOrders: 24,
    phone: '9876543212',
    email: 'maryam@artlor.co',
    avatar: '',
  },
  {
    name: 'Seebah Fathima',
    bio: 'Still life and botanical art specialist. Inspired by nature.',
    categories: ['Still Life', 'Landscape'],
    location: { type: 'Point', coordinates: [77.2090, 28.6139] }, // Delhi
    isOnline: true,
    rating: 4.6,
    completedOrders: 19,
    phone: '9876543213',
    email: 'seebah@artlor.co',
    avatar: '',
  },
  {
    name: 'Arjun Mehta',
    bio: 'Contemporary abstract artist blending Western and Indian aesthetics.',
    categories: ['Abstract', 'Modern'],
    location: { type: 'Point', coordinates: [77.5875, 12.9850] }, // Bangalore - Indiranagar
    isOnline: true,
    rating: 4.5,
    completedOrders: 31,
    phone: '9876543214',
    email: 'arjun@artlor.co',
    avatar: '',
  },
  {
    name: 'Priya Nair',
    bio: 'Portrait specialist who captures emotions on canvas.',
    categories: ['Portrait', 'Still Life'],
    location: { type: 'Point', coordinates: [76.2711, 10.8505] }, // Kochi
    isOnline: true,
    rating: 4.8,
    completedOrders: 42,
    phone: '9876543215',
    email: 'priya@artlor.co',
    avatar: '',
  },
  {
    name: 'Ravi Shankar',
    bio: 'Landscape artist specializing in Himalayan and rural India scenes.',
    categories: ['Landscape', 'Abstract'],
    location: { type: 'Point', coordinates: [80.2707, 13.0827] }, // Chennai
    isOnline: false,
    rating: 4.4,
    completedOrders: 15,
    phone: '9876543216',
    email: 'ravi@artlor.co',
    avatar: '',
  },
  {
    name: 'Zainab Ahmed',
    bio: 'Modern art enthusiast with a focus on geometric abstraction.',
    categories: ['Modern', 'Abstract'],
    location: { type: 'Point', coordinates: [73.8567, 18.5204] }, // Pune
    isOnline: true,
    rating: 4.6,
    completedOrders: 22,
    phone: '9876543217',
    email: 'zainab@artlor.co',
    avatar: '',
  },
  {
    name: 'Vikram Singh',
    bio: 'Traditional calligraphy meets modern design. Multilingual scripts.',
    categories: ['Calligraphy', 'Portrait'],
    location: { type: 'Point', coordinates: [75.7873, 26.9124] }, // Jaipur
    isOnline: true,
    rating: 4.7,
    completedOrders: 28,
    phone: '9876543218',
    email: 'vikram@artlor.co',
    avatar: '',
  },
  {
    name: 'Ananya Iyer',
    bio: 'Photorealistic portraits and figurative art. Trained in Florence.',
    categories: ['Portrait', 'Still Life'],
    location: { type: 'Point', coordinates: [78.4867, 17.385] }, // Hyderabad
    isOnline: true,
    rating: 4.9,
    completedOrders: 55,
    phone: '9876543219',
    email: 'ananya@artlor.co',
    avatar: '',
  },
  {
    name: 'Kabir Das',
    bio: 'Minimalist landscapes and watercolor specialist.',
    categories: ['Landscape', 'Modern'],
    location: { type: 'Point', coordinates: [77.6088, 12.9540] }, // Bangalore - HSR Layout
    isOnline: true,
    rating: 4.3,
    completedOrders: 12,
    phone: '9876543220',
    email: 'kabir@artlor.co',
    avatar: '',
  },
  {
    name: 'Fatima Begum',
    bio: 'Arabic and Urdu calligraphy art. Gold and ink on handmade paper.',
    categories: ['Calligraphy'],
    location: { type: 'Point', coordinates: [77.5700, 13.0200] }, // Bangalore - Malleshwaram
    isOnline: true,
    rating: 4.8,
    completedOrders: 33,
    phone: '9876543221',
    email: 'fatima@artlor.co',
    avatar: '',
  },
]

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('[Seed] Connected to MongoDB')

    // Clear existing artists
    await Artist.deleteMany({})
    console.log('[Seed] Cleared existing artists')

    // Insert seed data
    const created = await Artist.insertMany(sampleArtists)
    console.log(`[Seed] Created ${created.length} artists:`)
    created.forEach((a) => {
      console.log(`  ✓ ${a.name} — ${a.categories.join(', ')} — [${a.location.coordinates}]`)
    })

    // Ensure indexes are created
    await Artist.ensureIndexes()
    console.log('[Seed] Geospatial indexes created')

    await mongoose.disconnect()
    console.log('[Seed] Done!')
  } catch (err) {
    console.error('[Seed] Error:', err.message)
    process.exit(1)
  }
}

seed()
