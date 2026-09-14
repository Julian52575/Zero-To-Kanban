jest.mock('../../src/persistence', () => ({
    getItems: jest.fn(),
    getItem: jest.fn(),
    storeItem: jest.fn(),
    updateItem: jest.fn(),
    removeItem: jest.fn(),
}));

const db = require('../../src/persistence');
const itemRepository = require('../../src/repositories/itemRepository');

describe('itemRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getAll delegates to db.getItems', async () => {
        const items = [{ id: '1', name: 'Task 1', completed: false }];
        db.getItems.mockResolvedValue(items);

        const result = await itemRepository.getAll();

        expect(db.getItems).toHaveBeenCalledTimes(1);
        expect(result).toEqual(items);
    });

    test('create delegates to db.storeItem', async () => {
        const item = { id: '1', name: 'Task 1', completed: false };
        db.storeItem.mockResolvedValue(item);

        const result = await itemRepository.create(item);

        expect(db.storeItem).toHaveBeenCalledTimes(1);
        expect(db.storeItem).toHaveBeenCalledWith(item);
        expect(result).toEqual(item);
    });

    test('deleteById delegates to db.removeItem', async () => {
        db.removeItem.mockResolvedValue();

        await itemRepository.deleteById('1');

        expect(db.removeItem).toHaveBeenCalledTimes(1);
        expect(db.removeItem).toHaveBeenCalledWith('1');
    });

    test('updateById delegates to db.updateItem', async () => {
        const data = { name: 'Updated', completed: true };
        db.updateItem.mockResolvedValue();

        await itemRepository.updateById('1', data);

        expect(db.updateItem).toHaveBeenCalledTimes(1);
        expect(db.updateItem).toHaveBeenCalledWith('1', data);
    });

    test('getById delegates to db.getItem', async () => {
        const item = { id: '1', name: 'Task 1', completed: false };
        db.getItem.mockResolvedValue(item);

        const result = await itemRepository.getById('1');

        expect(db.getItem).toHaveBeenCalledTimes(1);
        expect(db.getItem).toHaveBeenCalledWith('1');
        expect(result).toEqual(item);
    });
});
