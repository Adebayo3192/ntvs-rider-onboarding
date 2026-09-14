'use client';

import { useEffect, useState } from 'react';
import { Copy, Share2, Check, Link2, X } from 'lucide-react';

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";
const ACCENT = '#0FA45C';

export default function AddRiderModal({ onClose }) {
  const [link, setLink] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share);

    fetch('/api/riders', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        setLink(data.link);
        setMessage(
          `Hello,\n\nYou can now complete your rider registration with NTVS Delivery.\nClick the link below to start:\n\n${data.link}\n\nThank you!`
        );
        setLoading(false);
      });
  }, []);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyMessage = async () => {
    await navigator.clipboard.writeText(message);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  const handleShare = async () => {
    try {
      await navigator.share({ text: message });
    } catch (err) {
      // user cancelled the share sheet
    }
  };

  const stepNum = { flex: 'none', width: 28, height: 28, borderRadius: '50%', background: '#DCF4E6', color: '#04763F', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(10,30,20,.42)', backdropFilter: 'blur(1.5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 28, boxSizing: 'border-box', zIndex: 2000, fontFamily: FONT }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: 620, maxWidth: '100%', maxHeight: '100%', overflowY: 'auto', padding: '26px 28px 22px', boxSizing: 'border-box', borderRadius: 22, background: '#fff', boxShadow: '0 36px 80px rgba(10,30,20,.35)' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ flex: 'none', width: 48, height: 48, borderRadius: 15, background: '#DCF4E6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Link2 size={22} color={ACCENT} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 23, fontWeight: 800, letterSpacing: '-.6px', color: '#10281C' }}>Add Rider</div>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: '#7C8A83', marginTop: 4 }}>Generate a registration link and share it with the rider.</div>
          </div>
          <X size={20} color="#9AA8A0" style={{ cursor: 'pointer', flex: 'none' }} onClick={onClose} />
        </div>

        {loading ? (
          <p style={{ marginTop: 24, fontSize: 14, color: '#7C8A83' }}>Generating link...</p>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginTop: 22 }}>
              <span style={stepNum}>1</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15.5, fontWeight: 800, color: '#10281C' }}>Generate Onboarding Link</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#7C8A83', marginTop: 3 }}>This link will allow the rider to complete their application.</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 10, height: 52, padding: '0 16px', borderRadius: 14, background: '#F5F9F6', border: '1px solid #E2E9E4', boxSizing: 'border-box' }}>
                <Link2 size={17} color="#7C8A83" style={{ flex: 'none' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#3A4C43', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{link}</span>
              </div>
              <button
                onClick={handleCopyLink}
                style={{ flex: 'none', height: 52, padding: '0 20px', border: 'none', borderRadius: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, fontFamily: FONT, fontSize: 14.5, fontWeight: 800, color: '#fff', background: `linear-gradient(100deg,#0BAE5E,${ACCENT})` }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            {canShare && (
              <div style={{ marginTop: 12 }}>
                <button
                  onClick={handleShare}
                  style={{ width: '100%', height: 50, borderRadius: 14, background: '#fff', border: '1.5px solid #AEE4C6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, fontFamily: FONT, fontSize: 14.5, fontWeight: 800, color: '#04763F', cursor: 'pointer', boxSizing: 'border-box' }}
                >
                  <Share2 size={17} /> Share Link
                </button>
              </div>
            )}

            <div style={{ height: 1, background: '#EEF2EF', margin: '20px 0' }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <span style={stepNum}>2</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15.5, fontWeight: 800, color: '#10281C' }}>Message Template (editable)</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#7C8A83', marginTop: 3 }}>You can send this message via WhatsApp, SMS, or any other channel.</div>
              </div>
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              style={{
                width: '100%',
                minHeight: 140,
                marginTop: 12,
                padding: '16px 18px',
                borderRadius: 15,
                background: '#F5F9F6',
                border: '1px solid #E2E9E4',
                fontFamily: FONT,
                fontSize: 13.5,
                fontWeight: 500,
                color: '#3A4C43',
                lineHeight: 1.55,
                boxSizing: 'border-box',
                resize: 'vertical',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: '#9AA8A0' }}>{message.length}/500</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 14 }}>
              <button
                onClick={onClose}
                style={{ flex: 1, height: 52, borderRadius: 14, background: '#F4F7F5', border: '1px solid #E2E9E4', fontFamily: FONT, fontSize: 15, fontWeight: 800, color: '#3A4C43', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCopyMessage}
                style={{ flex: 1.35, height: 52, border: 'none', borderRadius: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: FONT, fontSize: 15, fontWeight: 800, color: '#fff', background: `linear-gradient(100deg,#0BAE5E,${ACCENT})` }}
              >
                {copiedMsg ? <Check size={16} /> : <Copy size={16} />} {copiedMsg ? 'Copied' : 'Copy Message'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}