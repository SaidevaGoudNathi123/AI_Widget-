/**
 * Input Validation Security Tests
 * Tests for /lib/validation.ts
 */

import { validateSiteUrl, sanitizeMessage } from '../../lib/validation'

describe('Input Validation', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('validateSiteUrl', () => {
    beforeEach(() => {
      process.env.DEFAULT_SITE_URL = 'https://bubbl.io'
    })

    it('should return default URL when url is undefined', () => {
      const result = validateSiteUrl(undefined)
      expect(result).toBe('https://bubbl.io')
    })

    it('should accept valid HTTPS URL', () => {
      const result = validateSiteUrl('https://example.com')
      expect(result).toBe('https://example.com/')
    })

    it('should accept valid HTTP URL', () => {
      const result = validateSiteUrl('http://example.com')
      expect(result).toBe('http://example.com/')
    })

    it('should reject javascript: protocol (XSS prevention)', () => {
      const result = validateSiteUrl('javascript:alert(1)')
      expect(result).toBeNull()
    })

    it('should reject data: protocol', () => {
      const result = validateSiteUrl('data:text/html,<script>alert(1)</script>')
      expect(result).toBeNull()
    })

    it('should reject file: protocol', () => {
      const result = validateSiteUrl('file:///etc/passwd')
      expect(result).toBeNull()
    })

    it('should strip query parameters', () => {
      const result = validateSiteUrl('https://example.com/?malicious=param')
      expect(result).toBe('https://example.com/')
    })

    it('should strip fragment/hash', () => {
      const result = validateSiteUrl('https://example.com/#malicious')
      expect(result).toBe('https://example.com/')
    })

    it('should preserve pathname', () => {
      const result = validateSiteUrl('https://example.com/path/to/page')
      expect(result).toBe('https://example.com/path/to/page')
    })

    it('should reject malformed URLs', () => {
      expect(validateSiteUrl('not a url')).toBeNull()
      expect(validateSiteUrl('htp://broken')).toBeNull()
      expect(validateSiteUrl('://noprotocol')).toBeNull()
    })

    describe('production mode', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'production'
        process.env.ALLOWED_SITE_DOMAINS = 'bubbl.io,example.com'
      })

      it('should accept whitelisted domain', () => {
        const result = validateSiteUrl('https://bubbl.io')
        expect(result).toBe('https://bubbl.io/')
      })

      it('should accept subdomain of whitelisted domain', () => {
        const result = validateSiteUrl('https://app.bubbl.io')
        expect(result).toBe('https://app.bubbl.io/')
      })

      it('should reject non-whitelisted domain', () => {
        const result = validateSiteUrl('https://malicious.com')
        expect(result).toBeNull()
      })

      it('should reject domain that contains whitelisted domain but is not subdomain', () => {
        // Prevent attacks like "malicious-bubbl.io"
        const result = validateSiteUrl('https://malicious-bubbl.io')
        expect(result).toBeNull()
      })

      it('should handle multiple whitelisted domains', () => {
        expect(validateSiteUrl('https://bubbl.io')).not.toBeNull()
        expect(validateSiteUrl('https://example.com')).not.toBeNull()
        expect(validateSiteUrl('https://other.com')).toBeNull()
      })

      it('should return null when ALLOWED_SITE_DOMAINS not configured', () => {
        delete process.env.ALLOWED_SITE_DOMAINS
        const result = validateSiteUrl('https://anything.com')
        expect(result).toBeNull()
      })
    })

    describe('development mode', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'development'
      })

      it('should accept any valid http/https URL', () => {
        expect(validateSiteUrl('https://any-domain.com')).not.toBeNull()
        expect(validateSiteUrl('https://another-domain.org')).not.toBeNull()
      })

      it('should still reject invalid protocols', () => {
        expect(validateSiteUrl('javascript:alert(1)')).toBeNull()
        expect(validateSiteUrl('data:text/html')).toBeNull()
      })
    })
  })

  describe('sanitizeMessage', () => {
    it('should trim whitespace', () => {
      expect(sanitizeMessage('  hello  ')).toBe('hello')
      expect(sanitizeMessage('\n\thello\n\t')).toBe('hello')
    })

    it('should truncate to 2000 characters', () => {
      const longMessage = 'A'.repeat(2500)
      const result = sanitizeMessage(longMessage)

      expect(result.length).toBe(2000)
      expect(result).toBe('A'.repeat(2000))
    })

    it('should preserve messages under 2000 characters', () => {
      const message = 'This is a normal message'
      expect(sanitizeMessage(message)).toBe(message)
    })

    it('should handle empty string', () => {
      expect(sanitizeMessage('')).toBe('')
      expect(sanitizeMessage('   ')).toBe('')
    })

    it('should handle unicode characters', () => {
      const message = 'Hello 👋 World 🌍'
      expect(sanitizeMessage(message)).toBe(message)
    })

    it('should handle newlines and special characters', () => {
      const message = 'Line 1\nLine 2\tTabbed'
      expect(sanitizeMessage(message)).toBe(message)
    })

    it('should trim whitespace before checking length', () => {
      const longMessage = '  ' + 'A'.repeat(2000) + '  '
      const result = sanitizeMessage(longMessage)

      // Should trim first, then truncate
      expect(result.length).toBe(2000)
      expect(result.startsWith(' ')).toBe(false)
    })
  })
})
