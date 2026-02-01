import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';

// Simple validation schema types
type ValidationType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'email'
  | 'array'
  | 'object';

interface FieldSchema {
  type: ValidationType;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

interface ValidationSchema {
  [field: string]: FieldSchema;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Email regex pattern
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateField(
  value: any,
  field: string,
  schema: FieldSchema
): string | null {
  // Check required
  if (schema.required && (value === undefined || value === null || value === '')) {
    return `${field} is required`;
  }

  // Skip other validations if value is not present and not required
  if (value === undefined || value === null) {
    return null;
  }

  // Type validation
  switch (schema.type) {
    case 'string':
      if (typeof value !== 'string') {
        return `${field} must be a string`;
      }
      if (schema.minLength && value.length < schema.minLength) {
        return `${field} must be at least ${schema.minLength} characters`;
      }
      if (schema.maxLength && value.length > schema.maxLength) {
        return `${field} must be at most ${schema.maxLength} characters`;
      }
      if (schema.pattern && !schema.pattern.test(value)) {
        return `${field} has invalid format`;
      }
      break;

    case 'email':
      if (typeof value !== 'string' || !EMAIL_PATTERN.test(value)) {
        return `${field} must be a valid email address`;
      }
      break;

    case 'number':
      const num = typeof value === 'number' ? value : parseFloat(value);
      if (isNaN(num)) {
        return `${field} must be a number`;
      }
      if (schema.min !== undefined && num < schema.min) {
        return `${field} must be at least ${schema.min}`;
      }
      if (schema.max !== undefined && num > schema.max) {
        return `${field} must be at most ${schema.max}`;
      }
      break;

    case 'boolean':
      if (typeof value !== 'boolean') {
        return `${field} must be a boolean`;
      }
      break;

    case 'array':
      if (!Array.isArray(value)) {
        return `${field} must be an array`;
      }
      if (schema.minLength && value.length < schema.minLength) {
        return `${field} must have at least ${schema.minLength} items`;
      }
      if (schema.maxLength && value.length > schema.maxLength) {
        return `${field} must have at most ${schema.maxLength} items`;
      }
      break;

    case 'object':
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return `${field} must be an object`;
      }
      break;
  }

  // Custom validation
  if (schema.custom) {
    const result = schema.custom(value);
    if (typeof result === 'string') {
      return result;
    }
    if (result === false) {
      return `${field} is invalid`;
    }
  }

  return null;
}

export function validate(
  data: Record<string, any>,
  schema: ValidationSchema
): ValidationResult {
  const errors: string[] = [];

  for (const [field, fieldSchema] of Object.entries(schema)) {
    const error = validateField(data[field], field, fieldSchema);
    if (error) {
      errors.push(error);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Middleware wrapper
export function withValidation(
  schema: ValidationSchema,
  source: 'body' | 'query' = 'body'
) {
  return function validationMiddleware(handler: NextApiHandler): NextApiHandler {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const data = source === 'body' ? req.body : req.query;
      const result = validate(data, schema);

      if (!result.valid) {
        return res.status(400).json({
          success: false,
          error: result.errors[0],
          errors: result.errors,
        });
      }

      return handler(req, res);
    };
  };
}

// Common validation schemas
export const loginSchema: ValidationSchema = {
  email: { type: 'email', required: true },
  password: { type: 'string', required: true, minLength: 1 },
};

export const registerSchema: ValidationSchema = {
  email: { type: 'email', required: true },
  password: { type: 'string', required: true, minLength: 8 },
  name: { type: 'string', required: true, minLength: 1, maxLength: 100 },
  role: {
    type: 'string',
    required: true,
    custom: (v) => v === 'PRO' || v === 'CLIENT' || 'role must be PRO or CLIENT',
  },
};

export const createPostSchema: ValidationSchema = {
  mediaUrls: { type: 'array', required: true, minLength: 1 },
  caption: { type: 'string', maxLength: 500 },
  styleTags: { type: 'array' },
  hairTypeTags: { type: 'array' },
  location: { type: 'string', maxLength: 100 },
  estimatedDurationMinutes: { type: 'number', min: 1 },
};

export const createReviewSchema: ValidationSchema = {
  professionalId: { type: 'number', required: true },
  rating: { type: 'number', required: true, min: 1, max: 5 },
  text: { type: 'string', maxLength: 1000 },
  actualDurationMinutes: { type: 'number', min: 1 },
};
