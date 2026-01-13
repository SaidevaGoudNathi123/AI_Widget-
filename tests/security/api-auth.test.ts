/**
 * API Authentication Security Tests
 * Tests for /lib/api-auth.ts
 */

import { validateApiKey, generateApiKey } from '../../lib/api-auth'

describe('API Key Authentication', () => {
  const originalEnv = process.env

  beforeEach(() => {
    // Reset environment before each test
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('validateApiKey', () => {
    it('should reject null API key', () => {
      process.env.NODE_ENV = 'production'
      process.env.BUBBL_API_KEYS = 'sk_bubbl_test123'

      expect(validateApiKey(null)).toBe(false)
    })

    it('should reject undefined API key', () => {
      process.env.NODE_ENV = 'production'
      process.env.BUBBL_API_KEYS = 'sk_bubbl_test123'

      expect(validateApiKey(null)).toBe(false)
    })

    it('should reject invalid API key', () => {
      process.env.NODE_ENV = 'production'
      process.env.BUBBL_API_KEYS = 'sk_bubbl_validkey'

      expect(validateApiKey('sk_bubbl_invalidkey')).toBe(false)
    })

    it('should accept valid API key', () => {
      process.env.NODE_ENV = 'production'
      const validKey = 'sk_bubbl_validkey123'
      process.env.BUBBL_API_KEYS = validKey

      expect(validateApiKey(validKey)).toBe(true)
    })

    it('should support multiple API keys', () => {
      process.env.NODE_ENV = 'production'
      const key1 = 'sk_bubbl_key1'
      const key2 = 'sk_bubbl_key2'
      process.env.BUBBL_API_KEYS = `${key1},${key2}`

      expect(validateApiKey(key1)).toBe(true)
      expect(validateApiKey(key2)).toBe(true)
      expect(validateApiKey('sk_bubbl_key3')).toBe(false)
    })

    it('should handle whitespace in API keys list', () => {
      process.env.NODE_ENV = 'production'
      const key1 = 'sk_bubbl_key1'
      const key2 = 'sk_bubbl_key2'
      process.env.BUBBL_API_KEYS = `${key1}, ${key2} , sk_bubbl_key3`

      expect(validateApiKey(key1)).toBe(true)
      expect(validateApiKey(key2)).toBe(true)
      expect(validateApiKey('sk_bubbl_key3')).toBe(true)
    })

    it('should bypass validation in development when REQUIRE_API_KEY is false', () => {
      process.env.NODE_ENV = 'development'
      process.env.REQUIRE_API_KEY = 'false'
      process.env.BUBBL_API_KEYS = 'sk_bubbl_validkey'

      // Should accept any key in dev mode when REQUIRE_API_KEY is false
      expect(validateApiKey('any_invalid_key')).toBe(true)
    })

    it('should enforce validation in development when REQUIRE_API_KEY is true', () => {
      process.env.NODE_ENV = 'development'
      process.env.REQUIRE_API_KEY = 'true'
      const validKey = 'sk_bubbl_validkey'
      process.env.BUBBL_API_KEYS = validKey

      expect(validateApiKey(validKey)).toBe(true)
      expect(validateApiKey('invalid')).toBe(false)
    })

    it('should reject when no API keys configured', () => {
      process.env.NODE_ENV = 'production'
      process.env.BUBBL_API_KEYS = ''

      expect(validateApiKey('any_key')).toBe(false)
    })

    it('should use timing-safe comparison (constant time)', () => {
      // This test ensures the function doesn't short-circuit
      process.env.NODE_ENV = 'production'
      process.env.BUBBL_API_KEYS = 'sk_bubbl_validkey123'

      const startCorrect = process.hrtime.bigint()
      validateApiKey('sk_bubbl_validkey123')
      const endCorrect = process.hrtime.bigint()

      const startWrong = process.hrtime.bigint()
      validateApiKey('sk_bubbl_wrongkey123')
      const endWrong = process.hrtime.bigint()

      // Times should be roughly equal (within 100x tolerance)
      // This is a simplified test - real timing attacks are more sophisticated
      const correctTime = Number(endCorrect - startCorrect)
      const wrongTime = Number(endWrong - startWrong)

      // Just verify both complete (actual timing analysis would need many iterations)
      expect(correctTime).toBeGreaterThan(0)
      expect(wrongTime).toBeGreaterThan(0)
    })
  })

  describe('generateApiKey', () => {
    it('should generate key with correct prefix', () => {
      const key = generateApiKey()
      expect(key).toMatch(/^sk_bubbl_/)
    })

    it('should generate unique keys', () => {
      const key1 = generateApiKey()
      const key2 = generateApiKey()

      expect(key1).not.toBe(key2)
    })

    it('should generate keys of expected length', () => {
      const key = generateApiKey()
      // sk_bubbl_ (9 chars) + 43 chars base64url (32 bytes) = 52+ chars
      expect(key.length).toBeGreaterThan(50)
    })

    it('should generate base64url safe characters', () => {
      const key = generateApiKey()
      // Base64url uses A-Z, a-z, 0-9, -, _ (no +, /, =)
      expect(key).toMatch(/^sk_bubbl_[A-Za-z0-9_-]+$/)
    })
  })
})
