import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

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