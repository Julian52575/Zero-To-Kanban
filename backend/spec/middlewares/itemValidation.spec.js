const {
validateCreateItem,
validateUpdateItem,
} = require('../../src/middlewares/itemValidation');

describe('Item Validation Middleware', () => {
const createMocks = (body) => {
const req = {
body,
};

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };

    const next = jest.fn();

    return {
        req,
        res,
        next,
    };
};

describe('validateCreateItem', () => {
    it('should call next when item data is valid', () => {
        const { req, res, next } = createMocks({
            name: 'Mon item',
        });

        validateCreateItem(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });

    it('should trim the item name', () => {
        const { req, res, next } = createMocks({
            name: '  Mon item  ',
        });

        validateCreateItem(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(req.body).toEqual({
            name: 'Mon item',
        });
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });

    it('should return 400 when name is missing', () => {
        const { req, res, next } = createMocks({});

        validateCreateItem(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 when name is not a string', () => {
        const { req, res, next } = createMocks({
            name: 123,
        });

        validateCreateItem(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 when name is empty', () => {
        const { req, res, next } = createMocks({
            name: '',
        });

        validateCreateItem(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 when name contains only spaces', () => {
        const { req, res, next } = createMocks({
            name: '   ',
        });

        validateCreateItem(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 when name is shorter than 2 characters', () => {
        const { req, res, next } = createMocks({
            name: 'A',
        });

        validateCreateItem(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 when name is longer than 100 characters', () => {
        const { req, res, next } = createMocks({
            name: 'A'.repeat(101),
        });

        validateCreateItem(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 when completed is provided', () => {
        const { req, res, next } = createMocks({
            name: 'Mon item',
            completed: true,
        });

        validateCreateItem(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 when an unknown field is provided', () => {
        const { req, res, next } = createMocks({
            name: 'Mon item',
            unknown: 'value',
        });

        validateCreateItem(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 when body is null', () => {
        const { req, res, next } = createMocks(null);

        validateCreateItem(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it('should return validation errors with field and message', () => {
        const { req, res, next } = createMocks({
            name: 'A',
        });

        validateCreateItem(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            errors: [
                {
                    field: 'name',
                    message: expect.any(String),
                },
            ],
        });
        expect(next).not.toHaveBeenCalled();
    });
});

describe('validateUpdateItem', () => {
    it('should call next when update data is valid', () => {
        const { req, res, next } = createMocks({
            name: 'Mon item',
        });

        validateUpdateItem(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });

    it('should accept an empty update', () => {
        const { req, res, next } = createMocks({});

        validateUpdateItem(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(req.body).toEqual({});
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });

    it('should accept a completed update', () => {
        const { req, res, next } = createMocks({
            completed: true,
        });

        validateUpdateItem(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(req.body).toEqual({
            completed: true,
        });
    });

    it('should accept a completed false update', () => {
        const { req, res, next } = createMocks({
            completed: false,
        });

        validateUpdateItem(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(req.body).toEqual({
            completed: false,
        });
    });

    it('should accept a name and completed update', () => {
        const { req, res, next } = createMocks({
            name: 'Nouvel item',
            completed: true,
        });

        validateUpdateItem(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(req.body).toEqual({
            name: 'Nouvel item',
            completed: true,
        });
    });

    it('should trim the updated item name', () => {
        const { req, res, next } = createMocks({
            name: '  Nouvel item  ',
        });

        validateUpdateItem(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(req.body).toEqual({
            name: 'Nouvel item',
        });
    });

    it('should return 400 when name is not a string', () => {
        const { req, res, next } = createMocks({
            name: 123,
        });

        validateUpdateItem(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 when name is empty', () => {
        const { req, res, next } = createMocks({
            name: '',
        });

        validateUpdateItem(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 when name contains only spaces', () => {
        const { req, res, next } = createMocks({
            name: '   ',
        });

        validateUpdateItem(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 when name is shorter than 2 characters', () => {
        const { req, res, next } = createMocks({
            name: 'A',
        });

        validateUpdateItem(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 when name is longer than 100 characters', () => {
        const { req, res, next } = createMocks({
            name: 'A'.repeat(101),
        });

        validateUpdateItem(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 when completed is not a boolean', () => {
        const { req, res, next } = createMocks({
            completed: 'true',
        });

        validateUpdateItem(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 when an unknown field is provided', () => {
        const { req, res, next } = createMocks({
            unknown: 'value',
        });

        validateUpdateItem(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 when body is null', () => {
        const { req, res, next } = createMocks(null);

        validateUpdateItem(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it('should return validation errors with field and message', () => {
        const { req, res, next } = createMocks({
            completed: 'true',
        });

        validateUpdateItem(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            errors: [
                {
                    field: 'completed',
                    message: expect.any(String),
                },
            ],
        });
        expect(next).not.toHaveBeenCalled();
    });
});

});