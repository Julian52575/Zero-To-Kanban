const { z } = require('zod');

const createProjectSchema = z.object({
    name: z.string().trim().min(1),
});

module.exports = {
    createProjectSchema,
};