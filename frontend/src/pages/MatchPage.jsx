import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Target, LogOut, ArrowRight, Building, Briefcase, Copy, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { resumeAPI, jobsAPI, reportAPI } from '../services/api';

function ScoreRing({ value, color, size = 100 }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const progress = ((value || 0) / 100) * circ;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={circ - progress} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s ease', filter: `drop-shadow(0 0 8px ${color}80)` }} />
      </svg>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 22, fontWeight: 800, fontFamily: 'Outfit, sans-serif', color }}>{value ?? '—'}%</div>
    </div>
  );
}

export default function MatchPage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [matching, setMatching] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    resumeAPI.getAll().then(res => {
      setResumes(res.data.resumes);
      if (res.data.resumes.length > 0) setSelectedResumeId(res.data.resumes[0].id);
    }).catch(() => toast.error('Failed to load resumes'));
  }, []);

  const handleMatch = async () => {
    if (!selectedResumeId) { toast.error('Please select a resume'); return; }
    if (jobDescription.trim().length < 50) { toast.error('Please paste a full job description (min 50 chars)'); return; }
    setMatching(true);
    try {
      const res = await jobsAPI.match({ resumeId: selectedResumeId, jobDescription, jobTitle, company });
      setResult(res.data.match);
      toast.success('Job match complete!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Matching failed');
    } finally {
      setMatching(false);
    }
  };

  const copyCoverLetter = () => {
    navigator.clipboard.writeText(result.cover_letter);
    setCopied(true);
    toast.success('Cover letter copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateReport = async () => {
    if (!result) return;
    try {
      const res = await reportAPI.generate({ resumeId: selectedResumeId, matchId: result.id });
      toast.success('Report generated!');
      navigate(`/report/${res.data.reportId}`);
    } catch { toast.error('Failed to generate report'); }
  };

  const matchColor = result
    ? result.match_percentage >= 80 ? 'var(--emerald-400)'
      : result.match_percentage >= 60 ? 'var(--amber-400)'
      : 'var(--rose-400)'
    : 'var(--purple-400)';

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
            <Link to="/match" className="nav-link active">Job Match</Link>
            <Link to="/interview" className="nav-link">Interview Prep</Link>
            <button onClick={() => { logout(); navigate('/'); }} className="btn btn-secondary btn-sm"><LogOut size={14} /> Logout</button>
          </div>
        </div>
      </nav>

      <div className="page-content">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-header">
            <h1 className="page-title">Job Match Analyser</h1>
            <p className="page-subtitle">Paste a job description and see how well your resume matches</p>
          </motion.div>

          <div className="grid-2" style={{ gap: 32, alignItems: 'flex-start' }}>
            {/* Left: Input */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="glass-card" style={{ padding: 28 }}>
                <h3 style={{ fontSize: 16, marginBottom: 20, fontFamily: 'Outfit, sans-serif' }}>Select Resume</h3>
                {resumes.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>No resumes uploaded yet</p>
                    <Link to="/upload" className="btn btn-primary btn-sm"><ArrowRight size={14} /> Upload Resume</Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {resumes.map(r => (
                      <label key={r.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 16px', borderRadius: 10, cursor: 'pointer', border: `1px solid ${selectedResumeId === r.id ? 'var(--purple-500)' : 'var(--border-color)'}`, background: selectedResumeId === r.id ? 'rgba(139,92,246,0.1)' : 'transparent', transition: 'all 0.2s' }}>
                        <input type="radio" name="resume" value={r.id} checked={selectedResumeId === r.id} onChange={() => setSelectedResumeId(r.id)} style={{ accentColor: 'var(--purple-400)' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.original_name}</div>
                          {r.ats_score && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>ATS: {r.ats_score}%</div>}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="glass-card" style={{ padding: 28 }}>
                <h3 style={{ fontSize: 16, marginBottom: 20, fontFamily: 'Outfit, sans-serif' }}>Job Details</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label"><Briefcase size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Job Title</label>
                    <input id="job-title-input" type="text" className="form-input" placeholder="e.g. Senior React Developer" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label"><Building size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Company</label>
                    <input id="company-input" type="text" className="form-input" placeholder="e.g. Google" value={company} onChange={e => setCompany(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Job Description *</label>
                    <textarea id="job-description-input" className="form-input form-textarea" placeholder="Paste the full job description here..." value={jobDescription} onChange={e => setJobDescription(e.target.value)} style={{ minHeight: 200 }} />
                  </div>
                  <button id="match-btn" onClick={handleMatch} disabled={matching || !selectedResumeId} className="btn btn-primary" style={{ justifyContent: 'center' }}>
                    {matching ? <><div className="spinner" />Analysing Match...</> : <><Target size={16} />Match My Resume<ArrowRight size={16} /></>}
                  </button>
                  {matching && <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>AI is comparing your resume to the JD...</p>}
                </div>
              </div>
            </motion.div>

            {/* Right: Results */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              {!result ? (
                <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(34,211,238,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--cyan-400)' }}>
                    <Target size={36} />
                  </div>
                  <h3 style={{ fontSize: 18, fontFamily: 'Outfit, sans-serif', marginBottom: 8 }}>Match Results Appear Here</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Fill in the job details and click Match to get your score</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Match Score */}
                  <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
                    <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                      <ScoreRing value={result.match_percentage} color={matchColor} size={130} />
                    </div>
                    <h3 style={{ fontSize: 20, fontFamily: 'Outfit, sans-serif', marginBottom: 8 }}>Job Match Score</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>{result.match_summary}</p>
                    <button onClick={handleGenerateReport} className="btn btn-primary btn-sm" style={{ justifyContent: 'center', width: '100%' }}>
                      Generate Full Report
                    </button>
                  </div>

                  {/* Keywords */}
                  <div className="glass-card" style={{ padding: 24 }}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10 }}>
                        <CheckCircle size={15} color="var(--emerald-400)" />
                        <span style={{ fontSize: 14, fontWeight: 600 }}>Matched Keywords ({result.matched_keywords?.length || 0})</span>
                      </div>
                      <div className="skills-container">
                        {result.matched_keywords?.map(k => <span key={k} className="skill-chip skill-chip-green">{k}</span>)}
                      </div>
                    </div>
                    <hr className="section-divider" />
                    <div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10 }}>
                        <Target size={15} color="var(--rose-400)" />
                        <span style={{ fontSize: 14, fontWeight: 600 }}>Missing Keywords ({result.missing_keywords?.length || 0})</span>
                      </div>
                      <div className="skills-container">
                        {result.missing_keywords?.map(k => <span key={k} className="skill-chip skill-chip-red">{k}</span>)}
                      </div>
                    </div>
                  </div>

                  {/* Cover Letter */}
                  {result.cover_letter && (
                    <div className="glass-card" style={{ padding: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontSize: 15, fontFamily: 'Outfit, sans-serif' }}>✉️ Generated Cover Letter</h3>
                        <button id="copy-cover-letter-btn" onClick={copyCoverLetter} className="btn btn-secondary btn-sm">
                          {copied ? <><CheckCircle size={13} />Copied!</> : <><Copy size={13} />Copy</>}
                        </button>
                      </div>
                      <div className="cover-letter-box">{result.cover_letter}</div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
