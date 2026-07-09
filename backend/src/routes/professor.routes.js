
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

router.get('/:professorId/students', async (req, res) => {
  try {
    const professorId = String(req.params.professorId ?? '').trim();

    if (!professorId) {
      return res.status(400).json({
        error: 'ID do professor é obrigatório.',
      });
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .select(publicUserSelect)
      .eq('role', 'aluno')
      .eq('professor_id', professorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar alunos do professor:', error);

      return res.status(500).json({
        error: 'Não foi possível buscar os alunos do professor.',
        details: error.message,
      });
    }

    return res.status(200).json(data ?? []);
  } catch (error) {
    console.error('Erro inesperado ao buscar alunos:', error);

    return res.status(500).json({
      error: 'Erro interno ao buscar alunos.',
      details: error.message,
    });
  }
});

router.patch('/:professorId/students/:studentId/status', async (req, res) => {
  try {
    const professorId = String(req.params.professorId ?? '').trim();
    const studentId = String(req.params.studentId ?? '').trim();
    const status = String(req.body.status ?? '').trim().toLowerCase();

    if (!professorId || !studentId) {
      return res.status(400).json({
        error: 'ID do professor e ID do aluno são obrigatórios.',
      });
    }

    if (!['aprovado', 'rejeitado'].includes(status)) {
      return res.status(400).json({
        error: 'Status inválido. Use aprovado ou rejeitado.',
      });
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ status })
      .eq('id', studentId)
      .eq('professor_id', professorId)
      .eq('role', 'aluno')
      .select(publicUserSelect)
      .maybeSingle();

    if (error) {
      console.error('Erro ao atualizar status do aluno:', error);

      return res.status(500).json({
        error: 'Não foi possível atualizar o status do aluno.',
        details: error.message,
      });
    }

    if (!data) {
  return res.status(404).json({
    error: 'Aluno não encontrado para este professor.',
  });
}

const { error: resolveNotificationError } =
  await supabaseAdmin
    .from('notifications')
    .update({
      read: true,
      resolved: true,
      resolution: status,
    })
    .eq('user_id', professorId)
    .eq('type', 'autorizacao')
    .contains('data', {
      alunoId: studentId,
    })
    .eq('resolved', false);

if (resolveNotificationError) {
  console.error(
    'Aluno atualizado, mas houve erro ao resolver notificação:',
    resolveNotificationError,
  );
}

const studentNotification =
  status === 'aprovado'
    ? {
        title: 'Aprovação concedida!',
        message:
          'Você foi aprovado e agora tem acesso completo à plataforma.',
      }
    : {
        title: 'Solicitação rejeitada',
        message:
          'Sua solicitação foi rejeitada. Entre em contato com o professor para mais informações.',
      };

const { error: studentNotificationError } =
  await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: studentId,
      title: studentNotification.title,
      message: studentNotification.message,
      type: 'sistema',
      read: false,
      resolved: false,
      data: {
        professorId,
        status,
      },
    });

if (studentNotificationError) {
  console.error(
    'Aluno atualizado, mas houve erro ao notificá-lo:',
    studentNotificationError,
  );
}

return res.status(200).json({
  message:
    status === 'aprovado'
      ? 'Aluno aprovado com sucesso.'
      : 'Aluno rejeitado com sucesso.',
  user: data,
});

  } catch (error) {
    console.error('Erro inesperado ao atualizar aluno:', error);

    return res.status(500).json({
      error: 'Erro interno ao atualizar aluno.',
      details: error.message,
    });
  }
});

export default router;