const { createProjectSchema } = require('../schemas/projectSchema');

function validateCreateProject(req, res, next) {
    const result = createProjectSchema.safeParse(req.body);

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
    validateCreateProject,
};