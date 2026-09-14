jest.mock('../../src/persistence', () => ({
    getItems: jest.fn(),
    getItem: jest.fn(),
    storeItem: jest.fn(),
    updateItem: jest.fn(),
    removeItem: jest.fn(),
}));

const db = require('../../src/persistence');
const taskRepository = require('../../src/repositories/taskRepository');

describe('taskRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getAll delegates to db.getItems', async () => {
        const tasks = [{ id: '1', name: 'Task 1', completed: false }];
        db.getItems.mockResolvedValue(tasks);

        const result = await taskRepository.getAll();

        expect(db.getItems).toHaveBeenCalledTimes(1);
        expect(result).toEqual(tasks);
    });

    test('getById delegates to db.getItem', async () => {
        const task = { id: '1', name: 'Task 1', completed: false };
        db.getItem.mockResolvedValue(task);

        const result = await taskRepository.getById('1');

        expect(db.getItem).toHaveBeenCalledTimes(1);
        expect(db.getItem).toHaveBeenCalledWith('1');
        expect(result).toEqual(task);
    });

    test('create delegates to db.storeItem', async () => {
        const task = { id: '1', name: 'Task 1', completed: false };
        db.storeItem.mockResolvedValue(task);

        const result = await taskRepository.create(task);

        expect(db.storeItem).toHaveBeenCalledTimes(1);
        expect(db.storeItem).toHaveBeenCalledWith(task);
        expect(result).toEqual(task);
    });

    test('update delegates to db.updateItem', async () => {
        const data = { name: 'Updated', completed: true };
        db.updateItem.mockResolvedValue();

        await taskRepository.update('1', data);

        expect(db.updateItem).toHaveBeenCalledTimes(1);
        expect(db.updateItem).toHaveBeenCalledWith('1', data);
    });

    test('deleteById delegates to db.removeItem', async () => {
        db.removeItem.mockResolvedValue();

        await taskRepository.deleteById('1');

        expect(db.removeItem).toHaveBeenCalledTimes(1);
        expect(db.removeItem).toHaveBeenCalledWith('1');
    });
});
