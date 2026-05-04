import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Download, ArrowLeft, LogOut, FileText, CheckCircle, XCircle, Target, Lightbulb, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useAuthStore } from '../store/authStore';
import { reportAPI } from '../services/api';

function ScoreCircle({ value, label, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 40, fontWeight: 900, fontFamily: 'Outfit, sans-serif', color }}>{value ?? '—'}{value != null ? '%' : ''}</div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default function ReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    reportAPI.getOne(id)
      .then(res => setReport(res.data.report))
      .catch(() => { toast.error('Report not found'); navigate('/dashboard'); })
      .finally(() => setLoading(false));
  }, [id]);

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const el = reportRef.current;
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#0a0a15', useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = pdfHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
      while (heightLeft > 0) {
        position -= pdf.internal.pageSize.getHeight();
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
      pdf.save(`ResumeAI_Report_${Date.now()}.pdf`);
      toast.success('PDF downloaded!');
    } catch (err) {
      toast.error('PDF generation failed');
    } finally {
      setDownloading(false);
    }
  };

  const bullets = report?.improved_bullets
    ? (typeof report.improved_bullets === 'string' ? JSON.parse(report.improved_bullets) : report.improved_bullets)
    : [];

  if (loading) return (
    <div className="page-wrapper">
      <div className="loading-overlay"><div className="spinner" /><p>Loading report...</p></div>
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
            <button id="download-pdf-btn" onClick={downloadPDF} disabled={downloading} className="btn btn-primary btn-sm">
              {downloading ? <><div className="spinner" style={{ width: 14, height: 14 }} />Generating PDF...</> : <><Download size={14} />Download PDF</>}
            </button>
            <button onClick={() => { logout(); navigate('/'); }} className="btn btn-secondary btn-sm"><LogOut size={14} /> Logout</button>
          </div>
        </div>
      </nav>

      <div className="page-content">
        <div className="container" style={{ maxWidth: 900 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <button onClick={() => navigate('/dashboard')} className="btn btn-secondary btn-sm">
                <ArrowLeft size={14} /> Dashboard
              </button>
              <button id="download-pdf-btn-2" onClick={downloadPDF} disabled={downloading} className="btn btn-primary btn-sm">
                {downloading ? <><div className="spinner" style={{ width: 14, height: 14 }} />Generating...</> : <><Download size={14} />Download PDF</>}
              </button>
            </div>

            {/* Report Content */}
            <div ref={reportRef} style={{ background: 'var(--bg-primary)' }}>
              {/* Report Header */}
              <div className="glass-card" style={{ padding: 40, marginBottom: 24, textAlign: 'center', background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(34,211,238,0.05))' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
                  <Brain size={28} color="var(--purple-400)" />
                  <span style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Outfit, sans-serif', background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ResumeAI Report</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{report?.resume_name}</div>
                {report?.job_title && <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{report.job_title} {report.company ? `at ${report.company}` : ''}</div>}
                <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 8 }}>Generated {new Date(report?.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
              </div>

              {/* Scores */}
              <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontFamily: 'Outfit, sans-serif', marginBottom: 28 }}>📊 Score Summary</h2>
                <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 32 }}>
                  {report?.ats_score != null && <ScoreCircle value={report.ats_score} label="ATS Score" color={report.ats_score >= 80 ? 'var(--emerald-400)' : report.ats_score >= 60 ? 'var(--amber-400)' : 'var(--rose-400)'} />}
                  {report?.resume_score != null && <ScoreCircle value={report.resume_score} label="Resume Score" color={report.resume_score >= 80 ? 'var(--emerald-400)' : report.resume_score >= 60 ? 'var(--amber-400)' : 'var(--rose-400)'} />}
                  {report?.match_percentage != null && <ScoreCircle value={report.match_percentage} label="Job Match" color={report.match_percentage >= 80 ? 'var(--emerald-400)' : report.match_percentage >= 60 ? 'var(--amber-400)' : 'var(--rose-400)'} />}
                </div>
              </div>

              {/* Skills */}
              {(report?.matched_skills?.length > 0 || report?.missing_skills?.length > 0) && (
                <div className="grid-2" style={{ gap: 24, marginBottom: 24 }}>
                  <div className="glass-card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
                      <CheckCircle size={16} color="var(--emerald-400)" />
                      <h3 style={{ fontSize: 15, fontFamily: 'Outfit, sans-serif' }}>Matched Skills</h3>
                    </div>
                    <div className="skills-container">
                      {report.matched_skills?.map(s => <span key={s} className="skill-chip skill-chip-green">{s}</span>)}
                    </div>
                  </div>
                  <div className="glass-card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
                      <XCircle size={16} color="var(--rose-400)" />
                      <h3 style={{ fontSize: 15, fontFamily: 'Outfit, sans-serif' }}>Missing Skills</h3>
                    </div>
                    <div className="skills-container">
                      {report.missing_skills?.map(s => <span key={s} className="skill-chip skill-chip-red">{s}</span>)}
                    </div>
                  </div>
                </div>
              )}

              {/* Keywords */}
              {report?.matched_keywords?.length > 0 && (
                <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
                    <Target size={16} color="var(--cyan-400)" />
                    <h3 style={{ fontSize: 15, fontFamily: 'Outfit, sans-serif' }}>Missing Job Keywords</h3>
                  </div>
                  <div className="skills-container">
                    {report.missing_keywords?.map(k => <span key={k} className="skill-chip skill-chip-purple">{k}</span>)}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {report?.suggestions?.length > 0 && (
                <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 18, alignItems: 'center' }}>
                    <Lightbulb size={16} color="var(--amber-400)" />
                    <h3 style={{ fontSize: 15, fontFamily: 'Outfit, sans-serif' }}>Improvement Suggestions</h3>
                  </div>
                  {report.suggestions.map((s, i) => (
                    <div key={i} className="suggestion-item">
                      <span style={{ color: 'var(--purple-400)', fontWeight: 700 }}>{i + 1}.</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Improved Bullets */}
              {bullets.length > 0 && (
                <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 18, alignItems: 'center' }}>
                    <Zap size={16} color="var(--purple-400)" />
                    <h3 style={{ fontSize: 15, fontFamily: 'Outfit, sans-serif' }}>AI-Improved Bullet Points</h3>
                  </div>
                  {bullets.map((b, i) => (
                    <div key={i} className="bullet-compare">
                      <div className="bullet-original"><div className="bullet-label bullet-label-original">✗ Original</div>{b.original}</div>
                      <div className="bullet-improved"><div className="bullet-label bullet-label-improved">✓ Improved</div>{b.improved}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Cover Letter */}
              {report?.cover_letter && (
                <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
                  <h3 style={{ fontSize: 15, fontFamily: 'Outfit, sans-serif', marginBottom: 16 }}>✉️ Cover Letter</h3>
                  <div className="cover-letter-box">{report.cover_letter}</div>
                </div>
              )}

              {/* Footer */}
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                Generated by ResumeAI · Powered by AI · {new Date().getFullYear()}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
