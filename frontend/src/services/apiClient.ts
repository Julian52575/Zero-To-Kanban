export class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

// Every backend call goes through the /api prefix (stripped again by Traefik /
// the Vite proxy). Callers pass the backend's own route path (items, projects,
// ...) so GitNexus can match them against the Express routes in
// backend/src/app.js. At call sites, keep the path a string literal right after
// the opening parenthesis and type the result on the variable instead of with a
// type argument: GitNexus (see /.gitnexusrc) skips calls with a type argument.
// It also scans comments, so don't write example calls here.
const API_BASE = '/api';

const apiClient = {
    get: async <T>(url: string): Promise<T> => {
        const response = await fetch(`${API_BASE}${url}`);
        if (!response.ok) {
            throw new ApiError(
                response.status,
                `HTTP error: ${response.status}`,
            );
        }
        return response.json();
    },

    post: async <T>(url: string, body: unknown): Promise<T> => {
        const response = await fetch(`${API_BASE}${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            throw new ApiError(
                response.status,
                `HTTP error: ${response.status}`,
            );
        }
        return response.json();
    },

    put: async <T>(url: string, body: unknown): Promise<T> => {
        const response = await fetch(`${API_BASE}${url}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            throw new ApiError(
                response.status,
                `HTTP error: ${response.status}`,
            );
        }
        return response.json();
    },

    delete: async (url: string): Promise<void> => {
        const response = await fetch(`${API_BASE}${url}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new ApiError(
                response.status,
                `HTTP error: ${response.status}`,
            );
        }
    },
};

export default apiClient;