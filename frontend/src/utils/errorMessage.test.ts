import { describe, test, expect, vi } from 'vitest';
import { z } from 'zod';
import { getErrorMessage } from './errorMessage';
import { ApiError } from '../services/apiClient';

describe('getErrorMessage', () => {
    test.each([
        [500, 'The server encountered an error.'],
        [503, 'The server encountered an error.'],
        [404, 'The requested resource was not found.'],
        [400, 'The request is invalid.'],
        [403, 'Server error (403).'],
    ])('maps ApiError %i', (status, message) => {
        expect(getErrorMessage(new ApiError(status, 'x'))).toBe(message);
    });

    test('maps ZodError to an invalid-data message', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        const result = z.string().safeParse(1);
        expect(getErrorMessage(result.error)).toBe('The server returned invalid data.');
        consoleError.mockRestore();
    });

    test('maps TypeError to a connection message', () => {
        expect(getErrorMessage(new TypeError('Failed to fetch'))).toBe('Unable to connect to the server.');
    });

    test('falls back to a generic message', () => {
        expect(getErrorMessage('boom')).toBe('An unexpected error occurred.');
    });
});
