const app = require("./app");
const db = require("./persistence");
const { connectRabbitMQ, closeRabbitMQ } = require("./events/rabbitmq");
const { startConsumeFor } = require("./events/eventBus");
const { EVENTS } = require("./events/events");

const PORT = 3000;
const RABBITMQ_PORT = 5672;

async function startServer() {
  try {
    await db.init();
    await connectRabbitMQ(RABBITMQ_PORT);

    await startConsumeFor(EVENTS.TASK_CREATED, async (data) => {
      console.log(
        `Handling event: ${EVENTS.TASK_CREATED} with data: ${JSON.stringify(data)}`,
      );
    });
    await startConsumeFor(EVENTS.TASK_STATUS_CHANGED, async (data) => {
      console.log(
        `Handling event: ${EVENTS.TASK_STATUS_CHANGED} with data: ${JSON.stringify(data)}`,
      );
    });
    await startConsumeFor(EVENTS.TASK_DELETED, async (data) => {
      console.log(
        `Handling event: ${EVENTS.TASK_DELETED} with data: ${JSON.stringify(data)}`,
      );
    });

    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

const gracefulShutdown = async () => {
  try {
    await closeRabbitMQ();
    await db.teardown();
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
process.on("SIGUSR2", gracefulShutdown);

startServer();
