import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';
import registerRoutes from './routes/register';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes
// Mount authentication routes under the `/api/auth` prefix. These routes expose
// endpoints like `/api/auth/login` for logging in. Keep authentication related
// handlers grouped under the same prefix to keep the API surface coherent.
app.use('/api/auth', authRoutes);

// Mount registration routes under the more general `/api` prefix. When these
// routes were previously mounted under `/api/auth` the resulting endpoint was
// `/api/auth/register`, which mixed authentication and registration concerns
// and led to confusion on the client. By mounting the register routes at
// `/api/register` we make the intent explicit and avoid potential route
// collisions.
app.use('/api', registerRoutes);

// Porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});