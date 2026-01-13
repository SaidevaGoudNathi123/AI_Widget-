import { timingSafeEqual } from 'crypto'

/**
 * Validates an API key against configured keys
 * Uses timing-safe comparison to prevent timing attacks
 *
 * @param providedKey - The API key provided in the request header
 * @returns boolean indicating if the key is valid
 */
export function validateApiKey(providedKey: string | null): boolean {
  // Skip validation if REQUIRE_API_KEY is false (works in both dev and production)
  if (process.env.REQUIRE_API_KEY === 'false') {
    return true
  }

  if (!providedKey) return false

  const validKeys = process.env.BUBBL_API_KEYS?.split(',').map(k => k.trim()) || []

  if (validKeys.length === 0) {
    console.error('No API keys configured in BUBBL_API_KEYS')
    return false
  }

  // Use timing-safe comparison to prevent timing attacks
  return validKeys.some(validKey => {
    if (validKey.length !== providedKey.length) return false

    try {
      return timingSafeEqual(
        Buffer.from(validKey),
        Buffer.from(providedKey)
      )
    } catch {
      return false
    }
  })
}

/**
 * Generates a new API key with secure random bytes
 * Format: sk_bubbl_<base64url>
 *
 * @returns A newly generated API key string
 */
export function generateApiKey(): string {
  const crypto = require('crypto')
  return `sk_bubbl_${crypto.randomBytes(32).toString('base64url')}`
}
