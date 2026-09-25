const columnService = require('../services/ColumnService');

async function getColumns(req, res, next) {
  try {
    const columns = await columnService.getColumns(req.userId, req.params.projectId);
    if (columns === null) {
      return res.status(404).json({ error: 'project not found' });
    }
    res.json(columns);
  } catch (err) {
    next(err);
  }
}

module.exports = { getColumns };