require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const session = require('express-session');
const passport = require('./src/config/passport');
const authRoutes = require('./src/routes/auth');
const resumeRoutes = require('./src/routes/resume');
const analysisRoutes = require('./src/routes/analysis');
const jobRoutes = require('./src/routes/jobs');
const reportRoutes = require('./src/routes/report');
const interviewRoutes = require('./src/routes/interview');
const googleAuthRoutes = require('./src/routes/googleAuth');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  frameguard: false,
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: function (origin, callback) {
    // Allow any localhost origin in development
    if (!origin || origin.startsWith('http://localhost') || origin === process.env.FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: 'AI rate limit reached. Please wait a moment.' }
});

app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session (required for passport)
app.use(session({
  secret: process.env.JWT_SECRET || 'session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
}));
app.use(passport.initialize());
app.use(passport.session());

// Static files (uploaded resumes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/google', googleAuthRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/analysis', aiLimiter, analysisRoutes);
app.use('/api/jobs', aiLimiter, jobRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/interview', aiLimiter, interviewRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI Resume Analyser API is running 🚀' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
