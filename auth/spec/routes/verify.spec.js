const { verifySession } = require('../../src/tokens');
const { currentTokenVersion } = require('../../src/revocation');
const verify = require('../../src/routes/verify');

jest.mock('../../src/tokens', () => ({ verifySession: jest.fn() }));
jest.mock('../../src/revocation', () => ({ currentTokenVersion: jest.fn() }));

const mockRes = () => {
    const res = {};
    res.set = jest.fn(() => res);
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    res.sendStatus = jest.fn(() => res);
    res.redirect = jest.fn(() => res);
    return res;
};

const mockReq = ({ cookies = {}, headers = {} } = {}) => ({
    cookies,
    get: (name) => headers[name.toLowerCase()],
});

beforeEach(() => jest.clearAllMocks());

test('200 + identity headers for a valid, non-revoked session', async () => {
    verifySession.mockReturnValue({ sub: 'u1', username: 'ada', ver: 2 });
    currentTokenVersion.mockResolvedValue(2);
    const res = mockRes();

    await verify(mockReq({ cookies: { session: 'token' } }), res);

    expect(res.set).toHaveBeenCalledWith('X-Auth-User-Id', 'u1');
    expect(res.set).toHaveBeenCalledWith('X-Auth-User-Name', 'ada');
    expect(res.sendStatus).toHaveBeenCalledWith(200);
});

test('401 JSON when the token version is stale (revoked session)', async () => {
    verifySession.mockReturnValue({ sub: 'u1', username: 'ada', ver: 1 });
    currentTokenVersion.mockResolvedValue(2);
    const res = mockRes();

    await verify(
        mockReq({ cookies: { session: 'token' }, headers: { accept: 'application/json' } }),
        res,
    );

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.set).not.toHaveBeenCalledWith('X-Auth-User-Id', expect.anything());
});

test('302 to an absolute /login on the public origin for a browser navigation', async () => {
    verifySession.mockReturnValue(null);
    const res = mockRes();

    await verify(
        mockReq({
            headers: {
                accept: 'text/html',
                'x-forwarded-uri': '/board',
                'x-forwarded-proto': 'http',
                'x-forwarded-host': 'localhost:8000',
                host: 'auth:4000',
            },
        }),
        res,
    );

    expect(res.redirect).toHaveBeenCalledWith(
        302,
        'http://localhost:8000/login?next=%2Fboard',
    );
});

test('falls back to a relative /login when no forwarded/host headers are present', async () => {
    verifySession.mockReturnValue(null);
    const res = mockRes();

    await verify(mockReq({ headers: { accept: 'text/html', 'x-forwarded-uri': '/' } }), res);

    expect(res.redirect).toHaveBeenCalledWith(302, '/login?next=%2F');
});

test('401 for an unauthenticated API/XHR call', async () => {
    verifySession.mockReturnValue(null);
    const res = mockRes();

    await verify(mockReq({ headers: { accept: 'application/json' } }), res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.redirect).not.toHaveBeenCalled();
});

test('unknown user (version null) is treated as unauthenticated', async () => {
    verifySession.mockReturnValue({ sub: 'ghost', username: 'ghost', ver: 0 });
    currentTokenVersion.mockResolvedValue(null);
    const res = mockRes();

    await verify(mockReq({ cookies: { session: 'token' } }), res);

    expect(res.status).toHaveBeenCalledWith(401);
});
