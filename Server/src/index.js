import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRouter from './routes/auth.js';
import reportsRouter from './routes/reports.js';
import usersRouter from './routes/users.js';
import usertypesRouter from './routes/usertypes.js';
import notificationsRouter from './routes/notifications.js';
import schedulesRouter from './routes/schedules.js';
import analyticsRouter from './routes/analytics.js';

const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:8080', 'http://192.168.1.8:3000', 'http://192.168.1.8:8080'],
  credentials: true
}));
app.use(helmet());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 4000;

// Root route
app.get('/', (_req, res) => {
  res.json({
    message: 'CivicSense API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      reports: '/api/reports',
      users: '/api/users',
      usertypes: '/api/usertypes',
      notifications: '/api/notifications',
      schedules: '/api/schedules',
      analytics: '/api/analytics',
      uploads: '/uploads'
    },
    documentation: 'This is the backend API server for CivicSense civic issue reporting platform'
  });
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/users', usersRouter);
app.use('/api/usertypes', usertypesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/schedules', schedulesRouter);
app.use('/api/analytics', analyticsRouter);

app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));


