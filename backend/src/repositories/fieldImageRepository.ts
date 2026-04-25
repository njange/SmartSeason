import { pool } from '../db/pool';

export interface FieldImageRow {
  id: string;
  field_id: string;
  agent_id: string | null;
  agent_name: string | null;
  image_url: string;
  note: string | null;
  created_at: string;
}

export async function createFieldImage(input: {
  fieldId: string;
  agentId: string;
  imageUrl: string;
  note?: string;
}): Promise<FieldImageRow> {
  const result = await pool.query<FieldImageRow>(
    `WITH inserted AS (
       INSERT INTO field_images (field_id, agent_id, image_url, note)
       VALUES ($1, $2, $3, $4)
       RETURNING id, field_id, agent_id, image_url, note, created_at
     )
     SELECT i.id, i.field_id, i.agent_id, u.name AS agent_name, i.image_url, i.note, i.created_at
     FROM inserted i
     LEFT JOIN users u ON u.id = i.agent_id`,
    [input.fieldId, input.agentId, input.imageUrl, input.note ?? null]
  );

  return result.rows[0];
}

export async function listFieldImagesScoped(fieldId: string, userId: string, role: 'ADMIN' | 'FIELD_AGENT'): Promise<FieldImageRow[]> {
  const result = await pool.query<FieldImageRow>(
    `SELECT fi.id,
            fi.field_id,
            fi.agent_id,
            u.name AS agent_name,
            fi.image_url,
            fi.note,
            fi.created_at
     FROM field_images fi
     LEFT JOIN users u ON u.id = fi.agent_id
     JOIN fields f ON f.id = fi.field_id
     WHERE fi.field_id = $1
       AND ($2::text = 'ADMIN' OR f.assigned_agent_id = $3)
     ORDER BY fi.created_at DESC`,
    [fieldId, role, userId]
  );

  return result.rows;
}
