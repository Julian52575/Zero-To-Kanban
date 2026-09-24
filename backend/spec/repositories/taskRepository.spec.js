jest.mock('../../src/persistence', () => ({
    getTasks: jest.fn(),
    getTask: jest.fn(),
    storeTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
}));

const db = require('../../src/persistence');
const taskRepository = require('../../src/repositories/taskRepository');

describe('taskRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getAll delegates to db.getTasks', async () => {
        const tasks = [{ id: '1', title: 'Task 1' }];
        db.getTasks.mockResolvedValue(tasks);

        const result = await taskRepository.getAll('p1');

        expect(db.getTasks).toHaveBeenCalledWith('p1');
        expect(result).toEqual(tasks);
    });

    test('getById delegates to db.getTask', async () => {
        const task = { id: '1', title: 'Task 1' };
        db.getTask.mockResolvedValue(task);

        const result = await taskRepository.getById('1');

        expect(db.getTask).toHaveBeenCalledWith('1');
        expect(result).toEqual(task);
    });

    test('create delegates to db.storeTask', async () => {
        const data = { title: 'Task 1' };
        const task = { id: '1', ...data };
        db.storeTask.mockResolvedValue(task);

        const result = await taskRepository.create('c1', 'u1', data);

        expect(db.storeTask).toHaveBeenCalledWith('c1', 'u1', data);
        expect(result).toEqual(task);
    });

    test('update delegates to db.updateTask', async () => {
        const data = { title: 'Updated' };
        db.updateTask.mockResolvedValue({ id: '1', ...data });

        const result = await taskRepository.update('1', data);

        expect(db.updateTask).toHaveBeenCalledWith('1', data);
        expect(result).toEqual({ id: '1', ...data });
    });

    test('deleteById delegates to db.deleteTask', async () => {
        db.deleteTask.mockResolvedValue();

        await taskRepository.deleteById('1');

        expect(db.deleteTask).toHaveBeenCalledWith('1');
    });
});
