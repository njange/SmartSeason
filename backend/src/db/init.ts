import { pool } from './pool';
import { env } from '../config/env';
import { hashPassword } from '../utils/password';

const CREATE_SCHEMA_SQL = `
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
    CREATE TYPE user_role_enum AS ENUM ('ADMIN', 'FIELD_AGENT');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'crop_stage_enum') THEN
    CREATE TYPE crop_stage_enum AS ENUM ('PLANTED', 'GROWING', 'READY', 'HARVESTED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role_enum NOT NULL
);

CREATE TABLE IF NOT EXISTS fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  crop_type TEXT NOT NULL,
  planting_date DATE NOT NULL,
  current_stage crop_stage_enum NOT NULL DEFAULT 'PLANTED',
  assigned_agent_id UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS field_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stage crop_stage_enum NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE fields
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

CREATE TABLE IF NOT EXISTS field_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES users(id),
  image_url TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_field_images_field_created_at
  ON field_images (field_id, created_at DESC);
`;

export async function initializeDatabase(): Promise<void> {
  await pool.query(CREATE_SCHEMA_SQL);

  if (env.seedDemo) {
    await seedDemoData();
  }
}

async function seedDemoData(): Promise<void> {
  const adminEmail = 'admin@example.com';
  const agentEmail = 'agent@example.com';

  const existing = await pool.query('SELECT email FROM users WHERE email = ANY($1)', [[adminEmail, agentEmail]]);
  const existingEmails = new Set(existing.rows.map((row) => row.email));

  if (!existingEmails.has(adminEmail)) {
    const passwordHash = await hashPassword('Admin123!');
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'ADMIN')`,
      ['System Admin', adminEmail, passwordHash]
    );
  }

  let agentId: string;

  if (!existingEmails.has(agentEmail)) {
    const passwordHash = await hashPassword('Agent123!');
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'FIELD_AGENT')
       RETURNING id`,
      ['Field Agent', agentEmail, passwordHash]
    );
    agentId = result.rows[0].id;
  } else {
    const result = await pool.query('SELECT id FROM users WHERE email = $1', [agentEmail]);
    agentId = result.rows[0].id;
  }

  const fieldCount = await pool.query('SELECT COUNT(*)::int AS count FROM fields');
  if (fieldCount.rows[0].count === 0) {
    await pool.query(
      `INSERT INTO fields (name, crop_type, planting_date, current_stage, assigned_agent_id)
       VALUES
       ('North Plot', 'Maize', CURRENT_DATE - INTERVAL '21 days', 'GROWING', $1),
       ('River Edge', 'Beans', CURRENT_DATE - INTERVAL '11 days', 'PLANTED', $1),
       ('Hill Terrace', 'Tomatoes', CURRENT_DATE - INTERVAL '45 days', 'READY', NULL)`,
      [agentId]
    );
  }
}
