# AGENTS.md — order-drink

> AI agent collaboration guide. Describes project structure, conventions, and rules that AI agents must follow when modifying this codebase.

---

## Project Overview

Office drink ordering system. React frontend + Express backend, co-deployed in Docker, with real-time order sync via Socket.IO.

**Stack:** React 19 · Vite 8 · Express 5 · RethinkDB · Socket.IO 4 · Ant Design 6 · Zustand 5

**Deployment:** Docker multi-stage build, same-origin frontend/backend, port 5918

---

## Directory Structure

```
order-drink/
├── server.js                  # Backend: Express + RethinkDB + Socket.IO (single file, ~295 lines)
├── src/
│   ├── App.jsx                # Root component: ConfigProvider + Ant Design theme + message API
│   ├── index.jsx              # Entry point
│   ├── components/
│   │   ├── MyLayout/          # Page layout container, handles setUser() init + BackTop
│   │   ├── MyHeader/          # Header + dark mode toggle button
│   │   ├── MyContent/         # Main content container + admin auth Modal
│   │   │   ├── FoodMenu/      # Menu images (store list loaded dynamically from remote JSON)
│   │   │   ├── OrderForm/     # Order form (create / edit)
│   │   │   └── OrderTable/    # Order list + Socket.IO connection management
│   │   └── MyFooter/          # Footer
│   ├── stores/
│   │   ├── orderStore/        # Single order state (currently selected / editing order)
│   │   └── settingStore/      # UI settings (darkMode), persisted to localStorage
│   ├── services/
│   │   ├── axios/             # axiosClient configuration
│   │   ├── rethinkDB/         # HTTP API client (misleading name — actually a frontend API call layer)
│   │   └── user/              # localStorage user management (nanoid-generated IDs)
│   ├── constants/             # defaultSetting / defaultThemeSet
│   └── utils/
│       └── env.js             # Reads window._env_ (runtime-injected environment variables)
├── public/                    # Static assets (favicon, manifest)
├── build/                     # Vite build output (gitignored but used by Docker)
├── Dockerfile                 # Multi-stage build
├── docker-compose.yaml        # RethinkDB + app services
└── .env                       # Local development env vars (not committed)
```

---

## Data Flow

```
Browser
  └─ React UI
       ├─ axios (HTTP)  →  Express API  →  RethinkDB
       └─ Socket.IO     ←  Express (changeStream emit)
```

Menu data source: `https://gusty1.github.io/Database/order-drink/storeMenus.json` (external GitHub Pages, not managed in this repo)

---

## Environment Variables

Injected at runtime via `window._env_` (`src/utils/env.js`). In Docker, passed through the `environment` field; locally read from `.env`.

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_TITLE` | Page title | `測試用的標題` |
| `REACT_APP_STORE_NAME` | Default store (matches `storeMenus.json` value field) | `迷客夏` |
| `REACT_APP_DISABLED_MENU` | Lock store selection | `false` |
| `REACT_APP_ADMIN_PASSWORD` | Admin password (visible to frontend — intentional design) | `''` |
| `SERVER_PORT` | Backend port | `5918` |
| `RETHINKDB_HOST` | RethinkDB host | `localhost` |
| `RETHINKDB_PORT` | RethinkDB port | `28015` |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/getTodayOrders` | Get all orders for today (UTC date filter) |
| `POST` | `/setOrder` | Create (no id) or update (with id) an order |
| `DELETE` | `/deleteOrder/:id` | Delete a specific order |
| `GET` | `/getOrder/:id` | Get a single order by ID |

All database errors are logged via `console.error` on the backend. Only a generic message is returned to the client — internal DB details are never exposed.

---

## Code Conventions

### General

- **Immutable updates:** Zustand store always uses `set({...})` returning a new object — never mutate state directly
- **Naming:** Components use PascalCase, functions use camelCase, constants use UPPER_SNAKE_CASE
- **PropTypes:** All components that accept props must define `ComponentName.propTypes`
- **Error handling:** All async functions must be wrapped in try/catch — show a friendly message in the UI, log details with `console.error`
- **No magic numbers:** Use named constants (e.g. `RELOAD_DELAY_MS = 800`)

### React

- **Module-level init:** `getEnv()` and Layout component destructuring (e.g. `const { Content } = Layout`) go outside the component function — executed once only
- **useMemo:** Use for repeated computations such as `columns` (OrderTable) and `imageHeight` (FoodMenu)
- **useRef for stale closures:** Read latest state inside Socket.IO callbacks via `useRef` (see `orderRef` in OrderTable)
- **useEffect cleanup:** Socket.IO connections must call `socket.off()` + `socket.disconnect()` in the cleanup function

### Backend

- All API handlers use `validateOrder()` to validate input — return 400 with a specific error message on failure
- RethinkDB operation failures return 500 with a generic message (no DB internals leaked)
- changeStream errors (cursor error / catch) auto-retry `watchTableChanges()` after 5 seconds

---

## Design Decisions (Confirmed — Do Not Change)

| Item | Decision |
|------|----------|
| CORS `origin: '*'` | Internal-network-only deployment — all origins allowed, risk is acceptable |
| Admin password visible to frontend | Intentional: the password is held by whoever is responsible for ordering that day — internal use only |
| RethinkDB port exposed | Internal network environment — risk is acceptable |
| `services/rethinkDB/` naming | Historical name — actually an HTTP API client. Tech debt; can be renamed to `services/api/` in the future |
| `setUser()` placed in MyLayout | Historical decision — tech debt; can be moved to top-level `App.jsx` in the future |

---

## Modification Guide

### Adding an API Endpoint

1. Add a route in `server.js`, validate input, then operate on RethinkDB
2. Add the corresponding axios call in `src/services/rethinkDB/rethinkDB.js`
3. If a barrel export is needed, update `src/services/index.js`

### Adding a Component

1. Create `ComponentName/ComponentName.jsx` under `src/components/` (PascalCase)
2. If styles are needed, create `ComponentName/ComponentName.css` alongside it
3. Add the export to `src/components/index.js` barrel file if global use is required
4. PropTypes must be defined

### Modifying Menu Data

Menu data is maintained in an external JSON: `https://gusty1.github.io/Database/order-drink/storeMenus.json`

Format:
```json
[
  { "value": "迷客夏", "label": "迷客夏", "url": "https://..." },
  ...
]
```

This repo does not contain menu data. Edit it in the Database repo.

### Modifying Theme / Styles

- Ant Design theme tokens: `src/constants/defaultThemeSet.js`
- Dark mode check: `settingStore().setting.darkMode` (persisted via Zustand)
- Selected row CSS classes: `selected-row` (light) / `selected-row-dark` (dark), defined in `OrderTable.css`

---

## Known Tech Debt (Low Priority — Leave As-Is)

- `services/rethinkDB/` is a misleading name — can be renamed to `services/api/` in the future
- `MyLayout` handles `setUser()` initialization — slightly mixed responsibilities
- `MyContent` contains admin auth Modal logic — could be extracted into an `AdminAuthModal` component
- `OrderTable` has too many responsibilities (Socket.IO connection + data fetching + list rendering) — consider extracting a `useOrderSocket` hook
- No tests exist — priority candidates: `validateOrder`, `getUser/setUser`, `orderStore` unit tests

---

## Prohibited Actions

- Do NOT commit `REACT_APP_ADMIN_PASSWORD` or any other secrets to git
- Do NOT insert unvalidated data anywhere outside `validateOrder()`
- Do NOT commit `console.log` debug output to production (`console.error` is fine to keep)
- Do NOT tighten the CORS configuration without explicit discussion (internal deployment has specific requirements)
- Do NOT delete or rename `src/services/rethinkDB/` without confirmation — multiple files import from this path
