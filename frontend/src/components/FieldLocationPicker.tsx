import { useMemo } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { pinIcon } from './leafletPinIcon';

interface LocationValue {
  latitude: number | null;
  longitude: number | null;
}

function LocationSelectionHandler({ onPick }: { onPick: (latitude: number, longitude: number) => void }) {
  useMapEvents({
    click: (event) => {
      onPick(event.latlng.lat, event.latlng.lng);
    }
  });

  return null;
}

export function FieldLocationPicker({
  value,
  onChange
}: {
  value: LocationValue;
  onChange: (location: LocationValue) => void;
}) {
  const center = useMemo<[number, number]>(() => {
    if (typeof value.latitude === 'number' && typeof value.longitude === 'number') {
      return [value.latitude, value.longitude];
    }

    // Default center is East Africa to fit the expected farming region.
    return [-1.286389, 36.817223];
  }, [value.latitude, value.longitude]);

  return (
    <div className="space-y-2 md:col-span-3">
      <p className="text-sm font-semibold text-slate-800">Field location (click map to drop a pin)</p>
      <div className="h-64 overflow-hidden rounded-xl border border-slate-200">
        <MapContainer center={center} zoom={7} className="h-full w-full" scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationSelectionHandler
            onPick={(latitude, longitude) => onChange({ latitude, longitude })}
          />
          {typeof value.latitude === 'number' && typeof value.longitude === 'number' ? (
            <Marker position={[value.latitude, value.longitude]} icon={pinIcon} />
          ) : null}
        </MapContainer>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {typeof value.latitude === 'number' && typeof value.longitude === 'number'
            ? `Pinned at ${value.latitude.toFixed(6)}, ${value.longitude.toFixed(6)}`
            : 'No location selected yet'}
        </p>
        <button
          className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          onClick={() => onChange({ latitude: null, longitude: null })}
          type="button"
        >
          Clear pin
        </button>
      </div>
    </div>
  );
}
