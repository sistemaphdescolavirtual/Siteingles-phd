import { Router } from 'express';
import { supabaseAdmin, supabaseAuth } from '../config/supabase.js';

const router = Router();

function normalizeEmail(email) {
  return String(email ?? '').trim().toLowerCase();
}

function normalizeText(value) {
  return String(value ?? '').trim();
}

function generateProfessorCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'PROF-';

  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

async function generateUniqueProfessorCode() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = generateProfessorCode();

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('codigo', code)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return code;
    }
  }

  throw new Error('Não foi possível gerar um código único para o professor.');
}

async function findProfessorByCode(codigoProfessor) {
  const code = normalizeText(codigoProfessor).toUpperCase();

  if (!code) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, nome, email, codigo, status, role')
    .eq('codigo', code)
    .eq('role', 'professor')
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function getPublicUserById(userId) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select(`
      id,
      email,
      documento,
      role,
      nome,
      codigo,
      codigo_professor,
      status,
      professor_id,
      curso_adquirido,
      modulo_adquirido,
      data_cadastro,
      created_at,
      updated_at
    `)
    .eq('id', userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

router.get('/ping', (_req, res) => {
  return res.status(200).json({
    ok: true,
    message: 'Rota de autenticação funcionando.',
  });
});

router.get('/professor/:codigo', async (req, res) => {
  try {
    const professor = await findProfessorByCode(req.params.codigo);

    if (!professor) {
      return res.status(404).json({
        valid: false,
        error: 'Código de professor não encontrado.',
      });
    }

    if (professor.status !== 'aprovado') {
      return res.status(400).json({
        valid: false,
        error: 'Este professor ainda não está aprovado.',
      });
    }

    return res.status(200).json({
      valid: true,
      professor: {
        id: professor.id,
        nome: professor.nome,
        codigo: professor.codigo,
      },
    });
  } catch (error) {
    console.error('Erro ao validar código do professor:', error);

    return res.status(500).json({
      valid: false,
      error: 'Erro interno ao validar código do professor.',
      details: error.message,
    });
  }
});

router.post('/register', async (req, res) => {
  try {
    console.log('Recebi tentativa de cadastro:', req.body);

    const nome = normalizeText(req.body.nome);
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password ?? '');
    const documento = normalizeText(req.body.documento);
    const role = normalizeText(req.body.role || 'aluno');
    const codigoProfessor = normalizeText(req.body.codigoProfessor);
    const cursoAdquirido = normalizeText(req.body.cursoAdquirido);
    const moduloAdquirido = normalizeText(req.body.moduloAdquirido);

    if (!nome || !email || !password || !documento) {
      return res.status(400).json({
        error: 'Nome, email, senha e documento são obrigatórios.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'A senha precisa ter pelo menos 6 caracteres.',
      });
    }

    if (!['professor', 'aluno'].includes(role)) {
      return res.status(400).json({
        error: 'O tipo de usuário precisa ser professor ou aluno.',
      });
    }

    let professor = null;

    if (role === 'aluno' && codigoProfessor) {
      professor = await findProfessorByCode(codigoProfessor);

      if (!professor) {
        return res.status(400).json({
          error: 'Código de professor não encontrado.',
        });
      }

      if (professor.status !== 'aprovado') {
        return res.status(400).json({
          error: 'Este professor ainda não está aprovado.',
        });
      }
    }

    const codigo = role === 'professor'
      ? await generateUniqueProfessorCode()
      : null;

    const { data: createdUserData, error: createUserError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          nome,
          documento,
          role,
          codigo,
          codigoProfessor: codigoProfessor || null,
          status: role === 'professor' ? 'aprovado' : 'pendente',
          cursoAdquirido: cursoAdquirido || null,
          moduloAdquirido: moduloAdquirido || null,
        },
      });

    if (createUserError) {
      console.error('Erro ao criar usuário no Auth:', createUserError);

      return res.status(400).json({
        error: createUserError.message || 'Não foi possível criar o usuário.',
      });
    }

    const authUser = createdUserData.user;

    if (!authUser) {
      return res.status(500).json({
        error: 'Usuário criado, mas o Supabase não retornou os dados do usuário.',
      });
    }

    if (role === 'aluno' && professor) {
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          professor_id: professor.id,
          codigo_professor: professor.codigo,
        })
        .eq('id', authUser.id);

      if (updateError) {
        console.error('Erro ao vincular aluno ao professor:', updateError);

        return res.status(500).json({
          error: 'Usuário criado, mas não foi possível vincular ao professor.',
          details: updateError.message,
        });
      }
    }

    const publicUser = await getPublicUserById(authUser.id);

    return res.status(201).json({
      message: 'Usuário cadastrado com sucesso.',
      user: publicUser,
    });
  } catch (error) {
    console.error('Erro inesperado no cadastro:', error);

    return res.status(500).json({
      error: 'Erro interno ao cadastrar usuário.',
      details: error.message,
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    console.log('Recebi tentativa de login:', req.body);

    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password ?? '');

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email e senha são obrigatórios.',
      });
    }

    const { data: loginData, error: loginError } =
      await supabaseAuth.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) {
      console.error('Erro no login do Supabase Auth:', loginError);

      return res.status(401).json({
        error: 'Email ou senha inválidos.',
        details: loginError.message,
      });
    }

    if (!loginData?.user) {
      return res.status(401).json({
        error: 'Não foi possível autenticar o usuário.',
      });
    }

    let publicUser = null;

    try {
      publicUser = await getPublicUserById(loginData.user.id);
    } catch (userError) {
      console.error('Erro ao buscar usuário na tabela users:', userError);

      return res.status(500).json({
        error: 'Login feito no Auth, mas usuário não encontrado na tabela users.',
        details: userError.message,
      });
    }

    if (publicUser.status === 'rejeitado') {
      return res.status(403).json({
        error: 'Este cadastro foi rejeitado.',
      });
    }

    return res.status(200).json({
      message: 'Login realizado com sucesso.',
      user: publicUser,
      session: loginData.session,
    });
  } catch (error) {
    console.error('Erro inesperado no login:', error);

    return res.status(500).json({
      error: 'Erro interno ao fazer login.',
      details: error.message ?? String(error),
    });
  }
});

export default router;
