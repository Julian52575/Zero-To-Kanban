const { createProjectSchema } = require('../schemas/projectSchema');

function validateCreateProject(req, res, next) {
    const result = createProjectSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            error: result.error.issues,
        });
    }

    req.body = result.data;

    next();
}

module.exports = {
    validateCreateProject,
};