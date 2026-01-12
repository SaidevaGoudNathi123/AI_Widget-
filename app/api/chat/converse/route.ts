import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Error types for structured error handling
type ErrorCode = 'VALIDATION_ERROR' | 'RATE_LIMIT' | 'AUTH_ERROR' | 'MODEL_ERROR' | 'TIMEOUT' | 'UNKNOWN';

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
  AUTH_ERROR: {
    code: 'AUTH_ERROR',
    message: 'Authentication failed',
    userMessage: "I'm experiencing technical difficulties. Please contact support.",
    retryable: false,
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

// Production-ready conversation endpoint with comprehensive error handling
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    // Authentication check - require logged in user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({
        ...ERROR_RESPONSES.AUTH_ERROR,
        userMessage: "Please log in to use the chat.",
        requestId,
      }, { status: 401 });
    }

    // Validate content type
    const contentType = req.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      console.warn(`[${requestId}] Invalid content type: ${contentType}`);
      return Response.json({
        ...ERROR_RESPONSES.VALIDATION_ERROR,
        requestId,
      }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    
    if (!body) {
      console.warn(`[${requestId}] Failed to parse request body`);
      return Response.json({
        ...ERROR_RESPONSES.VALIDATION_ERROR,
        message: 'Invalid JSON payload',
        requestId,
      }, { status: 400 });
    }

    const { message, messages } = body;

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

    // Enhanced system prompt for production
    const systemPrompt = `You are the Bubbl Assistant, a helpful guide for an event-based co-living platform.

WHAT YOU DO:
- Help users find properties and events
- Provide quick, concise answers (under 100 words)
- Suggest relevant pages when helpful
- Be friendly but professional

RESPONSE STYLE:
- Keep it conversational and clear
- Use bullet points for lists
- Add helpful suggestions when relevant
- If you don't know something specific, guide them to the right page

AVAILABLE PAGES:
- /listings - Browse properties
- /community - View events and connect with housemates  
- /dashboard - User dashboard

CONTEXT:
Users might ask about:
- Finding properties for events
- Checking availability
- Getting property details (WiFi, check-in, amenities)
- Connecting with other guests
- How Bubbl works

Always be helpful and guide them to take the next step.`;

    // Build conversation history (limit to last 5 for cost efficiency)
    const conversationMessages = [
      { role: "system" as const, content: systemPrompt },
      ...validMessages.slice(-5),
      { role: "user" as const, content: sanitizedMessage },
    ];

    console.log(`[${requestId}] Processing message: ${sanitizedMessage.slice(0, 50)}...`);

    // Generate response using AI SDK with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 25000);
    });

    const generatePromise = generateText({
      model: openai("gpt-4"),
      messages: conversationMessages,
      temperature: 0.7,
      maxTokens: 200,
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
    } else if (error?.message?.includes('API key') || error?.status === 401) {
      apiError = ERROR_RESPONSES.AUTH_ERROR;
      statusCode = 500; // Don't expose auth errors to client
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

export async function GET() {
  return Response.json({
    service: "Conversational Chatbot API",
    status: "active",
    version: "2.0",
  });
}