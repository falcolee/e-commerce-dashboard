/**
 * Data Transformation Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import { toCamelCase, toSnakeCase, transformResponse, transformRequest } from '../transformers';

describe('Data Transformers', () => {
  describe('toCamelCase', () => {
    it('should convert snake_case strings to camelCase', () => {
      expect(toCamelCase('first_name')).toBe('firstName');
      expect(toCamelCase('user_id')).toBe('userId');
      expect(toCamelCase('created_at')).toBe('createdAt');
      expect(toCamelCase('total_revenue')).toBe('totalRevenue');
    });

    it('should handle simple objects', () => {
      const input = {
        first_name: 'John',
        last_name: 'Doe',
        user_id: 123
      };
      const expected = {
        firstName: 'John',
        lastName: 'Doe',
        userId: 123
      };
      expect(toCamelCase(input)).toEqual(expected);
    });

    it('should handle nested objects', () => {
      const input = {
        user: {
          first_name: 'John',
          address: {
            zip_code: '12345',
            street_name: 'Main St'
          }
        }
      };
      const expected = {
        user: {
          firstName: 'John',
          address: {
            zipCode: '12345',
            streetName: 'Main St'
          }
        }
      };
      expect(toCamelCase(input)).toEqual(expected);
    });

    it('should handle arrays', () => {
      const input = [
        { first_name: 'John', user_id: 1 },
        { first_name: 'Jane', user_id: 2 }
      ];
      const expected = [
        { firstName: 'John', userId: 1 },
        { firstName: 'Jane', userId: 2 }
      ];
      expect(toCamelCase(input)).toEqual(expected);
    });

    it('should handle null and undefined', () => {
      expect(toCamelCase(null)).toBe(null);
      expect(toCamelCase(undefined)).toBe(undefined);
    });

    it('should preserve Date objects', () => {
      const date = new Date();
      const input = { created_at: date };
      const expected = { createdAt: date };
      expect(toCamelCase(input)).toEqual(expected);
    });

    it('should handle primitive values', () => {
      expect(toCamelCase('string')).toBe('string');
      expect(toCamelCase(123)).toBe(123);
      expect(toCamelCase(true)).toBe(true);
      expect(toCamelCase(false)).toBe(false);
    });
  });

  describe('toSnakeCase', () => {
    it('should convert camelCase strings to snake_case', () => {
      expect(toSnakeCase('firstName')).toBe('first_name');
      expect(toSnakeCase('userId')).toBe('user_id');
      expect(toSnakeCase('createdAt')).toBe('created_at');
      expect(toSnakeCase('totalRevenue')).toBe('total_revenue');
    });

    it('should handle simple objects', () => {
      const input = {
        firstName: 'John',
        lastName: 'Doe',
        userId: 123
      };
      const expected = {
        first_name: 'John',
        last_name: 'Doe',
        user_id: 123
      };
      expect(toSnakeCase(input)).toEqual(expected);
    });

    it('should handle nested objects', () => {
      const input = {
        user: {
          firstName: 'John',
          address: {
            zipCode: '12345',
            streetName: 'Main St'
          }
        }
      };
      const expected = {
        user: {
          first_name: 'John',
          address: {
            zip_code: '12345',
            street_name: 'Main St'
          }
        }
      };
      expect(toSnakeCase(input)).toEqual(expected);
    });
  });

  describe('transformResponse', () => {
    it('should transform API response data', () => {
      const response = {
        success: true,
        data: {
          users: [
            { first_name: 'John', user_id: 1 },
            { first_name: 'Jane', user_id: 2 }
          ],
          pagination: {
            total_pages: 5,
            current_page: 1
          }
        }
      };

      const expected = {
        success: true,
        data: {
          users: [
            { firstName: 'John', userId: 1 },
            { firstName: 'Jane', userId: 2 }
          ],
          pagination: {
            totalPages: 5,
            currentPage: 1
          }
        }
      };

      expect(transformResponse(response)).toEqual(expected);
    });
  });

  describe('transformRequest', () => {
    it('should transform request data', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        filters: {
          dateRange: {
            startDate: '2024-01-01',
            endDate: '2024-01-31'
          }
        }
      };

      const expected = {
        first_name: 'John',
        last_name: 'Doe',
        filters: {
          date_range: {
            start_date: '2024-01-01',
            end_date: '2024-01-31'
          }
        }
      };

      expect(transformRequest(data)).toEqual(expected);
    });
  });
});