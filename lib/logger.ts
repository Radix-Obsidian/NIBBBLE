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

  private format(data?: unknown) {
    if (!data) return ''
    try {
      if (data instanceof Error) {
        const anyErr = data as any
        return { message: data.message, stack: data.stack, code: anyErr.code, details: anyErr.details }
      }
      if (typeof data === 'object') {
        const anyObj = data as any
        if (anyObj && (anyObj.message || anyObj.code || anyObj.details)) return anyObj
        return JSON.stringify(anyObj)
      }
      return data
    } catch {
      return data
    }
  }

  private log(level: LogLevel, message: string, data?: unknown) {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString()
    }

    if (this.isDevelopment) {
      const payload = this.format(data)
      switch (level) {
        case 'debug':
          console.log(`�� [DEBUG] ${message}`, payload)
          break
        case 'info':
          console.log(`ℹ️ [INFO] ${message}`, payload)
          break
        case 'warn':
          console.warn(`⚠️ [WARN] ${message}`, payload)
          break
        case 'error':
          console.error(`❌ [ERROR] ${message}`, payload)
          break
      }
    } else {
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
