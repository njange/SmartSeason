import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFieldUpdateApi, getAgentDashboardApi, getFieldUpdatesApi, uploadFieldImageApi } from '../api';
import type { CropStage } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { FieldMap } from '../components/FieldMap';
import { FieldImageTimeline } from '../components/FieldImageTimeline';

const stages: CropStage[] = ['PLANTED', 'GROWING', 'READY', 'HARVESTED'];

export function AgentDashboard() {
  const queryClient = useQueryClient();
  const [expandedFieldId, setExpandedFieldId] = useState<string | null>(null);

  const dashboardQuery = useQuery({
    queryKey: ['dashboard-agent'],
    queryFn: getAgentDashboardApi
  });

  const updateMutation = useMutation({
    mutationFn: ({ fieldId, stage, note }: { fieldId: string; stage: CropStage; note?: string }) => createFieldUpdateApi(fieldId, { stage, note }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-agent'] });
      queryClient.invalidateQueries({ queryKey: ['field-updates', variables.fieldId] });
    }
  });

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-600">Assigned Fields</p>
        <p className="mt-2 text-3xl font-bold text-emerald-700">{dashboardQuery.data?.totals.assignedFields ?? 0}</p>
      </section>

      <FieldMap
        title="Assigned Field Locations"
        fields={(dashboardQuery.data?.fields ?? []).map((field) => ({
          id: field.id,
          name: field.name,
          cropType: field.cropType,
          latitude: field.latitude,
          longitude: field.longitude,
          latestImageUrl: field.latestImageUrl
        }))}
      />

      <section className="grid gap-4 md:grid-cols-2">
        {dashboardQuery.data?.fields.map((field) => (
          <FieldCard
            key={field.id}
            fieldId={field.id}
            fieldName={field.name}
            cropType={field.cropType}
            currentStage={field.currentStage}
            status={field.computedStatus}
            onSubmit={(stage, note) => updateMutation.mutate({ fieldId: field.id, stage, note })}
            expanded={expandedFieldId === field.id}
            onToggleExpanded={() => setExpandedFieldId((id) => (id === field.id ? null : field.id))}
          />
        ))}
      </section>
    </div>
  );
}

function FieldCard(props: {
  fieldId: string;
  fieldName: string;
  cropType: string;
  currentStage: CropStage;
  status: 'ACTIVE' | 'AT_RISK' | 'COMPLETED';
  onSubmit: (stage: CropStage, note?: string) => void;
  expanded: boolean;
  onToggleExpanded: () => void;
}) {
  const [stage, setStage] = useState<CropStage>(props.currentStage);
  const [note, setNote] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageNote, setImageNote] = useState('');
  const queryClient = useQueryClient();

  const updatesQuery = useQuery({
    queryKey: ['field-updates', props.fieldId],
    queryFn: () => getFieldUpdatesApi(props.fieldId),
    enabled: props.expanded
  });

  const uploadImageMutation = useMutation({
    mutationFn: ({ image, note: uploadNote }: { image: File; note?: string }) =>
      uploadFieldImageApi(props.fieldId, { image, note: uploadNote }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['field-images', props.fieldId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-agent'] });
      setImageFile(null);
      setImageNote('');
    }
  });

  function submitUpdate(event: FormEvent) {
    event.preventDefault();
    props.onSubmit(stage, note.trim() || undefined);
    setNote('');
  }

  function submitImage(event: FormEvent) {
    event.preventDefault();
    if (!imageFile) {
      return;
    }

    uploadImageMutation.mutate({
      image: imageFile,
      note: imageNote.trim() || undefined
    });
  }

  return (
    <article className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold">{props.fieldName}</h2>
          <p className="text-sm text-slate-600">{props.cropType}</p>
        </div>
        <StatusBadge status={props.status} />
      </div>

      <p className="mt-3 text-sm text-slate-700">Current Stage: <strong>{props.currentStage}</strong></p>

      <form className="mt-4 space-y-3" onSubmit={submitUpdate}>
        <select
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
          value={stage}
          onChange={(e) => setStage(e.target.value as CropStage)}
        >
          {stages.map((stageItem) => (
            <option key={stageItem} value={stageItem}>{stageItem}</option>
          ))}
        </select>
        <textarea
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
          rows={3}
          placeholder="Add update note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800" type="submit">
          Submit Update
        </button>
      </form>

      <button className="mt-4 text-sm font-semibold text-emerald-800 underline" onClick={props.onToggleExpanded}>
        {props.expanded ? 'Hide activity timeline' : 'Show activity timeline'}
      </button>

      {props.expanded ? (
        <div className="mt-3 space-y-3 rounded-lg bg-slate-50 p-3 text-sm">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-700">Stage Activity</p>
            <div className="mt-2 space-y-2">
              {updatesQuery.data?.length ? updatesQuery.data.map((update) => (
                <div key={update.id} className="rounded border border-slate-200 bg-white p-2">
                  <p className="font-semibold">{update.stage} - {new Date(update.created_at).toLocaleString()}</p>
                  <p className="text-slate-700">{update.note || 'No note'}</p>
                </div>
              )) : <p className="text-slate-600">No updates yet.</p>}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-700">Field Detail Upload</p>
            <form className="mt-2 space-y-2" onSubmit={submitImage}>
              <input
                accept="image/jpeg,image/png"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
                type="file"
              />
              <textarea
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                rows={2}
                placeholder="Optional image note"
                value={imageNote}
                onChange={(event) => setImageNote(event.target.value)}
              />
              <button
                className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
                disabled={!imageFile || uploadImageMutation.isPending}
                type="submit"
              >
                {uploadImageMutation.isPending ? 'Uploading...' : 'Upload Image'}
              </button>
            </form>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-700">Image Timeline</p>
            <div className="mt-2">
              <FieldImageTimeline fieldId={props.fieldId} />
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
