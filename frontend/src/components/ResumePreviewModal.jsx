import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Download, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function ResumePreviewModal({ resume, onClose }) {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Build URL — uses auth token as query param for the iframe
  const previewUrl = `http://localhost:5000/api/resume/file/${resume.id}?token=${token}`;
  const isPdf = resume.mime_type === 'application/pdf' || resume.original_name?.endsWith('.pdf');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 20,
            width: '100%',
            maxWidth: 860,
            height: '88vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 24px', borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FileText size={18} color="var(--purple-400)" />
              <span style={{ fontWeight: 600, fontSize: 15 }}>{resume.original_name}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <a
                href={`http://localhost:5000/api/resume/file/${resume.id}?token=${token}&download=1`}
                target="_blank" rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ textDecoration: 'none' }}
              >
                <Download size={13} /> Download
              </a>
              <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '6px 10px' }}>
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Preview */}
          <div style={{ flex: 1, position: 'relative', background: '#f5f5f5' }}>
            {isPdf ? (
              <>
                {loading && (
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', background: 'var(--bg-card)', flexDirection: 'column', gap: 12,
                  }}>
                    <div className="spinner" style={{ width: 36, height: 36 }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading preview...</p>
                  </div>
                )}
                <iframe
                  src={previewUrl}
                  title="Resume Preview"
                  style={{ width: '100%', height: '100%', border: 'none', display: loading ? 'none' : 'block' }}
                  onLoad={() => setLoading(false)}
                  onError={() => { setError(true); setLoading(false); }}
                />
                {error && (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    height: '100%', flexDirection: 'column', gap: 16,
                  }}>
                    <FileText size={48} color="var(--text-muted)" />
                    <p style={{ color: 'var(--text-muted)' }}>Preview unavailable</p>
                    <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                      <ExternalLink size={14} /> Open in New Tab
                    </a>
                  </div>
                )}
              </>
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100%', flexDirection: 'column', gap: 16, background: 'var(--bg-card)',
              }}>
                <FileText size={64} color="var(--purple-400)" />
                <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
                  DOCX files cannot be previewed directly
                </p>
                <a href={previewUrl} target="_blank" rel="noopener noreferrer"
                  className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                  <Download size={14} /> Download to View
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
