'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function TestPage() {
  const [messages, setMessages] = useState([
    { text: '👋 Hello! I\'m Bubbl AI. Ask me anything!', isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [threadId, setThreadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_URL = 'https://aiwidget-production.up.railway.app/api/chat';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Test connection on load
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'active') {
          setConnectionStatus('connected');
          setStatus('✓ Connected to Railway deployment');
        } else {
          setConnectionStatus('warning');
          setStatus('⚠️ API connection issue');
        }
      })
      .catch(() => {
        setConnectionStatus('error');
        setStatus('⚠️ Cannot connect to API');
      });
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setStatus('Sending...');

    // Add user message
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          thread_id: threadId,
          site_url: 'https://bubbl.io'
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, { text: data.message, isUser: false }]);
        setThreadId(data.thread_id);
        setStatus(`✓ Response received in ${data.duration}ms`);
      } else {
        setMessages(prev => [...prev, {
          text: `❌ Error: ${data.userMessage || data.message || 'Unknown error'}`,
          isUser: false
        }]);
        setStatus('❌ Request failed');
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        text: '❌ Failed to connect to API. Check if Railway deployment has environment variables configured.',
        isUser: false
      }]);
      setStatus('❌ Connection failed');
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      sendMessage();
    }
  };

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        padding: '2.5rem',
      }}>
        <h1 style={{
          textAlign: 'center',
          color: '#333',
          marginBottom: '0.5rem'
        }}>
          🤖 Bubbl AI Widget - Live Demo
        </h1>

        <div style={{
          background: '#f0f9ff',
          padding: '1.25rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          borderLeft: '4px solid #0ea5e9'
        }}>
          <strong>Testing Instructions:</strong>
          <ul style={{ marginTop: '0.5rem', marginBottom: 0, paddingLeft: '1.5rem' }}>
            <li>This page connects to your Railway deployment</li>
            <li>API URL: <code style={{ background: '#e0f2fe', padding: '2px 6px', borderRadius: '3px' }}>https://aiwidget-production.up.railway.app</code></li>
            <li>No API key required - open for testing!</li>
            <li>Type a message and click "Send" to test</li>
            <li>The AI will respond using OpenAI GPT</li>
          </ul>
        </div>

        <div style={{
          border: '2px solid #e5e7eb',
          borderRadius: '12px',
          padding: '1.5rem',
          background: '#f9fafb'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Chat with Bubbl AI</h3>

          <div style={{
            height: '400px',
            overflowY: 'auto',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            padding: '1rem',
            background: 'white',
            marginBottom: '1rem'
          }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  margin: '0.75rem 0',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  maxWidth: '80%',
                  background: msg.isUser ? '#dbeafe' : '#f3f4f6',
                  marginLeft: msg.isUser ? 'auto' : '0',
                  textAlign: msg.isUser ? 'right' : 'left',
                  wordWrap: 'break-word'
                }}
              >
                {msg.isUser ? (
                  msg.text
                ) : (
                  <ReactMarkdown
                    components={{
                      a: ({node, ...props}) => (
                        <a {...props} style={{ color: '#3b82f6', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer" />
                      ),
                      p: ({node, ...props}) => <p {...props} style={{ margin: '0.5rem 0' }} />,
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading}
              style={{
                padding: '0.75rem 2rem',
                background: isLoading ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>

          <div style={{
            textAlign: 'center',
            padding: '0.75rem',
            fontSize: '12px',
            color: connectionStatus === 'connected' ? '#6b7280' : '#dc2626',
            marginTop: '0.5rem'
          }}>
            {status}
          </div>
        </div>

        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: '#f3f4f6',
          borderRadius: '8px',
          fontSize: '14px',
          textAlign: 'center',
          color: '#6b7280'
        }}>
          <p style={{ margin: 0 }}>
            Want to integrate this into your site? Check the{' '}
            <a href="/" style={{ color: '#3b82f6', textDecoration: 'none' }}>
              documentation
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
