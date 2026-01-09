"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isError?: boolean;
}

// Error types for better handling
type ErrorType = 'network' | 'timeout' | 'rate_limit' | 'server' | 'unknown';

const ERROR_MESSAGES: Record<ErrorType, string> = {
  network: "I can't connect to the server right now. Please check your internet connection and try again.",
  timeout: "The request is taking too long. Please try again.",
  rate_limit: "I'm receiving too many requests. Please wait a moment before trying again.",
  server: "I'm experiencing technical difficulties. Our team has been notified.",
  unknown: "Something went wrong. Please try again in a moment.",
};

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second
const REQUEST_TIMEOUT = 30000; // 30 seconds

export interface BubblChatbotProps {
  /** Position of the chatbot on the page */
  position?: 'bottom-right' | 'bottom-left' | 'inline';
  /** Theme of the chatbot */
  theme?: 'light' | 'dark';
  /** API endpoint URL - defaults to /api/chat */
  apiEndpoint?: string;
  /** Optional API key for authentication */
  apiKey?: string;
  /** Callback when message is sent */
  onMessage?: (message: Message) => void;
  /** Custom welcome message */
  welcomeMessage?: string;
  /** Site URL for absolute links */
  siteUrl?: string;
  /** Auto-open on load */
  autoOpen?: boolean;
}

export default function BubblChatbot({
  position = 'bottom-right',
  theme = 'light',
  apiEndpoint = '/api/chat',
  apiKey,
  onMessage,
  welcomeMessage = "Hey 👋 What brings you to Bubbl today?",
  siteUrl = '',
  autoOpen = false,
}: BubblChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'error'>('online');
  const [retryCount, setRetryCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setConnectionStatus('online');
    const handleOffline = () => setConnectionStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setConnectionStatus(navigator.onLine ? 'online' : 'offline');

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message when opened
  const openChatbot = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      const welcomeMsg: Message = {
        role: "assistant",
        content: welcomeMessage,
        timestamp: new Date(),
      };
      setMessages([welcomeMsg]);
    }
  };

  // Determine error type from error object
  const getErrorType = (error: any): ErrorType => {
    if (!navigator.onLine) return 'network';
    if (error.name === 'AbortError') return 'timeout';
    if (error.message?.includes('rate limit') || error.status === 429) return 'rate_limit';
    if (error.status >= 500) return 'server';
    return 'unknown';
  };

  // Fetch with timeout and retry logic
  const fetchWithRetry = useCallback(async (
    url: string,
    options: RequestInit,
    retries = MAX_RETRIES
  ): Promise<Response> => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    const timeoutId = setTimeout(() => {
      abortControllerRef.current?.abort();
    }, REQUEST_TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        signal: abortControllerRef.current.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok && retries > 0 && response.status >= 500) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        setRetryCount(prev => prev + 1);
        return fetchWithRetry(url, options, retries - 1);
      }

      setRetryCount(0);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError' && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        setRetryCount(prev => prev + 1);
        return fetchWithRetry(url, options, retries - 1);
      }

      throw error;
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (connectionStatus === 'offline') {
      const offlineMessage: Message = {
        role: "assistant",
        content: ERROR_MESSAGES.network,
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, offlineMessage]);
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    onMessage?.(userMessage);

    const userInput = input.trim();
    setInput("");
    setIsLoading(true);
    setConnectionStatus('online');

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetchWithRetry(apiEndpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: userInput,
          messages: messages.slice(-5).map(m => ({
            role: m.role,
            content: m.content
          })),
          siteUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw { status: response.status, message: errorData.message || 'Request failed' };
      }

      const data = await response.json();

      if (data.error) {
        throw { message: data.message, status: 500 };
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      onMessage?.(assistantMessage);
      setConnectionStatus('online');

    } catch (error: any) {
      console.error("Chat error:", error);
      const errorType = getErrorType(error);
      setConnectionStatus('error');

      const errorMessage: Message = {
        role: "assistant",
        content: ERROR_MESSAGES[errorType],
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setRetryCount(0);
    }
  };

  // Inline styles for position
  const getPositionStyles = () => {
    if (position === 'inline') return {};

    const base = { position: 'fixed' as const, zIndex: 50 };
    if (position === 'bottom-right') {
      return { ...base, bottom: '24px', right: '24px' };
    }
    return { ...base, bottom: '24px', left: '24px' };
  };

  // Theme colors
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-800';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  if (position !== 'inline' && !isOpen) {
    return (
      <button
        onClick={openChatbot}
        style={getPositionStyles()}
        className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center text-2xl hover:scale-110"
      >
        💬
      </button>
    );
  }

  const chatWindowStyles = position === 'inline'
    ? { width: '100%', height: '600px' }
    : { ...getPositionStyles(), width: '384px', height: '600px' };

  return (
    <div
      style={chatWindowStyles}
      className={`${bgColor} rounded-lg shadow-2xl flex flex-col border ${borderColor}`}
    >
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <div>
            <h3 className="font-semibold">Bubbl Assistant</h3>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                connectionStatus === 'online' ? 'bg-green-400' :
                connectionStatus === 'offline' ? 'bg-red-400' :
                'bg-yellow-400'
              }`} />
              <p className="text-xs text-blue-100">
                {connectionStatus === 'online' ? 'Here to help' :
                 connectionStatus === 'offline' ? 'Offline' :
                 'Reconnecting...'}
              </p>
            </div>
          </div>
        </div>
        {position !== 'inline' && (
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-blue-100 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Connection Warning */}
      {connectionStatus === 'offline' && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-sm text-yellow-800 flex items-center gap-2">
          <span>⚠️</span>
          <span>You're offline. Messages will be sent when you reconnect.</span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : msg.isError
                  ? "bg-red-50 border border-red-200 text-red-800"
                  : "bg-white border border-gray-200 text-gray-800"
              }`}
            >
              {msg.isError && (
                <div className="flex items-center gap-1 mb-1 text-red-600">
                  <span>⚠️</span>
                  <span className="text-xs font-medium">Connection Issue</span>
                </div>
              )}

              {/* Render markdown with clickable links */}
              {msg.role === "assistant" ? (
                <ReactMarkdown
                  components={{
                    a: ({ node, ...props }) => (
                      <a
                        {...props}
                        className="text-blue-600 hover:text-blue-800 underline font-medium"
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    ),
                    p: ({ node, ...props }) => (
                      <p {...props} className="mb-2 last:mb-0" />
                    ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}

              <p className="text-xs opacity-60 mt-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                {retryCount > 0 && (
                  <span className="text-xs text-gray-500">Retrying... ({retryCount}/{MAX_RETRIES})</span>
                )}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className={`p-4 border-t ${borderColor} ${bgColor} rounded-b-lg`}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className={`flex-1 px-4 py-2 border ${borderColor} rounded-lg focus:outline-none focus:border-blue-500 ${isDark ? 'bg-gray-800 text-white' : 'bg-white'}`}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
