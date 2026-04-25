export type UserRole = 'ADMIN' | 'FIELD_AGENT';

export type CropStage = 'PLANTED' | 'GROWING' | 'READY' | 'HARVESTED';

export type FieldStatus = 'ACTIVE' | 'AT_RISK' | 'COMPLETED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Field {
  id: string;
  name: string;
  cropType: string;
  plantingDate: string;
  currentStage: CropStage;
  assignedAgentId: string | null;
  assignedAgentName: string | null;
  latitude: number | null;
  longitude: number | null;
  latestImageUrl: string | null;
  computedStatus: FieldStatus;
  lastUpdateAt: string | null;
}

export interface AgentSummary {
  id: string;
  name: string;
  email: string;
}

export interface DashboardAdmin {
  totals: {
    fields: number;
    active: number;
    atRisk: number;
    completed: number;
  };
  agents: AgentSummary[];
}

export interface DashboardAgent {
  totals: {
    assignedFields: number;
  };
  fields: Field[];
}

export interface FieldUpdate {
  id: string;
  field_id: string;
  agent_id: string;
  agent_name: string;
  stage: CropStage;
  note: string | null;
  created_at: string;
}

export interface FieldImage {
  id: string;
  field_id: string;
  agent_id: string | null;
  agent_name: string | null;
  image_url: string;
  note: string | null;
  created_at: string;
}
