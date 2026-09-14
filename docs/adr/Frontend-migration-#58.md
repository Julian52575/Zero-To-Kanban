# Frontend migration

- **Discussion:** [#58](https://github.com/Julian52575/Zero-To-Kanban/discussions/58)
- **Category:** Architecture Decision Records
- **Original poster:** @Julian52575
- **Opened:** 2026-09-04 20:25Z
- **Closed:** 2026-09-11 21:48Z

### Discussion

### Date

2026-09-04

### Context

The current frontend is a simple React application, but its architecture is outdated and difficult to maintain. This approach makes the project harder to scale, test, and maintain.

Current architecture:
`src/`
├── `persistence/` (`index.js`, `mysql.js`, `sqlite.js`)
├── `routes/` (`addItem.js`, `deleteItem.js`, `getItems.js`, `updateItem.js`)
├── `static/`
│   ├── `css/` (`font-awesome/`, `bootstrap.min.css`, `styles.css`)
│   ├── `js/` (`app.js`, `babel.min.js`, `react-bootstrap.js`, `react-dom.production.min.js`, `react.production.min.js`)
│   └── `index.html`
└── `index.js`

Frontend is a single 179-line `app.js` (App/TodoListCard/AddItemForm/ItemDisplay in one file) with inline `fetch()` calls and no distinct loading/success/empty/error states.

### Options

1. Keep the current single-file React app (vendored `react.production.min.js`/`babel.min.js`, no bundler).
2. Follow the 4-step migration plan: split React components, create a centralized API layer, introduce a modern build system (Vite), and improve state/error management.

### Decision

Accepted

### Justification

`to be updated`

### Consequences

Step 1 — Split the React Components
The first migration should be to split the current `app.js` into several files. Currently, App, TodoListCard, AddItemForm, and ItemDisplay are all defined in the same file. A new structure could be:
`frontend/`
├── `components/`
│   ├── `TodoList.js`
│   ├── `TodoItem.js`
│   └── `AddItemForm.js`
├── `App.js`
└── `main.js`
Each component should have a single responsibility.

Step 2 — Create an API Layer
Currently, API requests are directly implemented inside React components (`src/static/js/app.js`):
function TodoListCard() {
    const [items, setItems] = React.useState(null);

    React.useEffect(() => {
        fetch('/items')
            .then(r => r.json())
            .then(setItems);
    }, []);

    const onNewItem = React.useCallback(
        newItem => {
            setItem
        },
        [items],
    );
}
This creates a strong dependency between the UI and the backend API. Instead, API operathis file couldprovide functions such as: `getItems()`, `createItem()`, `updateItem()`, `deleteItem()`. The components would then call these functions instead oll make it easier tomodify the API, handle errors consistently, and test the front-end independently from the backend.

Step 3 — Introduce a Modern Build System
These files should ndard npmdependencies and a modern frontend build system, so a bundler such as Vite could be introduced. The benefits include:
- Faster development.
- Modern JavaScript and JSX support.
- Dependency manage
- Production optimization.
- Better development tooling.
- Easier integratiools.

Step 4 — Improve State and Error Management
The current project does not have enough error handling and           management, it mains`):
const [items, setItems] = React.useState(null);
This does not distinguish between different application states. The new implementation should explicitly handle:
- Loading
- Success
- Empty
- Error
The frontend should also properly handle failed API requests, and not assume that every r

### Impact size

Medium -- days

### References

- Affected files: `src/static/js/app.js`, `src/static/index.html`, `src/static/js/babel.min.js`, `src/static/js/react.production.min.js`, `src/static/js/react-dom.production.min.js`, `src/static/js/react-bootstrap.js`, `src/static/css/`
- Target Architecture:
`frontend/`
├── `src/`
│   ├── `components/` (`TodoList.ts`, `TodoItem.ts`, `AddItemForm.ts`)
│   ├── `hooks/` (`useItems.ts`)
│   ├── `services/` (`apiClient.ts`, `itemsApi.ts`)
│   ├── `types/` (`item.ts`)
│   ├── `App.ts`
│   └── `main.ts`
├── `public/`
├── `package.json`
└── `vite.config.ts`

---
## Comments

#### @Antoineweisse -- 2026-09-07 14:41Z

Text for Justifications : 

Splitting the frontend and backend is a better approach because it clearly separates responsibilities and makes the application easier to maintain and scale.

Once the frontend is separated from the backend, using a dedicated frontend framework such as Vite makes sense. It provides a solid development environment and useful tooling while keeping the frontend lightweight and flexible.

Following the architecture recommended by the framework also makes the project easier to organize. Separating components, hooks, services, utilities, and other concerns into dedicated folders improves code readability, maintainability, and scalability. It also provides a clear and consistent structure for future development.

#### @Julian52575 -- 2026-09-11 14:36Z

@Antoineweisse Does this need further work ?

> **@Antoineweisse** -- 2026-09-11 17:05Z
>
> The proposed architecture improves maintainability, testability and scalability by separating UI components, API communication, application state and build tooling. Splitting the monolithic app.js into focused components makes responsibilities clearer, while a dedicated API layer isolates the frontend from backend implementation details. Introducing Vite and standard npm dependencies provides a modern and reproducible development and production workflow. Explicit loading, success, empty and error states also make the application more robust and predictable.

#### @Julian52575 -- 2026-09-11 21:45Z

/commit 59-split-frontend-and-backend

#### @Julian52575 -- 2026-09-11 21:48Z

/commit 59-split-frontend-and-backend

