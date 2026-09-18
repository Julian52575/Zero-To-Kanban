const bcrypt = require('bcryptjs');
const db = require('../../src/db');
const { signSession } = require('../../src/tokens');
const { setSessionCookie } = require('../../src/cookies');
const { primeTokenVersion } = require('../../src/revocation');
const login = require('../../src/routes/login');

jest.mock('../../src/db', () => ({ findUserByUsername: jest.fn() }));
jest.mock('../../src/tokens', () => ({ signSession: jest.fn() }));
jest.mock('../../src/cookies', () => ({ setSessionCookie: jest.fn() }));
jest.mock('../../src/revocation', () => ({ primeTokenVersion: jest.fn() }));
jest.mock('bcryptjs', () => ({ compare: jest.fn() }));

const mockRes = () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
};

beforeEach(() => jest.clearAllMocks());

test('rejects an invalid username without touching the database', async () => {
    const res = mockRes();
    await login({ body: { username: 'no', password: 'whatever1' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(db.findUserByUsername).not.toHaveBeenCalled();
});

test('rejects a missing password without touching the database', async () => {
    const res = mockRes();
    await login({ body: { username: 'ada' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(db.findUserByUsername).not.toHaveBeenCalled();
});

test('normalises the username, checks the password and issues a session', async () => {
    const user = { id: 'u1', username: 'ada', passwordHash: 'hash', tokenVersion: 4 };
    db.findUserByUsername.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(true);
    signSession.mockReturnValue('signed.jwt');
    const res = mockRes();

    await login({ body: { username: '  Ada  ', password: 'correct-horse', next: '/board' } }, res);

    expect(db.findUserByUsername).toHaveBeenCalledWith('ada');
    expect(bcrypt.compare).toHaveBeenCalledWith('correct-horse', 'hash');
    expect(primeTokenVersion).toHaveBeenCalledWith('u1', 4);
    expect(setSessionCookie).toHaveBeenCalledWith(res, 'signed.jwt');
    expect(res.json).toHaveBeenCalledWith({ id: 'u1', username: 'ada', next: '/board' });
});

test('rejects an unknown username with the generic credentials error', async () => {
    db.findUserByUsername.mockResolvedValue(null);
    bcrypt.compare.mockResolvedValue(false);
    const res = mockRes();

    await login({ body: { username: 'ghost', password: 'whatever1' } }, res);

    // Still runs bcrypt.compare against a dummy hash -- no timing shortcut.
    expect(bcrypt.compare).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'identifiant ou mot de passe incorrect' });
});

test('rejects a wrong password with the same generic error', async () => {
    db.findUserByUsername.mockResolvedValue({ id: 'u1', username: 'ada', passwordHash: 'hash', tokenVersion: 0 });
    bcrypt.compare.mockResolvedValue(false);
    const res = mockRes();

    await login({ body: { username: 'ada', password: 'wrong' } }, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'identifiant ou mot de passe incorrect' });
});

test('drops an open-redirect next value back to "/"', async () => {
    db.findUserByUsername.mockResolvedValue({ id: 'u1', username: 'ada', passwordHash: 'hash', tokenVersion: 0 });
    bcrypt.compare.mockResolvedValue(true);
    signSession.mockReturnValue('jwt');
    const res = mockRes();

    await login({ body: { username: 'ada', password: 'correct-horse', next: '//evil.example' } }, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ next: '/' }));
});
