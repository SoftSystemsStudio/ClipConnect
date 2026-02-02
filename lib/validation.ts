/**
 * Email validation utilities
 */

// Regular expression for email validation
// Follows RFC 5322 specification for most common email formats
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Validates an email address format
 * @param email - The email address to validate
 * @returns true if the email format is valid
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Check basic format
  if (!EMAIL_REGEX.test(email)) {
    return false;
  }

  // Check length constraints
  if (email.length > 254) {
    return false;
  }

  // Check local part length (before @)
  const [localPart, domain] = email.split('@');
  if (!localPart || localPart.length > 64) {
    return false;
  }

  // Check domain exists and has valid format
  if (!domain || domain.length === 0) {
    return false;
  }

  // Check for at least one dot in domain
  if (!domain.includes('.')) {
    return false;
  }

  // Check TLD exists and is at least 2 chars
  const tld = domain.split('.').pop();
  if (!tld || tld.length < 2) {
    return false;
  }

  return true;
}

/**
 * Validates password strength
 * @param password - The password to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }

  if (password.length > 128) {
    return { isValid: false, error: 'Password is too long' };
  }

  return { isValid: true };
}

/**
 * Validates a username/name field
 * @param name - The name to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateName(name: string): { isValid: boolean; error?: string } {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'Name is required' };
  }

  const trimmed = name.trim();

  if (trimmed.length < 1) {
    return { isValid: false, error: 'Name is required' };
  }

  if (trimmed.length > 100) {
    return { isValid: false, error: 'Name is too long' };
  }

  return { isValid: true };
}

/**
 * Sanitizes and normalizes an email address
 * @param email - The email to normalize
 * @returns Normalized email (lowercase, trimmed)
 */
export function normalizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }
  return email.toLowerCase().trim();
}
