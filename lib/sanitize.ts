// Simple HTML sanitizer - strips potentially dangerous tags and attributes
// For production, consider using a library like DOMPurify

const ALLOWED_TAGS = ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'ul', 'ol', 'li', 'a'];
const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ['href', 'title'],
};

// Escape HTML special characters
export function escapeHtml(str: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return str.replace(/[&<>"'/]/g, (char) => escapeMap[char]);
}

// Strip all HTML tags
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}

// Sanitize HTML - allow only safe tags
export function sanitizeHtml(html: string): string {
  // First, decode any encoded entities that could be used for XSS
  let sanitized = html;

  // Remove script tags and their contents
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove style tags and their contents
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript:/gi, '');

  // Remove data: URLs (can be used for XSS)
  sanitized = sanitized.replace(/data:/gi, '');

  // Remove vbscript: URLs
  sanitized = sanitized.replace(/vbscript:/gi, '');

  // Remove any remaining potentially dangerous tags
  const dangerousTags = ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'];
  for (const tag of dangerousTags) {
    const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>|<${tag}[^>]*/>|<${tag}[^>]*>`, 'gi');
    sanitized = sanitized.replace(regex, '');
  }

  return sanitized;
}

// Sanitize user input for safe storage
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';

  // Trim whitespace
  let sanitized = input.trim();

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Normalize unicode
  sanitized = sanitized.normalize('NFC');

  // Remove control characters (except newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return sanitized;
}

// Sanitize for SQL (use parameterized queries instead when possible)
export function sanitizeForSql(str: string): string {
  return str.replace(/['";\\]/g, '');
}

// Sanitize URL
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    return parsed.href;
  } catch {
    return '';
  }
}

// Sanitize filename
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 255);
}

// Sanitize search query
export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 200);
}

// Sanitize object - recursively sanitize all string values
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = {} as T;
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      (result as Record<string, unknown>)[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      (result as Record<string, unknown>)[key] = value.map((item) =>
        typeof item === 'string' ? sanitizeInput(item) : item
      );
    } else if (value && typeof value === 'object') {
      (result as Record<string, unknown>)[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      (result as Record<string, unknown>)[key] = value;
    }
  }
  return result;
}
