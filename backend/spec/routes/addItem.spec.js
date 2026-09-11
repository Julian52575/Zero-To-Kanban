jest.mock('uuid', () => ({
    v4: jest.fn(() => 'something-not-a-uuid'),
}));

jest.mock('../../src/repositories/itemRepository', () => ({
    create: jest.fn(),
}));

const itemRepository = require('../../src/repositories/itemRepository');
const addItem = require('../../src/routes/addItem');

test('it stores item correctly', async () => {
    const id = 'something-not-a-uuid';
    const name = 'A sample item';

    const req = { body: { name } };
    const res = { send: jest.fn() };

    const expectedItem = {
        id,
        name,
        completed: false,
    };

    itemRepository.create.mockResolvedValue(expectedItem);

    await addItem(req, res);

    expect(itemRepository.create).toHaveBeenCalledTimes(1);
    expect(itemRepository.create).toHaveBeenCalledWith(expectedItem);
    expect(res.send).toHaveBeenCalledWith(expectedItem);
});