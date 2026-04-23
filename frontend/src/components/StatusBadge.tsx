import type { FieldStatus } from '../types';

const statusStyles: Record<FieldStatus, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  AT_RISK: 'bg-amber-100 text-amber-900 border-amber-300',
  COMPLETED: 'bg-slate-200 text-slate-700 border-slate-300'
};

export function StatusBadge({ status }: { status: FieldStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${statusStyles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
