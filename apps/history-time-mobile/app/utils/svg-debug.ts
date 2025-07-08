/**
 * SVG Debug Utility
 * Helps track SVG loading and rendering issues across platforms
 */
import { Platform } from 'react-native';
import '../typings/global.d.ts';

// Debug levels
export enum DebugLevel {
  NONE = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  VERBOSE = 4,
}

// Current debug level - set to ERROR by default
let currentDebugLevel = DebugLevel.ERROR;

// Enable for development, disable for production
const isDev = process.env.NODE_ENV === 'development';

/**
 * Set the SVG debug level
 */
export function setSvgDebugLevel(level: DebugLevel): void {
  currentDebugLevel = level;
}

/**
 * Log SVG debugging information
 */
export function logSvg(level: DebugLevel, message: string, ...args: any[]): void {
  if (!isDev) return;
  if (level > currentDebugLevel) return;

  const prefix = '[SVG]';
  switch (level) {
    case DebugLevel.ERROR:
      console.error(prefix, message, ...args);
      break;
    case DebugLevel.WARN:
      console.warn(prefix, message, ...args);
      break;
    case DebugLevel.INFO:
      console.info(prefix, message, ...args);
      break;
    case DebugLevel.VERBOSE:
      console.log(prefix, message, ...args);
      break;
  }
}

/**
 * Track SVG component loading
 */
export function trackSvgLoad(name: string, success: boolean, details?: any): void {
  const level = success ? DebugLevel.VERBOSE : DebugLevel.ERROR;
  const status = success ? 'loaded' : 'failed';

  logSvg(level, `SVG ${name} ${status}`, details);
}

/**
 * Register global error handler for SVG rendering
 */
export function setupSvgErrorTracking(): void {
  // Only run on web platform
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const originalOnError = window.onerror;

    window.onerror = function (
      message: string | Event,
      source?: string,
      lineno?: number,
      colno?: number,
      error?: Error
    ): boolean | void {
      // Check if error is related to SVG
      const messageStr = message instanceof Event ? message.type : message;
      if (
        messageStr &&
        ((typeof messageStr === 'string' && messageStr.includes('svg')) ||
          source?.includes('svg') ||
          error?.stack?.includes('svg'))
      ) {
        logSvg(DebugLevel.ERROR, 'SVG rendering error caught by window.onerror', {
          message: messageStr,
          source,
          lineno,
          colno,
          error,
        });
      }

      // Call original handler
      if (typeof originalOnError === 'function') {
        return originalOnError(message, source, lineno, colno, error);
      }

      return false;
    };
  }
}

/**
 * Initialize SVG debugging
 */
export function initSvgDebug(level: DebugLevel = DebugLevel.ERROR): void {
  setSvgDebugLevel(level);
  setupSvgErrorTracking();
  logSvg(DebugLevel.INFO, 'SVG debugging initialized');
}
