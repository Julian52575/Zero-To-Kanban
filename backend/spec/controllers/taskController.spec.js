jest.mock('../../src/services/taskService', () => ({
    getTasks: jest.fn(),
    getTask: jest.fn(),
    createTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
}));

const taskService = require('../../src/services/taskService');
const taskController = require('../../src/controllers/taskController');

const mockRes = () => ({
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
    end: jest.fn(),
});

describe('taskController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getTasks responds with all tasks', async () => {
        const tasks = [{ id: '1', name: 'Task 1' }];
        taskService.getTasks.mockResolvedValue(tasks);

        const res = mockRes();
        await taskController.getTasks({}, res);

        expect(taskService.getTasks).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith(tasks);
    });

    test('getTask responds with a single task', async () => {
        const task = { id: '1', name: 'Task 1' };
        taskService.getTask.mockResolvedValue(task);

        const req = { params: { id: '1' } };
        const res = mockRes();
        await taskController.getTask(req, res);

        expect(taskService.getTask).toHaveBeenCalledWith('1');
        expect(res.json).toHaveBeenCalledWith(task);
    });

    test('createTask responds with 201 and the created task', async () => {
        const body = { name: 'New task' };
        const created = { id: '1', name: 'New task' };
        taskService.createTask.mockResolvedValue(created);

        const req = { body };
        const res = mockRes();
        await taskController.createTask(req, res);

        expect(taskService.createTask).toHaveBeenCalledWith(body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(created);
    });

    test('updateTask responds with the updated task', async () => {
        const body = { name: 'Updated', completed: true };
        const updated = { id: '1', ...body };
        taskService.updateTask.mockResolvedValue(updated);

        const req = { params: { id: '1' }, body };
        const res = mockRes();
        await taskController.updateTask(req, res);

        expect(taskService.updateTask).toHaveBeenCalledWith('1', body);
        expect(res.json).toHaveBeenCalledWith(updated);
    });

    test('deleteTask responds with 200 and ends the response', async () => {
        taskService.deleteTask.mockResolvedValue();

        const req = { params: { id: '1' } };
        const res = mockRes();
        await taskController.deleteTask(req, res);

        expect(taskService.deleteTask).toHaveBeenCalledWith('1');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.end).toHaveBeenCalledTimes(1);
    });
});
