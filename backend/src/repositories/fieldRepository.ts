import { pool } from '../db/pool';
import { CropStage, UserRole } from '../types';

export interface FieldRow {
  id: string;
  name: string;
  crop_type: string;
  planting_date: string;
  current_stage: CropStage;
  assigned_agent_id: string | null;
  assigned_agent_name: string | null;
  latitude: number | null;
  longitude: number | null;
  latest_image_url: string | null;
}

export interface FieldQueryInput {
  userId: string;
  role: UserRole;
}

export async function listFieldsScoped({ userId, role }: FieldQueryInput): Promise<FieldRow[]> {
  const query = `
    SELECT f.id,
           f.name,
           f.crop_type,
           f.planting_date,
           f.current_stage,
           f.assigned_agent_id,
           u.name AS assigned_agent_name,
           f.latitude,
           f.longitude,
           latest.image_url AS latest_image_url
    FROM fields f
    LEFT JOIN users u ON u.id = f.assigned_agent_id
    LEFT JOIN LATERAL (
      SELECT image_url
      FROM field_images fi
      WHERE fi.field_id = f.id
      ORDER BY fi.created_at DESC
      LIMIT 1
    ) AS latest ON TRUE
    WHERE ($1::text = 'ADMIN' OR f.assigned_agent_id = $2)
    ORDER BY f.planting_date DESC
  `;
  const result = await pool.query<FieldRow>(query, [role, userId]);
  return result.rows;
}

export async function findFieldByIdScoped(id: string, userId: string, role: UserRole): Promise<FieldRow | null> {
  const query = `
    SELECT f.id,
           f.name,
           f.crop_type,
           f.planting_date,
           f.current_stage,
           f.assigned_agent_id,
           u.name AS assigned_agent_name,
           f.latitude,
           f.longitude,
           latest.image_url AS latest_image_url
    FROM fields f
    LEFT JOIN users u ON u.id = f.assigned_agent_id
    LEFT JOIN LATERAL (
      SELECT image_url
      FROM field_images fi
      WHERE fi.field_id = f.id
      ORDER BY fi.created_at DESC
      LIMIT 1
    ) AS latest ON TRUE
    WHERE f.id = $1
      AND ($2::text = 'ADMIN' OR f.assigned_agent_id = $3)
    LIMIT 1
  `;
  const result = await pool.query<FieldRow>(query, [id, role, userId]);
  return result.rows[0] ?? null;
}

export async function createField(input: {
  name: string;
  cropType: string;
  plantingDate: string;
  currentStage: CropStage;
  latitude?: number | null;
  longitude?: number | null;
}): Promise<FieldRow> {
  const result = await pool.query<FieldRow>(
    `INSERT INTO fields (name, crop_type, planting_date, current_stage, latitude, longitude)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, crop_type, planting_date, current_stage, assigned_agent_id, NULL::text AS assigned_agent_name, latitude, longitude, NULL::text AS latest_image_url`,
    [input.name, input.cropType, input.plantingDate, input.currentStage, input.latitude ?? null, input.longitude ?? null]
  );

  return result.rows[0];
}

export async function updateField(
  id: string,
  input: Partial<{ name: string; cropType: string; plantingDate: string; currentStage: CropStage; latitude: number | null; longitude: number | null }>
): Promise<FieldRow | null> {
  const existing = await pool.query<{
    id: string;
    name: string;
    crop_type: string;
    planting_date: string;
    current_stage: CropStage;
    latitude: number | null;
    longitude: number | null;
  }>(
    'SELECT id, name, crop_type, planting_date, current_stage, latitude, longitude FROM fields WHERE id = $1',
    [id]
  );
  if (!existing.rows[0]) {
    return null;
  }

  const setLatitude = Object.prototype.hasOwnProperty.call(input, 'latitude');
  const setLongitude = Object.prototype.hasOwnProperty.call(input, 'longitude');

  const updated = {
    name: input.name ?? existing.rows[0].name,
    cropType: input.cropType ?? existing.rows[0].crop_type,
    plantingDate: input.plantingDate ?? existing.rows[0].planting_date,
    currentStage: input.currentStage ?? existing.rows[0].current_stage,
    latitude: setLatitude ? input.latitude ?? null : existing.rows[0].latitude,
    longitude: setLongitude ? input.longitude ?? null : existing.rows[0].longitude
  };

  const result = await pool.query<FieldRow>(
    `UPDATE fields
     SET name = $2,
         crop_type = $3,
         planting_date = $4,
         current_stage = $5,
         latitude = $6,
         longitude = $7
     WHERE id = $1
     RETURNING id, name, crop_type, planting_date, current_stage, assigned_agent_id, NULL::text AS assigned_agent_name, latitude, longitude, NULL::text AS latest_image_url`,
    [id, updated.name, updated.cropType, updated.plantingDate, updated.currentStage, updated.latitude, updated.longitude]
  );

  return result.rows[0] ?? null;
}

export async function assignField(fieldId: string, agentId: string): Promise<FieldRow | null> {
  const result = await pool.query<FieldRow>(
    `UPDATE fields f
     SET assigned_agent_id = $2
     FROM users u
     WHERE f.id = $1
       AND u.id = $2
       AND u.role = 'FIELD_AGENT'
     RETURNING f.id, f.name, f.crop_type, f.planting_date, f.current_stage, f.assigned_agent_id, u.name AS assigned_agent_name, f.latitude, f.longitude, NULL::text AS latest_image_url`,
    [fieldId, agentId]
  );
  return result.rows[0] ?? null;
}
