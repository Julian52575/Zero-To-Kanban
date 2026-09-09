const requireUser = require('../../src/middleware/requireUser');

const mockRes = () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
};

test('rejects a request with no identity header', () => {
    const res = mockRes();
    const next = jest.fn();

    requireUser({ get: () => undefined }, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
});

test('attaches req.userId / req.userName and calls next when present', () => {
    const headers = {
        'X-Auth-User-Id': 'user-1',
        'X-Auth-User-Name': 'ada',
    };
    const req = { get: (name) => headers[name] };
    const res = mockRes();
    const next = jest.fn();

    requireUser(req, res, next);

    expect(req.userId).toBe('user-1');
    expect(req.userName).toBe('ada');
    expect(next).toHaveBeenCalledTimes(1);
});
