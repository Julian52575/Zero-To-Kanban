const amqp = require("amqplib");

// `||` rather than destructuring defaults: compose passes unset vars through
// as empty strings, which destructuring defaults would not replace.
const RABBITMQ_USER = process.env.RABBITMQ_USER || "guest";
const RABBITMQ_PASSWORD = process.env.RABBITMQ_PASSWORD || "guest";
const RABBITMQ_HOST = process.env.RABBITMQ_HOST || "localhost";
const RABBITMQ_PORT = process.env.RABBITMQ_PORT || 5672;

let connection;
let channel;
let shuttingDown = false;
let reconnecting = false;

async function connectRabbitMQ() {
  connection = await amqp.connect(
    `amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:${RABBITMQ_PORT}`,
  );

  channel = await connection.createConfirmChannel();

  await channel.assertExchange("events", "topic", { durable: true });

  console.log("Connected to RabbitMQ");

  connection.on("close", async () => {
    if (shuttingDown) return;
    console.error("RabbitMQ connection closed. Attempting to reconnect...");
    channel = undefined;
    connection = undefined;
    setTimeout(reconnectRabbitMQ, 5000);
  });

  connection.on("error", (err) => {
    console.error("RabbitMQ connection error:", err);
  });
}

async function reconnectRabbitMQ() {
  if (reconnecting || shuttingDown) return;
  reconnecting = true;
  try {
    console.log("Trying to reconnect to RabbitMQ...");
    await connectRabbitMQ();
    const { restartConsumers } = require("./eventBus");
    await restartConsumers();
    console.log("Reconnected to RabbitMQ and restarted consumers.");
    reconnecting = false;
  } catch (err) {
    console.error("Failed to reconnect to RabbitMQ:", err);
    reconnecting = false;
    setTimeout(reconnectRabbitMQ, 5000);
  }
}

async function closeRabbitMQ() {
  shuttingDown = true;
  if (channel) await channel.close();
  if (connection) await connection.close();
}

function getChannel() {
  if (!channel) {
    throw new Error("RabbitMQ is not connected");
  }

  return channel;
}

module.exports = {
  connectRabbitMQ,
  closeRabbitMQ,
  getChannel,
};
