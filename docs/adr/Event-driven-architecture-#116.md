# Event-driven architecture

- **Discussion:** [#116](https://github.com/Julian52575/Zero-To-Kanban/discussions/116)
- **Category:** Architecture Decision Records
- **Original poster:** @Antoineweisse
- **Opened:** 2026-09-14 21:11Z
- **Closed:** 2026-09-24 12:47Z

### Discussion

### Date

14/09/2026

### Context

The current application follows a traditional request-response architecture where business operations are handled synchronously from the API request to the database.

As the application grows, some actions need to trigger additional processing without coupling these operations directly to the original request.

For example, when a task is created, its status changes, or it is deleted, other parts of the application may need to react to these changes.

Directly calling these components from the task service would create strong coupling between features and make the application harder to evolve.

An event-driven architecture allows the application to publish events when important business actions occur. Consumers can then react to these events independently.

The architecture should also allow the messaging system to evolve without requiring changes throughout the application.

### Interrogation

Why use an event-driven architecture ?

It reduces coupling between business operations and the components that react to them. A task service only needs to publish an event instead of knowing which components need to process it.

### Options

#### Option 1 — Direct synchronous calls

The service directly calls every component that needs to react to an action.

**Advantages:**
- Simple to implement
- No additional infrastructure
- Easy to debug initially

**Disadvantages:**
- Strong coupling between components
- Adding a new consumer requires modifying existing services
- A failure in a secondary operation can affect the main operation
- Does not scale well as the number of event consumers increases

#### Option 2 — In-process Event Bus

An internal Event Bus is implemented directly inside the backend.

**Advantages:**
- Simple architecture
- No external infrastructure
- Easy to integrate with the existing Node.js application
- Good solution for small-scale event handling

**Disadvantages:**
- Events only exist inside the running backend process
- Events are lost if the process crashes
- Does not provide durable message storage
- Does not allow independent services to consume events
- Less suitable if the application is split into multiple services

#### Option 3 — RabbitMQ

RabbitMQ is used as an external message broker.

The backend publishes events to a topic exchange, and consumers subscribe to the events they are interested in.

**Advantages:**
- Message persistence
- Reliable delivery mechanisms
- Supports multiple independent consumers
- Consumers are decoupled from event producers
- Supports routing through exchanges and routing keys
- Consumers can be restarted independently
- Well suited to asynchronous application events
- Easy to run locally and in Docker

**Disadvantages:**
- Adds infrastructure and operational complexity
- Requires connection and reconnection management
- Requires monitoring of queues and messages
- More complex to debug than synchronous calls

#### Option 4 — Apache Kafka

Kafka could be used as the event broker.

**Advantages:**
- Very high throughput
- Persistent event log
- Strong support for large-scale distributed systems
- Consumers can replay events

**Disadvantages:**
- More complex to deploy and operate
- Designed primarily for high-throughput event streaming
- More infrastructure than required for the current application
- Overkill for the expected workload


### Decision

Accepted

### Branch

_No response_

### Justification

RabbitMQ provides the required level of reliability and decoupling while remaining simple enough for the current scale of the project.

Kafka would introduce unnecessary complexity for the current requirements, while an in-process Event Bus would not provide the durability and independence required from an external messaging system.

The EventBus abstraction also prevents RabbitMQ-specific code from spreading throughout the application.

**Proposed — Use an event-driven architecture with RabbitMQ as the message broker.**

The backend will publish business events through an abstraction layer (`EventBus`) rather than interacting directly with RabbitMQ throughout the application.

RabbitMQ will use a topic exchange to route events based on their event name.

For example:

```text
Task Service
     |
     | publish(task.status.changed)
     v
 RabbitMQ
     |
     +----> Task Status Consumer
     |
     +----> Notification Consumer
     |
     +----> Future Consumer

The current event types include:

task.created
task.status.changed
task.deleted

The EventBus abstraction will isolate the application from the messaging implementation, allowing RabbitMQ to be replaced by another broker in the future without requiring changes to business logic.

### Consequences -- Upside

- Business components are loosely coupled
- New event consumers can be added without modifying producers
- Events can be processed asynchronously
- RabbitMQ provides durable queues and message persistence
- Consumers can be restarted independently
- The architecture can evolve toward multiple services
- The messaging implementation can potentially be replaced in the future

### Consequences -- Trade-offs and risks

- RabbitMQ becomes an additional infrastructure dependency
- The application must handle connection failures and reconnections
- Event processing introduces asynchronous behavior
- Debugging becomes more complex
- Failed messages require an appropriate error-handling strategy
- RabbitMQ must be monitored and maintained

### Impact size

Medium -- days

### References

RabbitMQ documentation
Apache Kafka documentation
Event-driven architecture principles

---
## Comments

#### @Julian52575 -- 2026-09-24 12:28Z

/commit 43-61-merge-frontback

#### @Julian52575 -- 2026-09-24 12:30Z

@Antoineweisse Set Decision to "Accepted" and run the command

#### @Antoineweisse -- 2026-09-24 12:30Z

/commit 43-61-merge-frontback

#### @Julian52575 -- 2026-09-24 12:46Z

/commit 43-61-merge-frontback

