jest.mock('uuid', () => ({
    v4: jest.fn(() => 'test-id'),
}));

jest.mock('../../src/repositories/itemRepository', () => ({
    getAll: jest.fn(),
    create: jest.fn(),
    deleteById: jest.fn(),
    updateById: jest.fn(),
    getById: jest.fn(),
}));

const itemRepository = require('../../src/repositories/itemRepository');
const itemService = require('../../src/services/itemService');

describe('itemService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getItems', () => {
        test('returns all items', async () => {
            const items = [
                { id: '1', name: 'Task 1', completed: false },
                { id: '2', name: 'Task 2', completed: true },
            ];

            itemRepository.getAll.mockResolvedValue(items);

            const result = await itemService.getItems();

            expect(itemRepository.getAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual(items);
        });
    });

    describe('createItem', () => {
        test('creates an incomplete item with a generated id', async () => {
            const data = {
                name: 'New task',
            };

            const expectedItem = {
                id: 'test-id',
                name: 'New task',
                completed: false,
            };

            itemRepository.create.mockResolvedValue(expectedItem);

            const result = await itemService.createItem(data);

            expect(itemRepository.create).toHaveBeenCalledTimes(1);
            expect(itemRepository.create).toHaveBeenCalledWith(expectedItem);
            expect(result).toEqual(expectedItem);
        });
    });

    describe('deleteItem', () => {
        test('deletes an item by id', async () => {
            const id = '123';

            itemRepository.deleteById.mockResolvedValue();

            await itemService.deleteItem(id);

            expect(itemRepository.deleteById).toHaveBeenCalledTimes(1);
            expect(itemRepository.deleteById).toHaveBeenCalledWith(id);
        });
    });

    describe('updateItem', () => {
        test('updates an item and returns the updated item', async () => {
            const id = '123';

            const data = {
                name: 'Updated task',
                completed: true,
            };

            const updatedItem = {
                id,
                name: 'Updated task',
                completed: true,
            };

            itemRepository.updateById.mockResolvedValue();
            itemRepository.getById.mockResolvedValue(updatedItem);

            const result = await itemService.updateItem(id, data);

            expect(itemRepository.updateById).toHaveBeenCalledTimes(1);
            expect(itemRepository.updateById).toHaveBeenCalledWith(
                id,
                {
                    name: 'Updated task',
                    completed: true,
                }
            );

            expect(itemRepository.getById).toHaveBeenCalledTimes(1);
            expect(itemRepository.getById).toHaveBeenCalledWith(id);

            expect(result).toEqual(updatedItem);
        });
    });
});