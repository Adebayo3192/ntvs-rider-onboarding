'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Search } from 'lucide-react';

const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), { ssr: false });

const useMapEvents = (props) => {
  const { useMapEvents: hook } = require('react-leaflet');
  return hook(props);
};

const useMap = () => {
  const { useMap: hook } = require('react-leaflet');
  return hook();
};

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyToHandler({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], 15);
    }
  }, [target, map]);
  return null;
}

export default function LocationPicker({ lat, lng, onChange }) {
  const [ready, setReady] = useState(false);
  const [icon, setIcon] = useState(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [flyTarget, setFlyTarget] = useState(null);
  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);

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

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 3) {
      setResults([]);
      return;
    }

    const thisRequestId = ++requestIdRef.current;

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&countrycodes=gh&limit=5`
        );
        const data = await res.json();

        if (thisRequestId === requestIdRef.current) {
          setResults(data);
        }
      } catch (err) {
        if (thisRequestId === requestIdRef.current) {
          setResults([]);
        }
      }
      setSearching(false);
    }, 500);
  };

  const handleSelectResult = (result) => {
    requestIdRef.current++;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setFlyTarget({ lat: parseFloat(result.lat), lng: parseFloat(result.lon) });
    setQuery(result.display_name);
    setResults([]);
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <MapPin size={18} /> Use My Current Location
      </button>

      <div style={{ position: 'relative', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid #2A4A38', borderRadius: 12, padding: '10px 14px' }}>
          <Search size={16} color="#7FB89E" />
          <input
            type="text"
            value={query}
            onChange={handleSearchChange}
            placeholder="Search a place or area to jump there..."
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 16 }}
          />
        </div>

        {(results.length > 0 || searching) && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#173D28', border: '1px solid #2A4A38', borderRadius: 12, marginTop: 4, zIndex: 1000, overflow: 'hidden' }}>
            {searching && (
              <div style={{ padding: 12, fontSize: 13, color: '#7FB89E' }}>Searching...</div>
            )}
            {results.map((r) => (
              <div
                key={r.place_id}
                onClick={() => handleSelectResult(r)}
                style={{ padding: 12, fontSize: 13, color: '#DCEFE3', cursor: 'pointer', borderBottom: '1px solid #2A4A38' }}
              >
                {r.display_name}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ fontSize: 12, color: '#7FB89E', marginBottom: 10 }}>
        Search moves the map to that area — tap or drag the pin below to mark the exact spot.
      </div>

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
          <FlyToHandler target={flyTarget} />
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