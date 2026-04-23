import { pool } from '../db/pool';
import { CropStage, UserRole } from '../types';

export interface FieldUpdateRow {
  id: string;
  field_id: string;
  agent_id: string;
  agent_name?: string;
  stage: CropStage;
  note: string | null;
  created_at: string;
}

export async function createFieldUpdate(input: {
  fieldId: string;
  agentId: string;
  stage: CropStage;
  note?: string;
}): Promise<FieldUpdateRow> {
  const result = await pool.query<FieldUpdateRow>(
    `WITH inserted AS (
       INSERT INTO field_updates (field_id, agent_id, stage, note)
       VALUES ($1, $2, $3, $4)
       RETURNING id, field_id, agent_id, stage, note, created_at
     )
     SELECT i.id, i.field_id, i.agent_id, u.name AS agent_name, i.stage, i.note, i.created_at
     FROM inserted i
     JOIN users u ON u.id = i.agent_id`,
    [input.fieldId, input.agentId, input.stage, input.note ?? null]
  );
  return result.rows[0];
}

export async function listFieldUpdates(fieldId: string, userId: string, role: UserRole): Promise<FieldUpdateRow[]> {
  const result = await pool.query<FieldUpdateRow>(
    `SELECT fu.id,
            fu.field_id,
            fu.agent_id,
            u.name AS agent_name,
            fu.stage,
            fu.note,
            fu.created_at
     FROM field_updates fu
     JOIN users u ON u.id = fu.agent_id
     JOIN fields f ON f.id = fu.field_id
     WHERE fu.field_id = $1
       AND ($2::text = 'ADMIN' OR f.assigned_agent_id = $3)
     ORDER BY fu.created_at DESC`,
    [fieldId, role, userId]
  );
  return result.rows;
}

export async function getLastUpdateByFieldIds(fieldIds: string[]): Promise<Record<string, FieldUpdateRow | null>> {
  if (fieldIds.length === 0) {
    return {};
  }

  const result = await pool.query<FieldUpdateRow>(
    `SELECT DISTINCT ON (fu.field_id)
            fu.id,
            fu.field_id,
            fu.agent_id,
            fu.stage,
            fu.note,
            fu.created_at
     FROM field_updates fu
     WHERE fu.field_id = ANY($1)
     ORDER BY fu.field_id, fu.created_at DESC`,
    [fieldIds]
  );

  const map: Record<string, FieldUpdateRow | null> = {};
  for (const id of fieldIds) {
    map[id] = null;
  }

  for (const row of result.rows) {
    map[row.field_id] = row;
  }

  return map;
}

export async function getLastSameStageUpdate(fieldId: string, stage: CropStage): Promise<FieldUpdateRow | null> {
  const result = await pool.query<FieldUpdateRow>(
    `SELECT id, field_id, agent_id, stage, note, created_at
     FROM field_updates
     WHERE field_id = $1 AND stage = $2
     ORDER BY created_at DESC
     LIMIT 1`,
    [fieldId, stage]
  );
  return result.rows[0] ?? null;
}
