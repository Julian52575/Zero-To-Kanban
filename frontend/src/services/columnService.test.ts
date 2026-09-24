import { describe, test, expect, vi } from 'vitest';
import apiClient from './apiClient';
import { getColumns } from './columnService';

vi.mock('./apiClient', () => ({
    default: { get: vi.fn() },
}));

describe('getColumns', () => {
    test('fetches the project columns sorted by order', async () => {
        vi.mocked(apiClient.get).mockResolvedValue([
            { id: 'c2', name: 'Doing', order: 1 },
            { id: 'c3', name: 'Done', order: 2 },
            { id: 'c1', name: 'Todo', order: 0 },
        ]);

        const columns = await getColumns('p1');

        expect(apiClient.get).toHaveBeenCalledWith('/api/projects/p1/columns');
        expect(columns.map((c) => c.id)).toEqual(['c1', 'c2', 'c3']);
    });
});
