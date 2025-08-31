/**
 * Simple logging utility for development and production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  data?: unknown
  timestamp: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private log(level: LogLevel, message: string, data?: unknown) {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString()
    }

    // In development, use console methods
    if (this.isDevelopment) {
      switch (level) {
        case 'debug':
          console.log(`�� [DEBUG] ${message}`, data || '')
          break
        case 'info':
          console.log(`ℹ️ [INFO] ${message}`, data || '')
          break
        case 'warn':
          console.warn(`⚠️ [WARN] ${message}`, data || '')
          break
        case 'error':
          console.error(`❌ [ERROR] ${message}`, data || '')
          break
      }
    } else {
      // In production, you could send to a logging service
      // For now, we'll just store in memory or send to analytics
      this.sendToAnalytics(entry)
    }
  }

  private sendToAnalytics(entry: LogEntry) {
    // In production, send to Vercel Analytics or other service
    if (typeof window !== 'undefined' && window.va) {
      window.va('event', {
        name: 'log',
        properties: {
          level: entry.level,
          message: entry.message,
          timestamp: entry.timestamp
        }
      })
    }
  }

  debug(message: string, data?: unknown) {
    this.log('debug', message, data)
  }

  info(message: string, data?: unknown) {
    this.log('info', message, data)
  }

  warn(message: string, data?: unknown) {
    this.log('warn', message, data)
  }

  error(message: string, data?: unknown) {
    this.log('error', message, data)
  }
}

export const logger = new Logger()
