const bcrypt = require('bcryptjs');
const db = require('../../src/db');
const { signSession } = require('../../src/tokens');
const { setSessionCookie } = require('../../src/cookies');
const { primeTokenVersion } = require('../../src/revocation');
const register = require('../../src/routes/register');

jest.mock('../../src/db', () => ({
    createUser: jest.fn(),
    UsernameTakenError: class UsernameTakenError extends Error {},
}));
jest.mock('../../src/tokens', () => ({ signSession: jest.fn() }));
jest.mock('../../src/cookies', () => ({ setSessionCookie: jest.fn() }));
jest.mock('../../src/revocation', () => ({ primeTokenVersion: jest.fn() }));
jest.mock('bcryptjs', () => ({ hash: jest.fn() }));

const mockRes = () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
};

beforeEach(() => jest.clearAllMocks());

test('rejects an invalid username without hashing or touching the database', async () => {
    const res = mockRes();
    await register({ body: { username: 'no', password: 'longenough1' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(db.createUser).not.toHaveBeenCalled();
});

test('rejects a too-short password without touching the database', async () => {
    const res = mockRes();
    await register({ body: { username: 'ada', password: 'short' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(db.createUser).not.toHaveBeenCalled();
});

test('hashes the password, creates the user and issues a session', async () => {
    bcrypt.hash.mockResolvedValue('hashed');
    const user = { id: 'u1', username: 'ada', tokenVersion: 0 };
    db.createUser.mockResolvedValue(user);
    signSession.mockReturnValue('signed.jwt');
    const res = mockRes();

    await register({ body: { username: '  Ada  ', password: 'longenough1', next: '/board' } }, res);

    expect(bcrypt.hash).toHaveBeenCalledWith('longenough1', 12);
    expect(db.createUser).toHaveBeenCalledWith('ada', 'hashed');
    expect(primeTokenVersion).toHaveBeenCalledWith('u1', 0);
    expect(setSessionCookie).toHaveBeenCalledWith(res, 'signed.jwt');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 'u1', username: 'ada', next: '/board' });
});

test('reports a taken username as 409 without leaking password details', async () => {
    bcrypt.hash.mockResolvedValue('hashed');
    db.createUser.mockRejectedValue(new db.UsernameTakenError('ada'));
    const res = mockRes();

    await register({ body: { username: 'ada', password: 'longenough1' } }, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'cet identifiant existe déjà, veuillez en choisir un autre' });
});
