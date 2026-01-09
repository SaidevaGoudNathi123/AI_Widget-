# 🤖 Bubbl Chatbot

Standalone, embeddable AI chatbot for the Bubbl event-based co-living platform. Features clickable links, no authentication requirements, and easy integration.

## ✨ Features

- ✅ **No Authentication Required** - Works without user login
- ✅ **Clickable Markdown Links** - All page references are blue, clickable links
- ✅ **Customizable** - Easy configuration for personality, knowledge, and behavior
- ✅ **Error Handling** - Comprehensive retry logic and connection status monitoring
- ✅ **Responsive** - Works on mobile and desktop
- ✅ **Flexible Positioning** - Bottom-right, bottom-left, or inline embedding
- ✅ **Light/Dark Theme** - Supports both themes
- ✅ **TypeScript** - Fully typed for better DX

## 📦 Installation

### From GitHub (Recommended)

```bash
npm install git+https://github.com/bubblco/bubbl-ai-widget.git react-markdown
```

Or with yarn:

```bash
yarn add git+https://github.com/bubblco/bubbl-ai-widget.git react-markdown
```

### From NPM (Coming Soon)

```bash
npm install @bubbl/chatbot react-markdown
```

## 🚀 Quick Start

### 1. Create API Route

Create `app/api/chat/route.ts` in your Next.js app:

```typescript
import { handleChatRequest } from '@bubbl/chatbot/api/chat'

export const POST = handleChatRequest
export const GET = async () => Response.json({ status: 'ok' })
```

### 2. Add Chatbot to Your Page

```typescript
import BubblChatbot from '@bubbl/chatbot'

export default function HomePage() {
  return (
    <div>
      <h1>Welcome to Bubbl!</h1>

      <BubblChatbot
        position="bottom-right"
        siteUrl="https://yourdomain.com"
      />
    </div>
  )
}
```

### 3. Set Environment Variable

Add to your `.env.local`:

```bash
OPENAI_API_KEY=sk-your-key-here
```

That's it! 🎉 The chatbot will now appear on your page.

## 🎨 Configuration

### Component Props

```typescript
interface BubblChatbotProps {
  /** Position of the chatbot on the page */
  position?: 'bottom-right' | 'bottom-left' | 'inline'

  /** Theme of the chatbot */
  theme?: 'light' | 'dark'

  /** API endpoint URL - defaults to /api/chat */
  apiEndpoint?: string

  /** Optional API key for authentication */
  apiKey?: string

  /** Callback when message is sent */
  onMessage?: (message: Message) => void

  /** Custom welcome message */
  welcomeMessage?: string

  /** Site URL for absolute links */
  siteUrl?: string

  /** Auto-open on load */
  autoOpen?: boolean
}
```

### Usage Examples

#### Bottom-Right Position (Default)

```tsx
<BubblChatbot position="bottom-right" />
```

#### Inline Embedding

```tsx
<div className="container">
  <BubblChatbot position="inline" />
</div>
```

#### Dark Theme

```tsx
<BubblChatbot theme="dark" />
```

#### Custom Welcome Message

```tsx
<BubblChatbot
  welcomeMessage="Hi! Looking for a co-living space? I'm here to help!"
/>
```

#### With Analytics Callback

```tsx
<BubblChatbot
  onMessage={(message) => {
    analytics.track('chatbot_message', {
      role: message.role,
      content: message.content.slice(0, 50),
      timestamp: message.timestamp
    })
  }}
/>
```

## ⚙️ Customizing the Chatbot

### Edit System Prompt

The system prompt defines the chatbot's personality and behavior. Edit `src/lib/config.ts`:

```typescript
export const chatbotConfig = {
  systemPrompt: (siteUrl: string) => `
    You are a helpful assistant for...

    # Your personality:
    - Friendly and professional
    - Concise responses

    # Always use markdown links:
    - [browse listings](${siteUrl}/listings)
    - [see events](${siteUrl}/events)
  `,

  model: {
    name: "gpt-4",        // or "gpt-3.5-turbo"
    temperature: 0.7,     // 0.1 = precise, 1.0 = creative
    maxTokens: 300,       // max response length
    contextMessages: 5,   // number of previous messages to remember
  },

  events: [
    {
      name: "Your Event",
      dates: "Jan 20-30, 2025",
      // ... event details
    }
  ]
}
```

### Add Event-Specific Knowledge

Edit the `events` array in `config.ts`:

```typescript
events: [
  {
    name: "Sundance Film Festival",
    slug: "sundance",
    dates: "Jan 20-30, 2025",
    location: "Park City, UT",
    venues: ["Egyptian Theatre", "Eccles Center"],
    tips: [
      "Arrive Jan 19 for opening night",
      "Buy tickets early at sundance.org"
    ],
    bubbl_stats: {
      spaces_available: 5,
      price_range: "$80-200/night"
    }
  }
]
```

## 🔗 Clickable Links

The chatbot automatically formats page references as clickable markdown links:

**User:** "How do I book?"

**Bot:** "You can [browse available spaces](https://bubbl.com/listings) and book directly! Want to [see how it works](https://bubbl.com/how-it-works)?"

All links:
- Are blue and underlined
- Open in a new tab
- Use full absolute URLs

## 🎯 Deployment

### Option 1: Same Repo (Monorepo)

Keep chatbot in same repo as your main app:

```
your-app/
├── packages/
│   └── chatbot/         # This package
└── apps/
    └── web/             # Your Next.js app
```

### Option 2: Separate Repo (NPM Package)

1. Push to GitHub:
```bash
cd bubbl-chatbot
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/bubblco/bubbl-ai-widget.git
git push -u origin main
```

2. Publish to NPM:
```bash
npm login
npm publish --access public
```

3. Install in other projects:
```bash
npm install @bubbl/chatbot
```

### Option 3: Git Submodule

```bash
git submodule add https://github.com/bubblco/bubbl-ai-widget.git packages/chatbot
```

## 📊 Analytics Integration

### Track Messages

```typescript
<BubblChatbot
  onMessage={(message) => {
    // Send to Mixpanel
    mixpanel.track('chatbot_message', {
      role: message.role,
      timestamp: message.timestamp
    })

    // Send to Google Analytics
    gtag('event', 'chatbot_message', {
      role: message.role
    })
  }}
/>
```

### Track Conversation Start

```typescript
<BubblChatbot
  onMessage={(message) => {
    if (message.role === 'user' && isFirstMessage) {
      analytics.track('chatbot_opened')
    }
  }}
/>
```

## 🛠️ Development

### Local Development

```bash
cd bubbl-chatbot
npm install
npm run dev
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

## 🔧 Troubleshooting

### Links Not Clickable

Make sure `react-markdown` is installed:
```bash
npm install react-markdown
```

### API Errors

Check your OpenAI API key in `.env.local`:
```bash
OPENAI_API_KEY=sk-...
```

### CORS Issues

If embedding on external domain, add CORS headers to API route:

```typescript
export async function POST(request: Request) {
  const response = await handleChatRequest(request)

  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')

  return response
}
```

### Chatbot Not Showing

1. Check console for errors
2. Verify API route is accessible: `curl http://localhost:3000/api/chat`
3. Make sure component is rendered: `<BubblChatbot />` is in your JSX

## 📝 Examples

### Basic Integration (bubbl-web)

```tsx
// app/page.tsx
import BubblChatbot from '@bubbl/chatbot'

export default function HomePage() {
  return (
    <>
      <YourMarketingContent />
      <BubblChatbot
        position="bottom-right"
        siteUrl="https://bubbl.com"
      />
    </>
  )
}
```

### Custom Styling

```tsx
<div className="custom-chatbot-container">
  <BubblChatbot
    position="inline"
    theme="dark"
  />

  <style jsx>{`
    .custom-chatbot-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
  `}</style>
</div>
```

### Multiple Instances

```tsx
// Different chatbots for different sections
<BubblChatbot
  position="bottom-right"
  welcomeMessage="Need help with bookings?"
  apiEndpoint="/api/chat/bookings"
/>

<BubblChatbot
  position="bottom-left"
  welcomeMessage="Event questions?"
  apiEndpoint="/api/chat/events"
/>
```

## 📚 API Reference

### `<BubblChatbot />` Component

Main chatbot component with UI and logic.

### `handleChatRequest(request: Request)`

API handler function for processing chat messages.

**Request Body:**
```typescript
{
  message: string,           // User's message
  messages?: Message[],      // Conversation history
  siteUrl?: string          // Base URL for links
}
```

**Response:**
```typescript
{
  message: string,           // Bot's response
  success: boolean,
  timestamp: string,
  requestId: string,
  duration: number          // Response time in ms
}
```

### `chatbotConfig`

Configuration object for customizing behavior.

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

## 📄 License

MIT © Bubbl Team

## 🆘 Support

- GitHub Issues: https://github.com/bubblco/bubbl-ai-widget/issues
- Email: support@bubbl.com
- Docs: https://docs.bubbl.com/chatbot

---

Made with ❤️ by the Bubbl team
