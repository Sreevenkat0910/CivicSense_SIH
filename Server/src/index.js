import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import reportsRouter from './routes/reports.js';
import usersRouter from './routes/users.js';
import usertypesRouter from './routes/usertypes.js';

const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080', 'http://192.168.1.8:3000', 'http://192.168.1.8:8080'],
  credentials: true
}));
app.use(helmet());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 4000;

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/reports', reportsRouter);
app.use('/api/users', usersRouter);
app.use('/api/usertypes', usertypesRouter);

app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));


