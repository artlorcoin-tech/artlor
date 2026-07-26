/**
 * Supabase Client — Lightweight REST API wrapper
 * 
 * Uses the Supabase REST (PostgREST) endpoint directly via fetch,
 * so no extra SDK dependency is needed. Every order placed through
 * OrderForm or QuickOrder is persisted here in the `orders` table.
 *
 * Environment variables (set in .env):
 *   VITE_SUPABASE_URL   — Supabase REST base URL
 *   VITE_SUPABASE_ANON  — Supabase anon/publishable key
 */

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://kuwqtzynfdvqtjqurqsv.supabase.co/rest/v1'

const SUPABASE_ANON =
  import.meta.env.VITE_SUPABASE_ANON ||
  'sb_publishable_OO6b1C_yy5URFdj6wvYtUg_iqXeMmHL'

/**
 * Insert a row into a Supabase table via the REST API.
 *
 * @param {string} table  — table name (e.g. "orders")
 * @param {object} row    — key/value object matching table columns
 * @returns {Promise<object>} — the created row (or error info)
 */
export async function supabaseInsert(table, row) {
  const url = `${SUPABASE_URL}/${table}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${SUPABASE_ANON}`,
      Prefer: 'return=representation',
    },
    body: JSON.stringify(row),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    console.error('[Supabase] Insert failed:', response.status, errorBody)
    throw new Error(`Supabase insert failed (${response.status})`)
  }

  const data = await response.json()
  return data
}

/**
 * Fetch rows from a Supabase table (simple select).
 *
 * @param {string} table   — table name
 * @param {string} [query] — PostgREST query string, e.g. "order_type=eq.quick"
 * @returns {Promise<Array>}
 */
export async function supabaseSelect(table, query = '') {
  const url = `${SUPABASE_URL}/${table}${query ? `?${query}` : ''}`

  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${SUPABASE_ANON}`,
    },
  })

  if (!response.ok) {
    const errorBody = await response.text()
    console.error('[Supabase] Select failed:', response.status, errorBody)
    throw new Error(`Supabase select failed (${response.status})`)
  }

  return response.json()
}

/**
 * Send a production-grade OTP to a phone number or email address via Supabase Auth (GoTrue).
 * Ensure Twilio (for phone) or SMTP (for email) is configured in your Supabase Dashboard.
 * 
 * @param {object} params - { phone: string } OR { email: string }
 * @returns {Promise<boolean>}
 */
export async function supabaseSendOtp(params) {
  const authUrl = SUPABASE_URL.replace(/\/rest\/v1\/?$/, '/auth/v1')
  const url = `${authUrl}/otp`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON,
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    console.error('[Supabase Auth] Sending OTP failed:', response.status, errorBody)
    let message = 'Verification code sending failed.'
    try {
      const errJson = JSON.parse(errorBody)
      if (errJson.msg) message = errJson.msg
    } catch (e) {}
    throw new Error(message)
  }

  return true
}

/**
 * Verify a production-grade OTP token for a phone number or email address.
 * 
 * @param {object} params - { phone: string, token: string, type: 'sms' } OR { email: string, token: string, type: 'signup' }
 * @returns {Promise<object>} - GoTrue session token
 */
export async function supabaseVerifyOtp(params) {
  const authUrl = SUPABASE_URL.replace(/\/rest\/v1\/?$/, '/auth/v1')
  const url = `${authUrl}/verify`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON,
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    console.error('[Supabase Auth] Verification failed:', response.status, errorBody)
    let message = 'Invalid or expired verification code. Please try again.'
    try {
      const errJson = JSON.parse(errorBody)
      if (errJson.msg) message = errJson.msg
    } catch (e) {}
    throw new Error(message)
  }

  const session = await response.json()
  return session
}

/**
 * Fetch and merge rows from custom_orders + quick_orders in parallel.
 * Returns a single array sorted by created_at descending.
 *
 * @param {string} [query] — optional PostgREST query string applied to both tables
 * @returns {Promise<Array>}
 */
export async function supabaseSelectBoth(query = '') {
  const [custom, quick] = await Promise.all([
    supabaseSelect('custom_orders', query),
    supabaseSelect('quick_orders', query),
  ])

  const withType = [
    ...custom.map((r) => ({ ...r, _table: 'custom' })),
    ...quick.map((r) => ({ ...r, _table: 'quick' })),
  ]

  withType.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return withType
}

/**
 * Fetch reference images from `gallery_references` table.
 *
 * @param {number|string} [paintingId] - optional filter by painting_id
 * @returns {Promise<Array>}
 */
export async function supabaseGetGalleryReferences(paintingId = null) {
  const query = paintingId ? `painting_id=eq.${paintingId}&order=created_at.desc` : 'order=created_at.desc'
  try {
    return await supabaseSelect('gallery_references', query)
  } catch (err) {
    console.warn('[Supabase] Could not fetch gallery_references (table may not exist yet):', err.message)
    return []
  }
}

/**
 * Add a new reference image record to `gallery_references`.
 *
 * @param {object} refData - { painting_id, painting_title, image_url, caption }
 * @returns {Promise<object>}
 */
export async function supabaseAddGalleryReference(refData) {
  return await supabaseInsert('gallery_references', refData)
}

/**
 * Delete a reference image record by ID.
 *
 * @param {string} id - UUID of reference image record
 * @returns {Promise<boolean>}
 */
export async function supabaseDeleteGalleryReference(id) {
  const url = `${SUPABASE_URL}/gallery_references?id=eq.${id}`
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${SUPABASE_ANON}`,
    },
  })

  if (!response.ok) {
    const errorBody = await response.text()
    console.error('[Supabase] Delete reference failed:', response.status, errorBody)
    throw new Error(`Delete failed (${response.status})`)
  }

  return true
}

/**
 * Upload a reference file to Supabase Storage bucket `gallery-references`.
 * Returns the public URL of the uploaded image.
 *
 * @param {File} file - Browser File object
 * @returns {Promise<string>} - Public image URL
 */
export async function supabaseUploadGalleryReferenceFile(file) {
  const sanitizeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const fileName = `${Date.now()}_${sanitizeName}`
  
  // Storage REST URL
  const storageUrl = SUPABASE_URL.replace(/\/rest\/v1\/?$/, '/storage/v1')
  const uploadUrl = `${storageUrl}/object/gallery-references/${fileName}`

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${SUPABASE_ANON}`,
      'Content-Type': file.type || 'application/octet-stream',
      'x-upsert': 'true',
    },
    body: file,
  })

  if (!response.ok) {
    const errorBody = await response.text()
    console.error('[Supabase Storage] File upload failed:', response.status, errorBody)
    throw new Error(`Upload failed (${response.status}): ensure 'gallery-references' bucket exists and is public in Supabase.`)
  }

  // Public storage URL format
  const publicUrl = `${storageUrl}/object/public/gallery-references/${fileName}`
  return publicUrl
}

/**
 * Fetch all gallery paintings from `gallery_paintings` table.
 * Falls back to default `galleryPaintings` static array if table not populated yet.
 *
 * @returns {Promise<Array>}
 */
export async function supabaseGetGalleryPaintings() {
  try {
    const data = await supabaseSelect('gallery_paintings', 'order=id.asc')
    if (data && data.length > 0) {
      // Merge with local overrides if any exist in localStorage
      const localEdits = JSON.parse(localStorage.getItem('artlor_painting_edits') || '{}')
      return data.map(p => ({
        ...p,
        ...(localEdits[p.id] || {})
      }))
    }
  } catch (err) {
    console.warn('[Supabase] Fetch gallery_paintings table failed, using static/local fallback:', err.message)
  }

  // Fallback to static list + local overrides
  const { galleryPaintings } = await import('../galleryPaintings')
  const localEdits = JSON.parse(localStorage.getItem('artlor_painting_edits') || '{}')
  return galleryPaintings.map(p => ({
    ...p,
    ...(localEdits[p.id] || {})
  }))
}

/**
 * Update a painting's title, style/category, or artist in Supabase (and sync to LocalStorage fallback).
 *
 * @param {number|string} id - Painting ID
 * @param {object} updates - { title, style, artist }
 * @returns {Promise<object>}
 */
export async function supabaseUpdateGalleryPainting(id, updates) {
  // Always update local cache fallback
  const localEdits = JSON.parse(localStorage.getItem('artlor_painting_edits') || '{}')
  localEdits[id] = { ...(localEdits[id] || {}), ...updates }
  localStorage.setItem('artlor_painting_edits', JSON.stringify(localEdits))

  // Try updating Supabase table
  try {
    const url = `${SUPABASE_URL}/gallery_paintings?id=eq.${id}`
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify(updates),
    })

    if (response.ok) {
      const data = await response.json()
      return data[0] || { id, ...updates }
    }
  } catch (err) {
    console.warn('[Supabase] Could not update remote gallery_paintings table:', err.message)
  }

  return { id, ...updates }
}

/**
 * Add a new custom painting to `gallery_paintings`.
 *
 * @param {object} paintingData - { title, style, artist, image }
 * @returns {Promise<object>}
 */
export async function supabaseAddGalleryPainting(paintingData) {
  try {
    const data = await supabaseInsert('gallery_paintings', paintingData)
    return data[0] || data
  } catch (err) {
    console.warn('[Supabase] Add gallery painting failed:', err.message)
    throw err
  }
}


