const express = require('express');

const getItems = require("./routes/item/getItems");
const getItem = require("./routes/item/getItem");
const addItem = require('./routes/item/addItem');
const updateItem = require('./routes/item/updateItem');
const deleteItem = require('./routes/item/deleteItem');

const getProjects = require('./routes/project/getProjects');
const getProject = require('./routes/project/getProject');
const createProject = require('./routes/project/createProject');
const updateProject = require('./routes/project/updateProject');
const deleteProject = require('./routes/project/deleteProject');

const { getColumns } = require('./controllers/ColumnController');

const {
    validateCreateProject,
} = require('./middlewares/projectValidation');

const requireUser = require('./middlewares/requireUser');


const app = express();

app.disable('x-powered-by');
app.use(express.json());

const apiRouter = express.Router();
apiRouter.get('/health', (req, res) => res.json({ ok: true }));
apiRouter.use(requireUser);

apiRouter.get('/items', getItems);
apiRouter.get('/items/:id', getItem);
apiRouter.post('/items', addItem);
apiRouter.put('/items/:id', updateItem);
apiRouter.patch('/items/:id', updateItem);
apiRouter.delete('/items/:id', deleteItem);


apiRouter.get('/projects', getProjects);
apiRouter.get('/projects/:id', getProject);
console.log('validateCreateProject:', typeof validateCreateProject);
console.log('createProject:', typeof createProject);
console.log('createProject value:', createProject);
apiRouter.post('/projects', validateCreateProject, createProject);
apiRouter.delete('/projects/:id', deleteProject);
apiRouter.put('/projects/:id', updateProject);
apiRouter.patch('/projects/:id', updateProject);

apiRouter.get('/projects/:projectId/tasks', getTasks);
apiRouter.get('/projects/:projectId/tasks/:id', getTask);
apiRouter.post('/projects/:projectId/tasks', addTask);
apiRouter.put('/projects/:projectId/tasks/:id', updateTask);
apiRouter.patch('/projects/:projectId/tasks/:id', updateTask);
apiRouter.delete('/projects/:projectId/tasks/:id', deleteTask);
apiRouter.get('/projects/:projectId/columns', getColumns);


app.use(apiRouter);

module.exports = app;