const {
    validateCreateItem,
    validateUpdateItem,
    validateItemId,
} = require('../../src/middlewares/itemValidation');

describe('item validation middleware', () => {
    describe('validateCreateItem', () => {
        test('accepts a valid item', () => {
            const req = {
                body: {
                    name: 'My task',
                },
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const next = jest.fn();

            validateCreateItem(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
        });

        test('rejects a missing name', () => {
            const req = {
                body: {},
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const next = jest.fn();

            validateCreateItem(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        });

        test('rejects an empty name', () => {
            const req = {
                body: {
                    name: '   ',
                },
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const next = jest.fn();

            validateCreateItem(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        });

        test('rejects a non-string name', () => {
            const req = {
                body: {
                    name: 123,
                },
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const next = jest.fn();

            validateCreateItem(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('validateUpdateItem', () => {
        test('accepts a valid update', () => {
            const req = {
                body: {
                    name: 'Updated task',
                    completed: true,
                },
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const next = jest.fn();

            validateUpdateItem(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
        });

        test('rejects an invalid name', () => {
            const req = {
                body: {
                    name: '',
                    completed: false,
                },
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const next = jest.fn();

            validateUpdateItem(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        });

        test('rejects a non-boolean completed value', () => {
            const req = {
                body: {
                    name: 'Task',
                    completed: 'false',
                },
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const next = jest.fn();

            validateUpdateItem(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('validateItemId', () => {
        test('accepts a valid id', () => {
            const req = {
                params: {
                    id: '12345',
                },
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const next = jest.fn();

            validateItemId(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
        });

        test('rejects an empty id', () => {
            const req = {
                params: {
                    id: '',
                },
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const next = jest.fn();

            validateItemId(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        });
    });
});