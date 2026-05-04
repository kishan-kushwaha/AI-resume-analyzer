import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Upload, FileText, BarChart3, Zap, LogOut, Plus, Trash2, Eye, Clock, MessageSquare, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { resumeAPI } from '../services/api';
import ResumePreviewModal from '../components/ResumePreviewModal';

const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const formatSize = (bytes) => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

function ScoreRing({ value, label, color, size = 100 }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const progress = ((value || 0) / 100) * circ;

  return (
    <div className="score-ring-container">
      <div className="score-ring" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circ} strokeDashoffset={circ - progress} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s ease', filter: `drop-shadow(0 0 6px ${color}80)` }}
          />
        </svg>
        <div className="score-ring-value" style={{ color }}>{value ?? '—'}{value !== undefined && value !== null ? '%' : ''}</div>
      </div>
      <div className="score-ring-label">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [previewResume, setPreviewResume] = useState(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await resumeAPI.getAll();
      setResumes(res.data.resumes);
    } catch {
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resume? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await resumeAPI.delete(id);
      setResumes(resumes.filter(r => r.id !== id));
      toast.success('Resume deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  return (
    <div className="page-wrapper" style={{ background: 'var(--bg-primary)' }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link to="/" className="navbar-brand">
            <Brain size={24} color="var(--purple-400)" />
            <span className="brand-gradient">ResumeAI</span>
          </Link>
          <div className="navbar-links">
            <Link to="/dashboard" className="nav-link active">Dashboard</Link>
            <Link to="/upload" className="nav-link">Upload</Link>
            <Link to="/match" className="nav-link">Job Match</Link>
            <Link to="/interview" className="nav-link">Interview Prep</Link>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="page-content">
        <div className="container">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
                <p className="page-subtitle">Manage your resumes and AI analyses</p>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/interview" className="btn btn-secondary btn-sm"><MessageSquare size={14} /> Interview Prep</Link>
                <Link to="/match" className="btn btn-secondary btn-sm"><Zap size={14} /> Job Match</Link>
                <Link to="/upload" className="btn btn-primary btn-sm"><Plus size={14} /> Upload Resume</Link>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid-3" style={{ marginBottom: 40 }}>
            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="stat-number">{resumes.length}</div>
                  <div className="stat-label">Resumes Uploaded</div>
                </div>
                <FileText size={24} color="var(--purple-400)" style={{ opacity: 0.6 }} />
              </div>
            </div>
            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="stat-number">{resumes.filter(r => r.analysis_id).length}</div>
                  <div className="stat-label">Analyses Done</div>
                </div>
                <BarChart3 size={24} color="var(--cyan-400)" style={{ opacity: 0.6 }} />
              </div>
            </div>
            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="stat-number">{resumes.filter(r => r.ats_score >= 80).length}</div>
                  <div className="stat-label">ATS Ready (80+)</div>
                </div>
                <Zap size={24} color="var(--emerald-400)" style={{ opacity: 0.6 }} />
              </div>
            </div>
          </motion.div>

          {/* Resumes List */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>Your Resumes</h2>
            </div>

            {loading ? (
              <div className="loading-overlay"><div className="spinner" /><p>Loading resumes...</p></div>
            ) : resumes.length === 0 ? (
              <div className="glass-card" style={{ padding: 0 }}>
                <div className="empty-state">
                  <div className="empty-state-icon"><FileText size={48} /></div>
                  <h3>No resumes yet</h3>
                  <p>Upload your first resume to get started with AI analysis</p>
                  <Link to="/upload" className="btn btn-primary"><Upload size={16} /> Upload Resume</Link>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {resumes.map((resume, i) => (
                  <motion.div
                    key={resume.id}
                    className="glass-card"
                    style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--purple-400)', flexShrink: 0 }}>
                      <FileText size={22} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {resume.original_name}
                      </div>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                        <span><Clock size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {formatDate(resume.created_at)}</span>
                        {resume.file_size && <span>{formatSize(resume.file_size)}</span>}
                      </div>
                    </div>

                    {resume.analysis_id ? (
                      <div style={{ display: 'flex', gap: 20 }}>
                        <ScoreRing value={resume.ats_score} label="ATS" color="var(--purple-400)" size={72} />
                        <ScoreRing value={resume.resume_score} label="Score" color="var(--cyan-400)" size={72} />
                      </div>
                    ) : (
                      <div className="badge badge-amber" style={{ fontSize: 12 }}>Not Analysed</div>
                    )}

                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <button
                        onClick={() => setPreviewResume(resume)}
                        className="btn btn-secondary btn-sm"
                        title="Preview Resume"
                      >
                        <Search size={14} /> Preview
                      </button>
                      <Link to={`/analyse/${resume.id}`} className="btn btn-secondary btn-sm">
                        <Eye size={14} /> {resume.analysis_id ? 'View' : 'Analyse'}
                      </Link>
                      <button
                        id={`delete-resume-${resume.id}`}
                        onClick={() => handleDelete(resume.id)}
                        className="btn btn-danger btn-sm"
                        disabled={deleting === resume.id}
                      >
                        {deleting === resume.id ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {previewResume && (
        <ResumePreviewModal
          resume={previewResume}
          onClose={() => setPreviewResume(null)}
        />
      )}
    </div>
  );
}
