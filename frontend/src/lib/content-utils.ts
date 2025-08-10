/**
 * Content Type Detection and Handling Utilities
 * Provides functions to detect content type and handle both markdown and HTML content
 */

/**
 * Detects if content is HTML based on common HTML patterns
 * @param content - The content string to analyze
 * @returns true if content appears to be HTML, false otherwise
 */
export function isHtmlContent(content: string): boolean {
  if (!content || typeof content !== 'string') return false;
  
  // Common HTML patterns
  const htmlPatterns = [
    /<[^>]+>/g,                    // HTML tags
    /&[a-zA-Z]+;/g,                // HTML entities
    /<html|<body|<head|<div|<span|<p|<h[1-6]|<ul|<ol|<li|<table|<tr|<td|<th|<img|<video|<audio|<iframe|<canvas|<svg/gi, // Common HTML elements
    /class\s*=\s*["'][^"']*["']/gi, // Class attributes
    /style\s*=\s*["'][^"']*["']/gi, // Style attributes
    /id\s*=\s*["'][^"']*["']/gi,    // ID attributes
  ];
  
  // Check if any HTML patterns are found
  return htmlPatterns.some(pattern => pattern.test(content));
}

/**
 * Detects if content is markdown based on common markdown patterns
 * @param content - The content string to analyze
 * @returns true if content appears to be markdown, false otherwise
 */
export function isMarkdownContent(content: string): boolean {
  if (!content || typeof content !== 'string') return false;
  
  // Common markdown patterns
  const markdownPatterns = [
    /^#{1,6}\s+/gm,                // Headers (# ## ### etc.)
    /^\*\s+/gm,                     // Unordered lists (* item)
    /^\d+\.\s+/gm,                  // Ordered lists (1. item)
    /^\>\s+/gm,                     // Blockquotes (> quote)
    /`[^`]+`/g,                     // Inline code (`code`)
    /```[\s\S]*```/g,               // Code blocks (```code```)
    /\[([^\]]+)\]\(([^)]+)\)/g,     // Links [text](url)
    /!\[([^\]]*)\]\(([^)]+)\)/g,    // Images ![alt](url)
    /^\-\s+/gm,                     // Alternative unordered lists (- item)
    /^\+\s+/gm,                     // Alternative unordered lists (+ item)
    /\*\*[^*]+\*\*/g,               // Bold text (**bold**)
    /\*[^*]+\*/g,                   // Italic text (*italic*)
    /~~[^~]+~~/g,                   // Strikethrough (~~strikethrough~~)
  ];
  
  // Check if any markdown patterns are found
  return markdownPatterns.some(pattern => pattern.test(content));
}

/**
 * Auto-detects content type based on content analysis
 * @param content - The content string to analyze
 * @returns 'html' | 'markdown' | 'text'
 */
export function detectContentType(content: string): 'html' | 'markdown' | 'text' {
  if (!content || typeof content !== 'string') return 'text';
  
  // Check for HTML first (more specific patterns)
  if (isHtmlContent(content)) {
    return 'html';
  }
  
  // Check for markdown patterns
  if (isMarkdownContent(content)) {
    return 'markdown';
  }
  
  // Default to text if no specific patterns found
  return 'text';
}

/**
 * Safely determines content type with fallback logic
 * @param content - The content string
 * @param explicitType - Explicit content type if provided
 * @returns The determined content type
 */
export function getContentType(
  content: string, 
  explicitType?: 'markdown' | 'html'
): 'markdown' | 'html' {
  // If explicit type is provided, use it
  if (explicitType) {
    return explicitType;
  }
  
  // Auto-detect based on content
  const detectedType = detectContentType(content);
  
  // Map detected types to our supported types
  switch (detectedType) {
    case 'html':
      return 'html';
    case 'markdown':
    case 'text':
    default:
      return 'markdown';
  }
}

/**
 * Validates HTML content for security
 * @param html - HTML content to validate
 * @returns true if HTML appears safe, false otherwise
 */
export function validateHtmlContent(html: string): boolean {
  if (!html || typeof html !== 'string') return false;
  
  // Check for dangerous patterns
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,  // Script tags
    /javascript:/gi,                                            // JavaScript protocol
    /on\w+\s*=/gi,                                             // Event handlers
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,    // Iframe tags (if not allowed)
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,    // Object tags
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,       // Embed tags
  ];
  
  // Check if any dangerous patterns are found
  return !dangerousPatterns.some(pattern => pattern.test(html));
}

/**
 * Sanitizes HTML content using DOMPurify
 * @param html - Raw HTML content
 * @returns Sanitized HTML content
 */
export function sanitizeHtmlContent(html: string): string {
  if (!html || typeof html !== 'string') return '';
  
  // Import DOMPurify dynamically to avoid SSR issues
  if (typeof window !== 'undefined') {
    const DOMPurify = require('dompurify');
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'div', 'span', 'br', 'hr',
        'ul', 'ol', 'li',
        'strong', 'em', 'b', 'i', 'u', 's',
        'blockquote', 'pre', 'code',
        'a', 'img', 'video', 'audio', 'iframe',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'canvas', 'svg'
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class', 'id', 'style',
        'width', 'height', 'target', 'rel', 'type', 'value',
        'placeholder', 'required', 'disabled', 'readonly',
        'maxlength', 'minlength', 'pattern', 'autocomplete',
        'autofocus', 'name', 'size', 'step', 'min', 'max'
      ],
      ALLOW_DATA_ATTR: false,
      ALLOW_UNKNOWN_PROTOCOLS: false,
      FORBID_TAGS: ['script', 'object', 'embed', 'applet'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    });
  }
  
  // Fallback for SSR - return empty string
  return '';
}

/**
 * Detects if a URL is external (not relative to current domain)
 * @param url - URL to check
 * @returns true if URL is external, false if internal/relative
 */
export function isExternalUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  // Check for external URL patterns
  return url.startsWith('http://') || 
         url.startsWith('https://') || 
         url.startsWith('//') ||
         url.startsWith('mailto:') ||
         url.startsWith('tel:') ||
         url.startsWith('ftp://');
}

/**
 * Extracts all links from markdown content
 * @param markdown - Markdown content to parse
 * @returns Array of link objects with text and URL
 */
export function extractMarkdownLinks(markdown: string): Array<{text: string, url: string}> {
  if (!markdown || typeof markdown !== 'string') return [];
  
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links: Array<{text: string, url: string}> = [];
  let match;
  
  while ((match = linkRegex.exec(markdown)) !== null) {
    links.push({
      text: match[1],
      url: match[2]
    });
  }
  
  return links;
}

/**
 * Extracts all links from HTML content
 * @param html - HTML content to parse
 * @returns Array of link objects with text and URL
 */
export function extractHtmlLinks(html: string): Array<{text: string, url: string}> {
  if (!html || typeof html !== 'string') return [];
  
  const linkRegex = /<a[^>]+href\s*=\s*["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
  const links: Array<{text: string, url: string}> = [];
  let match;
  
  while ((match = linkRegex.exec(html)) !== null) {
    links.push({
      text: match[2].trim(),
      url: match[1]
    });
  }
  
  return links;
}

/**
 * Validates if a URL is safe and well-formed
 * @param url - URL to validate
 * @returns true if URL is valid and safe, false otherwise
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  try {
    // Check for dangerous protocols
    if (url.startsWith('javascript:') || 
        url.startsWith('data:') || 
        url.startsWith('vbscript:')) {
      return false;
    }
    
    // For external URLs, validate format
    if (isExternalUrl(url)) {
      const urlObj = new URL(url);
      return ['http:', 'https:', 'mailto:', 'tel:', 'ftp:'].includes(urlObj.protocol);
    }
    
    // For relative URLs, check if they're safe
    return !url.includes('..') && !url.includes('javascript:');
  } catch {
    return false;
  }
}
