// Input sanitization utility to prevent XSS attacks
// Strips HTML tags and dangerous characters from user input

/**
 * Sanitize user input by removing HTML tags and dangerous characters
 * @param input - The user input to sanitize
 * @returns Sanitized string
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');

  // Remove potentially dangerous JavaScript patterns
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, ''); // Remove onclick, onerror, etc.

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
};

/**
 * Sanitize email by normalizing (lowercase, trim)
 * @param email - The email to sanitize
 * @returns Sanitized email
 */
export const sanitizeEmail = (email: string): string => {
  if (!email) return '';
  return email.toLowerCase().trim();
};

/**
 * Sanitize name by trimming and removing extra spaces
 * @param name - The name to sanitize
 * @returns Sanitized name
 */
export const sanitizeName = (name: string): string => {
  if (!name) return '';
  return name.trim().replace(/\s+/g, ' ');
};
