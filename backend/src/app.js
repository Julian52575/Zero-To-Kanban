const express = require('express');

const getItems = require('./routes/getItems');
const addItem = require('./routes/addItem');
const updateItem = require('./routes/updateItem');
const deleteItem = require('./routes/deleteItem');

const getTasks = require('./routes/getTasks');
const getTask = require('./routes/getTask');
const addTask = require('./routes/addTask');
const updateTask = require('./routes/updateTask');
const deleteTask = require('./routes/deleteTask');
const createProject = require('./routes/createProject');
const getProjects = require('./routes/getProjects');
const getProject = require('./routes/getProject');

const {
    validateCreateProject,
} = require('./middlewares/projectValidation');

const app = express();

app.disable('x-powered-by');

app.use(express.json());

app.get('/items', getItems);
app.post('/items', addItem);
app.put('/items/:id', updateItem);
app.delete('/items/:id', deleteItem);
app.get('/projects', getProjects);
app.get('/projects/:id', getProject);
console.log('validateCreateProject:', typeof validateCreateProject);
console.log('createProject:', typeof createProject);
console.log('createProject value:', createProject);
app.post('/projects', validateCreateProject, createProject);

app.get('/projects/:projectId/tasks', getTasks);
app.get('/projects/:projectId/tasks/:id', getTask);
app.post('/projects/:projectId/tasks', addTask);
app.put('/projects/:projectId/tasks/:id', updateTask);
app.delete('/projects/:projectId/tasks/:id', deleteTask);

module.exports = app;