'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), { ssr: false });
const useMapEvents = (props) => {
  const { useMapEvents: hook } = require('react-leaflet');
  return hook(props);
};

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({ lat, lng, onChange }) {
  const [ready, setReady] = useState(false);
  const [icon, setIcon] = useState(null);

  useEffect(() => {
    setReady(true);
    import('leaflet').then((L) => {
      const customIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });
      setIcon(customIcon);
    });
  }, []);

  const center = lat && lng ? [lat, lng] : [5.6037, -0.187]; // defaults to Accra

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => onChange(pos.coords.latitude, pos.coords.longitude),
      () => alert('Could not get your location. You can tap the map instead to drop a pin.')
    );
  };

  if (!ready || !icon) return <div style={{ height: 260, background: '#1B3A28', borderRadius: 14 }} />;

  return (
    <div style={{ marginBottom: 20 }}>
      <button
        type="button"
        onClick={useCurrentLocation}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: 12,
          border: 'none',
          background: '#05C16A',
          color: '#fff',
          fontWeight: 700,
          fontSize: 15,
          marginBottom: 12,
          cursor: 'pointer',
        }}
      >
        📍 Use My Current Location
      </button>

      <div style={{ height: 260, borderRadius: 14, overflow: 'hidden' }}>
        <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {lat && lng && (
            <Marker
              position={[lat, lng]}
              icon={icon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const p = e.target.getLatLng();
                  onChange(p.lat, p.lng);
                },
              }}
            />
          )}
          <ClickHandler onPick={onChange} />
        </MapContainer>
      </div>

      {lat && lng && (
        <div style={{ fontSize: 13, color: '#7FB89E', marginTop: 8, fontFamily: 'monospace' }}>
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </div>
      )}
    </div>
  );
}