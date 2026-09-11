function validateCreateItem(req, res, next) {
    const { name } = req.body;

    if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({
            error: 'name must be a non-empty string',
        });
    }

    next();
}

function validateUpdateItem(req, res, next) {
    const { name, completed } = req.body;

    if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({
            error: 'name must be a non-empty string',
        });
    }

    if (typeof completed !== 'boolean') {
        return res.status(400).json({
            error: 'completed must be a boolean',
        });
    }

    next();
}

function validateItemId(req, res, next) {
    const { id } = req.params;

    if (typeof id !== 'string' || id.trim() === '') {
        return res.status(400).json({
            error: 'id must be provided',
        });
    }

    next();
}

module.exports = {
    validateCreateItem,
    validateUpdateItem,
    validateItemId,
};