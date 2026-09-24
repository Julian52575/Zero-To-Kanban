jest.mock('../../src/repositories/taskRepository', () => ({
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteById: jest.fn(),
}));

jest.mock('../../src/events/eventBus', () => ({
    publishEvent: jest.fn(),
}));

const taskRepository = require('../../src/repositories/taskRepository');
const { publishEvent } = require('../../src/events/eventBus');
const { EVENTS } = require('../../src/events/events');
const taskService = require('../../src/services/taskService');

describe('taskService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getTasks delegates to taskRepository.getAll', async () => {
        const tasks = [{ id: '1', name: 'Task 1', completed: false }];
        taskRepository.getAll.mockResolvedValue(tasks);

        const result = await taskService.getTasks();

        expect(taskRepository.getAll).toHaveBeenCalledTimes(1);
        expect(result).toEqual(tasks);
    });

    test('getTask delegates to taskRepository.getById', async () => {
        const task = { id: '1', name: 'Task 1', completed: false };
        taskRepository.getById.mockResolvedValue(task);

        const result = await taskService.getTask('1');

        expect(taskRepository.getById).toHaveBeenCalledTimes(1);
        expect(taskRepository.getById).toHaveBeenCalledWith('1');
        expect(result).toEqual(task);
    });

    test('createTask delegates to taskRepository.create', async () => {
        const task = { name: 'New task' };
        const created = { id: '1', name: 'New task', completed: false };
        taskRepository.create.mockResolvedValue(created);

        const result = await taskService.createTask(task);

        expect(taskRepository.create).toHaveBeenCalledTimes(1);
        expect(taskRepository.create).toHaveBeenCalledWith(task);
        expect(publishEvent).toHaveBeenCalledWith(EVENTS.TASK_CREATED, {
            taskId: '1',
            name: 'New task',
            completed: false,
        });
        expect(result).toEqual(created);
    });

    test('updateTask saves the change and returns the stored task', async () => {
        const data = { name: 'Updated' };
        const stored = { id: '1', name: 'Updated', completed: true };
        taskRepository.update.mockResolvedValue();
        taskRepository.getById.mockResolvedValue(stored);

        const result = await taskService.updateTask('1', data);

        expect(taskRepository.update).toHaveBeenCalledTimes(1);
        expect(taskRepository.update).toHaveBeenCalledWith('1', data);
        expect(taskRepository.getById).toHaveBeenCalledWith('1');
        expect(publishEvent).toHaveBeenCalledWith(EVENTS.TASK_UPDATED, {
            taskId: '1',
            name: 'Updated',
            completed: true,
        });
        expect(result).toEqual(stored);
    });

    test('deleteTask delegates to taskRepository.deleteById', async () => {
        taskRepository.deleteById.mockResolvedValue();

        await taskService.deleteTask('1');

        expect(taskRepository.deleteById).toHaveBeenCalledTimes(1);
        expect(taskRepository.deleteById).toHaveBeenCalledWith('1');
        expect(publishEvent).toHaveBeenCalledWith(EVENTS.TASK_DELETED, {
            taskId: '1',
        });
    });
});
