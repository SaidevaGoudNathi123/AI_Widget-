/**
 * @bubbl/chatbot - Standalone AI chatbot package
 *
 * Main exports for the Bubbl chatbot package
 */

// Main chatbot component
export { default as BubblChatbot } from './components/BubblChatbot';
export type { BubblChatbotProps } from './components/BubblChatbot';

// API handler for Next.js routes
export { handleChatRequest, POST, GET } from './api/chat';

// Configuration
export { chatbotConfig } from './lib/config';
export type { default as ChatbotConfig } from './lib/config';
