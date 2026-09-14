const { getChannel } = require("./rabbitmq");


const consumers = [];

async function publishEvent(eventName, data) {
  const channel = getChannel();

  channel.publish("events", eventName, Buffer.from(JSON.stringify(data)), {
    persistent: true,
    contentType: "application/json",
  });
  console.log(
    `Published event: ${eventName} with data: ${JSON.stringify(data)}`,
  );
}

async function startConsumeFor(eventName, handler, queueName) {
  queueName ??= eventName.replace(/\./g, "-");

  consumers.push({
    eventName,
    handler,
    queueName,
  });

  await createConsumer(eventName, handler, queueName);
}

async function createConsumer(eventName, handler, queueName) {
  const channel = getChannel();

  await channel.assertQueue(queueName, { durable: true });
  await channel.bindQueue(queueName, "events", eventName);

  await channel.consume(queueName, async (msg) => {
    if (!msg) return;

    try {
      const eventData = JSON.parse(msg.content.toString());

      await handler(eventData);

      channel.ack(msg);
    } catch (err) {
      console.error(`Error processing event ${eventName}:`, err);
      channel.nack(msg, false, false);
    }
  });

  console.log(`Started consuming event: ${eventName} from queue: ${queueName}`);
}

async function restartConsumers() {
  for (const consumer of consumers) {
    await createConsumer(
      consumer.eventName,
      consumer.handler,
      consumer.queueName
    );
  }
}

module.exports = {
  publishEvent,
  startConsumeFor,
  restartConsumers,
};
