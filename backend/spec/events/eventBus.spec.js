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
} = require("../../src/events/eventBus");

const { EVENTS } = require("../../src/events/events");

describe("EventBus", () => {
  test("should publish and consume a TASK_CREATED event", async () => {
    const data = {
      taskId: "123",
      projectId: "project-id",
      name: "Test task",
      status: "TODO",
      priority: 1,
      deadline: null,
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
