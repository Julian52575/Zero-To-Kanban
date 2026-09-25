describe("rabbitmq", () => {
  let amqp;
  let rabbitmq;
  let connection;
  let channel;
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    jest.resetModules();

    channel = {
      assertExchange: jest.fn(),
      close: jest.fn(),
    };
    connection = {
      createConfirmChannel: jest.fn(async () => channel),
      on: jest.fn(),
      close: jest.fn(),
    };

    jest.doMock("amqplib", () => ({
      connect: jest.fn(async () => connection),
    }));
    jest.doMock("../../src/events/eventBus", () => ({
      restartConsumers: jest.fn(),
    }));

    process.env.RABBITMQ_USER = "user";
    process.env.RABBITMQ_PASSWORD = "password";
    process.env.RABBITMQ_HOST = "broker";
    process.env.RABBITMQ_PORT = "5673";

    amqp = require("amqplib");
    rabbitmq = require("../../src/events/rabbitmq");

    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  // The listener connectRabbitMQ registered on the connection for `event`.
  const listener = (event) =>
    connection.on.mock.calls.find(([name]) => name === event)[1];

  test("getChannel throws before a connection is made", () => {
    expect(() => rabbitmq.getChannel()).toThrow("RabbitMQ is not connected");
  });

  test("connects with the env credentials and declares the events exchange", async () => {
    await rabbitmq.connectRabbitMQ();

    expect(amqp.connect).toHaveBeenCalledWith(
      "amqp://user:password@broker:5673"
    );
    expect(connection.createConfirmChannel).toHaveBeenCalledTimes(1);
    expect(channel.assertExchange).toHaveBeenCalledWith("events", "topic", {
      durable: true,
    });
    expect(rabbitmq.getChannel()).toBe(channel);
  });

  test("defaults to localhost:5672 when host and port are not set", async () => {
    jest.resetModules();
    delete process.env.RABBITMQ_HOST;
    delete process.env.RABBITMQ_PORT;
    amqp = require("amqplib");
    rabbitmq = require("../../src/events/rabbitmq");

    await rabbitmq.connectRabbitMQ();

    expect(amqp.connect).toHaveBeenCalledWith(
      "amqp://user:password@localhost:5672"
    );
  });

  test("logs connection errors", async () => {
    await rabbitmq.connectRabbitMQ();
    const error = new Error("socket hang up");

    listener("error")(error);

    expect(console.error).toHaveBeenCalledWith(
      "RabbitMQ connection error:",
      error
    );
  });

  test("closeRabbitMQ closes the channel and the connection", async () => {
    await rabbitmq.connectRabbitMQ();

    await rabbitmq.closeRabbitMQ();

    expect(channel.close).toHaveBeenCalledTimes(1);
    expect(connection.close).toHaveBeenCalledTimes(1);
  });

  test("closeRabbitMQ is a no-op when never connected", async () => {
    await expect(rabbitmq.closeRabbitMQ()).resolves.toBeUndefined();

    expect(channel.close).not.toHaveBeenCalled();
    expect(connection.close).not.toHaveBeenCalled();
  });

  test("does not try to reconnect after a deliberate shutdown", async () => {
    jest.useFakeTimers();
    try {
      await rabbitmq.connectRabbitMQ();
      await rabbitmq.closeRabbitMQ();

      await listener("close")();
      jest.runOnlyPendingTimers();

      expect(amqp.connect).toHaveBeenCalledTimes(1);
      expect(console.error).not.toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });

  describe("when the connection drops", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test("reconnects after 5s and restarts the consumers", async () => {
      const { restartConsumers } = require("../../src/events/eventBus");
      await rabbitmq.connectRabbitMQ();

      await listener("close")();
      expect(() => rabbitmq.getChannel()).toThrow("RabbitMQ is not connected");

      await jest.advanceTimersByTimeAsync(5000);

      expect(amqp.connect).toHaveBeenCalledTimes(2);
      expect(restartConsumers).toHaveBeenCalledTimes(1);
      expect(rabbitmq.getChannel()).toBe(channel);
    });

    test("keeps retrying every 5s while the broker is unreachable", async () => {
      await rabbitmq.connectRabbitMQ();
      amqp.connect.mockRejectedValueOnce(new Error("ECONNREFUSED"));

      await listener("close")();
      await jest.advanceTimersByTimeAsync(5000);

      expect(amqp.connect).toHaveBeenCalledTimes(2);
      expect(console.error).toHaveBeenCalledWith(
        "Failed to reconnect to RabbitMQ:",
        expect.any(Error)
      );

      await jest.advanceTimersByTimeAsync(5000);

      expect(amqp.connect).toHaveBeenCalledTimes(3);
      expect(rabbitmq.getChannel()).toBe(channel);
    });

    test("does not start a second reconnect while one is in progress", async () => {
      await rabbitmq.connectRabbitMQ();
      let finishConnect;
      amqp.connect.mockImplementationOnce(
        () => new Promise((resolve) => (finishConnect = resolve))
      );

      await listener("close")();
      await listener("close")();
      await jest.advanceTimersByTimeAsync(5000);

      expect(amqp.connect).toHaveBeenCalledTimes(2);

      finishConnect(connection);
      await jest.advanceTimersByTimeAsync(0);
    });
  });
});
