// backend/src/routes/auth.ts
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { supabaseAdmin } from '../services/supabaseClient';

const router = Router();

router.post('/login',
  body('email').isEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    // caso admin
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      return res.json({ user: { email, role: 'admin' }, admin: true });
    }

    // login supabase
    const { data, error } = await supabaseAdmin.auth.admin.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: 'Credenciais inválidas' });

    // opcional: setar cookie httpOnly
    res.cookie('sb-access-token', data.session?.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000, // 1 dia
    });

    return res.json({ user: data.user });
  });

export default router;