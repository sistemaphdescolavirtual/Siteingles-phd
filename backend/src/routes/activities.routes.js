import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

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

router.get('/student/:studentId', async (req, res) => {
  try {
    const studentId = String(req.params.studentId ?? '').trim();

    if (!studentId) {
      return res.status(400).json({
        error: 'ID do aluno é obrigatório.',
      });
    }

    const { data, error } = await supabaseAdmin
      .from('activities')
      .select(activitySelect)
      .eq('aluno_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar atividades do aluno:', error);

      return res.status(500).json({
        error: 'Não foi possível buscar as atividades do aluno.',
        details: error.message,
      });
    }

    return res.status(200).json((data ?? []).map(mapActivity));
  } catch (error) {
    console.error('Erro inesperado ao buscar atividades do aluno:', error);

    return res.status(500).json({
      error: 'Erro interno ao buscar atividades do aluno.',
      details: error.message,
    });
  }
});

router.get('/professor/:professorId', async (req, res) => {
  try {
    const professorId = String(req.params.professorId ?? '').trim();

    if (!professorId) {
      return res.status(400).json({
        error: 'ID do professor é obrigatório.',
      });
    }

    const { data, error } = await supabaseAdmin
      .from('activities')
      .select(activitySelect)
      .eq('professor_id', professorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar atividades do professor:', error);

      return res.status(500).json({
        error: 'Não foi possível buscar as atividades do professor.',
        details: error.message,
      });
    }

    return res.status(200).json((data ?? []).map(mapActivity));
  } catch (error) {
    console.error('Erro inesperado ao buscar atividades do professor:', error);

    return res.status(500).json({
      error: 'Erro interno ao buscar atividades do professor.',
      details: error.message,
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const professorId = String(req.body.professorId ?? '').trim();
    const alunoId = String(req.body.alunoId ?? '').trim();
    const curso = String(req.body.curso ?? '').trim().toLowerCase();
    const titulo = String(req.body.titulo ?? '').trim();
    const descricao = String(req.body.descricao ?? '').trim();
    const anexos = Array.isArray(req.body.anexos) ? req.body.anexos : [];

    if (!professorId || !alunoId || !curso || !titulo || !descricao) {
      return res.status(400).json({
        error: 'Professor, aluno, curso, título e descrição são obrigatórios.',
      });
    }

    if (!['ingles', 'enem'].includes(curso)) {
      return res.status(400).json({
        error: 'Curso inválido. Use ingles ou enem.',
      });
    }

    const { data: aluno, error: alunoError } = await supabaseAdmin
      .from('users')
      .select('id, nome, professor_id, curso_adquirido, status')
      .eq('id', alunoId)
      .eq('role', 'aluno')
      .maybeSingle();

    if (alunoError) {
      console.error('Erro ao validar aluno:', alunoError);

      return res.status(500).json({
        error: 'Erro ao validar aluno.',
        details: alunoError.message,
      });
    }

    if (!aluno) {
      return res.status(404).json({
        error: 'Aluno não encontrado.',
      });
    }

    if (aluno.professor_id !== professorId) {
      return res.status(403).json({
        error: 'Este aluno não pertence a este professor.',
      });
    }

    if (aluno.status !== 'aprovado') {
      return res.status(400).json({
        error: 'Só é possível enviar atividades para alunos aprovados.',
      });
    }

    const { data: activity, error: activityError } = await supabaseAdmin
      .from('activities')
      .insert({
        professor_id: professorId,
        aluno_id: alunoId,
        curso,
        titulo,
        descricao,
        status: 'pendente',
        correction_status: 'pendente',
      })
      .select('id')
      .single();

    if (activityError) {
      console.error('Erro ao criar atividade:', activityError);

      return res.status(500).json({
        error: 'Não foi possível criar a atividade.',
        details: activityError.message,
      });
    }

    if (anexos.length > 0) {
      const attachmentsPayload = anexos.map((anexo) => ({
        activity_id: activity.id,
        nome: String(anexo.nome ?? 'Anexo').trim(),
        tipo: ['pdf', 'xls', 'txt', 'link'].includes(anexo.tipo)
          ? anexo.tipo
          : 'link',
        url: String(anexo.url ?? '').trim(),
      }));

      const { error: attachmentsError } = await supabaseAdmin
        .from('activity_attachments')
        .insert(attachmentsPayload);

      if (attachmentsError) {
        console.error('Erro ao salvar anexos:', attachmentsError);

        return res.status(500).json({
          error: 'Atividade criada, mas não foi possível salvar os anexos.',
          details: attachmentsError.message,
        });
      }
    }

    await supabaseAdmin.from('notifications').insert({
      user_id: alunoId,
      title: 'Nova atividade atribuída',
      message: `Você recebeu uma nova atividade: ${titulo}`,
      type: 'atividade',
      read: false,
      resolved: false,
      data: {
        atividadeId: activity.id,
        professorId,
        curso,
      },
    });

    const { data: createdActivity, error: selectError } = await supabaseAdmin
      .from('activities')
      .select(activitySelect)
      .eq('id', activity.id)
      .single();

    if (selectError) {
      console.error('Erro ao buscar atividade criada:', selectError);

      return res.status(201).json({
        message: 'Atividade criada com sucesso.',
        activityId: activity.id,
      });
    }

    return res.status(201).json({
      message: 'Atividade criada com sucesso.',
      activity: mapActivity(createdActivity),
    });
  } catch (error) {
    console.error('Erro inesperado ao criar atividade:', error);

    return res.status(500).json({
      error: 'Erro interno ao criar atividade.',
      details: error.message,
    });
  }
});

export default router;