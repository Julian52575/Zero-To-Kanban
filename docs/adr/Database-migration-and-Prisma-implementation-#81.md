# Database migration and Prisma implementation

- **Discussion:** [#81](https://github.com/Julian52575/Zero-To-Kanban/discussions/81)
- **Category:** Architecture Decision Records
- **Original poster:** @Sachet2Plastik
- **Opened:** 2026-09-08 14:03Z
- **Closed:** 2026-09-24 12:46Z

### Discussion

### Date

2026-09-08

### Context

<html>
<body>
<html><head></head><body><h1>Database Technology Comparison</h1><h2>1. Introduction</h2><p>The original application uses a legacy database setup. As part of the restructuring of the project, we are evaluating different database technologies and considering the use of <strong>Prisma</strong> to improve database access and maintainability.</p><p>The objective is not only to replace the existing database, but also to understand the differences between several database models and determine which solution is best suited for the application.</p><p>The technologies considered are:</p><ul><li><p><strong>MySQL</strong> — the existing relational database technology</p></li><li><p><strong>SQLite</strong> — the existing lightweight relational database technology</p></li><li><p><strong>PostgreSQL</strong> — a modern relational database considered for the migration</p></li><li><p><strong>NoSQL databases</strong> — a fundamentally different database approach used as a comparison</p></li></ul>

## Relational vs Non-Relational Databases

Databases can generally be divided into two broad categories: **relational databases** and **non-relational (NoSQL) databases**. They differ mainly in how they structure, store, and retrieve data.

## Relational Databases

Relational databases organize data into **tables** composed of rows and columns.

For example, a TODO application could have separate `users` and `tasks` tables:

```text
Users
+----+----------+
| id | username |
+----+----------+
| 1  | Alice    |
| 2  | Bob      |
+----+----------+

Tasks
+----+---------+----------------+
| id | user_id | title          |
+----+---------+----------------+
| 1  | 1       | Buy milk       |
| 2  | 1       | Finish project |
| 3  | 2       | Study          |
+----+---------+----------------+
```

The `user_id` column creates a relationship between the two tables. This is why these databases are called **relational databases**.

Relational databases generally use **SQL (Structured Query Language)** to create, modify and retrieve data.

### Advantages

* **Structured data:** Tables provide a clearly defined structure for the data.
* **Relationships:** Foreign keys allow relationships between different entities to be explicitly represented.
* **Data integrity:** Constraints can prevent invalid or inconsistent data.
* **Transactions:** Multiple operations can be grouped into a transaction, ensuring that either all operations succeed or none of them are applied.
* **Powerful queries:** SQL allows data from multiple tables to be combined using operations such as `JOIN`.

### Disadvantages

* **Rigid schema:** Changing the structure of a table can require a schema migration.
* **Complex relationships:** Queries involving many tables can become complex.
* **Scaling:** Scaling relational databases horizontally can require additional infrastructure and architectural considerations.
* **Potentially unnecessary complexity:** For very simple applications, a full relational database server may provide more functionality than necessary.

---

## Non-Relational Databases

Non-relational databases, commonly called **NoSQL databases**, do not primarily organize data into tables with predefined relationships.

Instead, they use different data models depending on the type of database. Common models include:

* **Document databases**
* **Key-value databases**
* **Column-oriented databases**
* **Graph databases**

For example, a document-oriented database could store a user and their tasks together in a single document:

```json
{
  "id": "user-123",
  "username": "Alice",
  "tasks": [
    {
      "title": "Buy milk",
      "completed": false
    },
    {
      "title": "Finish project",
      "completed": true
    }
  ]
}
```

Instead of storing the user and their tasks in separate tables connected by a foreign key, related data can be stored together.

### Advantages

* **Flexible schema:** Documents do not necessarily need to have exactly the same structure. New fields can often be added without modifying a predefined table schema.
* **Natural representation of hierarchical data:** Nested objects and collections can be stored directly inside a document.
* **Scalability:** Many NoSQL systems are designed with horizontal scaling in mind, allowing additional servers to be added as the amount of data or traffic increases.
* **Performance for specific workloads:** When the data model and queries match the database's structure, retrieving an entire document or key-value entry can be very efficient.
* **Different specialized models:** NoSQL is not limited to one model. Graph databases, for example, are particularly suited to highly connected data.

### Disadvantages

* **Less standardized:** Unlike relational databases, there is no single query language or data model shared by all NoSQL databases.
* **Relationships can be more difficult:** Data that naturally belongs in separate but related entities may require references, application-side joins, or data duplication.
* **Data duplication:** Storing related data together can result in the same information being duplicated across multiple documents.
* **Consistency depends on the database:** The available transaction and consistency guarantees vary significantly between NoSQL systems.
* **Flexible schema can become a disadvantage:** Although schema flexibility makes evolution easier, it can also allow inconsistent data structures if the application does not enforce its own rules.

---

## Main Differences

|                    | Relational                        | Non-Relational                                        |
| ------------------ | --------------------------------- | ----------------------------------------------------- |
| Data structure     | Tables, rows and columns          | Documents, key-value pairs, graphs, etc.              |
| Schema             | Usually predefined                | Often more flexible                                   |
| Relationships      | Native concept through keys       | Usually handled differently depending on the database |
| Query language     | SQL                               | Depends on the database                               |
| Data integrity     | Strong database-level constraints | Depends on the database and application               |
| Transactions       | Strong support                    | Varies depending on the database                      |
| Data duplication   | Generally minimized               | Can be used intentionally for performance             |
| Horizontal scaling | Possible, but can be more complex | Common design goal for many NoSQL systems             |
| Best suited for    | Structured, interconnected data   | Flexible or specialized data models                   |

## Example in the TODO Application

The difference becomes clearer when considering how the same application could be modeled.

### Relational approach

```text
User
 |
 | 1:N
 v
Task
```

The database would contain separate `User` and `Task` tables, with `Task.user_id` referencing `User.id`.

This is useful when users and tasks need to be queried independently or when many different entities are related to each other.

### Non-relational approach

```text
User Document
 |
 +-- Profile
 |
 +-- Task
 |
 +-- Task
 |
 +-- Task
```

The user's tasks could instead be embedded directly inside their document.

This can make retrieving a user's complete information very straightforward, but it can become less convenient if tasks need to be queried independently or shared between multiple entities.

## Which Approach to Choose?

Neither approach is universally better.

A **relational database** is generally a good choice when:

* The data has clear relationships.
* Data integrity is important.
* The schema is relatively structured.
* Complex queries between entities are required.
* Transactions are important.

A **non-relational database** can be advantageous when:

* The structure of the data changes frequently.
* Data is naturally represented as documents or other NoSQL models.
* Very large-scale horizontal scaling is a requirement.
* The application's access patterns benefit from storing related data together.
* A specialized database model, such as a graph database, is more appropriate than a relational model.

For the TODO application, the data is relatively structured and contains straightforward relationships between entities such as users and tasks. Therefore, a **relational database is a natural fit**, while a NoSQL database would primarily serve as an alternative if the application's requirements changed significantly.

</body>
</html>

### Options

<html>
<body>
<hr><h1>3. MySQL</h1><h2>Overview</h2><p><strong>MySQL</strong> is a relational database management system based on SQL. It is widely used for web applications and has been a common choice for many years.</p><p>In the legacy application, MySQL represents a traditional server-based relational database architecture.</p><h2>Advantages</h2><h3>Mature and widely used</h3><p>MySQL has existed for many years and has a large ecosystem.</p><p>This means there are many:</p><ul><li><p>Tutorials</p></li><li><p>Libraries</p></li><li><p>Hosting providers</p></li><li><p>Administration tools</p></li><li><p>Developers familiar with it</p></li></ul><h3>Good performance</h3><p>MySQL can handle a large number of queries and is suitable for applications ranging from small websites to large production systems.</p><h3>Relational model</h3><p>The relational model works well for a TODO application because the data naturally contains relationships.</p><p>For example:</p><pre><code class="language-text">User
 |
 +---- Task
 |
 +---- Task
 |
 +---- Task
</code></pre><p>A task can belong to a user through a foreign key.</p><h2>Disadvantages</h2><h3>Requires a database server</h3><p>Unlike SQLite, MySQL normally requires a separate database server process.</p><p>This adds some infrastructure to the project:</p><pre><code class="language-text">Application
     |
     v
 MySQL Server
     |
     v
   Storage
</code></pre><p>This can make development and deployment more complicated for a small application.</p><h3>Configuration</h3><p>A MySQL installation generally requires configuration such as:</p><ul><li><p>Database creation</p></li><li><p>User accounts</p></li><li><p>Passwords</p></li><li><p>Permissions</p></li><li><p>Connection configuration</p></li></ul><p>This can be unnecessary overhead for a very small application.</p><h2>Suitability for the project</h2><p>MySQL is a reasonable choice for the application, especially if the existing system already relies on it.</p><p>However, if the objective is to modernize the application rather than simply preserve the existing architecture, other options may provide advantages.</p><hr><h1>4. SQLite</h1><h2>Overview</h2><p><strong>SQLite</strong> is also a relational database, but it is fundamentally different from MySQL in how it is deployed.</p><p>SQLite is an <strong>embedded database</strong>. Instead of running a separate database server, the database is generally stored directly in a file.</p><p>For example:</p><pre><code class="language-text">Application
     |
     v
database.sqlite
</code></pre><p>The application accesses the database directly.</p><h2>Advantages</h2><h3>Extremely simple deployment</h3><p>There is no database server to install or configure.</p><p>The database can simply be a file:</p><pre><code class="language-text">data/
    database.sqlite
</code></pre><p>This makes SQLite particularly convenient for:</p><ul><li><p>Small applications</p></li><li><p>Local applications</p></li><li><p>Development</p></li><li><p>Tests</p></li><li><p>Prototypes</p></li></ul><h3>Lightweight</h3><p>SQLite has very little infrastructure overhead.</p><p>A small TODO application does not necessarily need a dedicated database server.</p><h3>Still relational</h3><p>Despite being lightweight, SQLite still provides:</p><ul><li><p>Tables</p></li><li><p>SQL</p></li><li><p>Primary keys</p></li><li><p>Foreign keys</p></li><li><p>Transactions</p></li><li><p>Constraints</p></li></ul><p>Therefore, migrating from another relational database to SQLite does not require changing the application's fundamental data model.</p><h2>Disadvantages</h2><h3>Concurrency limitations</h3><p>SQLite is designed around a file-based architecture.</p><p>This can become a limitation when many clients attempt to write to the database simultaneously.</p><p>A server-based database such as PostgreSQL or MySQL is generally better suited to applications with a high level of concurrent database activity.</p><h3>Scaling</h3><p>SQLite is excellent for small applications but becomes less attractive when the application needs:</p><ul><li><p>Many simultaneous users</p></li><li><p>Large-scale deployments</p></li><li><p>Multiple application servers</p></li><li><p>Advanced database infrastructure</p></li></ul><h2>Suitability for the project</h2><p>SQLite is a very attractive option for a small TODO application because of its simplicity.</p><p>However, if the goal is to move toward an architecture suitable for a larger production web application, PostgreSQL provides more room for future growth.</p><hr><h1>5. PostgreSQL</h1><h2>Overview</h2><p><strong>PostgreSQL</strong> is an open-source relational database management system.</p><p>Like MySQL, it uses a client/server architecture:</p><pre><code class="language-text">Application
     |
     v
PostgreSQL Server
     |
     v
   Storage
</code></pre><p>It is known for strong SQL support, data integrity and advanced database features.</p><h2>Advantages</h2><h3>Strong relational model</h3><p>PostgreSQL provides extensive support for:</p><ul><li><p>Foreign keys</p></li><li><p>Constraints</p></li><li><p>Transactions</p></li><li><p>Complex queries</p></li><li><p>Indexes</p></li><li><p>Views</p></li><li><p>Advanced data types</p></li></ul><p>This makes it well suited to applications containing relationships between entities.</p><h3>Data integrity</h3><p>PostgreSQL provides mechanisms that help prevent invalid data from entering the database.</p><p>For example, a foreign key can ensure that a task cannot reference a user that does not exist.</p><pre><code class="language-text">User
  |
  | 1
  |
  | *
  v
Task
</code></pre><p>This is particularly useful when restructuring legacy code because constraints can move part of the responsibility for maintaining data consistency from the application into the database itself.</p><h3>Good scalability</h3><p>PostgreSQL can support applications considerably larger than a simple TODO application.</p><p>Using it therefore avoids choosing a technology that may need to be replaced again if the project grows.</p><h3>Prisma support</h3><p>PostgreSQL is well supported by Prisma.</p><p>Prisma can generate a type-safe interface for interacting with the database based on the application's schema.</p><p>For example, instead of manually writing SQL queries throughout the application, the application can work with a generated Prisma Client.</p><hr><h1>6. NoSQL</h1><h2>Overview</h2><p>NoSQL databases represent a fundamentally different approach from relational databases.</p><p>Instead of organizing information primarily into tables and relationships, NoSQL databases can store data using models such as:</p><ul><li><p>Documents</p></li><li><p>Key-value pairs</p></li><li><p>Graphs</p></li><li><p>Wide-column structures</p></li></ul><p>A common example is a <strong>document database</strong>.</p><p>A TODO application could represent a user and their tasks as a document:</p><pre><code class="language-json">{
  "id": "user-123",
  "username": "Alice",
  "tasks": [
    {
      "title": "Buy milk",
      "completed": false
    },
    {
      "title": "Finish project",
      "completed": true
    }
  ]
}
</code></pre><p>This is very different from the relational model:</p><pre><code class="language-text">Users
  |
  +---- Tasks
  |
  +---- Tasks
</code></pre><p>The tasks can instead be embedded directly inside the user's document.</p><h2>Advantages</h2><h3>Flexible schema</h3><p>NoSQL databases often allow documents with different structures.</p><p>For example:</p><pre><code class="language-json">{
  "title": "Buy milk",
  "completed": false
}
</code></pre><p>and:</p><pre><code class="language-json">{
  "title": "Finish project",
  "completed": true,
  "priority": "high",
  "tags": ["school", "important"]
}
</code></pre><p>can potentially coexist without requiring a traditional table schema migration.</p><p>This can be useful when the structure of the data changes frequently.</p><h3>Natural representation of hierarchical data</h3><p>Data that naturally forms nested structures can sometimes be represented more directly.</p><p>For example:</p><pre><code class="language-text">User
 ├── Profile
 ├── Preferences
 └── Tasks
      ├── Task
      ├── Task
      └── Task
</code></pre><p>can be represented as a single document.</p><h2>Disadvantages</h2><h3>Relationships are less natural</h3><p>The TODO application has relationships between entities such as users and tasks.</p><p>In a relational database, this is straightforward:</p><pre><code class="language-text">users.id
    ^
    |
tasks.user_id
</code></pre><p>In a document database, the application may instead need to embed the data or manually maintain references.</p><p>This can make certain operations more complicated.</p><h3>Data duplication</h3><p>Embedding data can result in duplication.</p><p>For example, if information about a user is stored inside many documents, changing that information may require updating multiple documents.</p><h3>Less suitable for strongly structured data</h3><p>When an application has a relatively stable schema and many relationships between entities, a relational database is often a more natural fit.</p><h2>Suitability for the project</h2><p>NoSQL could be used for the TODO application, but it would introduce a substantially different data model without providing an obvious advantage for this particular application.</p><p>It is therefore useful as a comparison, but it does not appear to be the most natural choice for the current project.</p><hr><h1>7. Comparison</h1>

| Feature | MySQL | SQLite | PostgreSQL | NoSQL |
| -------- | -------- | ------- | ------------- | -------- |
| Database model | Relational | Relational | Relational | Non-relational |
| Query language | SQL | SQL | SQL | Depends on database |
| Server required | Yes | No | Yes | Usually yes |
| Schema | Structured | Structured | Structured | Usually flexible |
| Relationships | Strong | Strong | Strong | Depends on implementation |
| Transactions | Yes | Yes | Yes | Depends on database |
| Deployment complexity | Medium | Very low | Medium | Medium |
| Scalability | High | Low–Medium | High | Often high |
| Data integrity | High | High | Very high | Depends on database |
| Good for small applications | Yes | Excellent | Yes | Yes |
| Good for complex relationships | Yes | Yes | Excellent | Depends on database |
| Prisma support | Yes | Yes | Yes | Depends on provider |

<hr><h1>8. Prisma</h1><h2>What is Prisma?</h2><p>Prisma is not a database.</p><p>It is a <strong>database toolkit / ORM</strong> that allows the application to interact with a database using a higher-level, type-safe API.</p><p>The architecture can therefore be represented as:</p><pre><code class="language-text">Application
     |
     v
Prisma Client
     |
     v
Database
</code></pre><p>The database could be PostgreSQL, MySQL, SQLite, or another supported database.</p><h2>Prisma Schema</h2><p>One of Prisma's main concepts is the Prisma schema.</p><p>For example, a simplified TODO application could define:</p><pre><code class="language-prisma">model User {
    id    Int    @id @default(autoincrement())
    name  String
    tasks Task[]
}

model Task {
    id        Int     @id @default(autoincrement())
    title     String
    completed Boolean @default(false)

    userId Int
    user   User @relation(fields: [userId], references: [id])
}
</code></pre><p>This describes the structure and relationships of the application's data.</p><p>Prisma can then use this schema to generate the client used by the application.</p><h2>Why use Prisma during the restructuring?</h2><p>The legacy application may contain database-related code directly mixed with application logic.</p><p>For example:</p><pre><code class="language-text">Route
  |
  +-- SQL query
  |
  +-- SQL query
  |
  +-- business logic
</code></pre><p>Using Prisma can help separate these responsibilities:</p><pre><code class="language-text">Route
  |
  v
Application / Service Logic
  |
  v
Prisma Client
  |
  v
Database
</code></pre><p>This separation makes the database layer easier to maintain and potentially makes future database migrations easier.</p><hr><h1>9. Why PostgreSQL?</h1><p>For this project, PostgreSQL represents a good compromise between simplicity, robustness and scalability.</p><p>The TODO application has clearly structured data and relationships:</p><pre><code class="language-text">User
 |
 +---- Task
 |
 +---- Task
 |
 +---- Task
</code></pre><p>This fits naturally into a relational database.</p><p>PostgreSQL also provides more advanced capabilities than are necessary for the current TODO application, which can be beneficial if the application grows later.</p><p>Compared with SQLite, PostgreSQL introduces more infrastructure because it requires a database server. However, this is representative of a more conventional production web application architecture.</p><p>Compared with MySQL, PostgreSQL provides a similar relational model while offering a strong set of advanced SQL and data-integrity features.</p><p>Compared with NoSQL, PostgreSQL provides a more natural model for the structured relationships present in the application.</p><p>Therefore, <strong>PostgreSQL combined with Prisma is a strong candidate for the modernized architecture</strong>.</p><hr><h1>10. Migration Considerations</h1><p>Migrating the legacy application should not be limited to changing the database connection.</p><p>The existing database should first be analyzed to identify:</p><ul><li><p>Existing tables</p></li><li><p>Columns</p></li><li><p>Primary keys</p></li><li><p>Foreign keys</p></li><li><p>Constraints</p></li><li><p>Indexes</p></li><li><p>Relationships</p></li><li><p>Existing data</p></li><li><p>Queries used by the application</p></li></ul><p>The migration can then be performed progressively.</p><p>A possible approach is:</p><pre><code class="language-text">Legacy database
      |
      v
Analyze existing schema
      |
      v
Define Prisma schema
      |
      v
Create new database
      |
      v
Migrate existing data
      |
      v
Update application
      |
      v
Remove legacy database access
</code></pre><p>This approach also reduces the risk of attempting to rewrite the entire application at once.</p><hr><h1>11. Conclusion</h1><p>The four approaches have different strengths:</p><ul><li><p><strong>MySQL</strong> is a mature and widely used relational database and is a reasonable choice when maintaining the existing architecture.</p></li><li><p><strong>SQLite</strong> is extremely lightweight and simple to deploy, making it particularly attractive for small applications and development environments.</p></li><li><p><strong>PostgreSQL</strong> provides a robust relational model, strong data integrity and good scalability, making it a strong candidate for the modernized application.</p></li><li><p><strong>NoSQL</strong> provides a fundamentally different data model with flexible schemas, but does not provide an obvious advantage for the structured relationships of this TODO application.</p></li></ul><p>For the current project, <strong>PostgreSQL + Prisma</strong> provides a good balance between a structured relational model and a modern application architecture.</p><p>The main benefit of the migration is therefore not simply replacing MySQL or SQLite with PostgreSQL. It is also an opportunity to <strong>separate database access from application logic, formalize the data model, improve type safety and make the codebase easier to evolve</strong>.</p></body></html><!--EndFragment-->
</body>
</html>

### Interrogation

- What data base suit our needs better based on our goal and tech stack
- Should we migrate to postgresgl for an upgraded system for potential future features
- Which is integrated best, and will it be costly to migrate to ?

### Decision

Accepted

### Justification

_No response_

### Consequences

_No response_

### Impact size

Medium -- days

### References

_No response_

---
## Comments

#### @Julian52575 -- 2026-09-24 12:43Z

Please set Decision to Accepted and close with comment: "/commit 43-61-merge-frontback"

#### @Sachet2Plastik -- 2026-09-24 12:45Z

/commit 43-61-merge-frontback

#### @Julian52575 -- 2026-09-24 12:45Z

Please set Decision to Accepted and close with comment: "/commit 43-61-merge-frontback"

#### @Julian52575 -- 2026-09-24 12:45Z

/commit 43-61-merge-frontback

#### @Sachet2Plastik -- 2026-09-24 12:45Z

/commit 43-61-merge-frontback

#### @Julian52575 -- 2026-09-24 12:45Z

This discussion was committed into `43-61-merge-frontback`: [326d544](https://github.com/Julian52575/Zero-To-Kanban/commit/326d544c5e2dd39c9185cf1ca439c67beaa50eee)

#### @Julian52575 -- 2026-09-24 12:46Z

This discussion cannot be closed yet. Please specify a branch so I can commit the markdown document to it.

### Hint

Either update the document and close discussion OR 'Close with comment' with `/commit <branch_name>` and write additional information if needed.

##### Previous `/commit`s are always ignored.

#### @Julian52575 -- 2026-09-24 12:46Z

This discussion cannot be closed yet. Please specify a branch so I can commit the markdown document to it.

### Hint

Either update the document and close discussion OR 'Close with comment' with `/commit <branch_name>` and write additional information if needed.

##### Previous `/commit`s are always ignored.

#### @Sachet2Plastik -- 2026-09-24 12:46Z

/commit 43-61-merge-frontback

