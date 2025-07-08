/**
 * Global type definitions for React Native Web
 */

// Define global browser types for React Native Web
interface Window {
  onerror:
    | ((
        message: string | Event,
        source?: string,
        lineno?: number,
        colno?: number,
        error?: Error
      ) => boolean | void)
    | null;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
  innerWidth: number;
  innerHeight: number;
}

// Define navigator object
interface Navigator {
  userAgent: string;
}

// Define promise rejection event
interface PromiseRejectionEvent extends Event {
  promise: Promise<any>;
  reason: any;
}

// Extend the global namespace
declare global {
  // Make window available in TypeScript
  const window: Window | undefined;

  // Make navigator available in TypeScript
  const navigator: Navigator | undefined;

  // Include window in the global object
  interface Window {
    onerror:
      | ((
          message: string | Event,
          source?: string,
          lineno?: number,
          colno?: number,
          error?: Error
        ) => boolean | void)
      | null;
    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ): void;
    removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions
    ): void;
    innerWidth: number;
    innerHeight: number;
  }

  // Define promise rejection event
  interface PromiseRejectionEvent extends Event {
    promise: Promise<any>;
    reason: any;
  }

  // Define Hermes internal for React Native
  const HermesInternal: any | undefined;
}

export {};
