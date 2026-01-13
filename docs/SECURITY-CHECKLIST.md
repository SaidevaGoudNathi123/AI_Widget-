# Security Deployment Checklist

This checklist ensures all security features are properly configured before deployment.

**⚠️ IMPORTANT**: Complete ALL items before deploying to production.

---

## Pre-Deployment Checklist

### 1. Environment Configuration

- [ ] **OPENAI_API_KEY** is configured with a valid key
- [ ] **NEXTAUTH_SECRET** is set (generated with `openssl rand -base64 32`)
- [ ] **NEXTAUTH_URL** matches your production domain
- [ ] **BUBBL_API_KEYS** contains at least one secure API key
- [ ] **REQUIRE_API_KEY** is set to `true`
- [ ] **ALLOWED_SITE_DOMAINS** lists only authorized domains (comma-separated)
- [ ] **DEFAULT_SITE_URL** is set to your primary domain
- [ ] **LOG_LEVEL** is set to `info` or `warn` (not `debug` in production)
- [ ] **NODE_ENV** is set to `production`
- [ ] No sensitive data in `.env` file is committed to version control

### 2. API Key Authentication

- [ ] API keys follow format: `sk_bubbl_<random_string>`
- [ ] All API keys are cryptographically random (32+ bytes)
- [ ] API keys are distributed securely (not via email/slack)
- [ ] Key rotation process documented
- [ ] Keys are stored in environment variables only

**Test API Key Authentication:**
```bash
# Without API key (should fail with 401)
curl -X POST https://your-domain.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'

# With valid API key (should succeed)
curl -X POST https://your-domain.com/api/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_bubbl_your_key_here" \
  -d '{"message": "test"}'
```

Expected: First request returns 401, second succeeds

### 3. Input Validation

- [ ] URL protocol validation active (only http/https)
- [ ] Domain whitelist configured in `ALLOWED_SITE_DOMAINS`
- [ ] Message length limiting working (2000 chars max)
- [ ] Query strings and fragments stripped from URLs

**Test Input Validation:**
```bash
# Test javascript: URL injection (should fail with 400)
curl -X POST https://your-domain.com/api/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_key" \
  -d '{"message": "test", "site_url": "javascript:alert(1)"}'

# Test non-whitelisted domain (should fail with 400)
curl -X POST https://your-domain.com/api/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_key" \
  -d '{"message": "test", "site_url": "https://malicious.com"}'
```

Expected: Both requests return 400 VALIDATION_ERROR

### 4. Monitoring & Logging

- [ ] Structured logging enabled (JSON format in production)
- [ ] Log level configured appropriately
- [ ] Request metrics being logged
- [ ] Cost tracking working
- [ ] Security events being logged
- [ ] Logs do NOT contain sensitive data (API keys, passwords, PII)
- [ ] Log aggregation tool configured (optional but recommended)

**Verify Logging:**
- Make a test request and check logs contain:
  - Request ID
  - Duration
  - Status code
  - Token usage (if available)
  - Estimated cost
- Make a failed auth request and verify security event logged

### 5. Security Headers

- [ ] `X-Content-Type-Options: nosniff` present
- [ ] `X-Frame-Options: DENY` present
- [ ] `X-XSS-Protection: 1; mode=block` present
- [ ] `Referrer-Policy: strict-origin-when-cross-origin` present

**Test Headers:**
```bash
curl -I https://your-domain.com/api/chat
```

Expected: All security headers present in response

### 6. Testing

- [ ] All security tests passing
  ```bash
  npm run test:security
  ```
- [ ] No failing unit tests
  ```bash
  npm test
  ```
- [ ] Build succeeds without errors
  ```bash
  npm run build
  ```

### 7. OpenAI Configuration

- [ ] API key is valid and has sufficient credits
- [ ] Spending limits configured in OpenAI dashboard
- [ ] Rate limits understood and documented
- [ ] Cost alerts configured in OpenAI dashboard
- [ ] Usage monitoring in place

**Recommended OpenAI Limits:**
- Set monthly spending limit (e.g., $500/month)
- Enable email alerts at 75% and 90% thresholds
- Monitor daily usage for first week after launch

### 8. Documentation

- [ ] API documentation updated
- [ ] Security features documented
- [ ] Incident response plan created
- [ ] Contact information for security issues documented
- [ ] API key distribution process documented

### 9. Access Control

- [ ] Number of API keys is tracked
- [ ] Each API key has an owner/purpose documented
- [ ] Key revocation process tested
- [ ] Unused API keys revoked

### 10. Deployment

- [ ] Deployed to staging first
- [ ] Smoke tests passed on staging
- [ ] Monitoring verified on staging
- [ ] Rollback plan prepared
- [ ] Team notified of deployment time

---

## Post-Deployment Monitoring (First 24 Hours)

Monitor these metrics closely:

- [ ] Error rate < 1%
- [ ] P95 response time < 5 seconds
- [ ] No security events (invalid API key attempts)
- [ ] OpenAI costs within expected range
- [ ] No 5xx errors

**If any issues detected:**
1. Check logs for error details
2. Verify environment variables
3. If critical, rollback to previous version
4. Fix issue and redeploy

---

## Known Limitations

**⚠️ This deployment does NOT include:**
- Rate limiting (unlimited requests per API key)
- CORS restrictions (accepts requests from any origin)

**Mitigation:**
- Monitor usage closely
- Set OpenAI spending limits
- Revoke API keys if abuse detected
- Consider adding rate limiting if abuse occurs

---

## Security Incident Response

**If security issue detected:**

1. **Immediate Actions:**
   - Revoke compromised API keys immediately
   - Check logs for extent of breach
   - Document timeline of events

2. **Investigation:**
   - Identify attack vector
   - Assess impact (data accessed, costs incurred)
   - Check for similar vulnerabilities

3. **Remediation:**
   - Patch vulnerability
   - Rotate all API keys
   - Deploy fix
   - Verify fix with security tests

4. **Communication:**
   - Notify affected users
   - Document lessons learned
   - Update security procedures

---

## Emergency Contacts

- **OpenAI Support**: https://help.openai.com/
- **Deployment Platform**: [Your platform support]
- **Security Team**: [Your team contact]

---

## Approval Sign-Off

Before deploying to production, get approval from:

- [ ] Engineering Lead
- [ ] Security Team (if applicable)
- [ ] Product Owner

**Deployment Date:** _________________
**Deployed By:** _________________
**Approved By:** _________________

---

**Last Updated:** 2026-01-13
**Version:** 1.0
