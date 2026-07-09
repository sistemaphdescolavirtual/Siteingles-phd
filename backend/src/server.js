
import 'dotenv/config';

import express from 'express';
import cors from 'cors';

import { supabase } from './config/supabase.js';
import modulesRouter from './routes/modules.routes.js';
import authRouter from './routes/auth.routes.js';
import professorRouter from './routes/professor.routes.js';
import activitiesRouter from './routes/activities.routes.js';
import notificationsRouter from './routes/notifications.routes.js';
import chatRouter from './routes/chat.routes.js';
const app = express();

const port = Number(process.env.PORT) || 3001;
const configuredFrontendUrls = String( process.env.FRONTEND_URLS ?? process.env.FRONTEND_URL ?? '',).split(',').map((url) => url.trim()).filter(Boolean);

const allowedOrigins = new Set([
    'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://phdescolavitual.vercel.app',
   ...configuredFrontendUrls,
]);

function isAllowedOrigin(origin) {
  if (!origin){
     return true;
}
if (allowedOrigins.has(origin)) {
  return true;
}
try{
  const url = new URL(origin);

  return (
        url.protocol === 'https:' &&
      url.hostname.endsWith('.vercel.app')    
  );

}catch {
  return false;
}

}



app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      console.warn('Origem bloqueada pelo CORS:', origin);

      callback(
        new Error('Origem não permitida pelo CORS.'),
      );
    },
    methods: [
      'GET',
      'POST',
      'PATCH',
      'PUT',
      'DELETE',
      'OPTIONS',
    ],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
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
app.use('/api/professor', professorRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/chat', chatRouter);
app.use('/api/notifications', notificationsRouter);

app.use((_req, res) => {
  return res.status(404).json({
    error: 'Rota não encontrada.',
  });
});

app.listen(port, () => {
  console.log('');
  console.log('Backend iniciado com sucesso.');
  console.log(`API: http://localhost:${port}/api`);
console.log( `Frontends configurados: ${[
   ...allowedOrigins,
  ].join(', ')}`,
);  
  console.log('');
});
