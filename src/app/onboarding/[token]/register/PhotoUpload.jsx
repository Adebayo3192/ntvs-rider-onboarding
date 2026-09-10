'use client';

import { useState } from 'react';

export default function PhotoUpload({ token, label, onUploaded }) {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
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
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 100,
          borderRadius: 12,
          border: '1px dashed #2A4A38',
          background: 'rgba(255,255,255,0.06)',
          cursor: 'pointer',
          overflow: 'hidden',
        }}
      >
        {preview ? (
          <img src={preview} alt="preview" style={{ height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 13, color: '#7FB89E' }}>
            {uploading ? 'Uploading...' : 'Tap to upload photo'}
          </span>
        )}
        <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      </label>
    </div>
  );
}