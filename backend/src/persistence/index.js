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

async function createProject(project) {
    return prisma.project.create({
        data: {
            id: project.id,
            name: project.name,
        },
    });
}

async function getProjects() {
    return prisma.project.findMany();
}

async function getProject(id) {
    return prisma.project.findUnique({
        where: { id },
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
    createProject,
    getProjects,
    getProject,
};