const {
    createTaskSchema,
    updateTaskSchema,
} = require('../schemas/taskSchema');

function validateCreateTask(req, res, next) {
    const result = createTaskSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            errors: result.error.issues.map((issue) => ({
                field: issue.path.join('.') || 'body',
                message: issue.message,
            })),
        });
    }

    req.body = result.data;

    next();
}

function validateUpdateTask(req, res, next) {
    const result = updateTaskSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            errors: result.error.issues.map((issue) => ({
                field: issue.path.join('.') || 'body',
                message: issue.message,
            })),
        });
    }

    req.body = result.data;

    next();
}

module.exports = {
    validateCreateTask,
    validateUpdateTask,
};