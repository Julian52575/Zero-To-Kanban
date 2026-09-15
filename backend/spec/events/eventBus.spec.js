const {
  connectRabbitMQ,
  closeRabbitMQ,
} = require("../../src/events/rabbitmq");

const {
  publishEvent,
  startConsumeFor,
} = require("../../src/events/eventBus");

const { EVENTS } = require("../../src/events/events");

describe("EventBus", () => {
  beforeAll(async () => {
    await connectRabbitMQ(5672);
  });

  afterAll(async () => {
    await closeRabbitMQ();
  });

  test("should publish and consume a TASK_CREATED event", async () => {
    const data = {
      taskId: 123,
      name: "Test task",
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

    // Laisser RabbitMQ transmettre le message
    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(handler).toHaveBeenCalledWith(data);
  });
});