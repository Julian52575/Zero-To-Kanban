jest.mock('uuid', () => ({
    v4: jest.fn(() => 'test-id'),
}));

jest.mock('../../src/repositories/taskRepository', () => ({
    deleteById: jest.fn(),
}));

const taskRepository = require('../../src/repositories/taskRepository');
const deleteTask = require('../../src/routes/deleteTask');

test('it removes item correctly', async () => {
    const req = {
        params: { id: 12345 },
    };

    const res = {
        sendStatus: jest.fn(),
    };

    taskRepository.deleteById.mockResolvedValue();

    await deleteItem(req, res);

    expect(itemRepository.deleteById).toHaveBeenCalledTimes(1);
    expect(itemRepository.deleteById).toHaveBeenCalledWith(req.params.id);

    expect(res.sendStatus).toHaveBeenCalledWith(200);
});