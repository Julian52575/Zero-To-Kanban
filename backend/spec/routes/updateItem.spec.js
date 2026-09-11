jest.mock('uuid', () => ({
    v4: jest.fn(() => 'test-id'),
}));

jest.mock('../../src/repositories/itemRepository', () => ({
    updateById: jest.fn(),
    getById: jest.fn(),
}));

const itemRepository = require('../../src/repositories/itemRepository');
const updateItem = require('../../src/routes/updateItem');

const ITEM = { id: 12345 };

test('it updates items correctly', async () => {
    const req = {
        params: { id: 1234 },
        body: {
            name: 'New title',
            completed: false,
        },
    };

    const res = { send: jest.fn() };

    itemRepository.updateById.mockResolvedValue();
    itemRepository.getById.mockResolvedValue(ITEM);

    await updateItem(req, res);

    expect(itemRepository.updateById).toHaveBeenCalledTimes(1);

    expect(itemRepository.updateById).toHaveBeenCalledWith(
        req.params.id,
        {
            name: 'New title',
            completed: false,
        }
    );

    expect(itemRepository.getById).toHaveBeenCalledTimes(1);
    expect(itemRepository.getById).toHaveBeenCalledWith(req.params.id);

    expect(res.send).toHaveBeenCalledWith(ITEM);
});