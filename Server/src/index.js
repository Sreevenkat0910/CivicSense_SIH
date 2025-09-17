import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import reportsRouter from './routes/reports.js';
import usersRouter from './routes/users.js';

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

const PORT = process.env.PORT || 4000;

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/reports', reportsRouter);
app.use('/api/users', usersRouter);

app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));


