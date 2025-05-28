import { createLogger } from './logger.js';

const logger = createLogger('Validation');

/**
 * Validates that a value is a non-empty string
 */
export function validateRequiredString(value: any, fieldName: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${fieldName} is required and must be a non-empty string`);
  }
  return value.trim();
}

/**
 * Validates that a value is a valid GUID
 */
export function validateGuid(value: any, fieldName: string): string {
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const stringValue = validateRequiredString(value, fieldName);
  
  if (!guidRegex.test(stringValue)) {
    throw new Error(`${fieldName} must be a valid GUID format (e.g., 12345678-1234-1234-1234-123456789012)`);
  }
  
  return stringValue;
}

/**
 * Validates that a value is a positive integer
 */
export function validatePositiveInteger(value: any, fieldName: string): number {
  const numValue = Number(value);
  
  if (!Number.isInteger(numValue) || numValue <= 0) {
    throw new Error(`${fieldName} must be a positive integer`);
  }
  
  return numValue;
}

/**
 * Validates that a value is a non-negative integer
 */
export function validateNonNegativeInteger(value: any, fieldName: string): number {
  const numValue = Number(value);
  
  if (!Number.isInteger(numValue) || numValue < 0) {
    throw new Error(`${fieldName} must be a non-negative integer`);
  }
  
  return numValue;
}

/**
 * Validates that a table name is valid (alphanumeric, underscores, no spaces)
 */
export function validateTableName(value: any, fieldName: string = 'table'): string {
  const stringValue = validateRequiredString(value, fieldName);
  const tableNameRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
  
  if (!tableNameRegex.test(stringValue)) {
    throw new Error(`${fieldName} must be a valid table name (start with letter, contain only letters, numbers, and underscores)`);
  }
  
  return stringValue;
}

/**
 * Validates OData query parameters
 */
export function validateODataQuery(query: string, paramName: string): string {
  const trimmedQuery = query.trim();
  
  if (trimmedQuery === '') {
    throw new Error(`${paramName} cannot be empty`);
  }
  
  // Basic validation - check for potentially dangerous patterns
  const dangerousPatterns = [
    /drop\s+table/i,
    /delete\s+from/i,
    /update\s+.*\s+set/i,
    /insert\s+into/i,
    /<script/i,
    /javascript:/i,
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(trimmedQuery)) {
      logger.warn(`Potentially dangerous pattern detected in ${paramName}: ${trimmedQuery}`);
      throw new Error(`${paramName} contains potentially unsafe content`);
    }
  }
  
  return trimmedQuery;
}

/**
 * Validates that an object is not null or undefined
 */
export function validateRequired<T>(value: T | null | undefined, fieldName: string): T {
  if (value === null || value === undefined) {
    throw new Error(`${fieldName} is required`);
  }
  return value;
}

/**
 * Validates that a URL is properly formatted
 */
export function validateUrl(value: any, fieldName: string): string {
  const stringValue = validateRequiredString(value, fieldName);
  
  try {
    new URL(stringValue);
    return stringValue;
  } catch {
    throw new Error(`${fieldName} must be a valid URL`);
  }
}

/**
 * Sanitizes a string for use in OData queries
 */
export function sanitizeODataString(value: string): string {
  return value.replace(/'/g, "''");
} 