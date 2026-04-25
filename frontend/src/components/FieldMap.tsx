import { useMemo } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { pinIcon } from './leafletPinIcon';

interface MappableField {
  id: string;
  name: string;
  cropType: string;
  latitude: number | null;
  longitude: number | null;
  latestImageUrl: string | null;
}

function hasCoordinates(field: MappableField): field is MappableField & { latitude: number; longitude: number } {
  return typeof field.latitude === 'number' && typeof field.longitude === 'number';
}

export function FieldMap({ fields, title }: { fields: MappableField[]; title: string }) {
  const mappedFields = useMemo(() => fields.filter(hasCoordinates), [fields]);

  const center = useMemo<[number, number]>(() => {
    if (mappedFields.length === 0) {
      return [0, 0];
    }

    const latSum = mappedFields.reduce((sum, field) => sum + field.latitude, 0);
    const lngSum = mappedFields.reduce((sum, field) => sum + field.longitude, 0);

    return [latSum / mappedFields.length, lngSum / mappedFields.length];
  }, [mappedFields]);

  if (mappedFields.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="mt-3 text-sm text-slate-600">No location data available</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="mt-4 h-[360px] overflow-hidden rounded-xl border border-slate-200">
        <MapContainer center={center} zoom={8} className="h-full w-full" scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {mappedFields.map((field) => (
            <Marker key={field.id} position={[field.latitude, field.longitude]} icon={pinIcon}>
              <Popup>
                <div className="space-y-2">
                  <p className="font-semibold">{field.name}</p>
                  <p className="text-sm text-slate-600">{field.cropType}</p>
                  {field.latestImageUrl ? (
                    <img
                      alt={`Latest update for ${field.name}`}
                      className="h-28 w-40 rounded object-cover"
                      src={field.latestImageUrl}
                    />
                  ) : (
                    <p className="text-xs text-slate-500">No updates yet</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
}
