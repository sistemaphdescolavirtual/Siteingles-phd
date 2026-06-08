// backend/src/routes/register.ts
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { supabaseAdmin } from '../services/supabaseClient';

const router = Router();

router.post('/register',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('documento').notEmpty(),
  body('role').isIn(['aluno','professor']),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password, documento, role, codigoProfessor, cursoAdquirido, moduloAdquirido } = req.body;

    try {
      if (role === 'aluno') {
        // validar código do professor
        const { data: prof, error: profErr } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('role','professor')
          .eq('codigo', codigoProfessor)
          .single();
        if (profErr || !prof) return res.status(400).json({ error: 'Código de professor inválido' });

        // cria usuário de auth
        const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { documento, role }
        });
        if (authErr) return res.status(500).json({ error: 'Erro ao criar usuário' });

        // insere na tabela users com status pendente
        const { error: insertErr } = await supabaseAdmin.from('users').insert({
          id: authUser.user?.id,
          email,
          documento,
          role,
          nome: email.split('@')[0],
          codigo_professor: codigoProfessor,
          status: 'pendente',
          professor_id: prof.id,
          curso_adquirido: cursoAdquirido,
          modulo_adquirido: moduloAdquirido,
          data_cadastro: new Date()
        });
        if (insertErr) throw insertErr;

        // cria notificação para o professor
        await supabaseAdmin.from('notifications').insert({
          user_id: prof.id,
          title: 'Novo aluno aguardando aprovação',
          message: `${email.split('@')[0]} solicitou acesso à plataforma para o curso ${cursoAdquirido}.`,
          type: 'autorizacao',
          read: false,
          resolved: false,
          data: { alunoId: authUser.user?.id, curso: cursoAdquirido }
        });

        return res.status(201).json({ message: 'Aluno registrado com sucesso' });
      }

      if (role === 'professor') {
        // gerar código único (6 caracteres) – pode utilizar utilitário
        const generateCode = async () => {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          let code;
          while (true) {
            code = 'PROF-' + Array.from({length:6}, () => chars[Math.floor(Math.random()*chars.length)]).join('');
            const { data: existing } = await supabaseAdmin.from('users').select('id').eq('codigo', code).maybeSingle();
            if (!existing) break;
          }
          return code;
        };
        const codigo = await generateCode();

        // cria usuário auth
        const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { documento, role }
        });
        if (authErr) return res.status(500).json({ error: 'Erro ao criar professor' });

        // insere professor
        await supabaseAdmin.from('users').insert({
          id: authUser.user?.id,
          email,
          documento,
          role,
          nome: email.split('@')[0],
          codigo,
          status: 'aprovado',
          data_cadastro: new Date()
        });

        return res.status(201).json({ message: 'Professor criado', codigo });
      }

      return res.status(400).json({ error: 'Role inválido' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro interno ao registrar' });
    }
  });

export default router;