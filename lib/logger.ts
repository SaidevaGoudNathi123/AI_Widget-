/**
 * Structured logging utility for production and development
 * Provides different log levels and formats based on environment
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'security'

interface LogContext {
  requestId?: string
  userId?: string
  ip?: string
  endpoint?: string
  [key: string]: any
}

export class Logger {
  private logLevel: LogLevel = 'info'

  constructor() {
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || 'info'
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'security']
    return levels.indexOf(level) >= levels.indexOf(this.logLevel)
  }

  private formatLog(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString()

    if (process.env.NODE_ENV === 'production') {
      // Structured JSON for production (easier for log aggregation tools)
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...context,
      })
    } else {
      // Human-readable for development
      const contextStr = context ? ` ${JSON.stringify(context)}` : ''
      return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`
    }
  }

  debug(message: string, context?: LogContext) {
    if (this.shouldLog('debug')) {
      console.debug(this.formatLog('debug', message, context))
    }
  }

  info(message: string, context?: LogContext) {
    if (this.shouldLog('info')) {
      console.log(this.formatLog('info', message, context))
    }
  }

  warn(message: string, context?: LogContext) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatLog('warn', message, context))
    }
  }

  error(message: string, context?: LogContext) {
    if (this.shouldLog('error')) {
      console.error(this.formatLog('error', message, context))
    }
  }

  security(message: string, context?: LogContext) {
    // Security events are always logged regardless of log level
    console.error(this.formatLog('security', message, { ...context, security_event: true }))
  }
}

export const logger = new Logger()
