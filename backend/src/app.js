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

const app = express();

app.disable('x-powered-by');

app.use(express.json());

app.get('/items', getItems);
app.post('/items', addItem);
app.put('/items/:id', updateItem);
app.delete('/items/:id', deleteItem);

app.get('/projects/:projectId/tasks', getTasks);
app.get('/projects/:projectId/tasks/:id', getTask);
app.post('/projects/:projectId/tasks', addTask);
app.put('/projects/:projectId/tasks/:id', updateTask);
app.delete('/projects/:projectId/tasks/:id', deleteTask);

module.exports = app;