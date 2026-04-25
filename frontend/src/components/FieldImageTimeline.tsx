import { useQuery } from '@tanstack/react-query';
import { getFieldImagesApi } from '../api';

export function FieldImageTimeline({ fieldId }: { fieldId: string }) {
  const imagesQuery = useQuery({
    queryKey: ['field-images', fieldId],
    queryFn: () => getFieldImagesApi(fieldId)
  });

  if (!imagesQuery.data?.length) {
    return <p className="text-sm text-slate-600">No updates yet</p>;
  }

  return (
    <div className="space-y-3">
      {imagesQuery.data.map((image) => (
        <article key={image.id} className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <img
              src={image.image_url}
              alt={image.note ?? 'Field update image'}
              className="h-28 w-full rounded object-cover sm:w-40"
            />
            <div className="min-w-0 space-y-1">
              <p className="text-xs text-slate-500">{new Date(image.created_at).toLocaleString()}</p>
              <p className="text-sm font-medium text-slate-800">{image.agent_name ?? 'Field agent'}</p>
              <p className="text-sm text-slate-700">{image.note || 'No note'}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
