import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Brain, Upload, FileText, CheckCircle, X, ArrowRight, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { resumeAPI } from '../services/api';

export default function UploadPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploaded, setUploaded] = useState(null);

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      toast.error('Only PDF or DOCX files under 5MB allowed');
      return;
    }
    setFile(accepted[0]);
    setUploaded(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxSize: 5 * 1024 * 1024,
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await resumeAPI.upload(formData, setProgress);
      setUploaded(res.data.resume);
      toast.success('Resume uploaded and parsed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="page-wrapper">
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link to="/" className="navbar-brand">
            <Brain size={24} color="var(--purple-400)" />
            <span className="brand-gradient">ResumeAI</span>
          </Link>
          <div className="navbar-links">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/upload" className="nav-link active">Upload</Link>
            <Link to="/match" className="nav-link">Job Match</Link>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm"><LogOut size={14} /> Logout</button>
          </div>
        </div>
      </nav>

      <div className="page-content">
        <div className="container" style={{ maxWidth: 720 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-header">
            <h1 className="page-title">Upload Your Resume</h1>
            <p className="page-subtitle">Supports PDF and DOCX files up to 5MB</p>
          </motion.div>

          {!uploaded ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              {/* Dropzone */}
              <div {...getRootProps()} className={`dropzone-area ${isDragActive ? 'active' : ''}`}>
                <input {...getInputProps()} id="resume-file-input" />
                <div className="dropzone-icon">
                  <Upload size={28} />
                </div>
                <h3 style={{ fontSize: 20, marginBottom: 8, fontFamily: 'Outfit, sans-serif' }}>
                  {isDragActive ? 'Drop it here!' : 'Drag & Drop your Resume'}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
                  or click to browse files
                </p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <span className="badge badge-purple">PDF</span>
                  <span className="badge badge-cyan">DOCX</span>
                  <span className="badge badge-amber">Max 5MB</span>
                </div>
              </div>

              {/* Selected file */}
              {file && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card"
                  style={{ padding: 20, marginTop: 20, display: 'flex', alignItems: 'center', gap: 16 }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--purple-400)', flexShrink: 0 }}>
                    <FileText size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>{(file.size / 1024).toFixed(0)} KB</div>
                  </div>
                  <button onClick={() => setFile(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                    <X size={18} />
                  </button>
                </motion.div>
              )}

              {/* Progress */}
              {uploading && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span>Uploading & parsing...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="progress-bar-wrapper">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              <button
                id="upload-submit-btn"
                onClick={handleUpload}
                disabled={!file || uploading}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: 24, padding: '16px 24px', fontSize: 15 }}
              >
                {uploading ? (
                  <><div className="spinner" /> Uploading & Parsing...</>
                ) : (
                  <><Upload size={18} /> Upload & Parse Resume</>
                )}
              </button>
            </motion.div>
          ) : (
            /* Success */
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--emerald-400)' }}>
                <CheckCircle size={36} />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, fontFamily: 'Outfit, sans-serif' }}>Resume Uploaded!</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>{uploaded.original_name}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 32 }}>Text extracted successfully ({uploaded.textLength?.toLocaleString()} characters)</p>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to={`/analyse/${uploaded.id}`} className="btn btn-primary btn-lg">
                  <Brain size={18} /> Analyse with AI <ArrowRight size={16} />
                </Link>
                <Link to="/match" className="btn btn-secondary btn-lg">
                  Match to Job
                </Link>
              </div>

              <button
                onClick={() => { setFile(null); setUploaded(null); }}
                style={{ marginTop: 20, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13 }}
              >
                Upload another resume
              </button>
            </motion.div>
          )}

          {/* Tips */}
          {!uploaded && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: 24, marginTop: 24 }}>
              <h3 style={{ fontSize: 15, marginBottom: 16, fontFamily: 'Outfit, sans-serif' }}>💡 Tips for best results</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  'Use a text-based PDF (not scanned image)',
                  'Ensure your resume has clear sections: Experience, Skills, Education',
                  'Include your contact information and LinkedIn profile',
                  'Keep formatting simple — avoid complex tables or columns',
                ].map(tip => (
                  <div key={tip} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <CheckCircle size={15} color="var(--emerald-400)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
