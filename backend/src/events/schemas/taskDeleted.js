const { z } = require("zod");
const taskDeletedSchema = z.object({
    taskId: z.string(),
    
});

module.exports = taskDeletedSchema;