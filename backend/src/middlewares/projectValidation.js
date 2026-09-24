const {
    createProjectSchema,
    updateProjectSchema,
} = require('../schemas/projectSchema');

function validateBody(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

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
    };
}

const validateCreateProject = validateBody(createProjectSchema);
const validateUpdateProject = validateBody(updateProjectSchema);

module.exports = {
    validateCreateProject,
    validateUpdateProject,
};
