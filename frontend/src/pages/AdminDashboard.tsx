import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assignFieldApi, createFieldApi, getAdminDashboardApi, getFieldsApi } from '../api';
import type { CropStage, FieldStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';

const stages: CropStage[] = ['PLANTED', 'GROWING', 'READY', 'HARVESTED'];

export function AdminDashboard() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [status, setStatus] = useState<FieldStatus | ''>('');
  const [cropType, setCropType] = useState('');

  const [createForm, setCreateForm] = useState({
    name: '',
    cropType: '',
    plantingDate: new Date().toISOString().slice(0, 10),
    currentStage: 'PLANTED' as CropStage
  });

  const adminQuery = useQuery({
    queryKey: ['dashboard-admin'],
    queryFn: getAdminDashboardApi
  });

  const fieldsQuery = useQuery({
    queryKey: ['fields', page, limit, status, cropType],
    queryFn: () => getFieldsApi({
      page,
      limit,
      status: status || undefined,
      cropType: cropType || undefined
    })
  });

  const createMutation = useMutation({
    mutationFn: createFieldApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fields'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-admin'] });
      setCreateForm({
        name: '',
        cropType: '',
        plantingDate: new Date().toISOString().slice(0, 10),
        currentStage: 'PLANTED'
      });
    }
  });

  const assignMutation = useMutation({
    mutationFn: ({ fieldId, agentId }: { fieldId: string; agentId: string }) => assignFieldApi(fieldId, agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fields'] });
    }
  });

  function onCreateField(event: FormEvent) {
    event.preventDefault();
    createMutation.mutate(createForm);
  }

  const totalPages = fieldsQuery.data ? Math.max(1, Math.ceil(fieldsQuery.data.meta.total / fieldsQuery.data.meta.limit)) : 1;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Fields" value={adminQuery.data?.totals.fields ?? 0} />
        <StatCard label="Active" value={adminQuery.data?.totals.active ?? 0} color="text-emerald-700" />
        <StatCard label="At Risk" value={adminQuery.data?.totals.atRisk ?? 0} color="text-amber-700" />
        <StatCard label="Completed" value={adminQuery.data?.totals.completed ?? 0} color="text-slate-600" />
      </section>

      <section className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold">Create Field</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-4" onSubmit={onCreateField}>
          <input
            className="rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Field name"
            value={createForm.name}
            onChange={(e) => setCreateForm((old) => ({ ...old, name: e.target.value }))}
            required
          />
          <input
            className="rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Crop type"
            value={createForm.cropType}
            onChange={(e) => setCreateForm((old) => ({ ...old, cropType: e.target.value }))}
            required
          />
          <input
            className="rounded-lg border border-slate-300 px-3 py-2"
            type="date"
            value={createForm.plantingDate}
            onChange={(e) => setCreateForm((old) => ({ ...old, plantingDate: e.target.value }))}
            required
          />
          <div className="flex gap-2">
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              value={createForm.currentStage}
              onChange={(e) => setCreateForm((old) => ({ ...old, currentStage: e.target.value as CropStage }))}
            >
              {stages.map((stage) => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
            <button className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800" type="submit">
              Add
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-bold">Fields</h2>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              className="rounded-lg border border-slate-300 px-3 py-2"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as FieldStatus | '');
                setPage(1);
              }}
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="AT_RISK">At Risk</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <input
              className="rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Filter by crop"
              value={cropType}
              onChange={(e) => {
                setCropType(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-700">
                <th className="px-3 py-2">Field</th>
                <th className="px-3 py-2">Crop</th>
                <th className="px-3 py-2">Stage</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Assigned Agent</th>
                <th className="px-3 py-2">Assign</th>
              </tr>
            </thead>
            <tbody>
              {fieldsQuery.data?.items.map((field) => (
                <tr key={field.id} className="border-b border-slate-100">
                  <td className="px-3 py-3 font-medium">{field.name}</td>
                  <td className="px-3 py-3">{field.cropType}</td>
                  <td className="px-3 py-3">{field.currentStage}</td>
                  <td className="px-3 py-3"><StatusBadge status={field.computedStatus} /></td>
                  <td className="px-3 py-3">{field.assignedAgentName ?? 'Unassigned'}</td>
                  <td className="px-3 py-3">
                    <select
                      className="rounded-lg border border-slate-300 px-2 py-1"
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) {
                          assignMutation.mutate({ fieldId: field.id, agentId: e.target.value });
                        }
                      }}
                    >
                      <option value="">Select agent</option>
                      {adminQuery.data?.agents.map((agent) => (
                        <option key={agent.id} value={agent.id}>{agent.name}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-600">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              className="rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <button
              className="rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-40"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, color = 'text-slate-900' }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-600">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
