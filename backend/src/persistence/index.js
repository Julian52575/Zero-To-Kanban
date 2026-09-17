const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function init() {
    await prisma.$connect();
    console.log('Connected to database via Prisma');
}

async function teardown() {
    await prisma.$disconnect();
}

async function getItems() {
    return prisma.todoItem.findMany();
}

async function getItem(id) {
    return prisma.todoItem.findUnique({ where: { id } });
}

async function storeItem(item) {
    return prisma.todoItem.create({
        data: { id: item.id, name: item.name, completed: item.completed },
    });
}

async function updateItem(id, item) {
    await prisma.todoItem.update({
        where: { id },
        data: { name: item.name, completed: item.completed },
    });
}

async function removeItem(id) {
    await prisma.todoItem.delete({ where: { id } });
}

async function getTasks(projectId) {
    return prisma.task.findMany({
        where: {
            column: { projectId: projectId }
        },
        orderBy: [
            { columnId: 'asc' },
            { order: 'asc' }
        ]
    });
}

async function getTask(id) {
    return prisma.task.findUnique({
        where: { id },
        include: { column: true }
    });
}

async function storeTask(columnId, creatorId, taskData) {
    const taskCount = await prisma.task.count({
        where: { columnId }
    });

    return prisma.task.create({
        data: {
            title: taskData.title,
            description: taskData.description,
            order: taskCount,
            columnId: columnId,
            creatorId: creatorId,
            assigneeId: taskData.assigneeId || null
        },
    });
}

async function updateTask(id, updateData) {
    return prisma.task.update({
        where: { id },
        data: {
            title: updateData.title,
            description: updateData.description,
            order: updateData.order,
            columnId: updateData.columnId,
            assigneeId: updateData.assigneeId
        }
    });
}

async function deleteTask(id) {
    return prisma.task.delete({
        where: { id }
    });
}

module.exports = {
    init,
    teardown,
    getItems,
    getItem,
    storeItem,
    updateItem,
    removeItem,

    getTasks,
    getTask,
    storeTask,
    updateTask,
    deleteTask
};
