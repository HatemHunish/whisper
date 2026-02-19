# backend

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.8. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## Run with Docker modes

From the repo root:

```bash
COMPOSE_PROFILES=dev docker compose up --build
```

Use `COMPOSE_PROFILES` as the mode flag:

- `dev`: runs `backend` + `frontend` with hot reload (`http://localhost:3000` API, `http://localhost:5173` web).
- `served`: runs `backend-served` only, where backend serves the built frontend from `web/dist` (`http://localhost:3000`).

Examples:

```bash
# Backend + Vite frontend (hot reload)
COMPOSE_PROFILES=dev docker compose up --build

# Backend serves built frontend
COMPOSE_PROFILES=served docker compose up --build
```
