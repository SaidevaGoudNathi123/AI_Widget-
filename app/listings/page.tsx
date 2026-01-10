/**
 * Listings Page - Placeholder for Testing Chatbot Links
 */

export default function ListingsPage() {
  const searchParams = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : null;

  const event = searchParams?.get('event');

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1>Bubbl Listings</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          <em>This is a placeholder page for testing chatbot navigation</em>
        </p>

        {event && (
          <div style={{
            padding: '1rem',
            background: '#e7f3ff',
            borderRadius: '6px',
            marginBottom: '2rem'
          }}>
            <strong>Filtered by event:</strong> {event}
          </div>
        )}

        <div style={{
          padding: '1.5rem',
          background: '#f5f5f5',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          <h2>Example Listing 1</h2>
          <p><strong>Location:</strong> Park City, Utah</p>
          <p><strong>Event:</strong> Sundance Film Festival</p>
          <p><strong>Price:</strong> $120/night</p>
          <p><strong>Available Beds:</strong> 3</p>
          <p>
            Cozy mountain home just 10 minutes from Egyptian Theatre.
            Perfect for film enthusiasts!
          </p>
          <div style={{ marginTop: '1rem' }}>
            <span style={{
              display: 'inline-block',
              padding: '0.25rem 0.75rem',
              background: '#28a745',
              color: 'white',
              borderRadius: '4px',
              fontSize: '0.875rem'
            }}>
              Instant Book
            </span>
          </div>
        </div>

        <div style={{
          padding: '1.5rem',
          background: '#f5f5f5',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          <h2>Example Listing 2</h2>
          <p><strong>Location:</strong> Park City, Utah</p>
          <p><strong>Event:</strong> Sundance Film Festival</p>
          <p><strong>Price:</strong> $95/night</p>
          <p><strong>Available Beds:</strong> 2</p>
          <p>
            Downtown condo with shuttle access. Includes festival passes!
          </p>
          <div style={{ marginTop: '1rem' }}>
            <span style={{
              display: 'inline-block',
              padding: '0.25rem 0.75rem',
              background: '#ffc107',
              color: '#000',
              borderRadius: '4px',
              fontSize: '0.875rem'
            }}>
              Show Interest
            </span>
          </div>
        </div>

        <div style={{
          padding: '1.5rem',
          background: '#f5f5f5',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          <h2>Example Listing 3</h2>
          <p><strong>Location:</strong> Park City, Utah</p>
          <p><strong>Event:</strong> Sundance Film Festival</p>
          <p><strong>Price:</strong> $150/night</p>
          <p><strong>Available Beds:</strong> 4</p>
          <p>
            Luxury ski chalet near Deer Valley. Spacious and modern.
          </p>
          <div style={{ marginTop: '1rem' }}>
            <span style={{
              display: 'inline-block',
              padding: '0.25rem 0.75rem',
              background: '#28a745',
              color: 'white',
              borderRadius: '4px',
              fontSize: '0.875rem'
            }}>
              Instant Book
            </span>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <a href="/" style={{ color: '#007bff' }}>← Back to Home</a>
        </div>
      </div>
    </main>
  );
}
