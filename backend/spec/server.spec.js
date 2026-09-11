describe('server', () => {
    let app;
    let db;
    let exitSpy;

    const flush = () => new Promise((resolve) => setImmediate(resolve));

    beforeEach(() => {
        jest.resetModules();

        jest.doMock('../src/app', () => ({ listen: jest.fn() }));
        jest.doMock('../src/persistence', () => ({
            init: jest.fn(),
            teardown: jest.fn(),
        }));

        exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        process.removeAllListeners('SIGINT');
        process.removeAllListeners('SIGTERM');
        process.removeAllListeners('SIGUSR2');
        jest.restoreAllMocks();
    });

    test('starts listening once the database is initialized', async () => {
        db = require('../src/persistence');
        db.init.mockResolvedValue();
        app = require('../src/app');

        require('../src/server');
        await flush();

        expect(app.listen).toHaveBeenCalledWith(3000, expect.any(Function));

        app.listen.mock.calls[0][1]();
        expect(console.log).toHaveBeenCalledWith('Listening on port 3000');
    });

    test('exits with code 1 when database initialization fails', async () => {
        db = require('../src/persistence');
        const error = new Error('connection failed');
        db.init.mockRejectedValue(error);

        require('../src/server');
        await flush();

        expect(console.error).toHaveBeenCalledWith(error);
        expect(exitSpy).toHaveBeenCalledWith(1);
    });

    test('tears down the database and exits on SIGINT', async () => {
        db = require('../src/persistence');
        db.init.mockResolvedValue();
        db.teardown.mockResolvedValue();

        require('../src/server');
        await flush();

        process.emit('SIGINT');
        await flush();

        expect(db.teardown).toHaveBeenCalledTimes(1);
        expect(exitSpy).toHaveBeenCalledTimes(1);
    });

    test('still exits on SIGTERM even if teardown rejects', async () => {
        db = require('../src/persistence');
        db.init.mockResolvedValue();
        db.teardown.mockRejectedValue(new Error('disconnect failed'));

        require('../src/server');
        await flush();

        process.emit('SIGTERM');
        await flush();

        expect(db.teardown).toHaveBeenCalledTimes(1);
        expect(exitSpy).toHaveBeenCalledTimes(1);
    });

    test('tears down the database and exits on SIGUSR2', async () => {
        db = require('../src/persistence');
        db.init.mockResolvedValue();
        db.teardown.mockResolvedValue();

        require('../src/server');
        await flush();

        process.emit('SIGUSR2');
        await flush();

        expect(db.teardown).toHaveBeenCalledTimes(1);
        expect(exitSpy).toHaveBeenCalledTimes(1);
    });
});
