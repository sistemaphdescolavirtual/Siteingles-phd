import { Router } from 'express';
import { supabaseAdmin, supabaseAuth } from '../config/supabase.js';

const router = Router();

function normalizeEmail(email) {
  return String(email ?? '').trim().toLowerCase();
}

function normalizeText(value) {
  return String(value ?? '').trim();
}

function getBearerToken(req) {
  const [type, token] = String(
    req.headers.authorization ?? '',
  ).split(' ');

  return type === 'Bearer' && token
    ? token.trim()
    : null;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/.test(
    password,
  );
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

async function requireAuthenticatedUser(req, res, next) {
  try {
    const token = getBearerToken(req);

    if (!token) {
      return res.status(401).json({
        error: 'Token de autenticação não enviado.',
      });
    }

    const { data: authData, error: authError } =
      await supabaseAuth.auth.getUser(token);

    if (authError || !authData?.user) {
      return res.status(401).json({
        error: 'Token inválido ou expirado.',
      });
    }

    const publicUser = await getPublicUserById(
      authData.user.id,
    );

    if (publicUser.status !== 'aprovado') {
      return res.status(403).json({
        error: 'Este cadastro não está ativo.',
      });
    }

    req.authUser = authData.user;
    req.publicUser = publicUser;

    return next();
  } catch (error) {
    console.error(
      'Erro ao validar usuário autenticado:',
      error,
    );

    return res.status(500).json({
      error: 'Erro interno ao validar o usuário.',
    });
  }
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

router.post('/forgot-password', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        error: 'Informe um e-mail válido.',
      });
    }

    const frontendUrl = String(
      process.env.FRONTEND_URL ??
        process.env.FRONTEND_URLS?.split(',')[0] ??
        '',
    )
      .trim()
      .replace(/\/$/, '');

    if (!frontendUrl) {
      return res.status(500).json({
        error:
          'A URL do frontend não foi configurada no backend.',
      });
    }

    const { error } =
      await supabaseAuth.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${frontendUrl}/?page=reset-password`,
        },
      );

    if (error) {
      console.error(
        'Erro ao solicitar recuperação de senha:',
        error,
      );

      return res.status(400).json({
        error:
          'Não foi possível enviar o e-mail agora. Aguarde alguns minutos e tente novamente.',
      });
    }

    return res.status(200).json({
      message:
        'Se o e-mail estiver cadastrado, você receberá um link para criar uma nova senha.',
    });
  } catch (error) {
    console.error(
      'Erro inesperado na recuperação de senha:',
      error,
    );

    return res.status(500).json({
      error: 'Erro interno ao solicitar recuperação de senha.',
    });
  }
});


router.patch(
  '/profile',
  requireAuthenticatedUser,
  async (req, res) => {
    try {
      const currentUser = req.publicUser;
      const authUser = req.authUser;
      const nome = normalizeText(req.body.nome);
      const email = normalizeEmail(req.body.email);
      const currentPassword = String(
        req.body.currentPassword ?? '',
      );
      const newPassword = String(
        req.body.newPassword ?? '',
      );

      if (!nome || nome.length < 3) {
        return res.status(400).json({
          error: 'O nome precisa ter pelo menos 3 caracteres.',
        });
      }

      if (!email || !isValidEmail(email)) {
        return res.status(400).json({
          error: 'Informe um e-mail válido.',
        });
      }

      if (
        newPassword &&
        !isStrongPassword(newPassword)
      ) {
        return res.status(400).json({
          error:
            'A nova senha deve ter pelo menos 8 caracteres, com maiúscula, minúscula, número e símbolo.',
        });
      }

      const emailChanged = email !== currentUser.email;
      const passwordChanged = Boolean(newPassword);
      const nameChanged = nome !== currentUser.nome;
      const sensitiveChange =
        emailChanged || passwordChanged;

      if (!nameChanged && !sensitiveChange) {
        return res.status(200).json({
          message: 'Nenhuma alteração foi necessária.',
          user: currentUser,
          requiresLogin: false,
        });
      }

      if (sensitiveChange) {
        if (!currentPassword) {
          return res.status(400).json({
            error:
              'Informe sua senha atual para alterar e-mail ou senha.',
          });
        }

        const { error: passwordError } =
          await supabaseAuth.auth.signInWithPassword({
            email: currentUser.email,
            password: currentPassword,
          });

        if (passwordError) {
          return res.status(401).json({
            error: 'A senha atual está incorreta.',
          });
        }
      }

      const authUpdates = {};

      if (emailChanged) {
        authUpdates.email = email;
        authUpdates.email_confirm = true;
      }

      if (passwordChanged) {
        authUpdates.password = newPassword;
      }

      if (nameChanged) {
        authUpdates.user_metadata = {
          ...(authUser.user_metadata ?? {}),
          nome,
        };
      }

      if (Object.keys(authUpdates).length > 0) {
        const { error: authUpdateError } =
          await supabaseAdmin.auth.admin.updateUserById(
            currentUser.id,
            authUpdates,
          );

        if (authUpdateError) {
          const duplicateEmail =
            /already|registered|exists/i.test(
              authUpdateError.message,
            );

          return res.status(400).json({
            error: duplicateEmail
              ? 'Este e-mail já está sendo usado por outra conta.'
              : 'Não foi possível atualizar os dados de autenticação.',
          });
        }
      }

      const { error: publicUpdateError } =
        await supabaseAdmin
          .from('users')
          .update({ nome, email })
          .eq('id', currentUser.id);

      if (publicUpdateError) {
        const rollback = {};

        if (emailChanged) {
          rollback.email = currentUser.email;
          rollback.email_confirm = true;
        }

        if (passwordChanged) {
          rollback.password = currentPassword;
        }

        if (nameChanged) {
          rollback.user_metadata =
            authUser.user_metadata ?? {};
        }

        if (Object.keys(rollback).length > 0) {
          await supabaseAdmin.auth.admin.updateUserById(
            currentUser.id,
            rollback,
          );
        }

        console.error(
          'Erro ao atualizar perfil na tabela users:',
          publicUpdateError,
        );

        return res.status(500).json({
          error: 'Não foi possível concluir a atualização do perfil.',
        });
      }

      const updatedUser = await getPublicUserById(
        currentUser.id,
      );

      return res.status(200).json({
        message: sensitiveChange
          ? 'Dados atualizados. Entre novamente com suas novas credenciais.'
          : 'Perfil atualizado com sucesso.',
        user: updatedUser,
        requiresLogin: sensitiveChange,
      });
    } catch (error) {
      console.error(
        'Erro inesperado ao atualizar perfil:',
        error,
      );

      return res.status(500).json({
        error: 'Erro interno ao atualizar o perfil.',
      });
    }
  },
);

router.post('/register', async (req, res) => {
  try {
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

if (role === 'aluno' && professor) {
  const { error: notificationError } =
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: professor.id,
        title: 'Novo aluno aguardando aprovação',
        message: `${publicUser.nome} solicitou acesso à plataforma${
          publicUser.curso_adquirido
            ? ` para o curso de ${
                publicUser.curso_adquirido === 'ingles'
                  ? 'Inglês'
                  : 'ENEM'
              }`
            : ''
        }.`,
        type: 'autorizacao',
        read: false,
        resolved: false,
        data: {
          alunoId: publicUser.id,
          curso: publicUser.curso_adquirido,
        },
      });

  if (notificationError) {
    console.error(
      'Aluno cadastrado, mas houve erro ao criar notificação:',
      notificationError,
    );
  }
}

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

        if (publicUser.status !== 'aprovado') {
      const message =
        publicUser.status === 'pendente'
          ? 'Seu cadastro ainda está aguardando aprovação.'
          : 'Este cadastro não está ativo.';

      return res.status(403).json({
        error: message,
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
