import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * Use this before rendering any HTML using dangerouslySetInnerHTML.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html);
}

/**
 * Generates a cryptographically secure random string.
 * Use this instead of Math.random() for sensitive IDs, tokens, or security codes.
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(36)).join('').slice(0, length).toUpperCase();
}

/**
 * Specific version for numerical codes (like 4-6 digit pins).
 */
export function generateSecureNumCode(length: number = 6): string {
  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, (val) => val % 10).join('');
}
