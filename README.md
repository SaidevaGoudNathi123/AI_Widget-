# Bubbl Chatbot API

Backend API for Bubbl AI chatbot - designed for **Bubble.io integration**.

**Repository:** https://github.com/bubblco/bubbl-ai-widget
**Version:** 2.0.0

---

## 📋 Overview

This is a Next.js backend API that provides chat endpoints for the Bubbl AI chatbot. It's designed to be called from Bubble.io using their API Connector.

**Key Features:**
- ✅ RESTful chat API endpoint
- ✅ No authentication required (MVP)
- ✅ CORS enabled for Bubble.io
- ✅ Conversation context via `thread_id`
- ✅ Returns responses with **clickable markdown links**
- ✅ GPT-3.5-turbo for cost efficiency
- ✅ Placeholder pages for testing navigation

---

## 🚀 API Endpoints

### **POST `/api/chat`**

Send a message and receive AI response.

**Request:**
```json
{
  "message": "How does Bubbl work?",
  "thread_id": "optional_conversation_id",
  "messages": [
    {"role": "user", "content": "Previous user message"},
    {"role": "assistant", "content": "Previous bot response"}
  ],
  "site_url": "https://bubbl.io"
}
```

**Response:**
```json
{
  "message": "Bubbl connects you with [verified spaces](/listings)...",
  "thread_id": "abc123",
  "timestamp": "2025-01-09T17:30:00Z",
  "success": true,
  "requestId": "uuid",
  "duration": 1234
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message` | string | ✅ Yes | User's message (max 2000 chars) |
| `thread_id` | string | ❌ No | Conversation ID for context |
| `messages` | array | ❌ No | Previous conversation history |
| `site_url` | string | ❌ No | Base URL for links (default: https://bubbl.com) |

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Bot's response with markdown links |
| `thread_id` | string | Conversation ID (use this for next request) |
| `timestamp` | string | ISO timestamp |
| `success` | boolean | Request success status |
| `requestId` | string | Unique request identifier |
| `duration` | number | Response time in milliseconds |

### **GET `/api/chat`**

Health check endpoint.

**Response:**
```json
{
  "service": "Bubbl Chatbot API",
  "status": "active",
  "version": "2.0.0",
  "authRequired": false
}
```

---

## 🔗 Test Pages

Placeholder pages for testing chatbot link navigation:

- **Events:** `/events` - List of events
- **Listings:** `/listings` - List of available spaces
- **Filtered Listings:** `/listings?event=sundance` - Event-specific listings

---

## 💻 Bubble.io Integration Guide

### Step 1: Set Up API Connector

1. Open your Bubble.io editor
2. Go to **Plugins** → **API Connector**
3. Click **Add another API**
4. Name it: `Bubbl Chatbot API`

### Step 2: Configure the Chat Endpoint

**Add API Call:**
- Name: `send_message`
- Use as: **Action**
- Data type: **JSON**
- Method: **POST**
- URL: `https://your-railway-url.up.railway.app/api/chat`

**Body:**
```json
{
  "message": "<message>",
  "thread_id": "<thread_id>",
  "site_url": "https://bubbl.io"
}
```

**Parameters:**
- `message` (text, required)
- `thread_id` (text, optional)

**Initialize call:** Click "Initialize" to test the API

### Step 3: Build Chat UI

**Create UI Elements:**
1. **Repeating Group** (for messages)
   - Type of content: `text`
   - Data source: Custom state `chat_messages`

2. **Input** (for user message)
   - Type: `Multiline`
   - Placeholder: "Type your message..."

3. **Button** (Send)
   - Text: "Send"

### Step 4: Add Workflows

**When Button "Send" is clicked:**

1. **Add item to list** (chat_messages)
   - Item: `{"role": "user", "content": Input's value}`

2. **API Connector - send_message**
   - message: `Input's value`
   - thread_id: `Custom state thread_id`

3. **Add item to list** (chat_messages)
   - Item: `{"role": "assistant", "content": Result of step 2's message}`

4. **Set state** (thread_id)
   - Value: `Result of step 2's thread_id`

5. **Reset inputs**

### Step 5: Display Markdown Links

To make links clickable in Bubble.io:

**Option A: HTML Element**
- Add HTML element in Repeating Group cell
- Insert: `<p style="markdown content"></p>`
- Use regex to convert markdown to HTML

**Option B: Rich Text Editor**
- Use Bubble's Rich Text Editor
- Parse markdown links `[text](url)` to HTML `<a href="url">text</a>`

---

## 🛠️ Local Development

### Prerequisites

- Node.js 18+
- OpenAI API key

### Setup

```bash
# Clone the repository
git clone https://github.com/bubblco/bubbl-ai-widget.git
cd bubbl-ai-widget

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your OpenAI API key
echo "OPENAI_API_KEY=sk-your-key-here" > .env

# Run development server
npm run dev
```

Visit http://localhost:3000

### Test the API

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How does Bubbl work?",
    "site_url": "https://bubbl.io"
  }'
```

---

## 🚂 Railway Deployment

### Environment Variables

Set these in Railway dashboard:

```bash
OPENAI_API_KEY=sk-your-openai-key
NODE_ENV=production
```

### Deploy Steps

1. **Push code to GitHub** (this repo)

2. **Create Railway project:**
   - Go to https://railway.com/dashboard
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `bubblco/bubbl-ai-widget`

3. **Add environment variables:**
   - Go to Variables tab
   - Add `OPENAI_API_KEY`

4. **Generate domain:**
   - Go to Settings → Networking
   - Click "Generate Domain"
   - Copy the URL (e.g., `https://bubbl-api.up.railway.app`)

5. **Test deployment:**
   ```bash
   curl https://your-url.up.railway.app/api/chat
   ```

---

## ⚙️ Configuration

Edit `/lib/config.ts` to customize:

- **Model:** Change from `gpt-3.5-turbo` to `gpt-4` (more expensive)
- **Temperature:** Adjust creativity (0.1 = precise, 1.0 = creative)
- **Max Tokens:** Limit response length
- **Context Messages:** Number of previous messages to remember
- **System Prompt:** Chatbot personality and behavior
- **Events:** Add new events with details

Example:
```typescript
export const chatbotConfig = {
  model: {
    name: "gpt-3.5-turbo", // or "gpt-4"
    temperature: 0.7,
    maxTokens: 300,
    contextMessages: 5,
  },
  // ... rest of config
};
```

---

## 📊 Cost Estimates

**GPT-3.5-turbo:**
- ~$0.002 per conversation
- 1000 conversations = $2

**GPT-4:**
- ~$0.03 per conversation
- 1000 conversations = $30

**Recommendation:** Start with GPT-3.5-turbo for MVP

---

## 🔒 Security Considerations

### Current Security Posture (MVP)

**Implemented:**
- ✅ Input validation and sanitization
- ✅ Message length limits (2000 chars)
- ✅ Request timeout protection (25s)
- ✅ Environment variable validation
- ✅ Security headers (HSTS, X-Frame-Options, etc.)
- ✅ Error message sanitization
- ✅ No sensitive data in logs

**MVP Limitations (Address before production):**
- ⚠️ No authentication/authorization
- ⚠️ CORS allows all origins (`Access-Control-Allow-Origin: *`)
- ⚠️ No rate limiting (vulnerable to abuse)
- ⚠️ No request logging/monitoring
- ⚠️ No IP-based restrictions

### Production Recommendations

**1. Add Authentication**
```typescript
// Example: API key authentication
const apiKey = request.headers.get('X-API-Key');
if (apiKey !== process.env.BUBBL_API_KEY) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**2. Restrict CORS to Bubble.io Domain**
```typescript
const headers = {
  'Access-Control-Allow-Origin': 'https://yourbubbleapp.bubbleapps.io',
  // ... other headers
};
```

**3. Implement Rate Limiting**
Consider using:
- Upstash Rate Limit (serverless-friendly)
- Vercel Edge Config for simple limits
- Redis for more complex rate limiting

**4. Add Request Logging**
- Log all API requests with requestId
- Monitor for abuse patterns
- Set up alerts for errors

**5. Environment Variables**
Never commit these to git:
- `OPENAI_API_KEY` - Your OpenAI API key
- Add `.env` to `.gitignore` (already done)
- Use Railway's environment variable management

**6. Monitor OpenAI Costs**
- Set up billing alerts in OpenAI dashboard
- Monitor token usage in Railway logs
- Consider adding usage caps per user/session

---

## 🐛 Troubleshooting

### API Returns 500 Error

**Check:**
1. OpenAI API key is set correctly
2. Check Railway logs for errors
3. Verify request format matches documentation

### Links Not Working in Bubble.io

**Solution:**
- Bot returns markdown format: `[text](url)`
- You need to parse this in Bubble.io
- Convert to HTML: `<a href="url">text</a>`
- Use HTML element or custom plugin

### CORS Errors

**Solution:**
- API already has CORS enabled for all origins
- If issues persist, check Bubble.io API Connector settings
- Ensure "Use as: Action" is selected

### Conversation Context Not Working

**Solution:**
- Make sure you're sending `thread_id` from previous response
- Store `thread_id` in Bubble.io custom state
- Send it with each new message

---

## 📝 TODO for Buck (Bubble.io Developer)

- [ ] Set up API Connector in Bubble.io
- [ ] Build chat UI with Repeating Group
- [ ] Implement markdown link parsing
- [ ] Test with placeholder pages (`/events`, `/listings`)
- [ ] Add conversation context (thread_id management)
- [ ] Style the chat widget
- [ ] Test on mobile

---

## 🤝 Team Contact

**Backend (Saideva):** API development, Railway deployment
**Frontend (Buck):** Bubble.io UI, API integration

---

## 📄 License

MIT © Bubbl Team

---

**Built for Bubbl Team** • **v2.0.0** • **January 2025**
