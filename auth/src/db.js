'use strict';

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function init() {
    await prisma.$connect();
    console.log('auth: connected to database via Prisma');
}

async function teardown() {
    await prisma.$disconnect();
}

function findUserById(id) {
    return prisma.user.findUnique({ where: { id } });
}

function findUserByUsername(username) {
    return prisma.user.findUnique({ where: { username: username.toLowerCase() } });
}

// TEMPORARY: no credentials, so signing in just resolves a user row, creating
// it on first use. The web team replaces this with a real register/login split.
async function getOrCreateUser(username) {
    const name = username.toLowerCase();
    const existing = await findUserByUsername(name);
    if (existing) {
        return existing;
    }
    try {
        return await prisma.user.create({ data: { username: name } });
    } catch (err) {
        // Unique violation -- a concurrent request created it first. Re-read.
        if (err && err.code === 'P2002') {
            return findUserByUsername(name);
        }
        throw err;
    }
}

// Revokes every token ever issued for this user: their `ver` claim no longer
// matches the row. Returns the new tokenVersion.
async function bumpTokenVersion(id) {
    const user = await prisma.user.update({
        where: { id },
        data: { tokenVersion: { increment: 1 } },
    });
    return user.tokenVersion;
}

module.exports = {
    prisma,
    init,
    teardown,
    findUserById,
    findUserByUsername,
    getOrCreateUser,
    bumpTokenVersion,
};
