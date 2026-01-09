# Bubbl Chatbot Integration Guide for bubbl-web

This guide shows you how to integrate the standalone Bubbl chatbot into your bubbl-web Next.js application.

## Step 1: Install Dependencies

```bash
cd /path/to/bubbl-web
npm install react-markdown
```

## Step 2: Copy Chatbot Package

### Option A: Local Package (Recommended for Development)

```bash
# From your CHATBOT directory
cp -r bubbl-chatbot ../bubbl-web/packages/chatbot
```

Then in `bubbl-web/package.json`, add:

```json
{
  "dependencies": {
    "@bubbl/chatbot": "file:./packages/chatbot"
  }
}
```

Run `npm install` to link the local package.

### Option B: Git Submodule

```bash
cd /path/to/bubbl-web
git submodule add https://github.com/bubblco/bubbl-ai-widget.git packages/chatbot
npm install
```

### Option C: NPM Package (After Publishing)

```bash
npm install @bubbl/chatbot
```

## Step 3: Create API Route

Create `app/api/chat/route.ts`:

```typescript
import { handleChatRequest } from '@bubbl/chatbot'

export const POST = handleChatRequest

export async function GET() {
  return Response.json({
    service: "Bubbl Chatbot API",
    status: "active"
  })
}
```

## Step 4: Add to Your Homepage

Edit `app/page.tsx`:

```typescript
import BubblChatbot from '@bubbl/chatbot'

export default function HomePage() {
  return (
    <div>
      {/* Your existing content */}
      <YourHeroSection />
      <YourFeaturesSection />
      <YourFooter />

      {/* Add chatbot - floats in bottom-right corner */}
      <BubblChatbot
        position="bottom-right"
        siteUrl={process.env.NEXT_PUBLIC_SITE_URL || 'https://bubbl.com'}
        welcomeMessage="Hey! 👋 Looking for a co-living space? I'm here to help!"
      />
    </div>
  )
}
```

## Step 5: Environment Variables

Add to `bubbl-web/.env.local`:

```bash
OPENAI_API_KEY=sk-your-key-here
NEXT_PUBLIC_SITE_URL=https://bubbl.com
```

## Step 6: Test It!

```bash
npm run dev
```

Visit http://localhost:3000 and you should see:
- Floating chat bubble in bottom-right corner
- Click to open chat window
- Type a message and get response
- All links should be clickable and blue

## Advanced Integration

### Add to Specific Pages Only

```typescript
// app/listings/page.tsx
import BubblChatbot from '@bubbl/chatbot'

export default function ListingsPage() {
  return (
    <>
      <ListingsContent />

      <BubblChatbot
        position="bottom-right"
        siteUrl="https://bubbl.com"
        welcomeMessage="Looking for a space? I can help you find the perfect match!"
      />
    </>
  )
}
```

### Inline Embedding (Sidebar)

```typescript
// app/dashboard/page.tsx
import BubblChatbot from '@bubbl/chatbot'

export default function DashboardPage() {
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1">
        <DashboardContent />
      </main>

      {/* Chatbot in sidebar */}
      <aside className="w-96 border-l">
        <BubblChatbot
          position="inline"
          siteUrl="https://bubbl.com"
        />
      </aside>
    </div>
  )
}
```

### With Analytics

```typescript
import BubblChatbot from '@bubbl/chatbot'
import { analytics } from '@/lib/analytics'

export default function HomePage() {
  return (
    <>
      <Content />

      <BubblChatbot
        position="bottom-right"
        siteUrl="https://bubbl.com"
        onMessage={(message) => {
          // Track in your analytics
          analytics.track('chatbot_message', {
            role: message.role,
            timestamp: message.timestamp,
            content_preview: message.content.slice(0, 50)
          })

          // Track conversions
          if (message.content.includes('[browse')) {
            analytics.track('chatbot_listing_link_sent')
          }
        }}
      />
    </>
  )
}
```

### Dark Theme for Dark Mode Sites

```typescript
'use client'

import BubblChatbot from '@bubbl/chatbot'
import { useTheme } from 'next-themes'

export default function ChatbotWrapper() {
  const { theme } = useTheme()

  return (
    <BubblChatbot
      position="bottom-right"
      theme={theme === 'dark' ? 'dark' : 'light'}
      siteUrl="https://bubbl.com"
    />
  )
}
```

## Customization

### Customize System Prompt

Edit `packages/chatbot/src/lib/config.ts`:

```typescript
export const chatbotConfig = {
  systemPrompt: (siteUrl: string) => `
    You are the Bubbl Assistant for bubbl-web.

    # Your role:
    Help users find co-living spaces for events.

    # Always use markdown links:
    - [browse spaces](${siteUrl}/listings)
    - [see events](${siteUrl}/events)

    # Customize personality:
    - Be super friendly and helpful
    - Use emojis occasionally
    - Keep responses under 80 words
  `,

  model: {
    name: "gpt-3.5-turbo",  // Faster and cheaper
    temperature: 0.8,        // More creative
    maxTokens: 200,
    contextMessages: 3,      // Less memory for faster response
  }
}
```

### Add Event Knowledge

In `config.ts`, add to the `events` array:

```typescript
events: [
  {
    name: "Sundance Film Festival",
    slug: "sundance",
    dates: "Jan 20-30, 2025",
    location: "Park City, UT",
    venues: ["Egyptian Theatre", "Eccles Center"],
    tips: [
      "Book early - spaces fill up fast",
      "Shuttles run every 15 minutes"
    ],
    bubbl_stats: {
      spaces_available: 5,
      price_range: "$80-200/night"
    }
  },
  // Add your events here
]
```

## Testing Checklist

After integration, verify:

- [ ] Chatbot appears in bottom-right corner
- [ ] Clicking opens chat window
- [ ] Welcome message displays
- [ ] Can send messages and get responses
- [ ] Links in responses are clickable (blue, underlined)
- [ ] Links open in new tab
- [ ] Error handling works (try with no internet)
- [ ] Retry logic works
- [ ] Mobile responsive
- [ ] Works without login (no auth required)

## Troubleshooting

### "Module not found: @bubbl/chatbot"

Run `npm install` again:
```bash
npm install
```

### Links Not Clickable

Install react-markdown:
```bash
npm install react-markdown
```

### API Returns 500 Error

Check OpenAI API key in `.env.local`:
```bash
OPENAI_API_KEY=sk-...
```

### Chatbot Doesn't Appear

1. Check browser console for errors
2. Verify component is imported: `import BubblChatbot from '@bubbl/chatbot'`
3. Make sure it's rendered: `<BubblChatbot />` in JSX

## Performance Tips

### Use GPT-3.5-Turbo for Faster Responses

Edit `config.ts`:
```typescript
model: {
  name: "gpt-3.5-turbo",  // 10x faster, 10x cheaper than GPT-4
  temperature: 0.7,
  maxTokens: 200,
}
```

### Reduce Context Messages

```typescript
model: {
  contextMessages: 3,  // Remember last 3 messages instead of 5
}
```

### Add Response Caching

Cache common questions:

```typescript
const CACHED_RESPONSES = {
  "how does bubbl work": "Bubbl connects you with...",
  "what is bubbl": "Bubbl is an event-based..."
}

// In API route, check cache first
const cached = CACHED_RESPONSES[message.toLowerCase()]
if (cached) return Response.json({ message: cached })
```

## Next Steps

1. ✅ Test the chatbot on localhost
2. ✅ Customize welcome message
3. ✅ Add event-specific knowledge
4. ✅ Set up analytics tracking
5. ✅ Deploy to staging
6. ✅ Test on production
7. ✅ Monitor usage and costs

## Support

Questions? Issues?
- Check the main README: `bubbl-chatbot/README.md`
- Open an issue: https://github.com/bubblco/bubbl-ai-widget/issues
- Contact: support@bubbl.com
