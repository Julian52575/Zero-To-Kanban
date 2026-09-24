jest.mock("../../src/events/rabbitmq", () => ({
  getChannel: jest.fn(),
}));

jest.mock("../../src/persistence", () => ({
  prisma: {
    $transaction: jest.fn(async (callback) => {
      const tx = {
        processedEvent: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({}),
        },
      };

      return callback(tx);
    }),
  },
}));

jest.mock("uuid", () => ({
  v4: jest.fn(() => "123e4567-e89b-12d3-a456-426614174000"),
}));

const { getChannel } = require("../../src/events/rabbitmq");

const {
  publishEvent,
  startConsumeFor,
} = require("../../src/events/eventBus");

const { EVENTS } = require("../../src/events/events");

describe("EventBus", () => {
  let channel;
  let consumeHandler;

  beforeEach(() => {
    consumeHandler = null;

    channel = {
      assertQueue: jest.fn().mockResolvedValue({}),
      bindQueue: jest.fn().mockResolvedValue({}),

      consume: jest.fn().mockImplementation(async (queueName, handler) => {
        consumeHandler = handler;
      }),

      publish: jest.fn(),
      sendToQueue: jest.fn(),

      ack: jest.fn(),

      waitForConfirms: jest.fn().mockResolvedValue({}),
    };

    getChannel.mockReturnValue(channel);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should publish and consume a TASK_CREATED event", async () => {
    const data = {
      taskId: "task-123",
      projectId: "project-123",
      name: "Test task",
      status: "TODO",
      priority: 1,
      deadline: null,
    };

    const handler = jest.fn().mockResolvedValue(undefined);

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

    const publishedMessage = channel.publish.mock.calls[0][2];

    await consumeHandler({
      content: publishedMessage,
      properties: {
        headers: {},
      },
    });

    expect(handler).toHaveBeenCalledWith(
      data,
      "123e4567-e89b-12d3-a456-426614174000",
      expect.any(Object)
    );
  });
});