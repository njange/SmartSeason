export type UserRole = 'ADMIN' | 'FIELD_AGENT';

export type CropStage = 'PLANTED' | 'GROWING' | 'READY' | 'HARVESTED';

export type FieldComputedStatus = 'ACTIVE' | 'AT_RISK' | 'COMPLETED';

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
  name: string;
  email: string;
}
