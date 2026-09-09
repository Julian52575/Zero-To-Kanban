const db = require('../../src/db');
const { signSession } = require('../../src/tokens');
const { setSessionCookie } = require('../../src/cookies');
const { primeTokenVersion } = require('../../src/revocation');
const login = require('../../src/routes/login');

jest.mock('../../src/db', () => ({ getOrCreateUser: jest.fn() }));
jest.mock('../../src/tokens', () => ({ signSession: jest.fn() }));
jest.mock('../../src/cookies', () => ({ setSessionCookie: jest.fn() }));
jest.mock('../../src/revocation', () => ({ primeTokenVersion: jest.fn() }));

const mockRes = () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
};

beforeEach(() => jest.clearAllMocks());

test('rejects an invalid username without touching the database', async () => {
    const res = mockRes();
    await login({ body: { username: 'no' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(db.getOrCreateUser).not.toHaveBeenCalled();
});

test('normalises the username and issues a session (get-or-create)', async () => {
    const user = { id: 'u1', username: 'ada', tokenVersion: 4 };
    db.getOrCreateUser.mockResolvedValue(user);
    signSession.mockReturnValue('signed.jwt');
    const res = mockRes();

    await login({ body: { username: '  Ada  ', next: '/board' } }, res);

    expect(db.getOrCreateUser).toHaveBeenCalledWith('ada');
    expect(primeTokenVersion).toHaveBeenCalledWith('u1', 4);
    expect(setSessionCookie).toHaveBeenCalledWith(res, 'signed.jwt');
    expect(res.json).toHaveBeenCalledWith({ id: 'u1', username: 'ada', next: '/board' });
});

test('drops an open-redirect next value back to "/"', async () => {
    db.getOrCreateUser.mockResolvedValue({ id: 'u1', username: 'ada', tokenVersion: 0 });
    signSession.mockReturnValue('jwt');
    const res = mockRes();

    await login({ body: { username: 'ada', next: '//evil.example' } }, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ next: '/' }));
});
