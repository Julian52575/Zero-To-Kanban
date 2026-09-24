const { z } = require('zod');

const createProjectSchema = z
    .object(
        {
            name: z
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
                }),
        },
        {
            error: (issue) => {
                if (issue.code === 'invalid_type') {
                    return 'Project data must be an object.';
                }

                return 'Invalid project data.';
            },
        },
    )
    .strict({
        error: 'Unknown field provided.',
    });

module.exports = {
    createProjectSchema,
};