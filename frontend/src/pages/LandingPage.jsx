import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Upload, BarChart3, Zap, FileText, Target, ArrowRight, CheckCircle, Star } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const features = [
  { icon: <Brain size={24} />, title: 'AI-Powered Analysis', desc: 'Our AI analyses every aspect of your resume — from formatting to content quality.', color: 'var(--purple-400)' },
  { icon: <Target size={24} />, title: 'ATS Score Check', desc: 'Know exactly how well your resume will pass Applicant Tracking Systems.', color: 'var(--cyan-400)' },
  { icon: <BarChart3 size={24} />, title: 'Job Match %', desc: 'Paste any job description and get an instant match percentage with missing skills.', color: 'var(--emerald-400)' },
  { icon: <Zap size={24} />, title: 'Better Bullet Points', desc: 'AI rewrites your weak bullet points with stronger verbs and quantifiable impact.', color: 'var(--amber-400)' },
  { icon: <FileText size={24} />, title: 'Cover Letter Generator', desc: 'Get a personalized, professional cover letter tailored to each specific job.', color: 'var(--rose-400)' },
  { icon: <Upload size={24} />, title: 'PDF/DOCX Support', desc: 'Upload your resume in any format and we\'ll handle the rest instantly.', color: 'var(--purple-400)' },
];

const steps = [
  { step: '01', title: 'Upload Resume', desc: 'Drag & drop your PDF or DOCX resume' },
  { step: '02', title: 'AI Analysis', desc: 'Get ATS score, resume score & suggestions' },
  { step: '03', title: 'Match Job', desc: 'Paste job description for match % & missing skills' },
  { step: '04', title: 'Download Report', desc: 'Get a detailed PDF report to take action' },
];

export default function LandingPage() {
  const { token } = useAuthStore();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="container navbar-inner">
          <div className="navbar-brand">
            <Brain size={28} color="var(--purple-400)" />
            <span className="brand-gradient">ResumeAI</span>
          </div>
          <div className="navbar-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How it Works</a>
            {token ? (
              <Link to="/dashboard" className="btn btn-primary btn-sm">Go to Dashboard</Link>
            ) : (
              <>
                <Link to="/auth" className="nav-link">Login</Link>
                <Link to="/auth" className="btn btn-primary btn-sm">Create Account</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '140px 0 80px', position: 'relative', overflow: 'hidden' }}>
        {/* Background orbs */}
        <div style={{ position: 'absolute', top: '10%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '20%', right: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="badge badge-purple" style={{ display: 'inline-flex', marginBottom: 24, fontSize: 13, padding: '6px 16px' }}>
              <Zap size={14} /> Powered by AI
            </div>

            <h1 style={{ fontSize: 'clamp(40px, 7vw, 72px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24, fontFamily: 'Outfit, sans-serif' }}>
              Land Your Dream Job{' '}
              <span style={{ background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                with AI
              </span>
            </h1>

            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
              Upload your resume, paste any job description, and get instant AI analysis — ATS score, match percentage, missing skills, and a tailored cover letter.
            </p>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to={token ? '/upload' : '/auth'} className="btn btn-primary btn-lg">
                Analyse My Resume <ArrowRight size={18} />
              </Link>
              <a href="#how-it-works" className="btn btn-secondary btn-lg">
                See How It Works
              </a>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ display: 'flex', gap: 48, justifyContent: 'center', marginTop: 64, flexWrap: 'wrap' }}
          >
            {[
              { num: '95%', label: 'ATS Pass Rate' },
              { num: '3x', label: 'More Interviews' },
              { num: '< 30s', label: 'Analysis Time' },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 800, fontFamily: 'Outfit, sans-serif', background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.num}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '80px 0', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12, fontFamily: 'Outfit, sans-serif' }}>Everything You Need to Get Hired</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>All the AI tools to transform your job search</p>
          </div>

          <div className="grid-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="glass-card"
                style={{ padding: 28 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, marginBottom: 18 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 18, marginBottom: 10, fontFamily: 'Outfit, sans-serif' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ padding: '80px 0', borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12, fontFamily: 'Outfit, sans-serif' }}>How It Works</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>From resume to offer letter in 4 steps</p>
          </div>

          <div className="grid-2" style={{ gap: 32, alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {steps.map((s, i) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}
                >
                  <div style={{ minWidth: 52, height: 52, borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white', boxShadow: 'var(--shadow-glow)' }}>
                    {s.step}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 18, marginBottom: 6, fontFamily: 'Outfit, sans-serif' }}>{s.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Preview card */}
            <motion.div
              className="glass-card"
              style={{ padding: 32 }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Sample Analysis Result</div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                  {[{ label: 'ATS Score', val: 82, color: 'var(--purple-400)' }, { label: 'Resume Score', val: 78, color: 'var(--cyan-400)' }, { label: 'Job Match', val: 91, color: 'var(--emerald-400)' }].map(s => (
                    <div key={s.label} style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: s.color }}>{s.val}%</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Matched Skills</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['React', 'Node.js', 'PostgreSQL', 'REST API'].map(s => (
                    <span key={s} className="skill-chip skill-chip-green">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Missing Skills</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['Docker', 'AWS', 'Kubernetes'].map(s => (
                    <span key={s} className="skill-chip skill-chip-red">{s}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16, fontFamily: 'Outfit, sans-serif' }}>
            Ready to Supercharge Your Job Search?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 16 }}>
            Join thousands of job seekers getting more interviews with AI-optimized resumes.
          </p>
          <Link to={token ? '/dashboard' : '/auth'} className="btn btn-primary btn-lg">
            Start for Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '32px 0', textAlign: 'center' }}>
        <div className="container">
          <div className="navbar-brand" style={{ justifyContent: 'center', marginBottom: 12 }}>
            <Brain size={20} color="var(--purple-400)" />
            <span className="brand-gradient">ResumeAI</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Built with ❤️ using AI · © 2025</p>
        </div>
      </footer>
    </div>
  );
}
