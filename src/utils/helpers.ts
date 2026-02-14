import { URL } from 'node:url';
import { existsSync, statSync } from 'node:fs';

/**
 * Detect if a target is a URL or local path.
 */
export function isUrl(target: string): boolean {
  try {
    const url = new URL(target);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Normalize URL to ensure it has a protocol.
 */
export function normalizeUrl(target: string): string {
  if (!target.startsWith('http://') && !target.startsWith('https://')) {
    return `https://${target}`;
  }
  return target;
}

/**
 * Get base URL from a full URL.
 */
export function getBaseUrl(url: string): string {
  const parsed = new URL(url);
  return `${parsed.protocol}//${parsed.host}`;
}

/**
 * Check if a local path exists and is a directory.
 */
export function isDirectory(path: string): boolean {
  try {
    return existsSync(path) && statSync(path).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Format a score bar for terminal display.
 */
export function scoreBar(score: number, max: number, width: number = 20): string {
  const filled = Math.round((score / max) * width);
  const empty = width - filled;
  const percentage = Math.round((score / max) * 100);

  let color: (s: string) => string;
  if (percentage >= 80) color = (s: string) => `\x1b[32m${s}\x1b[0m`; // green
  else if (percentage >= 60) color = (s: string) => `\x1b[33m${s}\x1b[0m`; // yellow
  else if (percentage >= 40) color = (s: string) => `\x1b[38;5;208m${s}\x1b[0m`; // orange
  else color = (s: string) => `\x1b[31m${s}\x1b[0m`; // red

  return color('█'.repeat(filled)) + '░'.repeat(empty);
}

/**
 * Pad string to a fixed width.
 */
export function pad(str: string, width: number): string {
  return str.padEnd(width);
}

/**
 * Strip HTML tags and get plain text content.
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
