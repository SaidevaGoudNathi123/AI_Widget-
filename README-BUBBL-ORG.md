# Bubbl AI Chatbot Widget 🤖

A production-ready AI chatbot widget powered by OpenAI, with comprehensive security features and easy deployment.

## 🌟 Features

- ✅ **OpenAI Integration** - GPT-powered conversational AI
- ✅ **Security First** - API key authentication, input validation, monitoring
- ✅ **Production Ready** - Structured logging, cost tracking, error handling
- ✅ **Easy Deployment** - One-click Railway deployment
- ✅ **Fully Tested** - 39 security tests, 100% passing
- ✅ **React Component** - Ready-to-use UI component
- ✅ **REST API** - Use anywhere (Bubble.io, websites, apps)

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites

- Node.js 18+ installed
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Git installed

### 1. Clone the Repository

```bash
git clone https://github.com/bubblco/bubbl-ai-widget.git
cd bubbl-ai-widget
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Required: Your OpenAI API Key
OPENAI_API_KEY=sk-proj-your-openai-key-here

# Required: NextAuth Configuration
NEXTAUTH_SECRET=generate-with-command-below
NEXTAUTH_URL=http://localhost:3000

# Optional: API Security (false = open access, true = requires API key)
REQUIRE_API_KEY=false

# Optional: Environment
NODE_ENV=development
LOG_LEVEL=info
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser! 🎉

### 5. Test the API

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, AI!"}'
```

You should get an AI response! ✅

---

## 📦 What's Included

```
bubbl-ai-widget/
├── app/
│   ├── api/chat/           # Main chat API endpoint
│   └── api/chat/converse/  # Authenticated chat endpoint
├── lib/
│   ├── api-auth.ts         # API key authentication
│   ├── validation.ts       # Input validation & sanitization
│   ├── logger.ts           # Structured logging
│   ├── monitoring.ts       # Cost tracking & metrics
│   └── config.ts           # Chatbot configuration
├── tests/
│   └── security/           # 39 security tests
├── docs/
│   └── SECURITY-CHECKLIST.md  # Pre-deployment checklist
└── components/             # React UI components
```

---

## 🔐 Security Features

### 1. API Key Authentication (Optional)
- Secure endpoint access with API keys
- Timing-safe key comparison
- Support for multiple keys
- Development bypass mode

### 2. Input Validation
- Prevents XSS attacks (javascript:, data: URLs blocked)
- Domain whitelist in production
- Message length limiting (2000 chars)
- Query parameter stripping

### 3. Monitoring & Logging
- Structured JSON logs in production
- Request metrics tracking
- OpenAI cost estimation per request
- High-cost request alerts
- Security event logging

### 4. Comprehensive Testing
- 39 security tests (all passing)
- API authentication tests
- Input validation tests
- Automated test suite

---

## 🌐 Deploy to Railway

### Option 1: Quick Deploy (Recommended)

1. **Sign up for Railway**: https://railway.app/
2. **Click "New Project"** → **"Deploy from GitHub repo"**
3. **Select**: `bubblco/bubbl-ai-widget`
4. **Add Environment Variables** (see below)
5. **Deploy!** 🚀

### Option 2: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Add environment variables
railway variables set OPENAI_API_KEY=sk-proj-your-key

# Deploy
railway up
```

### Required Environment Variables for Railway

```bash
OPENAI_API_KEY=sk-proj-your-openai-key-here
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=https://your-app.up.railway.app
REQUIRE_API_KEY=false
NODE_ENV=production
LOG_LEVEL=info
```

**⚠️ Important:**
- No quotes around values!
- Update `NEXTAUTH_URL` with your actual Railway URL after first deployment

### Deployment Costs

- **Railway**: ~$5/month (first $5 free credit)
- **OpenAI**: ~$0.001 per message
- **Total**: Very affordable! 💰

---

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run Security Tests Only

```bash
npm run test:security
```

**Expected Output:**
```
Test Suites: 2 passed, 2 total
Tests:       39 passed, 39 total
```

### Run in Watch Mode

```bash
npm run test:watch
```

### Check Test Coverage

```bash
npm run test:coverage
```

---

## 📖 API Documentation

### Endpoint: `POST /api/chat`

**Request:**
```json
{
  "message": "Your message here",
  "thread_id": "optional-conversation-id",
  "site_url": "https://your-site.com"
}
```

**Response (Success):**
```json
{
  "message": "AI response here",
  "thread_id": "conversation-id-for-continuity",
  "timestamp": "2026-01-13T23:00:00.000Z",
  "success": true,
  "requestId": "unique-request-id",
  "duration": 1234
}
```

**Response (Error):**
```json
{
  "message": "Error message",
  "error": true,
  "code": "ERROR_CODE",
  "retryable": true,
  "requestId": "unique-request-id"
}
```

### Error Codes

- `VALIDATION_ERROR` - Invalid input (malformed JSON, empty message)
- `AUTH_ERROR` - Invalid or missing API key (when REQUIRE_API_KEY=true)
- `MODEL_ERROR` - OpenAI service unavailable
- `TIMEOUT` - Request took too long (>25 seconds)
- `UNKNOWN` - Unexpected error

### Example Usage

**JavaScript/Fetch:**
```javascript
const response = await fetch('https://your-app.up.railway.app/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello!' })
});

const data = await response.json();
console.log(data.message); // AI response
```

**cURL:**
```bash
curl -X POST https://your-app.up.railway.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!"}'
```

**Python:**
```python
import requests

response = requests.post(
    'https://your-app.up.railway.app/api/chat',
    json={'message': 'Hello!'}
)

data = response.json()
print(data['message'])  # AI response
```

---

## 🎨 Using the React Component

```jsx
import ProductionChatbot from '@/components/ProductionChatbot'

function MyPage() {
  return (
    <div>
      <h1>My Website</h1>
      <ProductionChatbot apiUrl="/api/chat" />
    </div>
  )
}
```

---

## 🔧 Configuration

### Customize the Chatbot

Edit `lib/config.ts` to customize:

```typescript
export const chatbotConfig = {
  name: "Bubbl AI Assistant",

  model: {
    name: "gpt-3.5-turbo",  // Change to "gpt-4" for better responses
    temperature: 0.7,        // 0-1: Lower = more focused
    maxTokens: 500,          // Max response length
  },

  systemPrompt: (siteUrl) => `
    You are a helpful assistant for ${siteUrl}.
    Be friendly and concise.
  `
}
```

### Enable API Key Security

If you want to require API keys for access:

**1. Generate an API key:**
```bash
node -e "console.log('sk_bubbl_' + require('crypto').randomBytes(32).toString('base64url'))"
```

**2. Update `.env`:**
```bash
REQUIRE_API_KEY=true
BUBBL_API_KEYS=sk_bubbl_your-generated-key-here
```

**3. Include key in requests:**
```bash
curl -X POST https://your-app.up.railway.app/api/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_bubbl_your-generated-key-here" \
  -d '{"message": "Hello!"}'
```

---

## 🛠️ Development

### Project Structure

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **OpenAI SDK** - AI integration
- **Jest** - Testing framework
- **NextAuth** - Authentication (for /converse endpoint)

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm test             # Run all tests
npm run test:security # Run security tests only
npm run lint         # Lint code
```

### Adding New Features

1. Create feature in `app/` or `lib/`
2. Add tests in `tests/`
3. Update this README
4. Run tests: `npm test`
5. Build: `npm run build`
6. Commit and push

---

## 🐛 Troubleshooting

### Issue: "Invalid OpenAI API key"

**Solution:** Check your `.env` file:
```bash
# Make sure your key is correct and has no quotes
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

Test the key directly:
```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-3.5-turbo","messages":[{"role":"user","content":"test"}]}'
```

### Issue: "Authentication failed" (401 error)

**Solution:** You have `REQUIRE_API_KEY=true` but didn't provide a key.

Either:
- Set `REQUIRE_API_KEY=false` in `.env`
- Or add `X-API-Key` header to your requests

### Issue: Railway deployment fails

**Solution:** Check these:
1. All environment variables added? (6 required)
2. No quotes around variable values
3. `NEXTAUTH_URL` matches your Railway URL
4. OpenAI key is valid

View logs in Railway dashboard → Deployments → Click deployment → View Logs

### Issue: Tests failing

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Run tests
npm test
```

### Issue: "Module not found" errors

**Solution:**
```bash
# Rebuild
npm run build
```

---

## 📊 Monitoring & Logs

### View Logs Locally

Development logs are human-readable:
```
[2026-01-13T23:00:00.000Z] INFO: Processing message {"requestId":"abc123"}
```

### View Logs on Railway

1. Go to Railway dashboard
2. Click your project
3. Click "Deployments" tab
4. Click latest deployment
5. View real-time logs

### Cost Tracking

Every request logs:
- Tokens used
- Estimated cost
- Duration

Example log:
```json
{
  "requestId": "abc123",
  "tokensUsed": 150,
  "estimatedCost": 0.00075,
  "duration": 1234
}
```

Monitor your OpenAI usage:
- https://platform.openai.com/usage

---

## 🤝 For Team Members

### First Time Setup

1. **Get access** to the GitHub repo
2. **Clone** the repository
3. **Get an OpenAI API key** (or ask team lead)
4. **Follow Quick Start** (top of this README)
5. **Run tests** to verify setup
6. **Deploy your own** Railway instance (optional)

### Deploying Your Own Instance

Each team member can deploy their own:
1. Fork or use the same repo
2. Deploy to Railway with your own OpenAI key
3. Use your own Railway URL
4. You pay for your own OpenAI usage

### Sharing One Deployment

If sharing one deployment:
1. One person deploys to Railway
2. Share the Railway URL with team
3. Everyone uses the same endpoint
4. One OpenAI key (one person pays)

---

## 📚 Additional Resources

- **OpenAI API Docs**: https://platform.openai.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Railway Docs**: https://docs.railway.app/
- **Security Checklist**: See `docs/SECURITY-CHECKLIST.md`

---

## 🔒 Security Checklist

Before deploying to production, review:
- [ ] Valid OpenAI API key configured
- [ ] NEXTAUTH_SECRET generated securely
- [ ] Environment variables have no quotes
- [ ] All tests passing (39/39)
- [ ] Build succeeds with no errors
- [ ] Decided on API key requirement (REQUIRE_API_KEY)
- [ ] OpenAI spending limits configured
- [ ] Monitoring and logs verified

See full checklist: `docs/SECURITY-CHECKLIST.md`

---

## 📝 License

MIT License - See LICENSE file for details

---

## 💬 Support

**Issues?** Open an issue on GitHub: https://github.com/bubblco/bubbl-ai-widget/issues

**Questions?** Contact the team or check the troubleshooting section above.

---

## 🎉 You're All Set!

Your AI chatbot widget is ready to use. Happy coding! 🚀

**Built with ❤️ by the Bubbl Team**
