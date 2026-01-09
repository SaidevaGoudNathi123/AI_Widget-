/**
 * Bubbl Chatbot API Route (Lean Version - No Auth Required)
 *
 * This is a standalone API handler that can be integrated into any Next.js app
 * without authentication requirements.
 */

import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { chatbotConfig } from "../lib/config";

// Error types for structured error handling
type ErrorCode = 'VALIDATION_ERROR' | 'RATE_LIMIT' | 'MODEL_ERROR' | 'TIMEOUT' | 'UNKNOWN';

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
};

/**
 * Main chat handler - can be used in Next.js API routes or serverless functions
 */
export async function handleChatRequest(request: Request) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    // Validate content type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      console.warn(`[${requestId}] Invalid content type: ${contentType}`);
      return Response.json({
        ...ERROR_RESPONSES.VALIDATION_ERROR,
        requestId,
      }, { status: 400 });
    }

    const body = await request.json().catch(() => null);

    if (!body) {
      console.warn(`[${requestId}] Failed to parse request body`);
      return Response.json({
        ...ERROR_RESPONSES.VALIDATION_ERROR,
        message: 'Invalid JSON payload',
        requestId,
      }, { status: 400 });
    }

    const { message, messages, siteUrl = 'https://bubbl.com' } = body;

    // Validate message
    if (!message || typeof message !== 'string') {
      console.warn(`[${requestId}] Invalid message: ${typeof message}`);
      return Response.json({
        ...ERROR_RESPONSES.VALIDATION_ERROR,
        requestId,
      }, { status: 400 });
    }

    // Sanitize and validate message length
    const sanitizedMessage = message.trim().slice(0, 2000); // Max 2000 chars
    if (sanitizedMessage.length === 0) {
      return Response.json({
        ...ERROR_RESPONSES.VALIDATION_ERROR,
        userMessage: 'Please enter a message.',
        requestId,
      }, { status: 400 });
    }

    // Validate messages array if provided
    const validMessages = Array.isArray(messages)
      ? messages.filter(m => m && typeof m.content === 'string' && ['user', 'assistant'].includes(m.role))
      : [];

    // Get system prompt from config with site URL
    const systemPrompt = chatbotConfig.systemPrompt(siteUrl);

    // Build conversation history (limit to last N for cost efficiency)
    const conversationMessages = [
      { role: "system" as const, content: systemPrompt },
      ...validMessages.slice(-chatbotConfig.model.contextMessages),
      { role: "user" as const, content: sanitizedMessage },
    ];

    console.log(`[${requestId}] Processing message: ${sanitizedMessage.slice(0, 50)}...`);

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

    return Response.json({
      message: responseText,
      timestamp: new Date().toISOString(),
      success: true,
      requestId,
      duration,
    });

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
    }, { status: statusCode });
  }
}

/**
 * Next.js API Route handler (app router)
 * Usage: Create app/api/chat/route.ts with:
 *
 * import { handleChatRequest } from '@bubbl/chatbot/api/chat'
 * export const POST = handleChatRequest
 */
export async function POST(request: Request) {
  return handleChatRequest(request);
}

/**
 * Health check endpoint
 */
export async function GET() {
  return Response.json({
    service: "Bubbl Chatbot API (Lean Version)",
    status: "active",
    version: "1.0.0",
    authRequired: false,
  });
}
