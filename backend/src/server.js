import 'dotenv/config';

import express from 'express';
import cors from 'cors';

import { supabase } from './config/supabase.js';
import modulesRouter from './routes/modules.routes.js';
import authRouter from './routes/auth.routes.js';

const app = express();

const port = Number(process.env.PORT) || 3001;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: frontendUrl,
  }),
);

app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    const { error } = await supabase
      .from('english_modules')
      .select('id')
      .limit(1);

    if (error) {
      return res.status(500).json({
        ok: false,
        server: 'online',
        database: 'erro',
        details: error.message,
      });
    }

    return res.status(200).json({
      ok: true,
      server: 'online',
      database: 'conectado',
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      server: 'online',
      database: 'erro',
    });
  }
});

app.use('/api/modules', modulesRouter);
app.use('/api/auth', authRouter);

app.use((_req, res) => {
  return res.status(404).json({
    error: 'Rota não encontrada.',
  });
});

app.listen(port, () => {
  console.log('');
  console.log('Backend iniciado com sucesso.');
  console.log(`API: http://localhost:${port}/api`);
  console.log(`Frontend permitido: ${frontendUrl}`);
  console.log('');
});