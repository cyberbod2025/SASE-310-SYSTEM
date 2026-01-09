import { describe, it, expect } from 'vitest';
import { escapeHtml } from '../sase-310-manual-upload/components/PrintButtons';

describe('escapeHtml', () => {
  it('should escape special characters', () => {
    const input = '<script>alert("XSS")</script>';
    const expected = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;';
    expect(escapeHtml(input)).toBe(expected);
  });

  it('should handle regular strings', () => {
    const input = 'Hello World';
    expect(escapeHtml(input)).toBe('Hello World');
  });

  it('should handle empty strings', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('should handle null or undefined', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });

  it('should escape single quotes', () => {
    const input = "It's me";
    const expected = "It&#039;s me";
    expect(escapeHtml(input)).toBe(expected);
  });

  it('should escape ampersands', () => {
      const input = "Ben & Jerry's";
      const expected = "Ben &amp; Jerry&#039;s";
      expect(escapeHtml(input)).toBe(expected);
  });
});
