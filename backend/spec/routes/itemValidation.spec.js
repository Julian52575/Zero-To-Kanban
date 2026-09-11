jest.mock('../../src/services/itemService', () => ({
    createItem: jest.fn(),
    updateItem: jest.fn(),
    deleteItem: jest.fn(),
    getItems: jest.fn(),
}));

const request = require('supertest');
const itemService = require('../../src/services/itemService');
const app = require('../../src/app');

describe('Item API validation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('rejects an item without a name', async () => {
        const response = await request(app)
            .post('/items')
            .send({});

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            error: 'name must be a non-empty string',
        });

        expect(itemService.createItem).not.toHaveBeenCalled();
    });

    test('rejects an item with an empty name', async () => {
        const response = await request(app)
            .post('/items')
            .send({
                name: '   ',
            });

        expect(response.status).toBe(400);
        expect(itemService.createItem).not.toHaveBeenCalled();
    });

    test('rejects an item with a non-string name', async () => {
        const response = await request(app)
            .post('/items')
            .send({
                name: 123,
            });

        expect(response.status).toBe(400);
        expect(itemService.createItem).not.toHaveBeenCalled();
    });

    test('accepts a valid item', async () => {
        const item = {
            id: 'test-id',
            name: 'My task',
            completed: false,
        };

        itemService.createItem.mockResolvedValue(item);

        const response = await request(app)
            .post('/items')
            .send({
                name: 'My task',
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(item);

        expect(itemService.createItem).toHaveBeenCalledWith({
            name: 'My task',
        });
    });

    test('rejects an update with an invalid completed value', async () => {
        const response = await request(app)
            .put('/items/test-id')
            .send({
                name: 'My task',
                completed: 'false',
            });

        expect(response.status).toBe(400);
        expect(itemService.updateItem).not.toHaveBeenCalled();
    });

    test('accepts a valid update', async () => {
        const item = {
            id: 'test-id',
            name: 'Updated task',
            completed: true,
        };

        itemService.updateItem.mockResolvedValue(item);

        const response = await request(app)
            .put('/items/test-id')
            .send({
                name: 'Updated task',
                completed: true,
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(item);

        expect(itemService.updateItem).toHaveBeenCalledWith(
            'test-id',
            {
                name: 'Updated task',
                completed: true,
            }
        );
    });
});