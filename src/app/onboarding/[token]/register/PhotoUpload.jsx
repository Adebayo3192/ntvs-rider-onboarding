'use client';

import { useState } from 'react';
import { Camera, Image as ImageIcon, AlertCircle } from 'lucide-react';

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";

const uploadBtn = {
  flex: 1, minWidth: 0, height: 56, display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer',
  borderRadius: 15, fontFamily: FONT, color: '#fff',
  background: 'rgba(5,193,106,.11)', border: '1px solid rgba(5,193,106,.35)',
};

export default function PhotoUpload({ token, label, onUploaded, error }) {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file) => {
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
    setFileSize((file.size / (1024 * 1024)).toFixed(1) + ' MB');
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

  const hasPhoto = !!preview;

  return (
    <div style={{ flex: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.8)' }}>{label}</label>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: 10,
          borderRadius: 16,
          background: error ? 'rgba(255,107,107,.07)' : 'rgba(255,255,255,.05)',
          border: error ? '1px solid rgba(255,107,107,.42)' : '1px solid rgba(255,255,255,.12)',
        }}
      >
        {hasPhoto ? (
          <img src={preview} alt="" style={{ flex: 'none', width: 74, height: 52, borderRadius: 11, objectFit: 'cover', border: '1px solid rgba(255,255,255,.14)' }} />
        ) : (
          <div
            style={{
              flex: 'none', width: 74, height: 52, borderRadius: 11, overflow: 'hidden',
              background: 'repeating-linear-gradient(135deg,#2C4A38 0 6px,#25402F 6px 12px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(255,255,255,.14)',
            }}
          >
            <span style={{ font: "500 8px 'JetBrains Mono',ui-monospace,Menlo,monospace", color: 'rgba(255,255,255,.55)' }}>
              {uploading ? 'uploading' : 'no photo'}
            </span>
          </div>
        )}

        {hasPhoto ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#4FE39C' }}>{uploading ? 'Uploading...' : 'Photo added'}</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName} · {fileSize}</span>
          </div>
        ) : (
          <span style={{ fontSize: 12, lineHeight: 1.4, color: 'rgba(255,255,255,.6)' }}>Photo preview appears here once taken</span>
        )}
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#FF6B6B', color: '#3B0D0D', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>!</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#FF8E8E' }}>Please upload this photo</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <label style={uploadBtn}>
          <Camera size={22} color="#4FE39C" />
          <span style={{ fontSize: 12.5, fontWeight: 700 }}>Take Photo</span>
          <input type="file" accept="image/*" capture="environment" onChange={(e) => uploadFile(e.target.files[0])} style={{ display: 'none' }} />
        </label>
        <label style={uploadBtn}>
          <ImageIcon size={22} color="#4FE39C" />
          <span style={{ fontSize: 12.5, fontWeight: 700 }}>Gallery</span>
          <input type="file" accept="image/*" onChange={(e) => uploadFile(e.target.files[0])} style={{ display: 'none' }} />
        </label>
      </div>
    </div>
  );
}