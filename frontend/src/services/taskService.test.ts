import { describe, test, expect, vi, beforeEach } from 'vitest';
import apiClient from './apiClient';
import { getTasks, getTask, createTask, updateTask, moveTask, deleteTask } from './taskService';

vi.mock('./apiClient', () => ({
    default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const api = vi.mocked(apiClient);

const rawTask = {
    id: 't1',
    title: 'Task',
    description: null,
    order: 0,
    columnId: 'c1',
    createdAt: '2026-01-01T00:00:00.000Z',
};

describe('taskService', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    test('getTasks fetches the project tasks and coerces dates', async () => {
        api.get.mockResolvedValue([rawTask]);

        const tasks = await getTasks('p1');

        expect(api.get).toHaveBeenCalledWith('/api/projects/p1/tasks');
        expect(tasks[0].createdAt).toEqual(new Date(rawTask.createdAt));
    });

    test('getTasks rejects malformed data', async () => {
        api.get.mockResolvedValue([{ id: 't1' }]);
        await expect(getTasks('p1')).rejects.toThrow();
    });

    test('getTask fetches a single task', async () => {
        api.get.mockResolvedValue(rawTask);
        const task = await getTask('p1', 't1');
        expect(api.get).toHaveBeenCalledWith('/api/projects/p1/tasks/t1');
        expect(task.id).toBe('t1');
    });

    test('createTask posts the input', async () => {
        api.post.mockResolvedValue(rawTask);
        const input = { title: 'Task', columnId: 'c1' };

        const task = await createTask('p1', input);

        expect(api.post).toHaveBeenCalledWith('/api/projects/p1/tasks', input);
        expect(task.title).toBe('Task');
    });

    test('updateTask puts the input', async () => {
        api.put.mockResolvedValue({ ...rawTask, title: 'Renamed' });

        const task = await updateTask('p1', 't1', { title: 'Renamed' });

        expect(api.put).toHaveBeenCalledWith('/api/projects/p1/tasks/t1', { title: 'Renamed' });
        expect(task.title).toBe('Renamed');
    });

    test('moveTask updates the column and order', async () => {
        api.put.mockResolvedValue({ ...rawTask, columnId: 'c2', order: 3 });

        const task = await moveTask('p1', 't1', 'c2', 3);

        expect(api.put).toHaveBeenCalledWith('/api/projects/p1/tasks/t1', { columnId: 'c2', order: 3 });
        expect(task.columnId).toBe('c2');
    });

    test('deleteTask calls the task URL', async () => {
        api.delete.mockResolvedValue(undefined);
        await deleteTask('p1', 't1');
        expect(api.delete).toHaveBeenCalledWith('/api/projects/p1/tasks/t1');
    });
});
