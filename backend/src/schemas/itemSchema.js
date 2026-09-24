const { z } = require('zod');

const createItemSchema = z
.object(
{
name: z
.string({
error: (issue) => {
if (issue.code === 'invalid_type') {
return 'Item name must be a string.';
}

                    return 'Invalid item name.';
                },
            })
            .trim()
            .min(1, {
                error: 'Item name cannot be empty.',
            })
            .min(2, {
                error: 'Item name must contain at least 2 characters.',
            })
            .max(100, {
                error: 'Item name must not exceed 100 characters.',
            }),
    },
    {
        error: (issue) => {
            if (issue.code === 'invalid_type') {
                return 'Item data must be an object.';
            }

            return 'Invalid item data.';
        },
    },
)
.strict({
    error: 'Unknown field provided.',
});

const updateItemSchema = z
.object(
{
name: z
.string({
error: (issue) => {
if (issue.code === 'invalid_type') {
return 'Item name must be a string.';
}

                    return 'Invalid item name.';
                },
            })
            .trim()
            .min(1, {
                error: 'Item name cannot be empty.',
            })
            .min(2, {
                error: 'Item name must contain at least 2 characters.',
            })
            .max(100, {
                error: 'Item name must not exceed 100 characters.',
            })
            .optional(),

        completed: z
            .boolean({
                error: (issue) => {
                    if (issue.code === 'invalid_type') {
                        return 'Item completed must be a boolean.';
                    }

                    return 'Invalid completed value.';
                },
            })
            .optional(),
    },
    {
        error: (issue) => {
            if (issue.code === 'invalid_type') {
                return 'Item data must be an object.';
            }

            return 'Invalid item data.';
        },
    },
)
.strict({
    error: 'Unknown field provided.',
});

module.exports = {
createItemSchema,
updateItemSchema,
};