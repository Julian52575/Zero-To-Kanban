jest.mock('uuid', () => ({
    v4: jest.fn(() => 'test-id'),
}));

jest.mock('../../src/repositories/itemRepository', () => ({
    deleteById: jest.fn(),
}));

const itemRepository = require('../../src/repositories/itemRepository');
const deleteItem = require('../../src/routes/deleteItem');

test('it removes item correctly', async () => {
    const req = {
        params: { id: 12345 },
    };

    const res = {
        sendStatus: jest.fn(),
    };

    itemRepository.deleteById.mockResolvedValue();

    await deleteItem(req, res);

    expect(itemRepository.deleteById).toHaveBeenCalledTimes(1);
    expect(itemRepository.deleteById).toHaveBeenCalledWith(req.params.id);

    expect(res.sendStatus).toHaveBeenCalledWith(200);
});