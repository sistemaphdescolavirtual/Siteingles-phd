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

router.post('/:activityId/response', async (req, res) => {
  try {
    const activityId = String(req.params.activityId ?? '').trim();
    const alunoId = String(req.body.alunoId ?? '').trim();
    const tipo = String(req.body.tipo ?? 'texto').trim().toLowerCase();
    const conteudo = String(req.body.conteudo ?? '').trim();

    if (!activityId || !alunoId || !conteudo) {
      return res.status(400).json({
        error: 'Atividade, aluno e resposta são obrigatórios.',
      });
    }

    if (!['texto', 'concluido'].includes(tipo)) {
      return res.status(400).json({
        error: 'Tipo de resposta inválido.',
      });
    }

    const { data: activity, error: activityError } = await supabaseAdmin
      .from('activities')
      .select('id, professor_id, aluno_id, titulo')
      .eq('id', activityId)
      .maybeSingle();

    if (activityError) {
      console.error('Erro ao buscar atividade:', activityError);

      return res.status(500).json({
        error: 'Erro ao buscar atividade.',
        details: activityError.message,
      });
    }

    if (!activity) {
      return res.status(404).json({
        error: 'Atividade não encontrada.',
      });
    }

    if (activity.aluno_id !== alunoId) {
      return res.status(403).json({
        error: 'Esta atividade não pertence a este aluno.',
      });
    }

   console.log('Resposta recebida:', {
  activityId,
  alunoId,
  tipo,
  conteudo,
});

const { data: savedResponse, error: responseError } = await supabaseAdmin
  .from('activity_responses')
  .upsert(
    {
      activity_id: activityId,
      tipo,
      conteudo,
      enviado_em: new Date().toISOString(),
    },
    {
      onConflict: 'activity_id',
    },
  )
  .select('activity_id, tipo, conteudo, enviado_em')
  .single();

if (responseError) {
  console.error('Erro ao salvar resposta:', responseError);

  return res.status(500).json({
    error: 'Não foi possível salvar a resposta.',
    details: responseError.message,
  });
}

console.log('Resposta salva no banco:', savedResponse);

    const { error: updateActivityError } = await supabaseAdmin
      .from('activities')
      .update({
        status: 'concluida',
        correction_status: 'em_analise',
        correction_feedback: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', activityId);

    if (updateActivityError) {
      console.error('Erro ao atualizar atividade:', updateActivityError);

      return res.status(500).json({
        error: 'Resposta salva, mas não foi possível atualizar a atividade.',
        details: updateActivityError.message,
      });
    }

    await supabaseAdmin.from('notifications').insert({
      user_id: activity.professor_id,
      title: 'Nova resposta de atividade',
      message: `O aluno enviou uma resposta para: ${activity.titulo}`,
      type: 'atividade',
      read: false,
      resolved: false,
      data: {
        atividadeId: activityId,
        alunoId,
      },
    });

    const { data: updatedActivity, error: selectError } = await supabaseAdmin
      .from('activities')
      .select(activitySelect)
      .eq('id', activityId)
      .single();

    if (selectError) {
      console.error('Erro ao buscar atividade atualizada:', selectError);

      return res.status(200).json({
        message: 'Resposta enviada com sucesso.',
      });
    }

    return res.status(200).json({
      message: 'Resposta enviada com sucesso.',
      activity: mapActivity(updatedActivity),
    });
  } catch (error) {
    console.error('Erro inesperado ao responder atividade:', error);

    return res.status(500).json({
      error: 'Erro interno ao responder atividade.',
      details: error.message,
    });
  }
});

router.patch('/:activityId/correction', async (req, res) => {
  try {
    const activityId = String(req.params.activityId ?? '').trim();
    const professorId = String(req.body.professorId ?? '').trim();
    const correctionStatus = String(req.body.correctionStatus ?? '').trim();
    const correctionFeedback = String(req.body.correctionFeedback ?? '').trim();

    if (!activityId || !professorId || !correctionStatus) {
      return res.status(400).json({
        error: 'Atividade, professor e status da correção são obrigatórios.',
      });
    }

    if (!['correta', 'incorreta', 'devolvida'].includes(correctionStatus)) {
      return res.status(400).json({
        error: 'Status de correção inválido.',
      });
    }

    if (
      ['incorreta', 'devolvida'].includes(correctionStatus) &&
      !correctionFeedback
    ) {
      return res.status(400).json({
        error: 'Feedback é obrigatório para atividade incorreta ou devolvida.',
      });
    }

    const { data: activity, error: activityError } = await supabaseAdmin
      .from('activities')
      .select('id, professor_id, aluno_id, titulo')
      .eq('id', activityId)
      .maybeSingle();

    if (activityError) {
      console.error('Erro ao buscar atividade:', activityError);

      return res.status(500).json({
        error: 'Erro ao buscar atividade.',
        details: activityError.message,
      });
    }

    if (!activity) {
      return res.status(404).json({
        error: 'Atividade não encontrada.',
      });
    }

    if (activity.professor_id !== professorId) {
      return res.status(403).json({
        error: 'Esta atividade não pertence a este professor.',
      });
    }

    const newActivityStatus =
      correctionStatus === 'devolvida' ? 'pendente' : 'concluida';

    const { error: updateError } = await supabaseAdmin
      .from('activities')
      .update({
        status: newActivityStatus,
        correction_status: correctionStatus,
        correction_feedback: correctionFeedback || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', activityId);

    if (updateError) {
      console.error('Erro ao corrigir atividade:', updateError);

      return res.status(500).json({
        error: 'Não foi possível salvar a correção.',
        details: updateError.message,
      });
    }

    await supabaseAdmin.from('notifications').insert({
      user_id: activity.aluno_id,
      title:
        correctionStatus === 'devolvida'
          ? 'Atividade devolvida para revisão'
          : 'Atividade corrigida',
      message:
        correctionStatus === 'devolvida'
          ? `Sua atividade "${activity.titulo}" foi devolvida para revisão.`
          : `Sua atividade "${activity.titulo}" foi corrigida pelo professor.`,
      type: 'atividade',
      read: false,
      resolved: false,
      data: {
        atividadeId: activityId,
        correctionStatus,
      },
    });

    const { data: updatedActivity, error: selectError } = await supabaseAdmin
      .from('activities')
      .select(activitySelect)
      .eq('id', activityId)
      .single();

    if (selectError) {
      console.error('Erro ao buscar atividade corrigida:', selectError);

      return res.status(200).json({
        message: 'Correção salva com sucesso.',
      });
    }

    return res.status(200).json({
      message: 'Correção salva com sucesso.',
      activity: mapActivity(updatedActivity),
    });
  } catch (error) {
    console.error('Erro inesperado ao corrigir atividade:', error);

    return res.status(500).json({
      error: 'Erro interno ao corrigir atividade.',
      details: error.message,
    });
  }
});

export default router;