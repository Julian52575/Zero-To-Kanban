const mockPrismaInstance = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    todoItem: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
};

jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn(() => mockPrismaInstance),
}));

const db = require('../../src/persistence');

describe('persistence', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('init connects to the database', async () => {
        mockPrismaInstance.$connect.mockResolvedValue();
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        await db.init();

        expect(mockPrismaInstance.$connect).toHaveBeenCalledTimes(1);
        logSpy.mockRestore();
    });

    test('teardown disconnects from the database', async () => {
        mockPrismaInstance.$disconnect.mockResolvedValue();

        await db.teardown();

        expect(mockPrismaInstance.$disconnect).toHaveBeenCalledTimes(1);
    });

    test('getItems returns every todo item', async () => {
        const items = [{ id: '1', name: 'Task 1', completed: false }];
        mockPrismaInstance.todoItem.findMany.mockResolvedValue(items);

        const result = await db.getItems();

        expect(mockPrismaInstance.todoItem.findMany).toHaveBeenCalledTimes(1);
        expect(result).toEqual(items);
    });

    test('getItem returns a single todo item by id', async () => {
        const item = { id: '1', name: 'Task 1', completed: false };
        mockPrismaInstance.todoItem.findUnique.mockResolvedValue(item);

        const result = await db.getItem('1');

        expect(mockPrismaInstance.todoItem.findUnique).toHaveBeenCalledWith({
            where: { id: '1' },
        });
        expect(result).toEqual(item);
    });

    test('storeItem creates a todo item with the given fields', async () => {
        const item = { id: '1', name: 'Task 1', completed: false };
        mockPrismaInstance.todoItem.create.mockResolvedValue(item);

        const result = await db.storeItem(item);

        expect(mockPrismaInstance.todoItem.create).toHaveBeenCalledWith({
            data: { id: '1', name: 'Task 1', completed: false },
        });
        expect(result).toEqual(item);
    });

    test('updateItem updates the name and completed fields by id', async () => {
        mockPrismaInstance.todoItem.update.mockResolvedValue();

        await db.updateItem('1', { name: 'Updated', completed: true });

        expect(mockPrismaInstance.todoItem.update).toHaveBeenCalledWith({
            where: { id: '1' },
            data: { name: 'Updated', completed: true },
        });
    });

    test('removeItem deletes a todo item by id', async () => {
        mockPrismaInstance.todoItem.delete.mockResolvedValue();

        await db.removeItem('1');

        expect(mockPrismaInstance.todoItem.delete).toHaveBeenCalledWith({
            where: { id: '1' },
        });
    });
});
