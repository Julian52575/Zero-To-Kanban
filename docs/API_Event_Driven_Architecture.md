# API — Event-Driven Architecture

## Overview

The backend uses an event-driven architecture based on **RabbitMQ**.

The goal is to decouple business operations from the components that react to them. Instead of directly calling another service or component, the application publishes an event that can be consumed asynchronously.

The event flow is:

```text
Producer
   │
   │ publishEvent()
   ▼
RabbitMQ
   │
   │ topic exchange: events
   ▼
Consumer Queue
   │
   ├── success ──► ACK
   │
   └── error
        │
        ▼
     Retry #1
        │
        ▼
     Retry #2
        │
        ▼
       DLQ
```

---

# 1. EventBus

The application does not communicate directly with RabbitMQ from business logic.

Instead, it uses an `EventBus` abstraction:

```text
Application
    │
    ▼
 EventBus
    │
    ▼
 RabbitMQ
```

The main responsibilities of the EventBus are:

- Publishing events
- Consuming events
- Validating event payloads
- Handling retries
- Moving failed events to the DLQ
- Providing idempotent event processing

RabbitMQ-specific logic is isolated in the EventBus and RabbitMQ modules.

---

# 2. Event Structure

Events use versioned names.

Example:

```text
task.created.v1
task.updated.v1
task.status.updated.v1
task.deleted.v1
project.created.v1
project.updated.v1
project.deleted.v1
```

Each published message contains an envelope with ```eventId``` and ```data``` like this:

```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "taskId": "123",
    "projectId": "456",
    "name": "Implement login",
    "status": "TODO",
    "priority": 1,
    "deadline": null
  }
}
```

### `eventId`

`eventId` is a UUID generated when the event is published.

It uniquely identifies the event and is later used to prevent the same event from being processed multiple times.

### `data`

`data` contains the event-specific payload.

The payload is validated using a Zod schema before publication and again when the event is consumed.

---

# 3. Publishing an Event

An event is published using:

```js
await publishEvent(EVENTS.TASK_CREATED, {
  taskId: "123",
  projectId: "456",
  name: "Implement login",
  status: "TODO",
  priority: 1,
  deadline: null,
});
```

The `publishEvent()` function:

1. Retrieves the RabbitMQ channel.
2. Validates the payload against the event schema.
3. Generates a unique `eventId`.
4. Creates the event envelope.
5. Publishes the message to the `events` exchange.
6. Waits for the RabbitMQ publisher confirmation.

Example:

```js
const event = {
  eventId: uuidv4(),
  data: validatedData,
};

channel.publish(
  "events",
  eventName,
  Buffer.from(JSON.stringify(event)),
  {
    persistent: true,
    contentType: "application/json",
  }
);

await channel.waitForConfirms();
```

The RabbitMQ channel is a `ConfirmChannel`.

This ensures that the application does not consider the event successfully published before RabbitMQ confirms its reception.

---

# 4. RabbitMQ Exchange

All application events are published to a single topic exchange:

```text
events
```

The event name is used as the routing key.

For example:

```text
Exchange: events
Routing key: task.created.v1
```

Consumers bind their queues to the exchange using the event name.

Example:

```text
events
   │
   ├── task.created.v1 ──► task-created-v1
   │
   ├── task.updated.v1 ──► task-updated-v1
   │
   └── task.deleted.v1 ──► task-deleted-v1
```

This allows several consumers to subscribe to different events independently.

---

# 5. Consuming an Event

A consumer is registered using:

```js
await startConsumeFor(
  EVENTS.TASK_CREATED,
  handleTaskCreated,
  "task-created-v1"
);
```

The consumer:

1. Declares its queue.
2. Binds the queue to the `events` exchange.
3. Declares its retry queues.
4. Waits for messages.
5. Parses the event.
6. Validates the event envelope.
7. Validates the event payload.
8. Processes the event.
9. Sends an ACK if processing succeeds.

Example:

```js
await processEvent(eventName, event, handler);
channel.ack(msg);
```

If processing fails, the message is sent through the retry mechanism instead.

---

# 6. Event Processing and Idempotence

Events can potentially be delivered more than once.

To avoid applying the same event multiple times, processed events are stored in the database.

The application uses the following Prisma model:

```prisma
model ProcessedEvent {
  eventId     String   @id
  processedAt DateTime @default(now())
}
```

Before processing an event, the application checks whether its `eventId` already exists:

```js
const alreadyProcessed =
  await tx.processedEvent.findUnique({
    where: {
      eventId: event.eventId,
    },
  });
```

If it already exists, the event is ignored.

Otherwise, the handler and the `ProcessedEvent` insertion are executed inside the same Prisma transaction.

```text
RabbitMQ message
       │
       ▼
 Check eventId
       │
   ┌───┴────┐
   │        │
 exists    new
   │        │
   ▼        ▼
 skip    process
            │
            ▼
      save eventId
```

---

# 7. Event Versioning

Events are explicitly versioned.

Example:

```text
task.created.v1
```

The version is part of the event name.

## Non-breaking changes

If the payload can evolve without breaking existing consumers, the existing event version can continue to be used.

## Breaking changes

A breaking payload change requires a new event version.

Example:

```text
task.created.v1
task.created.v2
```

This allows old consumers to continue consuming `task.created.v1` while new consumers migrate to `task.created.v2`.

```text
Producer
   │
   ├── task.created.v1 ──► Consumer v1
   │
   └── task.created.v2 ──► Consumer v2
```

Event schemas are defined separately and associated with their event name.

```js
const EVENT_SCHEMAS = {
  [EVENTS.TASK_CREATED]: taskCreatedSchema,
};
```

---

# 8. Retry Mechanism

A failed event is not immediately moved to the DLQ.

The application uses two retry queues:

```text
task-created-v1.retry.1
task-created-v1.retry.2
```

The current retry delays are:

| Retry | Delay |
|---|---:|
| Retry 1 | 5 seconds |
| Retry 2 | 30 seconds |
| After Retry 2 | DLQ |

The retry queues use:

- Durable queues
- Message TTL
- Dead Letter Exchange (DLX)

Example:

```text
task-created-v1
       │
       │ processing error
       ▼
retry.1
       │
       │ TTL = 5s
       ▼
task-created-v1
       │
       │ processing error
       ▼
retry.2
       │
       │ TTL = 30s
       ▼
task-created-v1
       │
       │ processing error
       ▼
DLQ
```

---

# 9. Retry Counter

The retry count is stored in the message headers:

```text
x-retry-count
```

When a message fails, the counter is incremented:

```js
const nextRetryCount = retryCount + 1;
```

The message is then published to the corresponding retry queue.

For example:

```json
{
  "x-retry-count": 1
}
```

then:

```json
{
  "x-retry-count": 2
}
```

After the maximum number of retries has been reached, the event is moved to the DLQ.

---

# 10. Dead Letter Queue

Each event consumer has its own DLQ.

Example:

```text
task-created-v1.dlq
task-updated-v1.dlq
task-deleted-v1.dlq
project-created-v1.dlq
```

The DLQ stores events that could not be successfully processed after all retries.

Messages moved to the DLQ contain additional headers:

```text
x-retry-count
x-original-event
x-dead-letter-reason
```

Example:

```text
x-retry-count: 2
x-original-event: task.created.v1
x-dead-letter-reason: max-retries-exceeded
```

This makes it possible to identify why an event ended up in the DLQ.

---

# 11. ACK Strategy

Messages are acknowledged only after successful processing.

### Successful processing

```text
Consume
   │
   ▼
Process event
   │
   ▼
Database transaction succeeds
   │
   ▼
ACK
```

### Failed processing

```text
Consume
   │
   ▼
Process event
   │
   ▼
Error
   │
   ▼
Publish to retry/DLQ
   │
   ▼
RabbitMQ confirms publication
   │
   ▼
ACK original message
```

The original message is **not acknowledged before RabbitMQ confirms that the retry/DLQ message was successfully published**.

This prevents losing an event if RabbitMQ rejects the retry/DLQ publication.

---

# 12. Queue Structure

For a `task.created.v1` event, the RabbitMQ queues are:

```text
task-created-v1
task-created-v1.retry.1
task-created-v1.retry.2
task-created-v1.dlq
```

The same structure is used for the other events.

Example:

```text
project-created-v1
project-created-v1.retry.1
project-created-v1.retry.2
project-created-v1.dlq

task-created-v1
task-created-v1.retry.1
task-created-v1.retry.2
task-created-v1.dlq
```

All queues are durable.

---

# 13. Complete Event Lifecycle

A complete event lifecycle is:

```text
┌─────────────────┐
│ Business Logic  │
└────────┬────────┘
         │
         │ publishEvent()
         ▼
┌─────────────────┐
│     EventBus    │
│                 │
│ Zod validation  │
│ Generate UUID   │
└────────┬────────┘
         │
         │ publish
         ▼
┌─────────────────┐
│    RabbitMQ     │
│ events exchange │
└────────┬────────┘
         │
         │ routing key
         ▼
┌─────────────────┐
│ Consumer Queue  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Validate event  │
│ Check eventId   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Event Handler   │
│ Prisma tx       │
└────────┬────────┘
         │
     ┌───┴────┐
     │        │
   Success   Error
     │        │
     ▼        ▼
    ACK    Retry #1
              │
              ▼
           Retry #2
              │
              ▼
             DLQ
```

---

# 14. Error Handling Summary

| Situation | Behavior |
|---|---|
| Invalid payload during publication | Event is rejected |
| RabbitMQ publication fails | Event is not considered published |
| Consumer successfully processes event | Message is ACKed |
| Consumer processing fails | Message is sent to retry |
| Retry #1 fails | Message is sent to retry #2 |
| Retry #2 fails | Message is moved to DLQ |
| Retry/DLQ publication fails | Original message is not ACKed |
| Event already processed | Event is skipped |

---

# 15. Summary

The event-driven architecture provides:

- **Decoupling** between producers and consumers.
- **Asynchronous processing** through RabbitMQ.
- **Reliable publication** using publisher confirms.
- **Payload validation** using Zod.
- **Event versioning** through versioned event names.
- **Retry handling** with configurable delays.
- **Dead Letter Queues** for permanently failing events.
- **Idempotent processing** through `ProcessedEvent`.
- **Durable queues and persistent messages** for resilience.
- **RabbitMQ isolation** behind an EventBus abstraction.

The architecture can therefore evolve without tightly coupling business logic to individual event consumers or directly to RabbitMQ.
