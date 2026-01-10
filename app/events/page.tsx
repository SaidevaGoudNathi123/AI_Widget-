/**
 * Events Page - Placeholder for Testing Chatbot Links
 */

export default function EventsPage() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1>Bubbl Events</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          <em>This is a placeholder page for testing chatbot navigation</em>
        </p>

        <div style={{
          padding: '1.5rem',
          background: '#f5f5f5',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <h2>Upcoming Events</h2>

          <div style={{
            background: 'white',
            padding: '1rem',
            borderRadius: '6px',
            marginTop: '1rem'
          }}>
            <h3>Sundance Film Festival</h3>
            <p><strong>Dates:</strong> January 20-30, 2025</p>
            <p><strong>Location:</strong> Park City, Utah</p>
            <p>
              The Sundance Film Festival showcases independent films and attracts filmmakers
              from around the world.
            </p>
            <a
              href="/listings?event=sundance"
              style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                background: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                marginTop: '0.5rem'
              }}
            >
              View Sundance Spaces
            </a>
          </div>

          <div style={{
            background: 'white',
            padding: '1rem',
            borderRadius: '6px',
            marginTop: '1rem'
          }}>
            <h3>SXSW</h3>
            <p><strong>Dates:</strong> March 7-16, 2025</p>
            <p><strong>Location:</strong> Austin, Texas</p>
            <p>
              South by Southwest brings together music, film, and interactive media.
            </p>
            <a
              href="/listings?event=sxsw"
              style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                background: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                marginTop: '0.5rem'
              }}
            >
              View SXSW Spaces
            </a>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <a href="/" style={{ color: '#007bff' }}>← Back to Home</a>
        </div>
      </div>
    </main>
  );
}
