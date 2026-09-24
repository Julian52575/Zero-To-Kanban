jest.mock('../../src/repositories/itemRepository', () => ({
    getById: jest.fn(),
}));

const itemRepository = require('../../src/repositories/itemRepository');
const getItem = require('../../src/routes/item/getItem');

const ITEM = { id: 12345, name: 'Task', completed: false };

test('it gets an item by id correctly', async () => {
    const req = { params: { id: 12345 } };
    const res = { send: jest.fn() };

    itemRepository.getById.mockResolvedValue(ITEM);

    await getItem(req, res);

    expect(itemRepository.getById).toHaveBeenCalledWith(12345);
    expect(res.send).toHaveBeenCalledWith(ITEM);
});
