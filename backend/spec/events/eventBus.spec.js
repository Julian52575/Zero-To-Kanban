jest.mock("../../src/events/rabbitmq", () => {
  const mockBindings = {};
  const mockConsumers = [];

  const mockChannel = {
    assertQueue: jest.fn(),
    bindQueue: jest.fn(async (queue, exchange, routingKey) => {
      mockBindings[queue] = routingKey;
    }),
    consume: jest.fn(async (queue, onMessage) => {
      mockConsumers.push({ routingKey: mockBindings[queue], onMessage });
    }),
    publish: jest.fn((exchange, routingKey, content) => {
      mockConsumers
        .filter((consumer) => consumer.routingKey === routingKey)
        .forEach((consumer) =>
          consumer.onMessage({ content, properties: { headers: {} } })
        );
    }),
    waitForConfirms: jest.fn(),
    ack: jest.fn(),
    sendToQueue: jest.fn(),
  };

  return {
    getChannel: jest.fn(() => mockChannel),
  };
});

jest.mock("../../src/persistence", () => {
  const mockTx = {
    processedEvent: {
      findUnique: jest.fn(async () => null),
      create: jest.fn(),
    },
  };

  return {
    prisma: {
      $transaction: jest.fn((callback) => callback(mockTx)),
    },
  };
});

const {
  publishEvent,
  startConsumeFor,
  restartConsumers,
} = require("../../src/events/eventBus");
const { getChannel } = require("../../src/events/rabbitmq");
const { prisma } = require("../../src/persistence");

const { EVENTS } = require("../../src/events/events");

describe("EventBus", () => {
  test("should publish and consume a TASK_CREATED event", async () => {
    const data = {
      taskId: "123",
      name: "Test task",
      completed: false,
    };

    const handler = jest.fn();

    const queueName = "test-task-created";

    await startConsumeFor(
      EVENTS.TASK_CREATED,
      handler,
      queueName
    );

    await publishEvent(
      EVENTS.TASK_CREATED,
      data
    );

    // Laisser le consumer traiter le message
    await new Promise((resolve) => setImmediate(resolve));

    expect(handler).toHaveBeenCalledWith(
      data,
      expect.any(String),
      expect.any(Object)
    );
  });
});

describe("EventBus error handling", () => {
  const channel = getChannel();

  const taskDeleted = { taskId: "123" };

  const envelope = (data, eventId = "5f0c9c1e-7c1f-4d8a-9a57-0b6f3c1d2e4f") =>
    Buffer.from(JSON.stringify({ eventId, data }));

  const message = (content, headers = {}) => ({
    content,
    properties: { headers },
  });

  // Registers a consumer and returns the callback amqplib would invoke.
  async function consumerFor(eventName, handler, queueName) {
    await startConsumeFor(eventName, handler, queueName);
    return channel.consume.mock.calls.at(-1)[1];
  }

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("derives the queue name and declares retry and dead-letter queues", async () => {
    await startConsumeFor(EVENTS.TASK_DELETED, jest.fn());

    expect(channel.bindQueue).toHaveBeenCalledWith(
      "task-deleted-v1",
      "events",
      EVENTS.TASK_DELETED
    );
    expect(channel.assertQueue).toHaveBeenCalledWith(
      "task-deleted-v1.retry.1",
      expect.objectContaining({
        arguments: expect.objectContaining({ "x-message-ttl": 5000 }),
      })
    );
    expect(channel.assertQueue).toHaveBeenCalledWith(
      "task-deleted-v1.retry.2",
      expect.objectContaining({
        arguments: expect.objectContaining({ "x-message-ttl": 30000 }),
      })
    );
    expect(channel.assertQueue).toHaveBeenCalledWith("task-deleted-v1.dlq", {
      durable: true,
    });
  });

  test("rejects publishing an event that has no schema", async () => {
    await expect(publishEvent("unknown.event.v1", {})).rejects.toThrow(
      "No schema defined for event unknown.event.v1"
    );
    expect(channel.publish).not.toHaveBeenCalled();
  });

  test("rejects publishing a payload that does not match the schema", async () => {
    await expect(
      publishEvent(EVENTS.TASK_DELETED, { taskId: 123 })
    ).rejects.toThrow(`Invalid payload for event ${EVENTS.TASK_DELETED}`);
    expect(channel.publish).not.toHaveBeenCalled();
  });

  test("ignores a null message", async () => {
    const onMessage = await consumerFor(EVENTS.TASK_DELETED, jest.fn(), "q-null");

    await onMessage(null);

    expect(channel.ack).not.toHaveBeenCalled();
    expect(channel.sendToQueue).not.toHaveBeenCalled();
  });

  test("skips an event that was already processed", async () => {
    const handler = jest.fn();
    const onMessage = await consumerFor(EVENTS.TASK_DELETED, handler, "q-dup");
    prisma.$transaction.mockImplementationOnce((callback) =>
      callback({
        processedEvent: {
          findUnique: jest.fn(async () => ({ eventId: "already" })),
          create: jest.fn(),
        },
      })
    );
    const msg = message(envelope(taskDeleted));

    await onMessage(msg);

    expect(handler).not.toHaveBeenCalled();
    expect(channel.ack).toHaveBeenCalledWith(msg);
  });

  test("sends an invalid envelope to the first retry queue", async () => {
    const handler = jest.fn();
    const onMessage = await consumerFor(EVENTS.TASK_DELETED, handler, "q-env");
    const msg = message(Buffer.from(JSON.stringify({ eventId: "not-a-uuid" })));

    await onMessage(msg);

    expect(handler).not.toHaveBeenCalled();
    expect(channel.sendToQueue).toHaveBeenCalledWith(
      "q-env.retry.1",
      msg.content,
      expect.objectContaining({ headers: { "x-retry-count": 1 } })
    );
    expect(channel.ack).toHaveBeenCalledWith(msg);
  });

  test("sends a failing event to the next retry queue", async () => {
    const handler = jest.fn(async () => {
      throw new Error("handler failed");
    });
    const onMessage = await consumerFor(EVENTS.TASK_DELETED, handler, "q-retry");
    const msg = message(envelope(taskDeleted), { "x-retry-count": 1 });

    await onMessage(msg);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(channel.sendToQueue).toHaveBeenCalledWith(
      "q-retry.retry.2",
      msg.content,
      expect.objectContaining({ headers: { "x-retry-count": 2 } })
    );
    expect(channel.ack).toHaveBeenCalledWith(msg);
  });

  test("treats a message without headers as a first failure", async () => {
    const onMessage = await consumerFor(EVENTS.TASK_DELETED, jest.fn(), "q-nohdr");
    const msg = { content: Buffer.from("not json"), properties: {} };

    await onMessage(msg);

    expect(channel.sendToQueue).toHaveBeenCalledWith(
      "q-nohdr.retry.1",
      msg.content,
      expect.objectContaining({ headers: { "x-retry-count": 1 } })
    );
    expect(channel.ack).toHaveBeenCalledWith(msg);
  });

  test("moves an event to the dead-letter queue once retries run out", async () => {
    const handler = jest.fn(async () => {
      throw new Error("handler failed");
    });
    const onMessage = await consumerFor(EVENTS.TASK_DELETED, handler, "q-dlq");
    const msg = message(envelope(taskDeleted), { "x-retry-count": 2 });

    await onMessage(msg);

    expect(channel.sendToQueue).toHaveBeenCalledWith(
      "q-dlq.dlq",
      msg.content,
      expect.objectContaining({
        headers: {
          "x-retry-count": 2,
          "x-original-event": EVENTS.TASK_DELETED,
          "x-dead-letter-reason": "max-retries-exceeded",
        },
      })
    );
    expect(channel.ack).toHaveBeenCalledWith(msg);
  });

  test("logs instead of throwing when re-queueing a failed event fails", async () => {
    const handler = jest.fn(async () => {
      throw new Error("handler failed");
    });
    const onMessage = await consumerFor(EVENTS.TASK_DELETED, handler, "q-broken");
    channel.waitForConfirms.mockRejectedValueOnce(new Error("channel closed"));
    const msg = message(envelope(taskDeleted));

    await expect(onMessage(msg)).resolves.toBeUndefined();

    expect(channel.ack).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      `Error handling retry for event ${EVENTS.TASK_DELETED}:`,
      expect.any(Error)
    );
  });

  test("restartConsumers re-creates every registered consumer", async () => {
    await startConsumeFor(EVENTS.PROJECT_DELETED, jest.fn(), "q-restart");
    channel.consume.mockClear();

    await restartConsumers();

    const queues = channel.consume.mock.calls.map(([queue]) => queue);
    expect(queues).toContain("q-restart");
    expect(queues).toContain("test-task-created");
  });
});
