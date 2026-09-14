'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Search } from 'lucide-react';

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";
const ACCENT = '#05C16A';

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
      map.flyTo([target.lat, target.lng], 16);
    }
  }, [target, map]);
  return null;
}

const locateBtn = {
  width: '100%', height: 62, border: 'none', borderRadius: 18, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flex: 'none',
  fontFamily: FONT, fontSize: 16.5, fontWeight: 700, background: ACCENT, color: '#06281A',
  boxShadow: '0 14px 30px rgba(5,193,106,.32)',
};

export default function LocationPicker({ lat, lng, onChange }) {
  const [ready, setReady] = useState(false);
  const [icon, setIcon] = useState(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [flyTarget, setFlyTarget] = useState(null);
  const [locating, setLocating] = useState(false);
  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    setReady(true);
    import('leaflet').then((L) => {
      const customIcon = L.divIcon({
        html: `<svg width="38" height="48" viewBox="0 0 38 48" fill="none">
          <path d="M19 47c0 0 15-16.5 15-28A15 15 0 004 19c0 11.5 15 28 15 28z" fill="${ACCENT}" stroke="#06281A" stroke-width="2"/>
          <circle cx="19" cy="18.5" r="5.6" fill="#06281A"/>
        </svg>`,
        className: '',
        iconSize: [38, 48],
        iconAnchor: [19, 48],
      });
      setIcon(customIcon);
    });
  }, []);

  const center = lat && lng ? [lat, lng] : [5.6037, -0.187];

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = pos.coords.latitude;
        const newLng = pos.coords.longitude;
        onChange(newLat, newLng);
        setFlyTarget({ lat: newLat, lng: newLng });
        setLocating(false);
      },
      () => {
        setLocating(false);
        alert('Could not get your location. You can tap the map instead to drop a pin.');
      }
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
        if (thisRequestId === requestIdRef.current) setResults(data);
      } catch (err) {
        if (thisRequestId === requestIdRef.current) setResults([]);
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

  if (!ready || !icon) return <div style={{ height: 270, background: '#1b3226', borderRadius: 20 }} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <button type="button" onClick={useCurrentLocation} style={locateBtn}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 21.5s7-6.1 7-11a7 7 0 10-14 0c0 4.9 7 11 7 11z" stroke="#06281A" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="12" cy="10.2" r="2.7" fill="#06281A" />
        </svg>
        <span>{locating ? 'Finding you...' : 'Use My Current Location'}</span>
      </button>

      <div style={{ position: 'relative' }}>
        <div style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', height: 50, borderRadius: 15, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.13)' }}>
          <Search size={18} color="rgba(255,255,255,.45)" style={{ flex: 'none' }} />
          <input
            type="text"
            value={query}
            onChange={handleSearchChange}
            placeholder="Search a place or area to jump there..."
            style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', fontFamily: FONT, fontSize: 16, fontWeight: 500, color: '#fff', outline: 'none' }}
          />
        </div>

        {(results.length > 0 || searching) && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#173D28', border: '1px solid rgba(255,255,255,.13)', borderRadius: 15, marginTop: 6, zIndex: 1000, overflow: 'hidden' }}>
            {searching && <div style={{ padding: 12, fontSize: 13, color: 'rgba(255,255,255,.6)' }}>Searching...</div>}
            {results.map((r) => (
              <div
                key={r.place_id}
                onClick={() => handleSelectResult(r)}
                style={{ padding: 12, fontSize: 13, color: 'rgba(255,255,255,.85)', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,.08)' }}
              >
                {r.display_name}
              </div>
            ))}
          </div>
        )}
      </div>

      <p style={{ margin: '-4px 0 0', fontSize: 11.5, lineHeight: 1.5, color: 'rgba(255,255,255,.5)' }}>
        Search moves the map to that area — tap or drag the pin below to mark the exact spot.
      </p>

      <div style={{ flex: 'none', position: 'relative', width: '100%', height: 270, borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,.15)', boxShadow: '0 16px 34px rgba(0,0,0,.35)', background: '#1b3226' }}>
        <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false} attributionControl={false}>
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
        <div style={{ position: 'absolute', right: 10, bottom: 8, padding: '3px 7px', borderRadius: 6, background: 'rgba(6,40,26,.72)', font: "500 8.5px ui-monospace,Menlo,monospace", color: 'rgba(255,255,255,.7)', pointerEvents: 'none' }}>
          © OpenStreetMap
        </div>
      </div>

      {lat && lng && (
        <div style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.45)' }}>Pin set at</span>
          <span style={{ font: "500 12px 'JetBrains Mono',ui-monospace,Menlo,monospace", color: 'rgba(255,255,255,.72)', letterSpacing: '.2px' }}>
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </span>
        </div>
      )}
    </div>
  );
}