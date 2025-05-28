import {
  validateRequiredString,
  validateGuid,
  validatePositiveInteger,
  validateNonNegativeInteger,
  validateTableName,
  validateODataQuery,
  validateRequired,
  validateUrl,
  sanitizeODataString,
} from '../src/utils/validation.js';

describe('Validation Utilities', () => {
  describe('validateRequiredString', () => {
    it('should accept valid non-empty strings', () => {
      expect(validateRequiredString('test', 'field')).toBe('test');
      expect(validateRequiredString('  test  ', 'field')).toBe('test');
    });

    it('should reject empty or invalid strings', () => {
      expect(() => validateRequiredString('', 'field')).toThrow('field is required and must be a non-empty string');
      expect(() => validateRequiredString('   ', 'field')).toThrow('field is required and must be a non-empty string');
      expect(() => validateRequiredString(null, 'field')).toThrow('field is required and must be a non-empty string');
      expect(() => validateRequiredString(undefined, 'field')).toThrow('field is required and must be a non-empty string');
      expect(() => validateRequiredString(123, 'field')).toThrow('field is required and must be a non-empty string');
    });
  });

  describe('validateGuid', () => {
    it('should accept valid GUIDs', () => {
      const validGuid = '12345678-1234-1234-1234-123456789012';
      expect(validateGuid(validGuid, 'id')).toBe(validGuid);
      expect(validateGuid('12345678-1234-5234-a234-123456789012', 'id')).toBe('12345678-1234-5234-a234-123456789012');
    });

    it('should reject invalid GUIDs', () => {
      expect(() => validateGuid('invalid-guid', 'id')).toThrow('id must be a valid GUID format');
      expect(() => validateGuid('12345678-1234-1234-1234-12345678901', 'id')).toThrow('id must be a valid GUID format');
      expect(() => validateGuid('12345678-1234-1234-1234-12345678901g', 'id')).toThrow('id must be a valid GUID format');
      expect(() => validateGuid('', 'id')).toThrow('id is required and must be a non-empty string');
    });
  });

  describe('validatePositiveInteger', () => {
    it('should accept positive integers', () => {
      expect(validatePositiveInteger(1, 'count')).toBe(1);
      expect(validatePositiveInteger('5', 'count')).toBe(5);
      expect(validatePositiveInteger(100, 'count')).toBe(100);
    });

    it('should reject non-positive integers', () => {
      expect(() => validatePositiveInteger(0, 'count')).toThrow('count must be a positive integer');
      expect(() => validatePositiveInteger(-1, 'count')).toThrow('count must be a positive integer');
      expect(() => validatePositiveInteger(1.5, 'count')).toThrow('count must be a positive integer');
      expect(() => validatePositiveInteger('invalid', 'count')).toThrow('count must be a positive integer');
    });
  });

  describe('validateNonNegativeInteger', () => {
    it('should accept non-negative integers', () => {
      expect(validateNonNegativeInteger(0, 'skip')).toBe(0);
      expect(validateNonNegativeInteger(1, 'skip')).toBe(1);
      expect(validateNonNegativeInteger('5', 'skip')).toBe(5);
    });

    it('should reject negative numbers', () => {
      expect(() => validateNonNegativeInteger(-1, 'skip')).toThrow('skip must be a non-negative integer');
      expect(() => validateNonNegativeInteger(1.5, 'skip')).toThrow('skip must be a non-negative integer');
    });
  });

  describe('validateTableName', () => {
    it('should accept valid table names', () => {
      expect(validateTableName('contacts', 'table')).toBe('contacts');
      expect(validateTableName('accounts', 'table')).toBe('accounts');
      expect(validateTableName('custom_entity', 'table')).toBe('custom_entity');
      expect(validateTableName('entity123', 'table')).toBe('entity123');
    });

    it('should reject invalid table names', () => {
      expect(() => validateTableName('123invalid', 'table')).toThrow('table must be a valid table name');
      expect(() => validateTableName('invalid-name', 'table')).toThrow('table must be a valid table name');
      expect(() => validateTableName('invalid name', 'table')).toThrow('table must be a valid table name');
      expect(() => validateTableName('', 'table')).toThrow('table is required and must be a non-empty string');
    });
  });

  describe('validateODataQuery', () => {
    it('should accept valid OData queries', () => {
      expect(validateODataQuery("firstname eq 'John'", 'filter')).toBe("firstname eq 'John'");
      expect(validateODataQuery('revenue gt 1000000', 'filter')).toBe('revenue gt 1000000');
      expect(validateODataQuery('name asc', 'orderby')).toBe('name asc');
    });

    it('should reject dangerous patterns', () => {
      expect(() => validateODataQuery('DROP TABLE users', 'filter')).toThrow('filter contains potentially unsafe content');
      expect(() => validateODataQuery('DELETE FROM contacts', 'filter')).toThrow('filter contains potentially unsafe content');
      expect(() => validateODataQuery('<script>alert("xss")</script>', 'filter')).toThrow('filter contains potentially unsafe content');
    });

    it('should reject empty queries', () => {
      expect(() => validateODataQuery('', 'filter')).toThrow('filter cannot be empty');
      expect(() => validateODataQuery('   ', 'filter')).toThrow('filter cannot be empty');
    });
  });

  describe('validateRequired', () => {
    it('should accept non-null/undefined values', () => {
      expect(validateRequired('test', 'field')).toBe('test');
      expect(validateRequired(0, 'field')).toBe(0);
      expect(validateRequired(false, 'field')).toBe(false);
      expect(validateRequired({}, 'field')).toEqual({});
    });

    it('should reject null/undefined values', () => {
      expect(() => validateRequired(null, 'field')).toThrow('field is required');
      expect(() => validateRequired(undefined, 'field')).toThrow('field is required');
    });
  });

  describe('validateUrl', () => {
    it('should accept valid URLs', () => {
      expect(validateUrl('https://example.com', 'url')).toBe('https://example.com');
      expect(validateUrl('https://test.crm.dynamics.com', 'url')).toBe('https://test.crm.dynamics.com');
    });

    it('should reject invalid URLs', () => {
      expect(() => validateUrl('invalid-url', 'url')).toThrow('url must be a valid URL');
      expect(() => validateUrl('', 'url')).toThrow('url is required and must be a non-empty string');
    });
  });

  describe('sanitizeODataString', () => {
    it('should escape single quotes', () => {
      expect(sanitizeODataString("John's Company")).toBe("John''s Company");
      expect(sanitizeODataString("Test")).toBe("Test");
      expect(sanitizeODataString("'quoted'")).toBe("''quoted''");
    });
  });
}); 