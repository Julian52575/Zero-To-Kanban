const { z } = require('zod');

const taskNameSchema = z
    .string({
        error: (issue) => {
            if (issue.code === 'invalid_type') {
                return 'Task name must be a string.';
            }

            return 'Invalid task name.';
        },
    })
    .trim()
    .min(1, {
        error: 'Task name cannot be empty.',
    })
    .min(2, {
        error: 'Task name must contain at least 2 characters.',
    })
    .max(100, {
        error: 'Task name must not exceed 100 characters.',
    });

const taskIdSchema = z
    .string({
        error: (issue) => {
            if (issue.code === 'invalid_type') {
                return 'Task ID must be a string.';
            }

            return 'Invalid task ID.';
        },
    })
    .trim()
    .min(1, {
        error: 'Task ID cannot be empty.',
    });

const projectIdSchema = z
    .string({
        error: (issue) => {
            if (issue.code === 'invalid_type') {
                return 'Project ID must be a string.';
            }

            return 'Invalid project ID.';
        },
    })
    .trim()
    .min(1, {
        error: 'Project ID cannot be empty.',
    });

const taskStatusSchema = z
    .string({
        error: (issue) => {
            if (issue.code === 'invalid_type') {
                return 'Task status must be a string.';
            }

            return 'Invalid task status.';
        },
    })
    .trim()
    .pipe(
        z.enum(
            ['TODO', 'IN_PROGRESS', 'DONE'],
            {
                error: 'Task status must be TODO, IN_PROGRESS or DONE.',
            },
        ),
    );

const taskPrioritySchema = z.number({
    error: (issue) => {
        if (issue.code === 'invalid_type') {
            return 'Task priority must be a number.';
        }

        return 'Invalid task priority.';
    },
});

const taskDeadlineSchema = z
    .string({
        error: (issue) => {
            if (issue.code === 'invalid_type') {
                return 'Task deadline must be a string.';
            }

            return 'Invalid task deadline.';
        },
    })
    .trim()
    .min(1, {
        error: 'Task deadline cannot be empty.',
    })
    .or(z.null());

const createTaskSchema = z
    .object(
        {
            projectId: projectIdSchema,

            name: taskNameSchema,

            status: taskStatusSchema,

            priority: taskPrioritySchema,

            deadline: taskDeadlineSchema,
        },
        {
            error: (issue) => {
                if (issue.code === 'invalid_type') {
                    return 'Task data must be an object.';
                }

                return 'Invalid task data.';
            },
        },
    )
    .strict({
        error: 'Unknown field provided.',
    });

const updateTaskSchema = z
    .object(
        {
            projectId: projectIdSchema.optional(),

            name: taskNameSchema.optional(),

            status: taskStatusSchema.optional(),

            priority: taskPrioritySchema.optional(),

            deadline: taskDeadlineSchema.optional(),
        },
        {
            error: (issue) => {
                if (issue.code === 'invalid_type') {
                    return 'Task data must be an object.';
                }

                return 'Invalid task data.';
            },
        },
    )
    .strict({
        error: 'Unknown field provided.',
    });

module.exports = {
    taskNameSchema,
    taskIdSchema,
    projectIdSchema,
    taskStatusSchema,
    taskPrioritySchema,
    taskDeadlineSchema,
    createTaskSchema,
    updateTaskSchema,
};