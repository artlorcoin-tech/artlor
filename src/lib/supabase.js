import { supabase } from './supabaseClient'

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
 * Safely set item in localStorage with quota error handling & automatic base64 pruning.
 * Prevents QuotaExceededError DOMException from crashing the application.
 *
 * @param {string} key
 * @param {string} value
 * @returns {boolean}
 */
export function safeLocalStorageSetItem(key, value) {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (err) {
    console.warn(`[Storage] localStorage.setItem failed for key "${key}":`, err?.message || err)

    const isQuotaError =
      err &&
      (err.name === 'QuotaExceededError' ||
        err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        err.code === 22 ||
        err.code === 1014)

    if (isQuotaError) {
      console.warn('[Storage] Quota exceeded. Pruning base64 image data from localStorage cache...')
      try {
        // 1. Remove base64 data URLs from custom paintings local cache
        const rawCustom = localStorage.getItem('artlor_custom_paintings')
        if (rawCustom) {
          const customPaintings = JSON.parse(rawCustom)
          if (Array.isArray(customPaintings)) {
            const sanitized = customPaintings.map((p) => {
              if (typeof p.image === 'string' && p.image.startsWith('data:image/')) {
                return { ...p, image: '' }
              }
              return p
            })
            localStorage.setItem('artlor_custom_paintings', JSON.stringify(sanitized))
          }
        }

        // 2. Retry saving target item
        localStorage.setItem(key, value)
        console.log('[Storage] Successfully saved after clearing base64 cache!')
        return true
      } catch (retryErr) {
        console.warn('[Storage] Could not save to localStorage even after pruning:', retryErr?.message || retryErr)
      }
    }
    return false
  }
}

/**
 * Safely get item from localStorage without throwing exceptions.
 *
 * @param {string} key
 * @param {string|null} [fallback=null]
 * @returns {string|null}
 */
export function safeLocalStorageGetItem(key, fallback = null) {
  try {
    const val = localStorage.getItem(key)
    return val !== null ? val : fallback
  } catch (e) {
    console.warn(`[Storage] localStorage.getItem failed for key "${key}":`, e?.message)
    return fallback
  }
}

/**
 * Compress an image file on the client side before uploading.
 * Optimized for high performance and low file size (<150KB JPEG, 1000px max).
 *
 * @param {File} file - Browser File object (image)
 * @param {object} [options]
 * @param {number} [options.maxWidth=1000] - Max width in pixels
 * @param {number} [options.maxHeight=1000] - Max height in pixels
 * @param {number} [options.quality=0.6] - JPEG quality (0-1)
 * @param {number} [options.maxSizeKB=150] - Target max file size in KB
 * @returns {Promise<File>} - Compressed File object
 */
async function compressImageFile(file, options = {}) {
  const {
    maxWidth = 1000,
    maxHeight = 1000,
    quality = 0.6,
    maxSizeKB = 150,
  } = options

  // Skip compression only for very small image files (under 150KB) or non-images
  if (file.size <= maxSizeKB * 1024 || !file.type.startsWith('image/')) {
    return file
  }

  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img

      // Calculate new dimensions maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      // Draw to canvas
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      // Convert to blob with JPEG compression
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.warn('[Compress] Canvas toBlob returned null, using original file')
            resolve(file)
            return
          }

          const compressedName = file.name.replace(/\.[^.]+$/, '') + '.jpg'
          const compressedFile = new File([blob], compressedName, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          })

          console.log(
            `[Compress] ${file.name}: ${(file.size / 1024).toFixed(0)}KB → ${(compressedFile.size / 1024).toFixed(0)}KB (${Math.round((1 - compressedFile.size / file.size) * 100)}% reduction)`
          )

          resolve(compressedFile)
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      console.warn('[Compress] Failed to load image for compression, using original')
      resolve(file)
    }

    img.src = url
  })
}

/**
 * Upload a reference file to Supabase Storage bucket `gallery-references`.
 * Automatically compresses large images (especially from iPhone/mobile cameras)
 * before uploading to avoid quota issues.
 *
 * Returns the public URL of the uploaded image. Fallbacks to Data URL if storage not set up.
 *
 * @param {File} file - Browser File object
 * @returns {Promise<string>} - Public image URL
 */
export async function supabaseUploadGalleryReferenceFile(file) {
  // Compress image before uploading (critical for iPhone photos that can be 5-10+ MB)
  const compressedFile = await compressImageFile(file)

  const sanitizeName = compressedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const fileName = `${Date.now()}_${sanitizeName}`

  try {
    const { data, error } = await supabase.storage
      .from('gallery-references')
      .upload(fileName, compressedFile, {
        cacheControl: '3600',
        upsert: true,
      })

    if (!error && data?.path) {
      const { data: publicUrlData } = supabase.storage
        .from('gallery-references')
        .getPublicUrl(data.path)
      if (publicUrlData?.publicUrl) {
        return publicUrlData.publicUrl
      }
    }

    if (error) {
      console.warn('[Supabase Storage] Storage API error:', error.message)
    }
  } catch (err) {
    console.warn('[Supabase Storage] Storage upload failed, falling back to data URL:', err.message)
  }

  // Fallback: Convert compressed image to Data URL (Base64) so image works immediately
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = (err) => reject(err)
    reader.readAsDataURL(compressedFile)
  })
}


/**
 * Fetch all gallery paintings from `gallery_paintings` table (or static fallback + custom local paintings).
 * Results are sorted by sort_order ascending (lowest sort_order = first in gallery).
 *
 * @returns {Promise<Array>}
 */
export async function supabaseGetGalleryPaintings() {
  const { galleryPaintings } = await import('../galleryPaintings')
  let paintingsList = [...galleryPaintings]
  let fetchedFromRemote = false

  try {
    const data = await supabaseSelect('gallery_paintings', 'order=sort_order.asc,id.asc')
    if (data && Array.isArray(data) && data.length > 0) {
      paintingsList = data
      fetchedFromRemote = true
    }
  } catch (err) {
    console.warn('[Supabase] Fetch gallery_paintings table failed, using local fallback:', err.message)
  }

  // When Supabase DB successfully provides gallery paintings, use it as the single source of truth across all devices!
  if (fetchedFromRemote) {
    // Purge any stale local custom entries that are already present in Supabase DB
    const customPaintings = JSON.parse(safeLocalStorageGetItem('artlor_custom_paintings', '[]'))
    if (customPaintings.length > 0) {
      const remainingCustoms = customPaintings.filter((custom) => {
        return !paintingsList.some(
          (remote) =>
            String(remote.id) === String(custom.id) ||
            (custom.image && remote.image === custom.image) ||
            (custom.title && remote.title && remote.title.toLowerCase() === custom.title.toLowerCase() && remote.style === custom.style)
        )
      })
      safeLocalStorageSetItem('artlor_custom_paintings', JSON.stringify(remainingCustoms))
    }

    // Deduplicate paintingsList strictly by ID and by image URL to guarantee 1 copy per artwork while allowing different paintings with same titles
    const seenIds = new Set()
    const seenImages = new Set()
    const deduplicated = []

    for (const p of paintingsList) {
      const idKey = String(p.id)
      const imgKey = p.image ? String(p.image).trim() : null

      if (!seenIds.has(idKey) && (!imgKey || !seenImages.has(imgKey))) {
        seenIds.add(idKey)
        if (imgKey) seenImages.add(imgKey)
        deduplicated.push(p)
      }
    }

    return deduplicated
  }

  // Fallback for offline / before table creation in Supabase:
  const customPaintings = JSON.parse(safeLocalStorageGetItem('artlor_custom_paintings', '[]'))
  const merged = [...paintingsList]

  // Add custom paintings if not already in list
  customPaintings.forEach((custom) => {
    if (!merged.some((p) => String(p.id) === String(custom.id))) {
      merged.push(custom)
    }
  })

  // Filter out deleted paintings
  const deletedIds = JSON.parse(safeLocalStorageGetItem('artlor_deleted_paintings', '[]')).map(String)
  const activePaintings = merged.filter((p) => !deletedIds.includes(String(p.id)))

  // Apply edits (titles/categories)
  const localEdits = JSON.parse(safeLocalStorageGetItem('artlor_painting_edits', '{}'))

  // Apply local sort order override if it exists
  const localOrder = JSON.parse(safeLocalStorageGetItem('artlor_painting_order', '[]'))

  let result = activePaintings.map((p) => ({
    ...p,
    ...(localEdits[p.id] || {}),
  }))

  // If we have a saved local order, sort by that order
  if (localOrder.length > 0) {
    const orderMap = {}
    localOrder.forEach((id, index) => { orderMap[String(id)] = index })
    result.sort((a, b) => {
      const orderA = orderMap[String(a.id)] !== undefined ? orderMap[String(a.id)] : 99999
      const orderB = orderMap[String(b.id)] !== undefined ? orderMap[String(b.id)] : 99999
      return orderA - orderB
    })
  }

  // Deduplicate fallback list
  const seenIds = new Set()
  const seenImages = new Set()
  const deduplicatedFallback = []
  for (const p of result) {
    const idKey = String(p.id)
    const imgKey = p.image ? String(p.image).trim() : null
    if (!seenIds.has(idKey) && (!imgKey || !seenImages.has(imgKey))) {
      seenIds.add(idKey)
      if (imgKey) seenImages.add(imgKey)
      deduplicatedFallback.push(p)
    }
  }

  return deduplicatedFallback
}

/**
 * Update a painting's title, style/category, or artist in Supabase (and sync to LocalStorage fallback).
 *
 * @param {number|string} id - Painting ID
 * @param {object} updates - { title, style, artist }
 * @returns {Promise<object>}
 */
export async function supabaseUpdateGalleryPainting(id, updates) {
  // Update local cache fallback
  const localEdits = JSON.parse(safeLocalStorageGetItem('artlor_painting_edits', '{}'))
  localEdits[id] = { ...(localEdits[id] || {}), ...updates }
  safeLocalStorageSetItem('artlor_painting_edits', JSON.stringify(localEdits))

  // Update in custom paintings if present
  const customPaintings = JSON.parse(safeLocalStorageGetItem('artlor_custom_paintings', '[]'))
  const updatedCustoms = customPaintings.map((c) => (String(c.id) === String(id) ? { ...c, ...updates } : c))
  safeLocalStorageSetItem('artlor_custom_paintings', JSON.stringify(updatedCustoms))

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
  const tempId = Date.now()
  const newPainting = {
    id: tempId,
    title: paintingData.title,
    style: paintingData.style,
    artist: paintingData.artist || '',
    image: paintingData.image,
    sort_order: 0, // New paintings always appear first
    created_at: new Date().toISOString(),
  }

  // Save to custom local cache for instant UI feedback before remote response
  const customPaintings = JSON.parse(safeLocalStorageGetItem('artlor_custom_paintings', '[]'))
  customPaintings.push(newPainting)
  safeLocalStorageSetItem('artlor_custom_paintings', JSON.stringify(customPaintings))

  // Try inserting into Supabase table
  try {
    const data = await supabaseInsert('gallery_paintings', {
      title: newPainting.title,
      style: newPainting.style,
      artist: newPainting.artist,
      image: newPainting.image,
      sort_order: 0,
    })
    if (data && data.length > 0) {
      const realPainting = data[0]

      // Clean up temporary local entry now that it's persisted in Supabase DB
      const customs = JSON.parse(safeLocalStorageGetItem('artlor_custom_paintings', '[]'))
      const cleanedCustoms = customs.filter((c) => String(c.id) !== String(tempId))
      safeLocalStorageSetItem('artlor_custom_paintings', JSON.stringify(cleanedCustoms))

      // Bump sort_order of existing paintings so this new one stays at position 0
      try {
        await supabaseBumpSortOrders(realPainting.id)
      } catch (e) {
        console.warn('[Supabase] Could not bump sort orders:', e.message)
      }

      return realPainting
    }
  } catch (err) {
    console.warn('[Supabase] Add gallery painting to table failed, using local cache fallback:', err.message)
  }

  return newPainting
}

/**
 * Bump the sort_order of all paintings except the given one, so the given painting stays first (sort_order=0).
 * @param {number|string} exceptId - The ID of the painting to keep at position 0
 */
async function supabaseBumpSortOrders(exceptId) {
  try {
    const all = await supabaseSelect('gallery_paintings', 'order=sort_order.asc,id.asc')
    const updates = all
      .filter((p) => String(p.id) !== String(exceptId))
      .map((p, i) => ({ id: p.id, sort_order: i + 1 }))

    await Promise.all(
      updates.map(({ id, sort_order }) =>
        fetch(`${SUPABASE_URL}/gallery_paintings?id=eq.${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_ANON,
            Authorization: `Bearer ${SUPABASE_ANON}`,
          },
          body: JSON.stringify({ sort_order }),
        })
      )
    )
  } catch (err) {
    console.warn('[Supabase] supabaseBumpSortOrders failed:', err.message)
  }
}

/**
 * Reorder gallery paintings by saving the new order to Supabase.
 * Accepts an array of painting IDs in the desired display order.
 *
 * @param {Array<number|string>} orderedIds - Array of painting IDs in desired order
 * @returns {Promise<boolean>}
 */
export async function supabaseReorderGalleryPaintings(orderedIds) {
  // Save order to localStorage for instant UI response
  safeLocalStorageSetItem('artlor_painting_order', JSON.stringify(orderedIds))

  // Persist new sort_order to Supabase DB for each painting
  try {
    await Promise.all(
      orderedIds.map((id, index) =>
        fetch(`${SUPABASE_URL}/gallery_paintings?id=eq.${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_ANON,
            Authorization: `Bearer ${SUPABASE_ANON}`,
          },
          body: JSON.stringify({ sort_order: index }),
        })
      )
    )
    console.log('[Supabase] Gallery painting order saved successfully to DB!')
  } catch (err) {
    console.warn('[Supabase] Could not save painting order to Supabase:', err.message)
  }

  return true
}

/**
 * Delete a gallery painting by ID (from Supabase table and local cache).
 *
 * @param {number|string} id - Painting ID
 * @returns {Promise<boolean>}
 */
export async function supabaseDeleteGalleryPainting(id) {
  const strId = String(id)

  // 1. Mark as deleted in local storage
  const deletedIds = JSON.parse(safeLocalStorageGetItem('artlor_deleted_paintings', '[]')).map(String)
  if (!deletedIds.includes(strId)) {
    deletedIds.push(strId)
    safeLocalStorageSetItem('artlor_deleted_paintings', JSON.stringify(deletedIds))
  }

  // 2. Remove from custom paintings if present
  const customPaintings = JSON.parse(safeLocalStorageGetItem('artlor_custom_paintings', '[]'))
  const updatedCustoms = customPaintings.filter((c) => String(c.id) !== strId)
  safeLocalStorageSetItem('artlor_custom_paintings', JSON.stringify(updatedCustoms))

  // 3. Remove from order list
  const localOrder = JSON.parse(safeLocalStorageGetItem('artlor_painting_order', '[]')).map(String)
  const updatedOrder = localOrder.filter((oId) => oId !== strId)
  safeLocalStorageSetItem('artlor_painting_order', JSON.stringify(updatedOrder))

  // 4. Delete from Supabase table
  try {
    const url = `${SUPABASE_URL}/gallery_paintings?id=eq.${id}`
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
      },
    })

    if (!response.ok) {
      console.warn('[Supabase] Delete remote painting returned status:', response.status)
    }
  } catch (err) {
    console.warn('[Supabase] Delete remote painting failed:', err.message)
  }

  return true
}




