jest.mock('uuid', () => ({
    v4: jest.fn(() => 'test-id'),
}));

jest.mock('../../src/repositories/taskRepository', () => ({
    getAll: jest.fn(),
}));

const taskRepository = require('../../src/repositories/taskRepository');
const getTasks = require('../../src/routes/getTasks');

const ITEMS = [{ id: 12345 }];

test('it gets items correctly', async () => {
    const req = {};
    const res = { send: jest.fn() };

    taskRepository.getAll.mockResolvedValue(ITEMS);

    await getTasks(req, res);

    expect(taskRepository.getAll).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith(ITEMS);
});