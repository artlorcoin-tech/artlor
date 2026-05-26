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
