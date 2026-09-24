const {
createItemSchema,
updateItemSchema,
} = require('../schemas/itemSchema');

const validateCreateItem = (req, res, next) => {
const result = createItemSchema.safeParse(req.body);

if (!result.success) {
    return res.status(400).json({
        errors: result.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
        })),
    });
}

req.body = result.data;

next();

};

const validateUpdateItem = (req, res, next) => {
const result = updateItemSchema.safeParse(req.body);

if (!result.success) {
    return res.status(400).json({
        errors: result.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
        })),
    });
}

req.body = result.data;

next();

};

module.exports = {
validateCreateItem,
validateUpdateItem,
};