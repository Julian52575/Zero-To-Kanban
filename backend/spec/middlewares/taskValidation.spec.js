const {
  validateCreateTask,
  validateUpdateTask,
} = require('../../src/middlewares/taskValidation');

describe('Task Validation Middleware', () => {
  const createValidTask = () => ({
    projectId: 'project-123',
    name: 'My Task',
    status: 'TODO',
    priority: 1,
    deadline: '2026-12-31',
  });

  describe('validateCreateTask', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
      req = {
        body: createValidTask(),
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      next = jest.fn();
    });

    describe('valid data', () => {
      test('should call next with valid task data', () => {
        validateCreateTask(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith();

        expect(req.body).toEqual({
          projectId: 'project-123',
          name: 'My Task',
          status: 'TODO',
          priority: 1,
          deadline: '2026-12-31',
        });

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
      });

      test('should trim string values', () => {
        req.body = {
          projectId: '  project-123  ',
          name: '  My Task  ',
          status: 'TODO',
          priority: 1,
          deadline: '  2026-12-31  ',
        };

        validateCreateTask(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);

        expect(req.body).toEqual({
          projectId: 'project-123',
          name: 'My Task',
          status: 'TODO',
          priority: 1,
          deadline: '2026-12-31',
        });
      });

      test('should accept null deadline', () => {
        req.body.deadline = null;

        validateCreateTask(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(req.body.deadline).toBeNull();
      });
    });

    describe('invalid data', () => {
      test('should reject missing projectId', () => {
        delete req.body.projectId;

        validateCreateTask(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);

        const response = res.json.mock.calls[0][0];

        expect(response.errors).toEqual(
          expect.arrayContaining([
            {
              field: 'projectId',
              message: expect.any(String),
            },
          ]),
        );
      });

      test('should reject empty projectId', () => {
        req.body.projectId = '';

        validateCreateTask(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);

        const response = res.json.mock.calls[0][0];

        expect(response.errors).toEqual(
          expect.arrayContaining([
            {
              field: 'projectId',
              message: expect.any(String),
            },
          ]),
        );
      });

      test('should reject missing name', () => {
        delete req.body.name;

        validateCreateTask(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);

        const response = res.json.mock.calls[0][0];

        expect(response.errors).toEqual(
          expect.arrayContaining([
            {
              field: 'name',
              message: expect.any(String),
            },
          ]),
        );
      });

      test('should reject empty name', () => {
        req.body.name = '';

        validateCreateTask(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);

        const response = res.json.mock.calls[0][0];

        expect(response.errors).toEqual(
          expect.arrayContaining([
            {
              field: 'name',
              message: 'Task name cannot be empty.',
            },
          ]),
        );
      });

      test('should reject name shorter than 2 characters', () => {
        req.body.name = 'A';

        validateCreateTask(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);

        const response = res.json.mock.calls[0][0];

        expect(response.errors).toEqual(
          expect.arrayContaining([
            {
              field: 'name',
              message: 'Task name must contain at least 2 characters.',
            },
          ]),
        );
      });

      test('should reject name longer than 100 characters', () => {
        req.body.name = 'A'.repeat(101);

        validateCreateTask(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);

        const response = res.json.mock.calls[0][0];

        expect(response.errors).toEqual(
          expect.arrayContaining([
            {
              field: 'name',
              message: expect.any(String),
            },
          ]),
        );
      });

      test('should reject missing status', () => {
        delete req.body.status;

        validateCreateTask(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);

        const response = res.json.mock.calls[0][0];

        expect(response.errors).toEqual(
          expect.arrayContaining([
            {
              field: 'status',
              message: expect.any(String),
            },
          ]),
        );
      });

      test('should reject invalid status', () => {
        req.body.status = 'INVALID_STATUS';

        validateCreateTask(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);

        const response = res.json.mock.calls[0][0];

        expect(response.errors).toEqual(
          expect.arrayContaining([
            {
              field: 'status',
              message: expect.any(String),
            },
          ]),
        );
      });

      test('should reject missing priority', () => {
        delete req.body.priority;

        validateCreateTask(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);

        const response = res.json.mock.calls[0][0];

        expect(response.errors).toEqual(
          expect.arrayContaining([
            {
              field: 'priority',
              message: expect.any(String),
            },
          ]),
        );
      });

      test('should reject invalid priority type', () => {
        req.body.priority = 'HIGH';

        validateCreateTask(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);

        const response = res.json.mock.calls[0][0];

        expect(response.errors).toEqual(
          expect.arrayContaining([
            {
              field: 'priority',
              message: expect.any(String),
            },
          ]),
        );
      });

      test('should reject missing deadline', () => {
        delete req.body.deadline;

        validateCreateTask(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);

        const response = res.json.mock.calls[0][0];

        expect(response.errors).toEqual(
          expect.arrayContaining([
            {
              field: 'deadline',
              message: expect.any(String),
            },
          ]),
        );
      });

      test('should reject empty deadline', () => {
        req.body.deadline = '';

        validateCreateTask(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);

        const response = res.json.mock.calls[0][0];

        expect(response.errors).toEqual(
          expect.arrayContaining([
            {
              field: 'deadline',
              message: expect.any(String),
            },
          ]),
        );
      });

      test('should reject invalid body type', () => {
        req.body = null;

        validateCreateTask(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);

        const response = res.json.mock.calls[0][0];

        expect(response.errors).toEqual(
          expect.arrayContaining([
            {
              field: 'body',
              message: expect.any(String),
            },
          ]),
        );
      });
    });

    describe('unknown fields', () => {
      test('should reject unknown fields', () => {
        req.body.extraField = 'not allowed';

        validateCreateTask(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);

        const response = res.json.mock.calls[0][0];

        expect(response.errors).toEqual(
          expect.arrayContaining([
            {
              field: expect.any(String),
              message: expect.any(String),
            },
          ]),
        );
      });
    });
  });

  describe('validateUpdateTask', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
      req = {
        body: {},
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      next = jest.fn();
    });

    describe('valid data', () => {
      test('should accept an empty update object', () => {
        validateUpdateTask(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(req.body).toEqual({});

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
      });

      test('should accept a partial update', () => {
        req.body = {
          name: 'Updated Task',
        };

        validateUpdateTask(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(req.body).toEqual({
          name: 'Updated Task',
        });
      });

      test('should accept multiple fields', () => {
        req.body = {
          name: 'Updated Task',
          status: 'IN_PROGRESS',
          priority: 2,
          deadline: '2026-12-31',
        };

        validateUpdateTask(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(req.body).toEqual({
          name: 'Updated Task',
          status: 'IN_PROGRESS',
          priority: 2,
          deadline: '2026-12-31',
        });
      });

      test('should trim updated string values', () => {
        req.body = {
          name: '  Updated Task  ',
          status: '  DONE  ',
          deadline: '  2026-12-31  ',
        };

        validateUpdateTask(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(req.body).toEqual({
          name: 'Updated Task',
          status: 'DONE',
          deadline: '2026-12-31',
        });
      });

      test('should accept null deadline', () => {
        req.body = {
          deadline: null,
        };

        validateUpdateTask(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(req.body.deadline).toBeNull();
      });
    });

    describe('invalid data', () => {
      test('should reject an empty name', () => {
        req.body = {
          name: '',
        };

        validateUpdateTask(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);

        const response = res.json.mock.calls[0][0];

        expect(response.errors).toEqual(
          expect.arrayContaining([
            {
              field: 'name',
              message: expect.any(String),
            },
          ]),
        );
      });

      test('should reject a name shorter than 2 characters', () => {
        req.body = {
          name: 'A',
        };

        validateUpdateTask(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);

        const response = res.json.mock.calls[0][0];

        expect(response.errors).toEqual(
          expect.arrayContaining([
            {
              field: 'name',
              message: expect.any(String),
            },
          ]),
        );
      });

      test('should reject a name longer than 100 characters', () => {
        req.body = {
          name: 'A'.repeat(101),
        };

        validateUpdateTask(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);

        const response = res.json.mock.calls[0][0];

        expect(response.errors).toEqual(
          expect.arrayContaining([
            {
              field: 'name',
              message: expect.any(String),
            },
          ]),
        );
      });

      test('should reject an invalid status', () => {
        req.body = {
          status: 'INVALID_STATUS',
        };

        validateUpdateTask(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);

        const response = res.json.mock.calls[0][0];

        expect(response.errors).toEqual(
          expect.arrayContaining([
            {
              field: 'status',
              message: expect.any(String),
            },
          ]),
        );
      });

      test('should reject an invalid priority', () => {
        req.body = {
          priority: 'HIGH',
        };

        validateUpdateTask(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);

        const response = res.json.mock.calls[0][0];

        expect(response.errors).toEqual(
          expect.arrayContaining([
            {
              field: 'priority',
              message: expect.any(String),
            },
          ]),
        );
      });

      test('should reject an empty deadline', () => {
        req.body = {
          deadline: '',
        };

        validateUpdateTask(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);

        const response = res.json.mock.calls[0][0];

        expect(response.errors).toEqual(
          expect.arrayContaining([
            {
              field: 'deadline',
              message: expect.any(String),
            },
          ]),
        );
      });
    });

    describe('unknown fields', () => {
      test('should reject unknown fields', () => {
        req.body = {
          unknownField: 'value',
        };

        validateUpdateTask(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);

        const response = res.json.mock.calls[0][0];

        expect(response.errors).toEqual(
          expect.arrayContaining([
            {
              field: expect.any(String),
              message: expect.any(String),
            },
          ]),
        );
      });
    });
  });
});