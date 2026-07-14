import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

function normalizeEmail(email) {
  return String(email ?? '').trim().toLowerCase();
}

function normalizeText(value) {
  return String(value ?? '').trim();
}

async function validateAdminRequester(requesterId) {
  const cleanRequesterId = normalizeText(requesterId);

  if (!cleanRequesterId) {
    return {
      valid: false,
      status: 400,
      error: 'ID do gestor solicitante é obrigatório.',
    };
  }

  const { data: requester, error } = await supabaseAdmin
    .from('users')
    .select('id, role, status, nome, email')
    .eq('id', cleanRequesterId)
    .maybeSingle();

  if (error) {
    console.error('Erro ao validar gestor solicitante:', error);

    return {
      valid: false,
      status: 500,
      error: 'Erro ao validar gestor solicitante.',
      details: error.message,
    };
  }

  if (!requester) {
    return {
      valid: false,
      status: 404,
      error: 'Gestor solicitante não encontrado.',
    };
  }

  const isAdmin =
    ['gestor', 'admin'].includes(requester.role) &&
    requester.status === 'aprovado';

  if (!isAdmin) {
    return {
      valid: false,
      status: 403,
      error: 'Apenas gestores aprovados podem executar esta ação.',
    };
  }

  return {
    valid: true,
    requester,
  };
}

const publicUserSelect = `
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
`;

const activitySelect = `
  id,
  professor_id,
  aluno_id,
  curso,
  titulo,
  descricao,
  status,
  correction_status,
  correction_feedback,
  created_at,
  publish_at,
  due_at,
  updated_at,
  activity_attachments (
    id,
    nome,
    tipo,
    url,
    created_at
  ),
  activity_responses (
    tipo,
    conteudo,
    enviado_em,
    arquivo_attachment_id,
    created_at
  )
`;

function mapActivity(activity) {
  const response = Array.isArray(activity.activity_responses)
    ? activity.activity_responses[0]
    : activity.activity_responses;

  return {
    id: activity.id,
    professorId: activity.professor_id,
    alunoId: activity.aluno_id,
    curso: activity.curso,
    titulo: activity.titulo,
    descricao: activity.descricao,
    status: activity.status,
    correctionStatus: activity.correction_status,
    correctionFeedback: activity.correction_feedback ?? undefined,
    createdAt: activity.created_at,
    publishAt: activity.publish_at,
    dueAt: activity.due_at,
    anexos: (activity.activity_attachments ?? []).map((attachment) => ({
      id: attachment.id,
      nome: attachment.nome,
      tipo: attachment.tipo,
      url: attachment.url,
    })),
    resposta: response
      ? {
          tipo: response.tipo,
          conteudo: response.conteudo,
          enviadoEm: response.enviado_em,
        }
      : undefined,
  };
}

router.get('/users', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select(publicUserSelect)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar usuários no admin:', error);

      return res.status(500).json({
        error: 'Não foi possível buscar os usuários.',
        details: error.message,
      });
    }

    return res.status(200).json(data ?? []);
  } catch (error) {
    console.error('Erro inesperado ao buscar usuários no admin:', error);

    return res.status(500).json({
      error: 'Erro interno ao buscar usuários.',
      details: error.message,
    });
  }
});

router.get('/professors', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select(publicUserSelect)
      .eq('role', 'professor')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar professores no admin:', error);

      return res.status(500).json({
        error: 'Não foi possível buscar os professores.',
        details: error.message,
      });
    }

    return res.status(200).json(data ?? []);
  } catch (error) {
    console.error('Erro inesperado ao buscar professores no admin:', error);

    return res.status(500).json({
      error: 'Erro interno ao buscar professores.',
      details: error.message,
    });
  }
});

router.get('/students', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select(publicUserSelect)
      .eq('role', 'aluno')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar alunos no admin:', error);

      return res.status(500).json({
        error: 'Não foi possível buscar os alunos.',
        details: error.message,
      });
    }

    return res.status(200).json(data ?? []);
  } catch (error) {
    console.error('Erro inesperado ao buscar alunos no admin:', error);

    return res.status(500).json({
      error: 'Erro interno ao buscar alunos.',
      details: error.message,
    });
  }
});

router.get('/activities', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('activities')
      .select(activitySelect)
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) {
      console.error('Erro ao buscar atividades no admin:', error);

      return res.status(500).json({
        error: 'Não foi possível buscar as atividades.',
        details: error.message,
      });
    }

    return res.status(200).json((data ?? []).map(mapActivity));
  } catch (error) {
    console.error('Erro inesperado ao buscar atividades no admin:', error);

    return res.status(500).json({
      error: 'Erro interno ao buscar atividades.',
      details: error.message,
    });
  }
});


router.post('/managers', async (req, res) => {
  try {
    const requesterValidation = await validateAdminRequester(
      req.body.requesterId,
    );

    if (!requesterValidation.valid) {
      return res.status(requesterValidation.status).json({
        error: requesterValidation.error,
        details: requesterValidation.details,
      });
    }

    const nome = normalizeText(req.body.nome);
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password ?? '');
    const documento = normalizeText(req.body.documento);

    if (!nome || !email || !password || !documento) {
      return res.status(400).json({
        error: 'Nome, email, senha e documento são obrigatórios.',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'A senha do gestor precisa ter pelo menos 8 caracteres.',
      });
    }

    const { data: existingUser, error: existingUserError } =
      await supabaseAdmin
        .from('users')
        .select('id, email, documento')
        .or(`email.eq.${email},documento.eq.${documento}`)
        .maybeSingle();

    if (existingUserError) {
      console.error(
        'Erro ao verificar gestor existente:',
        existingUserError,
      );

      return res.status(500).json({
        error: 'Erro ao verificar se o usuário já existe.',
        details: existingUserError.message,
      });
    }

    if (existingUser) {
      return res.status(409).json({
        error: 'Já existe um usuário com este email ou documento.',
      });
    }

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          nome,
          role: 'gestor',
        },
        app_metadata: {
          role: 'gestor',
        },
      });

    if (authError || !authData?.user) {
      console.error('Erro ao criar gestor no Auth:', authError);

      return res.status(500).json({
        error: 'Não foi possível criar o gestor no Auth.',
        details:
          authError?.message ??
          'Usuário não foi retornado pelo Supabase Auth.',
      });
    }

    const authUserId = authData.user.id;

        const { data: publicUser, error: publicUserError } =
      await supabaseAdmin
        .from('users')
        .upsert(
          {
            id: authUserId,
            email,
            documento,
            role: 'gestor',
            nome,
            status: 'aprovado',
            codigo: null,
            codigo_professor: null,
            professor_id: null,
            curso_adquirido: null,
            modulo_adquirido: null,
          },
          {
            onConflict: 'id',
          },
        )
        .select(publicUserSelect)
        .single();

    if (publicUserError) {
      console.error(
        'Erro ao criar gestor na tabela users:',
        publicUserError,
      );

      await supabaseAdmin.auth.admin.deleteUser(authUserId);

            return res.status(500).json({
        error: 'Gestor criado no Auth, mas não foi salvo na tabela users.',
        details: publicUserError.message,
        hint: publicUserError.hint,
        code: publicUserError.code,
      });
    }

    return res.status(201).json({
      message: 'Gestor criado com sucesso.',
      user: publicUser,
    });
  } catch (error) {
    console.error('Erro inesperado ao criar gestor:', error);

    return res.status(500).json({
      error: 'Erro interno ao criar gestor.',
      details: error.message,
    });
  }
});

router.patch('/users/:userId/status', async (req, res) => {
  try {
    const userId = String(req.params.userId ?? '').trim();
    const status = String(req.body.status ?? '').trim().toLowerCase();

    if (!userId) {
      return res.status(400).json({
        error: 'ID do usuário é obrigatório.',
      });
    }

    if (!['aprovado', 'pendente', 'rejeitado'].includes(status)) {
      return res.status(400).json({
        error: 'Status inválido. Use aprovado, pendente ou rejeitado.',
      });
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ status })
      .eq('id', userId)
      .select(publicUserSelect)
      .maybeSingle();

    if (error) {
      console.error('Erro ao atualizar status do usuário no admin:', error);

      return res.status(500).json({
        error: 'Não foi possível atualizar o usuário.',
        details: error.message,
      });
    }

    if (!data) {
      return res.status(404).json({
        error: 'Usuário não encontrado.',
      });
    }

    return res.status(200).json({
      message: 'Status do usuário atualizado com sucesso.',
      user: data,
    });
  } catch (error) {
    console.error('Erro inesperado ao atualizar usuário no admin:', error);

    return res.status(500).json({
      error: 'Erro interno ao atualizar usuário.',
      details: error.message,
    });
  }
});

export default router;