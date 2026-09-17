function validateCreateProject(req, res, next) {
    const { name } = req.body;

    if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({
            error: 'name must be a non-empty string',
        });
    }

    next();
}

module.exports = {
    validateCreateProject,
};