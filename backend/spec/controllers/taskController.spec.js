jest.mock('../../src/services/taskService', () => ({
    getTasks: jest.fn(),
    getTask: jest.fn(),
    createTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
}));

jest.mock('../../src/persistence', () => ({
    userCanAccessProject: jest.fn(),
    columnBelongsToProject: jest.fn(),
    storeTask: jest.fn(),
}));

jest.mock('../../src/events/eventBus', () => ({
    publishEvent: jest.fn(),
}));

const taskService = require('../../src/services/taskService');
const {
    userCanAccessProject,
    columnBelongsToProject,
    storeTask,
} = require('../../src/persistence');
const { publishEvent } = require('../../src/events/eventBus');
const { EVENTS } = require('../../src/events/events');
const taskController = require('../../src/controllers/taskController');

const mockRes = () => ({
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
    end: jest.fn(),
});

const task = {
    id: 't1',
    title: 'Task 1',
    description: null,
    order: 0,
    columnId: 'c1',
    creatorId: 'u1',
    assigneeId: null,
    column: { id: 'c1', projectId: 'p1' },
};

const taskEvent = {
    taskId: 't1',
    projectId: 'p1',
    columnId: 'c1',
    title: 'Task 1',
    description: null,
    order: 0,
    creatorId: 'u1',
    assigneeId: null,
};

describe('taskController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        userCanAccessProject.mockResolvedValue(true);
        columnBelongsToProject.mockResolvedValue(true);
    });

    describe('getTasks', () => {
        test('responds with the tasks of the project', async () => {
            taskService.getTasks.mockResolvedValue([task]);

            const req = { userId: 'u1', params: { projectId: 'p1' } };
            const res = mockRes();
            await taskController.getTasks(req, res);

            expect(userCanAccessProject).toHaveBeenCalledWith('u1', 'p1');
            expect(taskService.getTasks).toHaveBeenCalledWith('p1');
            expect(res.json).toHaveBeenCalledWith([task]);
        });

        test("responds 404 for someone else's project", async () => {
            userCanAccessProject.mockResolvedValue(false);

            const req = { userId: 'u2', params: { projectId: 'p1' } };
            const res = mockRes();
            await taskController.getTasks(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(taskService.getTasks).not.toHaveBeenCalled();
        });
    });

    describe('getTask', () => {
        test('responds with a task of the project', async () => {
            taskService.getTask.mockResolvedValue(task);

            const req = { userId: 'u1', params: { projectId: 'p1', id: 't1' } };
            const res = mockRes();
            await taskController.getTask(req, res);

            expect(taskService.getTask).toHaveBeenCalledWith('t1');
            expect(res.json).toHaveBeenCalledWith(task);
        });

        test('responds 404 for a task of another project', async () => {
            taskService.getTask.mockResolvedValue(task);

            const req = { userId: 'u1', params: { projectId: 'p2', id: 't1' } };
            const res = mockRes();
            await taskController.getTask(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'task not found' });
        });

        test('responds 404 when the task does not exist', async () => {
            taskService.getTask.mockResolvedValue(null);

            const req = { userId: 'u1', params: { projectId: 'p1', id: 'nope' } };
            const res = mockRes();
            await taskController.getTask(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('createTask', () => {
        const body = { title: 'Task 1', columnId: 'c1' };

        test('responds with 201 and the created task', async () => {
            storeTask.mockResolvedValue(task);

            const req = { userId: 'u1', params: { projectId: 'p1' }, body };
            const res = mockRes();
            await taskController.createTask(req, res, jest.fn());

            expect(storeTask).toHaveBeenCalledWith('c1', 'u1', {
                title: 'Task 1',
                description: undefined,
                assigneeId: undefined,
            });
            expect(publishEvent).toHaveBeenCalledWith(
                EVENTS.TASK_CREATED,
                taskEvent
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(task);
        });

        test("responds 404 for someone else's project", async () => {
            userCanAccessProject.mockResolvedValue(false);

            const req = { userId: 'u2', params: { projectId: 'p1' }, body };
            const res = mockRes();
            await taskController.createTask(req, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(404);
            expect(storeTask).not.toHaveBeenCalled();
        });

        test('responds 400 for a column of another project', async () => {
            columnBelongsToProject.mockResolvedValue(false);

            const req = { userId: 'u1', params: { projectId: 'p1' }, body };
            const res = mockRes();
            await taskController.createTask(req, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(400);
            expect(storeTask).not.toHaveBeenCalled();
        });

        test('forwards unexpected errors', async () => {
            const error = new Error('db down');
            storeTask.mockRejectedValue(error);
            const next = jest.fn();

            const req = { userId: 'u1', params: { projectId: 'p1' }, body };
            await taskController.createTask(req, mockRes(), next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('updateTask', () => {
        test('responds with the updated task', async () => {
            const body = { title: 'Updated' };
            const updated = { ...task, title: 'Updated' };
            taskService.getTask.mockResolvedValue(task);
            taskService.updateTask.mockResolvedValue(updated);

            const req = {
                userId: 'u1',
                params: { projectId: 'p1', id: 't1' },
                body,
            };
            const res = mockRes();
            await taskController.updateTask(req, res, jest.fn());

            expect(taskService.updateTask).toHaveBeenCalledWith('t1', body);
            expect(publishEvent).toHaveBeenCalledWith(EVENTS.TASK_UPDATED, {
                ...taskEvent,
                title: 'Updated',
            });
            expect(res.json).toHaveBeenCalledWith(updated);
        });

        test('checks access on the URL project, not the body', async () => {
            userCanAccessProject.mockImplementation(
                async (userId, projectId) => projectId === 'mine'
            );
            taskService.getTask.mockResolvedValue(task);

            const req = {
                userId: 'u2',
                params: { projectId: 'p1', id: 't1' },
                body: { projectId: 'mine', title: 'Hijacked' },
            };
            const res = mockRes();
            await taskController.updateTask(req, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(404);
            expect(taskService.updateTask).not.toHaveBeenCalled();
        });

        test('responds 404 for a task of another project', async () => {
            taskService.getTask.mockResolvedValue(task);

            const req = {
                userId: 'u1',
                params: { projectId: 'p2', id: 't1' },
                body: { title: 'Updated' },
            };
            const res = mockRes();
            await taskController.updateTask(req, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(404);
            expect(taskService.updateTask).not.toHaveBeenCalled();
        });

        test('responds 400 when moving to a column of another project', async () => {
            taskService.getTask.mockResolvedValue(task);
            columnBelongsToProject.mockResolvedValue(false);

            const req = {
                userId: 'u1',
                params: { projectId: 'p1', id: 't1' },
                body: { columnId: 'foreign-column', order: 0 },
            };
            const res = mockRes();
            await taskController.updateTask(req, res, jest.fn());

            expect(columnBelongsToProject).toHaveBeenCalledWith(
                'foreign-column',
                'p1'
            );
            expect(res.status).toHaveBeenCalledWith(400);
            expect(taskService.updateTask).not.toHaveBeenCalled();
        });
    });

    describe('deleteTask', () => {
        test('responds 204 and publishes the event', async () => {
            taskService.deleteTask.mockResolvedValue(task);

            const req = { userId: 'u1', params: { projectId: 'p1', id: 't1' } };
            const res = mockRes();
            await taskController.deleteTask(req, res);

            expect(taskService.deleteTask).toHaveBeenCalledWith('t1', 'u1');
            expect(publishEvent).toHaveBeenCalledWith(EVENTS.TASK_DELETED, {
                taskId: 't1',
            });
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.end).toHaveBeenCalledTimes(1);
        });

        test('responds 404 when the task does not exist', async () => {
            taskService.deleteTask.mockResolvedValue(null);

            const res = mockRes();
            await taskController.deleteTask(
                { userId: 'u1', params: { projectId: 'p1', id: 'nope' } },
                res
            );

            expect(res.status).toHaveBeenCalledWith(404);
            expect(publishEvent).not.toHaveBeenCalled();
        });

        test("responds 403 for a task of someone else's project", async () => {
            taskService.deleteTask.mockResolvedValue(false);

            const res = mockRes();
            await taskController.deleteTask(
                { userId: 'u2', params: { projectId: 'p1', id: 't1' } },
                res
            );

            expect(res.status).toHaveBeenCalledWith(403);
            expect(publishEvent).not.toHaveBeenCalled();
        });
    });
});
