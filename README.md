# Shamba Crop Field Tracking Monorepo

A full-stack crop field tracking system with:

- `frontend`: React + Vite + TypeScript + Tailwind CSS
- `backend`: Node.js + Express + TypeScript + PostgreSQL
- Dockerized deployment with `docker-compose`

## Architecture

Monorepo structure:

- `frontend` for UI
- `backend` for API and business logic
- `docker-compose.yml` for local reproducible deployment

Backend follows layered architecture:

- routes -> controllers -> services -> repositories -> database

Core backend design decisions:

- REST API for clear, simple client/server communication
- JWT for stateless auth and easy horizontal scaling
- Computed field status (not persisted) to keep business state derivable from canonical data
- Env-driven configuration for deploy flexibility

## Data Model

PostgreSQL normalized schema:

- `users`
  - `id` UUID
  - `name`
  - `email` unique
  - `password_hash`
  - `role` enum (`ADMIN`, `FIELD_AGENT`)
- `fields`
  - `id` UUID
  - `name`
  - `crop_type`
  - `planting_date`
  - `current_stage` enum (`PLANTED`, `GROWING`, `READY`, `HARVESTED`)
  - `assigned_agent_id` FK -> `users.id`
- `field_updates`
  - `id` UUID
  - `field_id` FK -> `fields.id`
  - `agent_id` FK -> `users.id`
  - `stage`
  - `note`
  - `created_at`

Assumption:

- One assigned agent per field at a time

## Auth and Roles

JWT auth with role authorization middleware:

- `ADMIN`
  - Can view all fields
  - Can create fields
  - Can assign agents to fields
- `FIELD_AGENT`
  - Can only access fields assigned to them
  - Can post updates to assigned fields only

## Computed Field Status Logic

Computed in service layer and returned by API:

- `COMPLETED`: field stage is `HARVESTED`
- `AT_RISK`: no update for `AT_RISK_NO_UPDATE_DAYS` OR stuck too long in same stage (`AT_RISK_STUCK_STAGE_DAYS`)
- `ACTIVE`: otherwise

## API Endpoints

Auth:

- `POST /auth/login`

Fields:

- `GET /fields`
- `GET /fields/:id`
- `POST /fields` (admin)
- `PATCH /fields/:id` (admin)
- `PATCH /fields/:id/assign` (admin)

Updates:

- `POST /fields/:id/updates` (agent)
- `GET /fields/:id/updates`

Dashboard:

- `GET /dashboard/admin`
- `GET /dashboard/agent`

## Demo Credentials

Seeded automatically when `SEED_DEMO=true`:

- Admin:
  - email: `admin@example.com`
  - password: `Admin123!`
- Agent:
  - email: `agent@example.com`
  - password: `Agent123!`

## Environment Variables

Copy from `.env.example` (root):

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `AT_RISK_NO_UPDATE_DAYS`
- `AT_RISK_STUCK_STAGE_DAYS`
- `SEED_DEMO`
- `VITE_API_BASE_URL`

Backend local `.env.example` is in `backend/.env.example`.

## Run with Docker

```bash
docker-compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- PostgreSQL: `localhost:5433`

## Local Development (without Docker)

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Bonus Features Included

- Seeded demo data
- Pagination and filters on fields endpoint
- Activity timeline per field (agent view)
