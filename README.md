# SmartSeason Field Monitoring System

## Submission Overview

This repository contains a full stack crop field monitoring system built for the Full Stack Developer Technical Assessment.

Tech stack used:

- Frontend: React, Vite, TypeScript, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL
- Auth: JWT with role-based authorization
- Deployment: Docker Compose and GitHub Actions CI/CD

Repository layout:

- frontend
- backend
- docker-compose.yml
- .github/workflows/deploy.yml

## Requirement Coverage

### 1) Users and Access

- Roles implemented:
  - ADMIN (Coordinator)
  - FIELD_AGENT
- Authentication:
  - Login endpoint returns JWT
  - Password hashing with bcrypt
- Authorization:
  - Admin can access all fields and dashboards
  - Agent can only access assigned fields and submit updates on assigned fields

### 2) Field Management

- Admin can create fields
- Admin can assign field agents to fields
- Fields include:
  - name
  - crop type
  - planting date
  - current stage

### 3) Field Updates

- Field agents can:
  - update field stage
  - add notes
- Admin can:
  - view all fields
  - monitor updates across all agents

### 4) Field Stages

Implemented lifecycle:

- PLANTED
- GROWING
- READY
- HARVESTED

### 5) Computed Field Status Logic

Computed in backend service layer (not stored in DB):

- COMPLETED: when stage is HARVESTED
- AT_RISK: when no update for configured number of days OR field remains too long in the same stage
- ACTIVE: all other cases

This design avoids stale status values and keeps status consistent with latest field updates.

### 6) Dashboard

- Admin dashboard:
  - total fields
  - status breakdown
  - table of fields
  - assign agents
- Field agent dashboard:
  - assigned fields
  - stage update form
  - notes entry
  - activity timeline

## Architecture and Design Decisions

- Layered backend architecture:
  - routes -> controllers -> services -> repositories -> db
- REST API design for clear separation between frontend and backend
- Stateless backend via JWT for scalability
- PostgreSQL normalized schema with foreign keys and enums
- Environment variable based configuration for portability

## Data Model

users:

- id (UUID)
- name
- email (unique)
- password_hash
- role (ADMIN, FIELD_AGENT)

fields:

- id (UUID)
- name
- crop_type
- planting_date
- current_stage (PLANTED, GROWING, READY, HARVESTED)
- assigned_agent_id (FK to users.id)

field_updates:

- id (UUID)
- field_id (FK to fields.id)
- agent_id (FK to users.id)
- stage
- note
- created_at

## API Endpoints

Auth:

- POST /auth/login

Fields:

- GET /fields
- GET /fields/:id
- POST /fields (admin)
- PATCH /fields/:id (admin)
- PATCH /fields/:id/assign (admin)

Updates:

- POST /fields/:id/updates (agent)
- GET /fields/:id/updates

Dashboard:

- GET /dashboard/admin
- GET /dashboard/agent

## Setup Instructions

### Option A: Docker (recommended)

1. Clone repository.
2. Create root .env from .env.example.
3. Run:

   docker-compose up --build

4. Access services:

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- PostgreSQL: localhost:5433

### Option B: Local development

Backend:

1. Go to backend folder.
2. Create backend .env from backend/.env.example.
3. Install dependencies and run:

   npm install
   npm run dev

Frontend:

1. Go to frontend folder.
2. Install dependencies and run:

   npm install
   npm run dev

## Environment Variables

Root .env (for Docker Compose):

- POSTGRES_DB
- POSTGRES_USER
- POSTGRES_PASSWORD
- JWT_SECRET
- JWT_EXPIRES_IN
- AT_RISK_NO_UPDATE_DAYS
- AT_RISK_STUCK_STAGE_DAYS
- SEED_DEMO
- VITE_API_BASE_URL

Backend local file:

- backend/.env.example

## Demo Credentials

When SEED_DEMO=true:

- Admin:
  - Email: admin@example.com
  - Password: Admin123!
- Field Agent:
  - Email: agent@example.com
  - Password: Agent123!

## Assumptions

- One agent is assigned per field at a time.
- Admin manages field assignment and can view all records.
- Agent visibility is restricted to assigned fields only.

## Bonus Features Implemented

- Seed script behavior integrated at startup
- Pagination and filtering on fields listing
- Agent activity timeline for field updates
- CI/CD workflow with image build, push, and VM deployment

## Screenshot Placeholders

Add two screenshots before submission:

1. Admin dashboard view

  <img width="1915" height="993" alt="Screenshot 2026-04-24 112208" src="https://github.com/user-attachments/assets/6f2ea9ec-4774-4bd3-a672-2a37f35ef5b2" />


2. Field agent dashboard view

   <img width="1901" height="989" alt="Screenshot 2026-04-24 111416" src="https://github.com/user-attachments/assets/88377025-c876-4813-ac73-5dfa8e6a60e7" />


## Submission Checklist

Before sending submission email:

1. Ensure repository is public or access is granted.
2. Ensure README is up to date.
3. Confirm demo credentials work.
4. Attach or include the two dashboard screenshots.
5. Include deployment access details if live deployment is provided.

## Suggested Submission Email Template

Subject: Full Stack Developer Technical Assessment Submission - SmartSeason Field Monitoring System

Body:

- Repository:(https://github.com/njange/SmartSeason)
- Live URL:(https://smart-season-liard.vercel.app/)
- Demo credentials:
  - Admin: admin@example.com / Admin123!
  - Agent: agent@example.com / Agent123!
- Notes:
  - Built with React + Node.js + PostgreSQL
  - Dockerized deployment included
  - CI/CD workflow included
