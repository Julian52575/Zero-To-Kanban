const { validateCreateProject } = require('../../src/middlewares/projectValidation');

describe('validateCreateProject middleware', () => {
    const createMocks = (body) => {
        const req = {
            body,
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        const next = jest.fn();

        return { req, res, next };
    };

    describe('valid data', () => {
        it('should call next when project data is valid', () => {
            const { req, res, next } = createMocks({
                name: 'Mon projet',
            });

            validateCreateProject(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it('should trim the project name', () => {
            const { req, res, next } = createMocks({
                name: '   Mon projet   ',
            });

            validateCreateProject(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);

            expect(req.body).toEqual({
                name: 'Mon projet',
            });

            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('invalid data', () => {
        it('should return 400 when name is missing', () => {
            const { req, res, next } = createMocks({});

            validateCreateProject(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 400 when name is not a string', () => {
            const { req, res, next } = createMocks({
                name: 123,
            });

            validateCreateProject(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 400 when name is empty', () => {
            const { req, res, next } = createMocks({
                name: '',
            });

            validateCreateProject(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 400 when name contains only spaces', () => {
            const { req, res, next } = createMocks({
                name: '   ',
            });

            validateCreateProject(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 400 when name has only one character', () => {
            const { req, res, next } = createMocks({
                name: 'A',
            });

            validateCreateProject(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 400 when name is longer than 100 characters', () => {
            const { req, res, next } = createMocks({
                name: 'A'.repeat(101),
            });

            validateCreateProject(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 400 when body contains unknown fields', () => {
            const { req, res, next } = createMocks({
                name: 'Mon projet',
                unknown: 'value',
            });

            validateCreateProject(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 400 when body is null', () => {
            const { req, res, next } = createMocks(null);

            validateCreateProject(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 400 when body is an array', () => {
            const { req, res, next } = createMocks([]);

            validateCreateProject(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 400 when body is a number', () => {
            const { req, res, next } = createMocks(123);

            validateCreateProject(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('error response', () => {
        it('should return validation errors with field and message', () => {
            const { req, res, next } = createMocks({
                name: 'A',
            });

            validateCreateProject(req, res, next);

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
});