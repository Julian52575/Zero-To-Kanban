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

// Thrown when a username is already taken. Kept distinct from a generic
// Prisma error so routes can turn it into a clean 409 without inspecting
// Prisma error codes themselves.
class UsernameTakenError extends Error {
    constructor(username) {
        super(`username already taken: ${username}`);
        this.name = 'UsernameTakenError';
    }
}

// Creates a new user row with an already-hashed password. Throws
// UsernameTakenError on a unique-constraint conflict (including the
// concurrent-registration race).
async function createUser(username, passwordHash) {
    const name = username.toLowerCase();
    try {
        return await prisma.user.create({ data: { username: name, passwordHash } });
    } catch (err) {
        if (err && err.code === 'P2002') {
            throw new UsernameTakenError(name);
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
    createUser,
    bumpTokenVersion,
    UsernameTakenError,
};
