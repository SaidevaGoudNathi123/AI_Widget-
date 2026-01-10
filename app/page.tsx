/**
 * Bubbl Chatbot API - Documentation Homepage
 */

export default function HomePage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-app.railway.app';

  return (
    <main style={{
      minHeight: '100vh',
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif',
      background: '#f8f9fa'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Bubbl Chatbot API</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Backend API for Bubble.io chatbot integration
        </p>

        {/* API Status */}
        <div style={{
          padding: '1.5rem',
          background: 'white',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2>API Status</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{
              width: '12px',
              height: '12px',
              background: '#28a745',
              borderRadius: '50%',
              display: 'inline-block'
            }}></span>
            <span>Online and ready</span>
          </div>
        </div>

        {/* API Endpoints */}
        <div style={{
          padding: '1.5rem',
          background: 'white',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2>API Endpoints</h2>

          <div style={{ marginTop: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              POST {baseUrl}/api/chat
            </h3>
            <p style={{ color: '#666', marginBottom: '0.5rem' }}>
              Send a message and get AI response
            </p>

            <details style={{ marginTop: '0.5rem' }}>
              <summary style={{ cursor: 'pointer', color: '#007bff' }}>
                View Request/Response Format
              </summary>
              <div style={{
                padding: '1rem',
                background: '#f5f5f5',
                borderRadius: '4px',
                marginTop: '0.5rem'
              }}>
                <strong>Request Body:</strong>
                <pre style={{ overflow: 'auto', fontSize: '0.875rem' }}>{`{
  "message": "How does Bubbl work?",
  "thread_id": "optional_conversation_id",
  "messages": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ],
  "site_url": "https://bubbl.io"
}`}</pre>

                <strong style={{ marginTop: '1rem', display: 'block' }}>Response:</strong>
                <pre style={{ overflow: 'auto', fontSize: '0.875rem' }}>{`{
  "message": "Bubbl connects you with [verified spaces](/listings)...",
  "thread_id": "abc123",
  "timestamp": "2025-01-09T...",
  "success": true,
  "requestId": "uuid",
  "duration": 1234
}`}</pre>
              </div>
            </details>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              GET {baseUrl}/api/chat
            </h3>
            <p style={{ color: '#666' }}>
              Health check endpoint
            </p>
          </div>
        </div>

        {/* Test Pages */}
        <div style={{
          padding: '1.5rem',
          background: 'white',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2>Test Pages</h2>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            Placeholder pages for testing chatbot link navigation:
          </p>
          <ul style={{ lineHeight: '2' }}>
            <li>
              <a href="/events" style={{ color: '#007bff' }}>
                /events
              </a> - Events page
            </li>
            <li>
              <a href="/listings" style={{ color: '#007bff' }}>
                /listings
              </a> - Listings page
            </li>
            <li>
              <a href="/listings?event=sundance" style={{ color: '#007bff' }}>
                /listings?event=sundance
              </a> - Filtered listings
            </li>
          </ul>
        </div>

        {/* Integration Guide */}
        <div style={{
          padding: '1.5rem',
          background: 'white',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2>Bubble.io Integration</h2>
          <ol style={{ lineHeight: '1.8' }}>
            <li>Open Bubble.io editor</li>
            <li>Go to Plugins → API Connector</li>
            <li>Add new API: <code style={{ background: '#f5f5f5', padding: '0.25rem 0.5rem' }}>Bubbl Chatbot</code></li>
            <li>Add POST call to: <code style={{ background: '#f5f5f5', padding: '0.25rem 0.5rem' }}>{baseUrl}/api/chat</code></li>
            <li>Set body type to JSON</li>
            <li>Build your chat UI using Repeating Groups</li>
            <li>Call the API on message send</li>
            <li>Display responses with clickable markdown links</li>
          </ol>
        </div>

        {/* Features */}
        <div style={{
          padding: '1.5rem',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2>Features</h2>
          <ul style={{ lineHeight: '1.8' }}>
            <li>✅ No authentication required (MVP)</li>
            <li>✅ CORS enabled for Bubble.io</li>
            <li>✅ Conversation context via thread_id</li>
            <li>✅ Markdown links in responses</li>
            <li>✅ Error handling with retry logic</li>
            <li>✅ Request timeout protection</li>
            <li>✅ GPT-3.5-turbo for cost efficiency</li>
          </ul>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center', color: '#666' }}>
          <p>Built for Bubbl Team • v2.0.0</p>
        </div>
      </div>
    </main>
  );
}
