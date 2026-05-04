import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, ArrowLeft, Zap, Target, CheckCircle, XCircle, Lightbulb, ArrowUpRight, FileText, LogOut, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { useAuthStore } from '../store/authStore';
import { analysisAPI, resumeAPI, reportAPI } from '../services/api';

function ScoreRing({ value, label, color, size = 120 }) {
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const progress = ((value || 0) / 100) * circ;
  return (
    <div className="score-ring-container">
      <div className="score-ring" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circ} strokeDashoffset={circ - progress} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.5s ease', filter: `drop-shadow(0 0 8px ${color}80)` }} />
        </svg>
        <div className="score-ring-value" style={{ color, fontSize: 26 }}>{value ?? '—'}{value != null ? '%' : ''}</div>
      </div>
      <div className="score-ring-label" style={{ fontSize: 13 }}>{label}</div>
    </div>
  );
}

function getScoreColor(score) {
  if (score >= 80) return 'var(--emerald-400)';
  if (score >= 60) return 'var(--amber-400)';
  return 'var(--rose-400)';
}

export default function AnalysisPage() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [resume, setResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analysing, setAnalysing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => { fetchResume(); }, [resumeId]);

  const fetchResume = async () => {
    try {
      const res = await resumeAPI.getOne(resumeId);
      setResume(res.data.resume);
      if (res.data.resume.analysis_id) {
        setAnalysis({
          id: res.data.resume.analysis_id,
          ats_score: res.data.resume.ats_score,
          resume_score: res.data.resume.resume_score,
          matched_skills: res.data.resume.matched_skills,
          missing_skills: res.data.resume.missing_skills,
          suggestions: res.data.resume.suggestions,
          improved_bullets: res.data.resume.improved_bullets,
          overall_feedback: res.data.resume.overall_feedback,
        });
      }
    } catch { toast.error('Failed to load resume'); navigate('/dashboard'); }
    finally { setLoading(false); }
  };

  const runAnalysis = async () => {
    setAnalysing(true);
    try {
      const res = await analysisAPI.analyse(resumeId);
      setAnalysis(res.data.analysis);
      toast.success(res.data.cached ? 'Loaded from cache!' : 'Resume analysed!');
    } catch (err) { toast.error(err.response?.data?.error || 'Analysis failed'); }
    finally { setAnalysing(false); }
  };

  const handleGenerateReport = async () => {
    if (!analysis) return;
    setGeneratingReport(true);
    try {
      const res = await reportAPI.generate({ resumeId, analysisId: analysis.id });
      toast.success('Report generated!');
      navigate(`/report/${res.data.reportId}`);
    } catch { toast.error('Failed to generate report'); }
    finally { setGeneratingReport(false); }
  };

  const bullets = analysis?.improved_bullets
    ? (typeof analysis.improved_bullets === 'string' ? JSON.parse(analysis.improved_bullets) : analysis.improved_bullets)
    : [];

  if (loading) return (
    <div className="page-wrapper">
      <div className="loading-overlay"><div className="spinner" /><p>Loading resume...</p></div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link to="/" className="navbar-brand">
            <Brain size={24} color="var(--purple-400)" /><span className="brand-gradient">ResumeAI</span>
          </Link>
          <div className="navbar-links">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/match" className="nav-link">Job Match</Link>
            <button onClick={() => { logout(); navigate('/'); }} className="btn btn-secondary btn-sm"><LogOut size={14} /> Logout</button>
          </div>
        </div>
      </nav>

      <div className="page-content">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <button onClick={() => navigate('/dashboard')} className="btn btn-secondary btn-sm" style={{ marginBottom: 20 }}>
              <ArrowLeft size={14} /> Back
            </button>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h1 className="page-title">Resume Analysis</h1>
                <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}><FileText size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />{resume?.original_name}</div>
              </div>
              {analysis && (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <Link to="/match" className="btn btn-outline btn-sm"><Target size={14} /> Match to Job</Link>
                  <button id="generate-report-btn" onClick={handleGenerateReport} disabled={generatingReport} className="btn btn-secondary btn-sm">
                    {generatingReport ? <><div className="spinner" style={{ width: 14, height: 14 }} />Generating...</> : <><Download size={14} /> Get Report</>}
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {!analysis ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="glass-card" style={{ padding: 60, textAlign: 'center', marginTop: 32 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--purple-400)' }}>
                <Brain size={40} />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, fontFamily: 'Outfit, sans-serif' }}>Ready to Analyse!</h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: 440, margin: '0 auto 32px', lineHeight: 1.7 }}>
                AI will analyse your resume and give you ATS score, quality score, missing skills, and actionable suggestions.
              </p>
              <button id="run-analysis-btn" onClick={runAnalysis} disabled={analysing} className="btn btn-primary btn-lg">
                {analysing ? <><div className="spinner" />Analysing...</> : <><Brain size={20} />Analyse My Resume<ArrowUpRight size={18} /></>}
              </button>
              {analysing && <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 16 }}>This takes 10-20 seconds...</p>}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <div className="glass-card" style={{ padding: 32, marginTop: 24, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 32 }}>
                  <ScoreRing value={analysis.ats_score} label="ATS Score" color={getScoreColor(analysis.ats_score)} />
                  <ScoreRing value={analysis.resume_score} label="Resume Score" color={getScoreColor(analysis.resume_score)} />
                  <div style={{ textAlign: 'center', maxWidth: 200, display: 'flex', alignItems: 'center' }}>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{analysis.overall_feedback}</p>
                  </div>
                </div>
              </div>

              <div className="tabs" style={{ marginBottom: 24 }}>
                {['overview', 'skills', 'suggestions', 'bullets'].map(t => (
                  <button key={t} id={`tab-${t}`} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              {activeTab === 'overview' && (
                <div className="grid-2" style={{ gap: 24 }}>
                  <div className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 16, fontFamily: 'Outfit, sans-serif' }}>Resume Radar</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <RadarChart data={[
                        { subject: 'ATS', value: analysis.ats_score || 0 },
                        { subject: 'Content', value: analysis.resume_score || 0 },
                        { subject: 'Skills', value: Math.min(100, (analysis.matched_skills?.length || 0) * 10) },
                        { subject: 'Completeness', value: Math.min(100, (analysis.ats_score || 0) + 5) },
                        { subject: 'Impact', value: bullets.length > 0 ? 75 : 40 },
                      ]}>
                        <PolarGrid stroke="rgba(255,255,255,0.08)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                        <Radar dataKey="value" stroke="var(--purple-400)" fill="var(--purple-400)" fillOpacity={0.2} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 16, fontFamily: 'Outfit, sans-serif' }}>Score Breakdown</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={[{ name: 'ATS', val: analysis.ats_score }, { name: 'Resume', val: analysis.resume_score }]} barSize={48}>
                        <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'var(--text-primary)' }} />
                        <Bar dataKey="val" radius={[6, 6, 0, 0]}><Cell fill="var(--purple-400)" /><Cell fill="var(--cyan-400)" /></Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="grid-2" style={{ gap: 24 }}>
                  <div className="glass-card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
                      <CheckCircle size={18} color="var(--emerald-400)" />
                      <h3 style={{ fontSize: 16, fontFamily: 'Outfit, sans-serif' }}>Matched Skills ({analysis.matched_skills?.length || 0})</h3>
                    </div>
                    <div className="skills-container">
                      {analysis.matched_skills?.map(s => <span key={s} className="skill-chip skill-chip-green">{s}</span>)}
                    </div>
                  </div>
                  <div className="glass-card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
                      <XCircle size={18} color="var(--rose-400)" />
                      <h3 style={{ fontSize: 16, fontFamily: 'Outfit, sans-serif' }}>Missing Skills ({analysis.missing_skills?.length || 0})</h3>
                    </div>
                    <div className="skills-container">
                      {analysis.missing_skills?.map(s => <span key={s} className="skill-chip skill-chip-red">{s}</span>)}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'suggestions' && (
                <div className="glass-card" style={{ padding: 28 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center' }}>
                    <Lightbulb size={18} color="var(--amber-400)" />
                    <h3 style={{ fontSize: 16, fontFamily: 'Outfit, sans-serif' }}>AI Improvement Suggestions</h3>
                  </div>
                  {analysis.suggestions?.map((s, i) => (
                    <div key={i} className="suggestion-item">
                      <span style={{ color: 'var(--purple-400)', fontWeight: 700, fontSize: 16 }}>{i + 1}.</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'bullets' && (
                <div className="glass-card" style={{ padding: 28 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center' }}>
                    <Zap size={18} color="var(--purple-400)" />
                    <h3 style={{ fontSize: 16, fontFamily: 'Outfit, sans-serif' }}>AI-Improved Bullet Points</h3>
                  </div>
                  {bullets.length > 0 ? bullets.map((b, i) => (
                    <div key={i} className="bullet-compare">
                      <div className="bullet-original"><div className="bullet-label bullet-label-original">✗ Original</div>{b.original}</div>
                      <div className="bullet-improved"><div className="bullet-label bullet-label-improved">✓ AI Improved</div>{b.improved}</div>
                    </div>
                  )) : <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No bullet improvements. Your bullets look good!</p>}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
