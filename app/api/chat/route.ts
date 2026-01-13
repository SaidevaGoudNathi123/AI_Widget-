/**
 * Bubbl Chatbot API - Chat Endpoint
 *
 * This endpoint is designed to be called from Bubble.io using their API Connector.
 * No authentication required for MVP.
 */

import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { chatbotConfig } from "../../../lib/config";
import { validateApiKey } from "../../../lib/api-auth";

// Error types
type ErrorCode = 'VALIDATION_ERROR' | 'RATE_LIMIT' | 'MODEL_ERROR' | 'TIMEOUT' | 'UNKNOWN' | 'AUTH_ERROR';

interface ApiError {
  code: ErrorCode;
  message: string;
  userMessage: string;
  retryable: boolean;
}

const ERROR_RESPONSES: Record<ErrorCode, ApiError> = {
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid request payload',
    userMessage: 'Please provide a valid message.',
    retryable: false,
  },
  RATE_LIMIT: {
    code: 'RATE_LIMIT',
    message: 'Rate limit exceeded',
    userMessage: "I'm getting a lot of requests right now. Please wait a moment and try again.",
    retryable: true,
  },
  MODEL_ERROR: {
    code: 'MODEL_ERROR',
    message: 'Model unavailable',
    userMessage: "I'm temporarily unavailable. Please try again in a moment.",
    retryable: true,
  },
  TIMEOUT: {
    code: 'TIMEOUT',
    message: 'Request timeout',
    userMessage: "The request is taking too long. Please try again.",
    retryable: true,
  },
  UNKNOWN: {
    code: 'UNKNOWN',
    message: 'Unknown error',
    userMessage: "I'm having trouble connecting right now. Please try again!",
    retryable: true,
  },
  AUTH_ERROR: {
    code: 'AUTH_ERROR',
    message: 'Invalid or missing API key',
    userMessage: 'Authentication failed. Please provide a valid API key.',
    retryable: false,
  },
};

/**
 * POST /api/chat
 *
 * Request body:
 * {
 *   "message": "User's message",
 *   "thread_id": "optional_conversation_id",
 *   "messages": [{"role": "user|assistant", "content": "..."}], // optional conversation history
 *   "site_url": "https://bubbl.io" // optional, defaults to bubbl.com
 * }
 *
 * Response:
 * {
 *   "message": "Bot's response with [markdown links](url)",
 *   "thread_id": "conversation_id",
 *   "timestamp": "2025-01-09T...",
 *   "success": true,
 *   "requestId": "uuid",
 *   "duration": 1234
 * }
 */
export async function POST(request: Request) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  // Enable CORS for Bubble.io (MVP: Allow all origins)
  // TODO: In production, restrict to specific domains
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    'Content-Type': 'application/json',
    // Security headers
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  };

  // Validate OpenAI API key is configured
  if (!process.env.OPENAI_API_KEY) {
    console.error(`[${requestId}] OPENAI_API_KEY not configured`);
    return Response.json({
      message: "Service configuration error. Please contact support.",
      error: true,
      code: 'MODEL_ERROR',
      retryable: false,
      requestId,
    }, { status: 503, headers });
  }

  try {
    // Validate content type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      console.warn(`[${requestId}] Invalid content type: ${contentType}`);
      return Response.json({
        ...ERROR_RESPONSES.VALIDATION_ERROR,
        requestId,
      }, { status: 400, headers });
    }

    const body = await request.json().catch(() => null);

    if (!body) {
      console.warn(`[${requestId}] Failed to parse request body`);
      return Response.json({
        ...ERROR_RESPONSES.VALIDATION_ERROR,
        message: 'Invalid JSON payload',
        requestId,
      }, { status: 400, headers });
    }

    // Check API key authentication
    const apiKey = request.headers.get('x-api-key');

    if (!validateApiKey(apiKey)) {
      console.warn(`[${requestId}] Invalid or missing API key`);
      return Response.json({
        ...ERROR_RESPONSES.AUTH_ERROR,
        requestId,
      }, { status: 401, headers });
    }

    const {
      message,
      messages,
      thread_id,
      site_url = 'https://bubbl.io'
    } = body;

    // Validate message
    if (!message || typeof message !== 'string') {
      console.warn(`[${requestId}] Invalid message: ${typeof message}`);
      return Response.json({
        ...ERROR_RESPONSES.VALIDATION_ERROR,
        requestId,
      }, { status: 400, headers });
    }

    // Sanitize and validate message length
    const sanitizedMessage = message.trim().slice(0, 2000); // Max 2000 chars
    if (sanitizedMessage.length === 0) {
      return Response.json({
        ...ERROR_RESPONSES.VALIDATION_ERROR,
        userMessage: 'Please enter a message.',
        requestId,
      }, { status: 400, headers });
    }

    // Validate messages array if provided
    const validMessages = Array.isArray(messages)
      ? messages.filter(m => m && typeof m.content === 'string' && ['user', 'assistant'].includes(m.role))
      : [];

    // Get system prompt from config with site URL
    const systemPrompt = chatbotConfig.systemPrompt(site_url);

    // Build conversation history (limit to last N for cost efficiency)
    const conversationMessages = [
      { role: "system" as const, content: systemPrompt },
      ...validMessages.slice(-chatbotConfig.model.contextMessages),
      { role: "user" as const, content: sanitizedMessage },
    ];

    console.log(`[${requestId}] Processing message: ${sanitizedMessage.slice(0, 50)}... (thread: ${thread_id || 'new'})`);

    // Generate response using AI SDK with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 25000);
    });

    const generatePromise = generateText({
      model: openai(chatbotConfig.model.name),
      messages: conversationMessages,
      temperature: chatbotConfig.model.temperature,
      maxTokens: chatbotConfig.model.maxTokens,
    });

    const { text } = await Promise.race([generatePromise, timeoutPromise]) as { text: string };

    const responseText = text || "I'm here to help! Could you tell me more about what you're looking for?";
    const duration = Date.now() - startTime;

    console.log(`[${requestId}] Response generated in ${duration}ms`);

    // Return thread_id for conversation continuity
    const responseThreadId = thread_id || requestId;

    return Response.json({
      message: responseText,
      thread_id: responseThreadId,
      timestamp: new Date().toISOString(),
      success: true,
      requestId,
      duration,
    }, { headers });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] Conversation error after ${duration}ms:`, error);

    // Determine error type
    let apiError: ApiError = ERROR_RESPONSES.UNKNOWN;
    let statusCode = 500;

    if (error?.message === 'Request timeout') {
      apiError = ERROR_RESPONSES.TIMEOUT;
      statusCode = 504;
    } else if (error?.message?.includes('rate limit') || error?.status === 429) {
      apiError = ERROR_RESPONSES.RATE_LIMIT;
      statusCode = 429;
    } else if (error?.message?.includes('model')) {
      apiError = ERROR_RESPONSES.MODEL_ERROR;
      statusCode = 503;
    }

    return Response.json({
      message: apiError.userMessage,
      error: true,
      code: apiError.code,
      retryable: apiError.retryable,
      requestId,
      duration,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }, { status: statusCode, headers });
  }
}

/**
 * OPTIONS /api/chat
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    },
  });
}

/**
 * GET /api/chat
 * Health check endpoint
 */
export async function GET() {
  return Response.json({
    service: "Bubbl Chatbot API",
    status: "active",
    version: "2.0.0",
    authRequired: false,
    endpoints: {
      chat: "POST /api/chat",
      health: "GET /api/chat"
    },
    documentation: "See README.md for API documentation"
  });
}
