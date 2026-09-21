jest.mock('uuid', () => ({
    v4: jest.fn(() => 'test-id'),
}));

jest.mock('../../src/repositories/taskRepository', () => ({
    getAll: jest.fn(),
}));

const taskRepository = require('../../src/repositories/taskRepository');
const getTask = require('../../src/routes/getTask');

const ITEM = { id: 12345 };

test('it gets items correctly', async () => {
    const req = {};
    const res = { send: jest.fn() };

    taskRepository.getById.mockResolvedValue(ITEM.id);

    await getTask(req, res);

    expect(taskRepository.getAll).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith(ITEM.id);
});