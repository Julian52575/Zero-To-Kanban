const {
    validateCreateProject,
} = require('../../src/middlewares/projectValidation');

describe('validateCreateProject', () => {
    it('should call next for valid data', () => {
        const req = {
            body: {
                name: 'Mon projet',
            },
        };

        const res = {};
        const next = jest.fn();

        validateCreateProject(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    it('should return 400 when name is missing', () => {
        const req = {
            body: {},
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        const next = jest.fn();

        validateCreateProject(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 when name is not a string', () => {
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

        validateCreateProject(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 when name is empty', () => {
        const req = {
            body: {
                name: '',
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        const next = jest.fn();

        validateCreateProject(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).not.toHaveBeenCalled();
    });

    it('should trim the project name', () => {
        const req = {
            body: {
                name: '  Mon projet  ',
            },
        };

        const res = {};
        const next = jest.fn();

        validateCreateProject(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.body.name).toBe('Mon projet');
    });
});