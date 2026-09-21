jest.mock('uuid', () => ({
    v4: jest.fn(() => 'test-id'),
}));

jest.mock('../../src/repositories/taskRepository', () => ({
    update: jest.fn(),
    getById: jest.fn(),
}));

const taskRepository = require('../../src/repositories/taskRepository');
const updateTask = require('../../src/routes/updateTask');

const UPDATED_ITEM = { 
    id: 1234,
    title: 'Finish Unit Tests',
    description: 'Write Jest specs for the task route',
    order: 1,
    columnId: 'column-123',
    creatorId: 'user-456',
    assigneeId: 'user-789'
};

test('it updates items correctly', async () => {
    const req = {
        params: { id: 1234 },
        body: {
            title: 'Finish Unit Tests',
            description: 'Write Jest specs for the task route',
            order: 1,
            columnId: 'column-123',
            creatorId: 'user-456',
            assigneeId: 'user-789'
        },
    };

    const res = { 
        send: jest.fn(),
        status: jest.fn().mockReturnThis()
    };

    taskRepository.update.mockResolvedValue(UPDATED_ITEM);

    await updateTask(req, res);

    expect(taskRepository.update).toHaveBeenCalledTimes(1);
    expect(taskRepository.update).toHaveBeenCalledWith(req.params.id, req.body);

    expect(res.send).toHaveBeenCalledWith(UPDATED_ITEM);
});