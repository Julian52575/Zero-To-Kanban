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

const {
    validateCreateProject,
} = require('./middlewares/projectValidation');

const app = express();

app.disable('x-powered-by');

app.use(express.json());

app.get('/items', getItems);
app.get('/items/:id', getItem);
app.post('/items', addItem);
app.put('/items/:id', updateItem);
app.patch('/items/:id', updateItem);
app.delete('/items/:id', deleteItem);

app.get('/projects', getProjects);
app.get('/projects/:id', getProject);
console.log('validateCreateProject:', typeof validateCreateProject);
console.log('createProject:', typeof createProject);
console.log('createProject value:', createProject);
app.post('/projects', validateCreateProject, createProject);
app.delete('/projects/:id', deleteProject);
app.put('/projects/:id', updateProject);
app.patch('/projects/:id', updateProject);


module.exports = app;