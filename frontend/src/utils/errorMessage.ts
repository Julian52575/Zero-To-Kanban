import { ZodError } from 'zod';
import { ApiError } from '../services/apiClient';

export function getErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
        if (error.status >= 500) {
            return 'The server encountered an error.';
        }
        if (error.status === 404) {
            return 'The requested resource was not found.';
        }
        if (error.status === 400) {
            return 'The request is invalid.';
        }
        return `Server error (${error.status}).`;
    }
    if (error instanceof ZodError) {
        console.error('Invalid data received from API:', error);
        return 'The server returned invalid data.';
    }
    if (error instanceof TypeError) {
        return 'Unable to connect to the server.';
    }
    return 'An unexpected error occurred.';
}