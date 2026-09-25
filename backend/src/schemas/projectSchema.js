const { z } = require('zod');

const projectNameSchema = z
    .string({
        error: (issue) => {
            if (issue.code === 'invalid_type') {
                return 'Project name must be a string.';
            }

            return 'Invalid project name.';
        },
    })
    .trim()
    .min(1, {
        error: 'Project name cannot be empty.',
    })
    .min(2, {
        error: 'Project name must contain at least 2 characters.',
    })
    .max(100, {
        error: 'Project name must not exceed 100 characters.',
    });

const projectDataOptions = {
    error: (issue) => {
        if (issue.code === 'invalid_type') {
            return 'Project data must be an object.';
        }

        return 'Invalid project data.';
    },
};

const createProjectSchema = z
    .object({ name: projectNameSchema }, projectDataOptions)
    .strict({
        error: 'Unknown field provided.',
    });

// Not strict: clients send the stored project back (e.g. createdAt) on update.
// Unknown fields are stripped instead of rejected.
const updateProjectSchema = z.object(
    { name: projectNameSchema },
    projectDataOptions,
);

module.exports = {
    createProjectSchema,
    updateProjectSchema,
};
