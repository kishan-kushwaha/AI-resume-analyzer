import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, LogOut, MessageSquare, ChevronDown, ChevronUp,
  Copy, CheckCircle, Zap, Target, Users, ArrowRight, Lightbulb
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { resumeAPI, interviewAPI } from '../services/api';

const CATEGORY_COLORS = {
  Technical: { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.4)', color: 'var(--purple-400)', icon: <Zap size={13} /> },
  Behavioral: { bg: 'rgba(34,211,238,0.1)', border: 'rgba(34,211,238,0.3)', color: 'var(--cyan-400)', icon: <Users size={13} /> },
  Situational: { bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)', color: 'var(--amber-400)', icon: <Target size={13} /> },
  HR: { bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.3)', color: 'var(--emerald-400)', icon: <MessageSquare size={13} /> },
};

const DIFFICULTY_COLORS = {
  Easy: 'var(--emerald-400)',
  Medium: 'var(--amber-400)',
  Hard: 'var(--rose-400)',
};

function QuestionCard({ q, index }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const cat = CATEGORY_COLORS[q.category] || CATEGORY_COLORS.Technical;

  const copyAnswer = () => {
    navigator.clipboard.writeText(`Q: ${q.question}\n\nA: ${q.idealAnswer}`);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      style={{
        border: `1px solid ${open ? cat.border : 'var(--border-color)'}`,
        borderRadius: 14,
        background: open ? cat.bg : 'var(--bg-card)',
        transition: 'all 0.25s',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 14,
          padding: '18px 20px', background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: '50%', background: cat.bg,
          border: `1px solid ${cat.border}`, display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: cat.color, fontWeight: 800, fontSize: 14,
          flexShrink: 0,
        }}>
          {index + 1}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
            {q.question}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 11, padding: '2px 10px', borderRadius: 20,
              background: cat.bg, border: `1px solid ${cat.border}`,
              color: cat.color, display: 'flex', alignItems: 'center', gap: 4,
            }}>
              {cat.icon} {q.category}
            </span>
            <span style={{ fontSize: 11, color: DIFFICULTY_COLORS[q.difficulty], fontWeight: 600 }}>
              ● {q.difficulty}
            </span>
          </div>
        </div>
        <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 20px 20px 20px', borderTop: `1px solid ${cat.border}` }}>
              <div style={{ paddingTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: cat.color }}>💡 Ideal Answer</span>
                  <button onClick={copyAnswer} className="btn btn-secondary btn-sm" style={{ padding: '4px 12px', fontSize: 12 }}>
                    {copied ? <><CheckCircle size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                  </button>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 14 }}>
                  {q.idealAnswer}
                </p>
                {q.tip && (
                  <div style={{
                    padding: '10px 14px', borderRadius: 10, background: 'rgba(251,191,36,0.08)',
                    border: '1px solid rgba(251,191,36,0.2)', display: 'flex', gap: 8, alignItems: 'flex-start',
                  }}>
                    <Lightbulb size={14} color="var(--amber-400)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 13, color: 'var(--amber-400)' }}><strong>Tip:</strong> {q.tip}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function InterviewPage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    resumeAPI.getAll().then(res => {
      setResumes(res.data.resumes || []);
      if (res.data.resumes?.length > 0) setSelectedResumeId(res.data.resumes[0].id);
    }).catch(() => toast.error('Failed to load resumes'));
  }, []);

  const handleGenerate = async () => {
    if (!selectedResumeId) { toast.error('Please select a resume'); return; }
    setGenerating(true);
    try {
      const res = await interviewAPI.generate({ resumeId: selectedResumeId, jobTitle, jobDescription });
      setResult(res.data);
      toast.success(`${res.data.questions.length} questions generated!`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const categories = ['All', 'Technical', 'Behavioral', 'Situational', 'HR'];
  const filteredQuestions = result?.questions?.filter(q => filter === 'All' || q.category === filter) || [];

  return (
    <div className="page-wrapper">
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link to="/" className="navbar-brand">
            <Brain size={24} color="var(--purple-400)" /><span className="brand-gradient">ResumeAI</span>
          </Link>
          <div className="navbar-links">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/upload" className="nav-link">Upload</Link>
            <Link to="/match" className="nav-link">Job Match</Link>
            <Link to="/interview" className="nav-link active">Interview Prep</Link>
            <button onClick={() => { logout(); navigate('/'); }} className="btn btn-secondary btn-sm">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="page-content">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-header">
            <h1 className="page-title">🎯 Interview Prep</h1>
            <p className="page-subtitle">AI generates personalized interview questions with ideal answers based on your resume</p>
          </motion.div>

          <div className="grid-2" style={{ gap: 32, alignItems: 'flex-start' }}>
            {/* Left: Input */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, marginBottom: 18, fontFamily: 'Outfit, sans-serif' }}>Select Resume</h3>
                {resumes.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 14 }}>No resumes uploaded yet</p>
                    <Link to="/upload" className="btn btn-primary btn-sm"><ArrowRight size={14} /> Upload Resume</Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {resumes.map(r => (
                      <label key={r.id} style={{
                        display: 'flex', gap: 10, alignItems: 'center', padding: '10px 14px',
                        borderRadius: 10, cursor: 'pointer',
                        border: `1px solid ${selectedResumeId === r.id ? 'var(--purple-500)' : 'var(--border-color)'}`,
                        background: selectedResumeId === r.id ? 'rgba(139,92,246,0.1)' : 'transparent',
                        transition: 'all 0.2s',
                      }}>
                        <input type="radio" name="resume" value={r.id} checked={selectedResumeId === r.id}
                          onChange={() => setSelectedResumeId(r.id)} style={{ accentColor: 'var(--purple-400)' }} />
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{r.original_name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="glass-card" style={{ padding: 28 }}>
                <h3 style={{ fontSize: 16, marginBottom: 18, fontFamily: 'Outfit, sans-serif' }}>Job Details (Optional)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Job Title</label>
                    <input type="text" className="form-input" placeholder="e.g. React Developer"
                      value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Job Description</label>
                    <textarea className="form-input form-textarea" placeholder="Paste job description for more relevant questions..."
                      value={jobDescription} onChange={e => setJobDescription(e.target.value)}
                      style={{ minHeight: 120 }} />
                  </div>
                  <button onClick={handleGenerate} disabled={generating || !selectedResumeId} className="btn btn-primary"
                    style={{ justifyContent: 'center' }}>
                    {generating
                      ? <><div className="spinner" />Generating Questions...</>
                      : <><MessageSquare size={16} />Generate Interview Q&A</>}
                  </button>
                  {generating && (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                      AI is preparing 10 personalized questions...
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Right: Results */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
              {!result ? (
                <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%', background: 'rgba(139,92,246,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px', color: 'var(--purple-400)',
                  }}>
                    <MessageSquare size={36} />
                  </div>
                  <h3 style={{ fontSize: 18, fontFamily: 'Outfit, sans-serif', marginBottom: 8 }}>Interview Questions Appear Here</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                    Select a resume and click Generate to get 10 personalized questions
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 28, flexWrap: 'wrap' }}>
                    {Object.entries(CATEGORY_COLORS).map(([cat, style]) => (
                      <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: style.color }}>
                        {style.icon} {cat}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  {/* Stats */}
                  <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                    <div className="glass-card" style={{ padding: '14px 20px', flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--purple-400)', fontFamily: 'Outfit, sans-serif' }}>
                        {result.questions.length}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Questions</div>
                    </div>
                    {Object.entries(CATEGORY_COLORS).map(([cat, style]) => (
                      <div key={cat} className="glass-card" style={{ padding: '14px 20px', flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: style.color, fontFamily: 'Outfit, sans-serif' }}>
                          {result.questions.filter(q => q.category === cat).length}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{cat}</div>
                      </div>
                    ))}
                  </div>

                  {/* Filter */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                    {categories.map(cat => (
                      <button key={cat} onClick={() => setFilter(cat)}
                        style={{
                          padding: '6px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                          border: `1px solid ${filter === cat ? 'var(--purple-500)' : 'var(--border-color)'}`,
                          background: filter === cat ? 'rgba(139,92,246,0.2)' : 'transparent',
                          color: filter === cat ? 'var(--purple-400)' : 'var(--text-secondary)',
                          transition: 'all 0.2s',
                        }}>
                        {cat} {cat !== 'All' && `(${result.questions.filter(q => q.category === cat).length})`}
                      </button>
                    ))}
                  </div>

                  {/* Questions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {filteredQuestions.map((q, i) => (
                      <QuestionCard key={q.id || i} q={q} index={i} />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
