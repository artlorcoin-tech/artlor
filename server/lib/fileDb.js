import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_FILE = path.join(__dirname, '../db.json')

// Sample artists matching the seed data
const DEFAULT_ARTISTS = [
  {
    _id: '65c1f1000000000000000001',
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
    _id: '65c1f1000000000000000002',
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
    _id: '65c1f1000000000000000003',
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
    _id: '65c1f1000000000000000004',
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
    _id: '65c1f1000000000000000005',
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
    _id: '65c1f1000000000000000006',
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
    _id: '65c1f1000000000000000007',
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
    _id: '65c1f1000000000000000008',
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
    _id: '65c1f1000000000000000009',
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
    _id: '65c1f100000000000000000a',
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
    _id: '65c1f100000000000000000b',
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
    _id: '65c1f100000000000000000c',
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

function generateId() {
  return crypto.randomBytes(12).toString('hex')
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

class FileDb {
  constructor() {
    this.data = { artists: [], orders: [] }
    this.init()
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf8')
        this.data = JSON.parse(fileContent)
      } else {
        this.data = { artists: [...DEFAULT_ARTISTS], orders: [] }
        this.saveToFile()
      }
    } catch (err) {
      console.error('[FileDb] Initialization failed, using default state:', err.message)
      this.data = { artists: [...DEFAULT_ARTISTS], orders: [] }
    }
  }

  saveToFile() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8')
    } catch (err) {
      console.error('[FileDb] Write failed:', err.message)
    }
  }

  getArtists() {
    return this.data.artists
  }

  getOrders() {
    return this.data.orders
  }

  saveArtist(artist) {
    const idx = this.data.artists.findIndex((a) => String(a._id) === String(artist._id))
    const now = new Date().toISOString()
    if (idx >= 0) {
      this.data.artists[idx] = { ...this.data.artists[idx], ...artist, updatedAt: now }
    } else {
      artist._id = artist._id || generateId()
      artist.createdAt = artist.createdAt || now
      artist.updatedAt = now
      this.data.artists.push(artist)
    }
    this.saveToFile()
    return artist
  }

  saveOrder(order) {
    const idx = this.data.orders.findIndex((o) => String(o._id) === String(order._id))
    const now = new Date().toISOString()
    if (idx >= 0) {
      this.data.orders[idx] = { ...this.data.orders[idx], ...order, updatedAt: now }
    } else {
      order._id = order._id || generateId()
      order.createdAt = order.createdAt || now
      order.updatedAt = now
      this.data.orders.push(order)
    }
    this.saveToFile()
    return order
  }

  resetArtists(artists) {
    this.data.artists = artists.map((a) => ({
      ...a,
      _id: a._id || generateId(),
      createdAt: a.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))
    this.saveToFile()
  }

  clearOrders() {
    this.data.orders = []
    this.saveToFile()
  }
}

export const fileDb = new FileDb()

// ─── Query chain helper ────────────────────────────────────────────────────────
class MockQuery {
  constructor(result) {
    this.result = result
  }

  populate(field, select) {
    if (!this.result) return this
    const populateField = (item) => {
      if (!item) return item
      const artistId = item[field]
      if (artistId) {
        const artist = fileDb.getArtists().find((a) => String(a._id) === String(artistId))
        if (artist) {
          // If select is provided, simulate field filtering
          if (select) {
            const selectKeys = select.split(' ')
            const filteredArtist = {}
            selectKeys.forEach((key) => {
              filteredArtist[key] = artist[key]
            })
            filteredArtist._id = artist._id
            item[field] = filteredArtist
          } else {
            item[field] = { ...artist }
          }
        }
      }
      return item
    }

    if (Array.isArray(this.result)) {
      this.result = this.result.map(populateField)
    } else {
      this.result = populateField(this.result)
    }
    return this
  }

  sort(sortObj) {
    if (!Array.isArray(this.result)) return this
    const key = Object.keys(sortObj)[0]
    const order = sortObj[key]
    this.result.sort((a, b) => {
      const aVal = a[key]
      const bVal = b[key]
      if (aVal < bVal) return order === -1 ? 1 : -1
      if (aVal > bVal) return order === -1 ? -1 : 1
      return 0
    })
    return this
  }

  limit(num) {
    if (Array.isArray(this.result)) {
      this.result = this.result.slice(0, num)
    }
    return this
  }

  lean() {
    return this.result
  }

  // Support direct await
  then(onFulfilled, onRejected) {
    return Promise.resolve(this.result).then(onFulfilled, onRejected)
  }
}

// ─── Mock Document class for Mongoose-like save() ─────────────────────────────
class MockDocument {
  constructor(data, collectionName) {
    Object.assign(this, JSON.parse(JSON.stringify(data)))
    this._collection = collectionName
  }

  async save() {
    const rawData = { ...this }
    delete rawData._collection

    if (this._collection === 'artists') {
      const saved = fileDb.saveArtist(rawData)
      Object.assign(this, saved)
    } else if (this._collection === 'orders') {
      const saved = fileDb.saveOrder(rawData)
      Object.assign(this, saved)
    }
    return this
  }
}

// ─── Mock models ─────────────────────────────────────────────────────────────

export class MockArtistModel {
  static find(query = {}) {
    let artists = [...fileDb.getArtists()]

    // Handle standard filter properties
    if (query.categories) {
      artists = artists.filter((a) => a.categories.includes(query.categories))
    }
    if (query.isOnline !== undefined) {
      artists = artists.filter((a) => a.isOnline === query.isOnline)
    }
    if (query._id && query._id.$nin) {
      const ninStr = query._id.$nin.map((id) => String(id))
      artists = artists.filter((a) => !ninStr.includes(String(a._id)))
    }

    // Proximity sorting using $nearSphere fallback
    if (query.location && query.location.$nearSphere) {
      const near = query.location.$nearSphere
      const coordinates = near.$geometry.coordinates // [lng, lat]
      const maxDistance = near.$maxDistance || 50000 // default 50km

      const [lng, lat] = coordinates

      // Calculate distance for all matching artists
      const artistsWithDist = artists.map((a) => {
        const [aLng, aLat] = a.location.coordinates
        const dist = haversineDistance(lat, lng, aLat, aLng) // distance in km
        return { artist: a, distance: dist }
      })

      // Filter by max distance (maxDistance is in meters, so divide by 1000 for km)
      const maxDistKm = maxDistance / 1000
      const filtered = artistsWithDist.filter((item) => item.distance <= maxDistKm)

      // Sort by proximity
      filtered.sort((a, b) => a.distance - b.distance)

      // Map back to artist objects
      artists = filtered.map((item) => item.artist)
    }

    return new MockQuery(artists.map((a) => new MockDocument(a, 'artists')))
  }

  static async findById(id) {
    const artist = fileDb.getArtists().find((a) => String(a._id) === String(id))
    return artist ? new MockDocument(artist, 'artists') : null
  }

  static async findByIdAndUpdate(id, update, options = {}) {
    const artist = fileDb.getArtists().find((a) => String(a._id) === String(id))
    if (!artist) return null

    const updated = { ...artist }
    if (update.$set) {
      Object.assign(updated, update.$set)
    } else {
      Object.assign(updated, update)
    }

    const saved = fileDb.saveArtist(updated)
    return new MockDocument(saved, 'artists')
  }

  static async create(payload) {
    const now = new Date().toISOString()
    const artist = {
      _id: generateId(),
      avatar: '',
      bio: '',
      isOnline: false,
      rating: 4.5,
      completedOrders: 0,
      phone: '',
      email: '',
      socketId: null,
      ...payload,
      createdAt: now,
      updatedAt: now,
    }
    const saved = fileDb.saveArtist(artist)
    return new MockDocument(saved, 'artists')
  }

  static async deleteMany(query = {}) {
    fileDb.resetArtists([])
    return { deletedCount: fileDb.getArtists().length }
  }

  static async insertMany(artists) {
    fileDb.resetArtists(artists)
    return fileDb.getArtists().map((a) => new MockDocument(a, 'artists'))
  }

  static async ensureIndexes() {
    return true
  }
}

export class MockOrderModel {
  static find(query = {}) {
    let orders = [...fileDb.getOrders()]

    if (query.status) {
      orders = orders.filter((o) => o.status === query.status)
    }

    return new MockQuery(orders.map((o) => new MockDocument(o, 'orders')))
  }

  static async findById(id) {
    const order = fileDb.getOrders().find((o) => String(o._id) === String(id))
    if (!order) return null
    return new MockQuery(new MockDocument(order, 'orders'))
  }

  static async create(payload) {
    const now = new Date().toISOString()
    const order = {
      _id: generateId(),
      description: '',
      size: 'Medium',
      status: 'pending',
      assignedArtist: null,
      currentOfferArtist: null,
      currentOfferDistance: null,
      offerSentAt: null,
      rejectedArtists: [],
      matchDistance: null,
      customerSocketId: null,
      ...payload,
      createdAt: now,
      updatedAt: now,
    }
    const saved = fileDb.saveOrder(order)
    return new MockDocument(saved, 'orders')
  }
}
