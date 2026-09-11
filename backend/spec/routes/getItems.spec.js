jest.mock('uuid', () => ({
    v4: jest.fn(() => 'test-id'),
}));

jest.mock('../../src/repositories/itemRepository', () => ({
    getAll: jest.fn(),
}));

const itemRepository = require('../../src/repositories/itemRepository');
const getItems = require('../../src/routes/getItems');

const ITEMS = [{ id: 12345 }];

test('it gets items correctly', async () => {
    const req = {};
    const res = { send: jest.fn() };

    itemRepository.getAll.mockResolvedValue(ITEMS);

    await getItems(req, res);

    expect(itemRepository.getAll).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith(ITEMS);
});