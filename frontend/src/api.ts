import axios from 'axios';
import type { CropStage, DashboardAdmin, DashboardAgent, Field, FieldStatus, FieldUpdate, User } from './types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('shamba_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface LoginResponse {
  token: string;
  user: User;
}

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', { email, password });
  return response.data;
}

export async function getAdminDashboardApi(): Promise<DashboardAdmin> {
  const response = await api.get<DashboardAdmin>('/dashboard/admin');
  return response.data;
}

export async function getAgentDashboardApi(): Promise<DashboardAgent> {
  const response = await api.get<DashboardAgent>('/dashboard/agent');
  return response.data;
}

export async function getFieldsApi(params: {
  page: number;
  limit: number;
  status?: FieldStatus;
  cropType?: string;
}): Promise<{ items: Field[]; meta: { page: number; limit: number; total: number } }> {
  const response = await api.get('/fields', { params });
  return response.data;
}

export async function createFieldApi(input: {
  name: string;
  cropType: string;
  plantingDate: string;
  currentStage: CropStage;
}) {
  const response = await api.post('/fields', input);
  return response.data;
}

export async function assignFieldApi(fieldId: string, agentId: string) {
  const response = await api.patch(`/fields/${fieldId}/assign`, { agentId });
  return response.data;
}

export async function createFieldUpdateApi(fieldId: string, input: { stage: CropStage; note?: string }) {
  const response = await api.post(`/fields/${fieldId}/updates`, input);
  return response.data;
}

export async function getFieldUpdatesApi(fieldId: string): Promise<FieldUpdate[]> {
  const response = await api.get<FieldUpdate[]>(`/fields/${fieldId}/updates`);
  return response.data;
}
