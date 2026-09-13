'use client';

import { useEffect, useState } from 'react';
import { Copy, Share2, Check } from 'lucide-react';

export default function AddRiderModal({ onClose }) {
  const [link, setLink] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share);

    fetch('/api/riders', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        setLink(data.link);
        setMessage(
          `Hi, welcome to NTVS! Please use this link to complete your rider registration: ${data.link}`
        );
        setLoading(false);
      });
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await navigator.share({ text: message });
    } catch (err) {
      // user cancelled the share sheet — no action needed
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 2000 }}>
      <div style={{ background: '#173D28', borderRadius: 16, padding: 24, width: '100%', maxWidth: 460 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: '#fff' }}>New Rider Link</h2>

        {loading ? (
          <p style={{ color: '#7FB89E', fontSize: 14 }}>Generating link...</p>
        ) : (
          <>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#B7D4C4', marginBottom: 6, display: 'block' }}>
              Message to send
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                width: '100%',
                minHeight: 120,
                padding: 14,
                borderRadius: 12,
                border: '1px solid #2A4A38',
                background: 'rgba(255,255,255,0.06)',
                color: '#fff',
                fontSize: 15,
                boxSizing: 'border-box',
                marginBottom: 16,
                resize: 'vertical',
              }}
            />

            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              {canShare && (
                <button
                  onClick={handleShare}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 12, border: 'none', background: '#05C16A', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                >
                  <Share2 size={16} /> Share
                </button>
              )}
              <button
                onClick={handleCopy}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 12, border: '1px solid #2A4A38', background: 'transparent', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </>
        )}

        <button
          onClick={onClose}
          style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #2A4A38', background: 'transparent', color: '#7FB89E', fontSize: 14, cursor: 'pointer', marginTop: 6 }}
        >
          Close
        </button>
      </div>
    </div>
  );
}