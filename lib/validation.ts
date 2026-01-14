/**
 * Input validation and sanitization utilities
 * Prevents injection attacks and ensures data integrity
 */

/**
 * Validates and sanitizes a site URL
 * - Only allows http/https protocols
 * - In production, enforces domain whitelist
 * - Strips query parameters and fragments for security
 *
 * @param url - The URL to validate
 * @returns Sanitized URL string, or null if invalid
 */
export function validateSiteUrl(url: string | undefined): string | null {
  if (!url) {
    return process.env.DEFAULT_SITE_URL || 'https://bubbl.io'
  }

  try {
    const parsed = new URL(url)

    // Only allow http/https protocols (prevents javascript:, data:, etc.)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      console.warn(`Invalid protocol in site_url: ${parsed.protocol}`)
      return null
    }

    // For production, only allow whitelisted domains (if configured)
    if (process.env.NODE_ENV === 'production') {
      const allowedDomains = process.env.ALLOWED_SITE_DOMAINS?.split(',').map(d => d.trim()) || []

      // If ALLOWED_SITE_DOMAINS is set to "*" or not configured, allow all domains
      if (allowedDomains.length === 0 || allowedDomains.includes('*')) {
        console.log('Allowing all domains (no whitelist configured or wildcard set)')
        // Allow all domains - no restriction
      } else {
        // Check if hostname matches any allowed domain (exact match or subdomain)
        const isAllowed = allowedDomains.some(domain =>
          parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
        )

        if (!isAllowed) {
          console.warn(`Domain not in whitelist: ${parsed.hostname}`)
          return null
        }
      }
    }

    // Return sanitized URL (protocol + hostname + pathname, no query or hash)
    // This prevents query string injection and fragment-based attacks
    // Remove trailing slash for consistency
    const pathname = parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/$/, '')
    return `${parsed.protocol}//${parsed.hostname}${pathname}`
  } catch (error) {
    console.warn(`Invalid URL format: ${url}`)
    return null
  }
}

/**
 * Sanitizes a user message
 * - Trims whitespace
 * - Limits length to prevent abuse
 *
 * @param message - The message to sanitize
 * @returns Sanitized message string
 */
export function sanitizeMessage(message: string): string {
  // Trim whitespace and limit to 2000 characters
  return message.trim().slice(0, 2000)
}
