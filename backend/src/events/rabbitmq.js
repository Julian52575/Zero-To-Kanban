const amqp = require("amqplib");

const { RABBITMQ_USER, RABBITMQ_PASSWORD } = process.env;

let connection;
let channel;
let shuttingDown = false;
let reconnecting = false;

async function connectRabbitMQ(port = 5672) {
  connection = await amqp.connect(
    `amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@rabbitmq:${port}`,
  );
  
  channel = await connection.createChannel();
  
  await channel.assertExchange("events", "topic", { durable: true });

  console.log("Connected to RabbitMQ");

  connection.on("close", async () => {
    if (shuttingDown) return;
    console.error("RabbitMQ connection closed. Attempting to reconnect...");
    channel = undefined;
    connection = undefined;
    setTimeout(() => reconnectRabbitMQ(port), 5000);
  });

  connection.on("error", (err) => {
    console.error("RabbitMQ connection error:", err);
  });
}

async function reconnectRabbitMQ(port) {
  if (reconnecting || shuttingDown) return;
  reconnecting = true;
  try {
    console.log("Trying to reconnect to RabbitMQ...");
    await connectRabbitMQ(port);
    const { restartConsumers } = require("./eventBus");
    await restartConsumers();
    console.log("Reconnected to RabbitMQ and restarted consumers.");
    reconnecting = false;
  } catch (err) {
    console.error("Failed to reconnect to RabbitMQ:", err);
    reconnecting = false;
    setTimeout(() => reconnectRabbitMQ(port), 5000);
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
