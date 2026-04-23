import { pool } from '../db/pool';
import { UserRole } from '../types';

export interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const result = await pool.query<UserRow>(
    `SELECT id, name, email, password_hash, role
     FROM users
     WHERE email = $1`,
    [email]
  );
  return result.rows[0] ?? null;
}

export async function getAgents(): Promise<Array<{ id: string; name: string; email: string }>> {
  const result = await pool.query(
    `SELECT id, name, email
     FROM users
     WHERE role = 'FIELD_AGENT'
     ORDER BY name ASC`
  );
  return result.rows;
}
