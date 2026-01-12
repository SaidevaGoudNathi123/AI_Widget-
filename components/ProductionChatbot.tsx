"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  options?: string[];
  links?: { text: string; href: string }[];
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

export default function ProductionChatbot() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'error'>('online');
  const [retryCount, setRetryCount] = useState(0);
  const [showToast, setShowToast] = useState(false); // Bottom-left notification
  const [toastDismissed, setToastDismissed] = useState(false); // User dismissed toast
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setConnectionStatus('online');
    const handleOffline = () => setConnectionStatus('offline');
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Set initial status
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

  // Show toast notification immediately after login (no delay)
  useEffect(() => {
    if (session && !toastDismissed && !isOpen) {
      // Small delay just for smooth page load
      const timer = setTimeout(() => {
        setShowToast(true);
      }, 500); // 0.5 seconds - just for smooth animation
      return () => clearTimeout(timer);
    }
  }, [session, toastDismissed, isOpen]);

  // Handle opening chatbot from toast or button
  const openChatbot = () => {
    setShowToast(false);
    setIsOpen(true);
    setHasAutoOpened(true);
    // Send welcome message
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        role: "assistant",
        content: "Hey 👋 What brings you to Bubbl today?",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  };

  // Dismiss toast without opening chatbot
  const dismissToast = () => {
    setShowToast(false);
    setToastDismissed(true);
  };

  const handleQuickOption = (option: string) => {
    // User clicks a quick option
    const userMessage: Message = {
      role: "user",
      content: option,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Respond based on option
    let response: Message;
    switch (option) {
      case "Popular things people do here":
        response = {
          role: "assistant",
          content: "Here are a few good starting points:",
          timestamp: new Date(),
          links: [
            { text: "Browse Properties", href: "/listings" },
            { text: "Explore Events", href: "/community" },
            { text: "How it Works", href: "/dashboard" }
          ],
        };
        break;

      case "What this site is for":
        response = {
          role: "assistant",
          content: "Bubbl is an event-based co-living marketplace. We connect people attending the same events to share amazing properties.\n\nYou can browse listings, find housemates, and get AI-powered concierge support during your stay.\n\nWhat would you like to explore?",
          timestamp: new Date(),
          links: [
            { text: "See Available Properties", href: "/listings" },
            { text: "View Community Features", href: "/community" }
          ],
        };
        break;

      case "I'm looking for something specific":
        response = {
          role: "assistant",
          content: "Great! Tell me what you're looking for and I'll help you find it. For example:\n• Properties in a specific city\n• Events happening soon\n• Your booking details\n\nJust type your question below.",
          timestamp: new Date(),
        };
        break;

      default:
        response = {
          role: "assistant",
          content: "I'm here to help! What can I assist you with?",
          timestamp: new Date(),
        };
    }

    setMessages(prev => [...prev, response]);
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
    // Cancel any existing request
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
        // Retry on server errors
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        setRetryCount(prev => prev + 1);
        return fetchWithRetry(url, options, retries - 1);
      }
      
      setRetryCount(0);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError' && retries > 0) {
        // Retry on timeout
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

    // Check connection status first
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
    const userInput = input.trim();
    setInput("");
    setIsLoading(true);
    setConnectionStatus('online');

    try {
      // Always use AI for responses - no forced quick options
      const response = await fetchWithRetry("/api/chat/converse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userInput,
          messages: messages.slice(-5).map(m => ({
            role: m.role,
            content: m.content
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw { status: response.status, message: errorData.message || 'Request failed' };
      }

      const data = await response.json();

      // Check if the API returned an error flag
      if (data.error) {
        throw { message: data.message, status: 500 };
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        links: detectLinks(data.message, userInput),
      };

      setMessages(prev => [...prev, assistantMessage]);
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

  // Helper to detect and add helpful links based on context
  const detectLinks = (message: string, userInput: string) => {
    const links: { text: string; href: string }[] = [];
    const lowerMessage = message.toLowerCase();
    const lowerInput = userInput.toLowerCase();

    if (lowerInput.includes("event") || lowerInput.includes("activity")) {
      links.push({ text: "Browse Events", href: "/community" });
    }
    if (lowerInput.includes("property") || lowerInput.includes("listing") || lowerInput.includes("stay")) {
      links.push({ text: "View Properties", href: "/listings" });
    }
    if (lowerInput.includes("price") || lowerInput.includes("cost") || lowerInput.includes("how much")) {
      links.push({ text: "See Listings", href: "/listings" });
    }
    if (lowerInput.includes("miami") || lowerInput.includes("location") || lowerInput.includes("where")) {
      links.push({ text: "Browse Locations", href: "/listings" });
    }

    return links.length > 0 ? links : undefined;
  };

  if (!session) {
    return null; // Don't show chatbot if not logged in
  }

  return (
    <>
      {/* Bottom-Left Toast Notification */}
      {showToast && !isOpen && (
        <div className="fixed bottom-6 left-6 z-50 animate-slide-up">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 max-w-xs">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                🤖
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Need any help?</p>
                <p className="text-sm text-gray-600 mt-1">I can help with bookings, WiFi, events, and more!</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={openChatbot}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Chat now
                  </button>
                  <button
                    onClick={dismissToast}
                    className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-800 transition-colors"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
              <button
                onClick={dismissToast}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Button (bottom-right) */}
      {!isOpen && !showToast && (
        <button
          onClick={openChatbot}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center text-2xl z-50 hover:scale-110"
        >
          💬
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
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
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-blue-100 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Connection Warning Banner */}
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

                  {/* Render markdown with clickable links for assistant messages */}
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
                          <p {...props} className="mb-2 last:mb-0 whitespace-pre-wrap" />
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}

                  {/* Quick Options */}
                  {msg.options && (
                    <div className="mt-3 space-y-2">
                      {msg.options.map((option, i) => (
                        <button
                          key={i}
                          onClick={() => handleQuickOption(option)}
                          className="block w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-sm transition-colors"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Helpful Links */}
                  {msg.links && (
                    <div className="mt-3 space-y-1">
                      {msg.links.map((link, i) => (
                        <a
                          key={i}
                          href={link.href}
                          className="block text-blue-600 hover:text-blue-700 text-sm underline"
                        >
                          → {link.text}
                        </a>
                      ))}
                    </div>
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
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
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
      )}
    </>
  );
}
