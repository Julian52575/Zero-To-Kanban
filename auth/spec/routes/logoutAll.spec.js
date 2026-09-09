const db = require('../../src/db');
const { primeTokenVersion } = require('../../src/revocation');
const { clearSessionCookie } = require('../../src/cookies');
const logoutAll = require('../../src/routes/logoutAll');

jest.mock('../../src/db', () => ({ bumpTokenVersion: jest.fn() }));
jest.mock('../../src/revocation', () => ({ primeTokenVersion: jest.fn() }));
jest.mock('../../src/cookies', () => ({ clearSessionCookie: jest.fn() }));

beforeEach(() => jest.clearAllMocks());

test('bumps the token version, primes the cache, clears the cookie', async () => {
    db.bumpTokenVersion.mockResolvedValue(5);
    const res = { sendStatus: jest.fn() };

    await logoutAll({ user: { id: 'u1' } }, res);

    expect(db.bumpTokenVersion).toHaveBeenCalledWith('u1');
    expect(primeTokenVersion).toHaveBeenCalledWith('u1', 5);
    expect(clearSessionCookie).toHaveBeenCalledWith(res);
    expect(res.sendStatus).toHaveBeenCalledWith(204);
});
