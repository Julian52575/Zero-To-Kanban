import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import apiClient, { ApiError } from './apiClient';

function mockFetch(ok: boolean, status: number, body: unknown = undefined) {
    const fetchMock = vi.fn().mockResolvedValue({
        ok,
        status,
        json: () => Promise.resolve(body),
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

describe('ApiError', () => {
    test('carries the HTTP status and a name', () => {
        const error = new ApiError(418, 'teapot');
        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe('ApiError');
        expect(error.status).toBe(418);
        expect(error.message).toBe('teapot');
    });
});

describe('apiClient', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test('get returns the parsed JSON body', async () => {
        const fetchMock = mockFetch(true, 200, { a: 1 });
        await expect(apiClient.get('/x')).resolves.toEqual({ a: 1 });
        expect(fetchMock).toHaveBeenCalledWith('/x');
    });

    test('post sends a JSON body and returns the parsed response', async () => {
        const fetchMock = mockFetch(true, 201, { id: '1' });
        await expect(apiClient.post('/x', { name: 'n' })).resolves.toEqual({ id: '1' });
        expect(fetchMock).toHaveBeenCalledWith('/x', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'n' }),
        });
    });

    test('put sends a JSON body and returns the parsed response', async () => {
        const fetchMock = mockFetch(true, 200, { id: '1' });
        await expect(apiClient.put('/x', { name: 'n' })).resolves.toEqual({ id: '1' });
        expect(fetchMock).toHaveBeenCalledWith('/x', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'n' }),
        });
    });

    test('delete resolves on success', async () => {
        const fetchMock = mockFetch(true, 204);
        await expect(apiClient.delete('/x')).resolves.toBeUndefined();
        expect(fetchMock).toHaveBeenCalledWith('/x', { method: 'DELETE' });
    });

    test.each([
        ['get', () => apiClient.get('/x')],
        ['post', () => apiClient.post('/x', {})],
        ['put', () => apiClient.put('/x', {})],
        ['delete', () => apiClient.delete('/x')],
    ])('%s throws an ApiError when the response is not ok', async (_method, call) => {
        mockFetch(false, 404);
        const error = await call().catch((e: unknown) => e);
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(404);
        expect((error as ApiError).message).toBe('HTTP error: 404');
    });
});
