// Unit tests never open a socket -- db / prisma are mocked in each spec -- but
// src/config.js exits the process if SESSION_SECRET is unset. Provide one so
// `npm test` works without a .env file.
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'test-secret';
