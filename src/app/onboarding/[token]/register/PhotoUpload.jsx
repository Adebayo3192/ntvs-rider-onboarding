'use client';

import { useState } from 'react';

export default function PhotoUpload({ token, label, onUploaded }) {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file) => {
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('token', token);

    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();

    setUploading(false);
    if (data.url) {
      onUploaded(data.url);
    }
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#B7D4C4', marginBottom: 6, display: 'block' }}>
        {label}
      </label>

      {preview && (
        <div style={{ marginBottom: 8, borderRadius: 12, overflow: 'hidden', height: 100 }}>
          <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <label
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px',
            borderRadius: 12,
            border: '1px dashed #2A4A38',
            background: 'rgba(255,255,255,0.06)',
            cursor: 'pointer',
            fontSize: 13,
            color: '#7FB89E',
            textAlign: 'center',
          }}
        >
          {uploading ? 'Uploading...' : 'Take Photo'}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => uploadFile(e.target.files[0])}
            style={{ display: 'none' }}
          />
        </label>

        <label
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px',
            borderRadius: 12,
            border: '1px dashed #2A4A38',
            background: 'rgba(255,255,255,0.06)',
            cursor: 'pointer',
            fontSize: 13,
            color: '#7FB89E',
            textAlign: 'center',
          }}
        >
          {uploading ? 'Uploading...' : 'Choose from Gallery'}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => uploadFile(e.target.files[0])}
            style={{ display: 'none' }}
          />
        </label>
      </div>
    </div>
  );
}