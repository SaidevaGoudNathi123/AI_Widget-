/**
 * Request monitoring and cost tracking utilities
 * Tracks API usage, performance, and OpenAI costs
 */

import { logger } from './logger'

interface RequestMetrics {
  requestId: string
  endpoint: string
  method: string
  statusCode: number
  duration: number
  userId?: string
  ip?: string
  tokensUsed?: number
  estimatedCost?: number
}

/**
 * Logs request completion metrics
 * Includes automatic alerts for high costs and errors
 *
 * @param metrics - Request metrics to log
 */
export function logRequestMetrics(metrics: RequestMetrics) {
  logger.info('Request completed', {
    requestId: metrics.requestId,
    endpoint: metrics.endpoint,
    method: metrics.method,
    statusCode: metrics.statusCode,
    duration: metrics.duration,
    userId: metrics.userId,
    ip: metrics.ip,
    tokensUsed: metrics.tokensUsed,
    estimatedCost: metrics.estimatedCost,
  })

  // Alert on high cost requests (>$0.10 per request)
  if (metrics.estimatedCost && metrics.estimatedCost > 0.1) {
    logger.warn('High cost request detected', {
      requestId: metrics.requestId,
      cost: metrics.estimatedCost,
      tokensUsed: metrics.tokensUsed,
    })
  }

  // Alert on server errors
  if (metrics.statusCode >= 500) {
    logger.error('Server error occurred', {
      requestId: metrics.requestId,
      statusCode: metrics.statusCode,
      endpoint: metrics.endpoint,
    })
  }
}

/**
 * Calculates estimated cost for OpenAI API usage
 * Pricing based on current OpenAI rates (as of 2025)
 *
 * @param usage - Token usage from OpenAI response
 * @param model - Model name used
 * @returns Estimated cost in USD
 */
export function calculateCost(
  usage: { promptTokens: number; completionTokens: number },
  model: string
): number {
  // OpenAI pricing per 1000 tokens (as of January 2025)
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-3.5-turbo': { input: 0.0005 / 1000, output: 0.0015 / 1000 },
    'gpt-4': { input: 0.03 / 1000, output: 0.06 / 1000 },
    'gpt-4-turbo': { input: 0.01 / 1000, output: 0.03 / 1000 },
  }

  // Default to gpt-3.5-turbo pricing if model not found
  const modelPricing = pricing[model] || pricing['gpt-3.5-turbo']

  const inputCost = usage.promptTokens * modelPricing.input
  const outputCost = usage.completionTokens * modelPricing.output

  return inputCost + outputCost
}
