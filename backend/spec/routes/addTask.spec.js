jest.mock('uuid', () => ({
    v4: jest.fn(() => 'something-not-a-uuid'),
}));

jest.mock('../../src/repositories/taskRepository', () => ({
    create: jest.fn(),
}));

const taskRepository = require('../../src/repositories/taskRepository');
const addTask = require('../../src/routes/addTask');

test('it stores a task correctly with all required Prisma fields', async () => {
    const taskId = 'mocked-task-uuid';
    const mockTaskBody = {
        title: 'Finish Unit Tests',
        description: 'Write Jest specs for the task route',
        order: 1,
        columnId: 'column-123',
        creatorId: 'user-456',
        assigneeId: 'user-789'
    };

    const req = { body: mockTaskBody };
    const res = { 
        send: jest.fn(),
        status: jest.fn().mockReturnThis()
    };

    const expectedTaskResult = {
        id: taskId,
        ...mockTaskBody,
        createdAt: new Date('2026-03-30T12:00:00.000Z'),
        updatedAt: new Date('2026-03-30T12:00:00.000Z'),
    };

    taskRepository.create.mockResolvedValue(expectedTaskResult);

    await addTask(req, res);

    expect(taskRepository.create).toHaveBeenCalledTimes(1);
    expect(taskRepository.create).toHaveBeenCalledWith({
        id: taskId,
        ...mockTaskBody
    });
    expect(res.send).toHaveBeenCalledWith(expectedTaskResult);
});