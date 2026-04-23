import { listFieldsScoped } from '../repositories/fieldRepository';
import { getAgents } from '../repositories/userRepository';
import { getLastUpdateByFieldIds } from '../repositories/updateRepository';
import { computeFieldStatus } from './fieldService';

export async function getAdminDashboardData(input: {
  userId: string;
  noUpdateDaysThreshold: number;
  stuckStageDaysThreshold: number;
}) {
  const fields = await listFieldsScoped({ userId: input.userId, role: 'ADMIN' });
  const lastUpdates = await getLastUpdateByFieldIds(fields.map((field) => field.id));

  const statusCount = {
    ACTIVE: 0,
    AT_RISK: 0,
    COMPLETED: 0
  };

  for (const field of fields) {
    const status = await computeFieldStatus(
      field.id,
      field.current_stage,
      lastUpdates[field.id] ? new Date(lastUpdates[field.id]!.created_at) : null,
      input.noUpdateDaysThreshold,
      input.stuckStageDaysThreshold
    );
    statusCount[status] += 1;
  }

  const agents = await getAgents();

  return {
    totals: {
      fields: fields.length,
      active: statusCount.ACTIVE,
      atRisk: statusCount.AT_RISK,
      completed: statusCount.COMPLETED
    },
    agents
  };
}

export async function getAgentDashboardData(input: {
  userId: string;
  noUpdateDaysThreshold: number;
  stuckStageDaysThreshold: number;
}) {
  const fields = await listFieldsScoped({ userId: input.userId, role: 'FIELD_AGENT' });
  const lastUpdates = await getLastUpdateByFieldIds(fields.map((field) => field.id));

  const items = await Promise.all(
    fields.map(async (field) => {
      const status = await computeFieldStatus(
        field.id,
        field.current_stage,
        lastUpdates[field.id] ? new Date(lastUpdates[field.id]!.created_at) : null,
        input.noUpdateDaysThreshold,
        input.stuckStageDaysThreshold
      );

      return {
        id: field.id,
        name: field.name,
        cropType: field.crop_type,
        currentStage: field.current_stage,
        computedStatus: status,
        plantingDate: field.planting_date,
        lastUpdateAt: lastUpdates[field.id]?.created_at ?? null
      };
    })
  );

  return {
    totals: {
      assignedFields: items.length
    },
    fields: items
  };
}
