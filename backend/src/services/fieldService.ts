import { z } from 'zod';
import {
  assignField,
  createField,
  findFieldByIdScoped,
  listFieldsScoped,
  updateField
} from '../repositories/fieldRepository';
import {
  createFieldUpdate,
  getLastSameStageUpdate,
  getLastUpdateByFieldIds,
  listFieldUpdates
} from '../repositories/updateRepository';
import { AppError } from '../utils/errors';
import { CropStage, FieldComputedStatus, UserRole } from '../types';

const stageEnum = z.enum(['PLANTED', 'GROWING', 'READY', 'HARVESTED']);

export const createFieldSchema = z.object({
  name: z.string().min(2),
  cropType: z.string().min(2),
  plantingDate: z.string().date(),
  currentStage: stageEnum.default('PLANTED')
});

export const updateFieldSchema = z.object({
  name: z.string().min(2).optional(),
  cropType: z.string().min(2).optional(),
  plantingDate: z.string().date().optional(),
  currentStage: stageEnum.optional()
});

export const assignFieldSchema = z.object({
  agentId: z.string().uuid()
});

export const createUpdateSchema = z.object({
  stage: stageEnum,
  note: z.string().max(400).optional()
});

export const listFieldQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['ACTIVE', 'AT_RISK', 'COMPLETED']).optional(),
  cropType: z.string().optional()
});

function getDayDiff(fromDate: Date, toDate: Date): number {
  const diffMs = toDate.getTime() - fromDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export async function computeFieldStatus(
  fieldId: string,
  currentStage: CropStage,
  lastUpdateDate: Date | null,
  noUpdateDaysThreshold: number,
  stuckStageDaysThreshold: number
): Promise<FieldComputedStatus> {
  if (currentStage === 'HARVESTED') {
    return 'COMPLETED';
  }

  const now = new Date();
  if (!lastUpdateDate || getDayDiff(lastUpdateDate, now) >= noUpdateDaysThreshold) {
    return 'AT_RISK';
  }

  const lastSameStageUpdate = await getLastSameStageUpdate(fieldId, currentStage);
  if (lastSameStageUpdate) {
    const sameStageDays = getDayDiff(new Date(lastSameStageUpdate.created_at), now);
    if (sameStageDays >= stuckStageDaysThreshold) {
      return 'AT_RISK';
    }
  }

  return 'ACTIVE';
}

export async function getFieldsForUser(input: {
  userId: string;
  role: UserRole;
  page: number;
  limit: number;
  status?: FieldComputedStatus;
  cropType?: string;
  noUpdateDaysThreshold: number;
  stuckStageDaysThreshold: number;
}) {
  const rows = await listFieldsScoped({ userId: input.userId, role: input.role });
  const lastUpdates = await getLastUpdateByFieldIds(rows.map((row) => row.id));

  const enriched = await Promise.all(
    rows.map(async (row) => {
      const lastUpdate = lastUpdates[row.id];
      const computedStatus = await computeFieldStatus(
        row.id,
        row.current_stage,
        lastUpdate ? new Date(lastUpdate.created_at) : null,
        input.noUpdateDaysThreshold,
        input.stuckStageDaysThreshold
      );

      return {
        id: row.id,
        name: row.name,
        cropType: row.crop_type,
        plantingDate: row.planting_date,
        currentStage: row.current_stage,
        assignedAgentId: row.assigned_agent_id,
        assignedAgentName: row.assigned_agent_name,
        computedStatus,
        lastUpdateAt: lastUpdate?.created_at ?? null
      };
    })
  );

  const filtered = enriched.filter((field) => {
    const statusMatch = input.status ? field.computedStatus === input.status : true;
    const cropTypeMatch = input.cropType
      ? field.cropType.toLowerCase().includes(input.cropType.toLowerCase())
      : true;
    return statusMatch && cropTypeMatch;
  });

  const start = (input.page - 1) * input.limit;
  const items = filtered.slice(start, start + input.limit);

  return {
    items,
    meta: {
      page: input.page,
      limit: input.limit,
      total: filtered.length
    }
  };
}

export async function getFieldByIdForUser(input: {
  id: string;
  userId: string;
  role: UserRole;
  noUpdateDaysThreshold: number;
  stuckStageDaysThreshold: number;
}) {
  const row = await findFieldByIdScoped(input.id, input.userId, input.role);
  if (!row) {
    throw new AppError('Field not found', 404);
  }

  const lastUpdates = await getLastUpdateByFieldIds([row.id]);
  const lastUpdate = lastUpdates[row.id];

  const computedStatus = await computeFieldStatus(
    row.id,
    row.current_stage,
    lastUpdate ? new Date(lastUpdate.created_at) : null,
    input.noUpdateDaysThreshold,
    input.stuckStageDaysThreshold
  );

  return {
    id: row.id,
    name: row.name,
    cropType: row.crop_type,
    plantingDate: row.planting_date,
    currentStage: row.current_stage,
    assignedAgentId: row.assigned_agent_id,
    assignedAgentName: row.assigned_agent_name,
    computedStatus,
    lastUpdateAt: lastUpdate?.created_at ?? null
  };
}

export async function createFieldRecord(input: z.infer<typeof createFieldSchema>) {
  return createField(input);
}

export async function updateFieldRecord(id: string, input: z.infer<typeof updateFieldSchema>) {
  const updated = await updateField(id, input);
  if (!updated) {
    throw new AppError('Field not found', 404);
  }
  return updated;
}

export async function assignFieldToAgent(fieldId: string, agentId: string) {
  const assigned = await assignField(fieldId, agentId);
  if (!assigned) {
    throw new AppError('Field or agent not found', 404);
  }
  return assigned;
}

export async function addFieldUpdate(input: {
  fieldId: string;
  agentId: string;
  role: UserRole;
  stage: CropStage;
  note?: string;
}) {
  const field = await findFieldByIdScoped(input.fieldId, input.agentId, input.role);
  if (!field) {
    throw new AppError('Field not found or not assigned to this agent', 404);
  }

  const update = await createFieldUpdate({
    fieldId: input.fieldId,
    agentId: input.agentId,
    stage: input.stage,
    note: input.note
  });

  await updateField(input.fieldId, { currentStage: input.stage });

  return update;
}

export async function getFieldUpdates(input: { fieldId: string; userId: string; role: UserRole }) {
  const field = await findFieldByIdScoped(input.fieldId, input.userId, input.role);
  if (!field) {
    throw new AppError('Field not found', 404);
  }

  return listFieldUpdates(input.fieldId, input.userId, input.role);
}
