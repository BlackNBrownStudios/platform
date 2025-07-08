/**
 * Simple UUID generator that works in both React Native and Web environments
 * This is a cross-platform implementation that doesn't rely on external dependencies
 */
export function generateUUID(): string {
  // Generate a random hexadecimal digit
  const randomHex = (): string => Math.floor(Math.random() * 16).toString(16);

  // Pattern for UUID v4 (random)
  // xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx where y is 8, 9, a, or b
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
