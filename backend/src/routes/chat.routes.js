import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function mapMessage(message) {
  return {
    id: message.id,
    senderId: message.sender_id,
    receiverId: message.receiver_id,
    message: message.message,
    read: message.read,
    createdAt: message.created_at,
  };
}

async function validateChatParticipants(firstUserId, secondUserId) {
  const { data: users, error } = await supabaseAdmin
    .from('users')
    .select('id, nome, role, professor_id, status')
    .in('id', [firstUserId, secondUserId]);

  if (error) {
    throw new Error(`Erro ao validar participantes: ${error.message}`);
  }

  if (!users || users.length !== 2) {
    return {
      valid: false,
      status: 404,
      error: 'Um dos usuários do chat não foi encontrado.',
    };
  }

  const professor = users.find((user) => user.role === 'professor');
  const aluno = users.find((user) => user.role === 'aluno');

  if (!professor || !aluno) {
    return {
      valid: false,
      status: 403,
      error: 'O chat é permitido apenas entre professor e aluno.',
    };
  }

  if (aluno.professor_id !== professor.id || aluno.status !== 'aprovado') {
    return {
      valid: false,
      status: 403,
      error: 'Professor e aluno não possuem um vínculo aprovado.',
    };
  }

  return {
    valid: true,
    professor,
    aluno,
  };
}

router.get('/conversation/:userId/:otherUserId', async (req, res) => {
  try {
    const userId = String(req.params.userId ?? '').trim();
    const otherUserId = String(req.params.otherUserId ?? '').trim();

    if (!UUID_PATTERN.test(userId) || !UUID_PATTERN.test(otherUserId)) {
      return res.status(400).json({
        error: 'IDs de usuário inválidos.',
      });
    }

    const participants = await validateChatParticipants(
      userId,
      otherUserId,
    );

    if (!participants.valid) {
      return res.status(participants.status).json({
        error: participants.error,
      });
    }

    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .select(
        'id, sender_id, receiver_id, message, read, created_at',
      )
      .or(
        `and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`,
      )
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar conversa:', error);

      return res.status(500).json({
        error: 'Não foi possível carregar a conversa.',
        details: error.message,
      });
    }

    return res.status(200).json(
      (messages ?? []).map(mapMessage),
    );
  } catch (error) {
    console.error('Erro inesperado ao carregar conversa:', error);

    return res.status(500).json({
      error: 'Erro interno ao carregar conversa.',
      details: error.message,
    });
  }
});

router.post('/messages', async (req, res) => {
  try {
    const senderId = String(req.body.senderId ?? '').trim();
    const receiverId = String(req.body.receiverId ?? '').trim();
    const message = String(req.body.message ?? '').trim();

    if (
      !UUID_PATTERN.test(senderId) ||
      !UUID_PATTERN.test(receiverId)
    ) {
      return res.status(400).json({
        error: 'Remetente ou destinatário inválido.',
      });
    }

    if (!message) {
      return res.status(400).json({
        error: 'A mensagem não pode estar vazia.',
      });
    }

    if (message.length > 4000) {
      return res.status(400).json({
        error: 'A mensagem deve ter no máximo 4000 caracteres.',
      });
    }

    const participants = await validateChatParticipants(
      senderId,
      receiverId,
    );

    if (!participants.valid) {
      return res.status(participants.status).json({
        error: participants.error,
      });
    }

    const sender =
      participants.professor.id === senderId
        ? participants.professor
        : participants.aluno;

    const { data: savedMessage, error: messageError } =
      await supabaseAdmin
        .from('messages')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          message,
          read: false,
        })
        .select(
          'id, sender_id, receiver_id, message, read, created_at',
        )
        .single();

    if (messageError) {
      console.error('Erro ao salvar mensagem:', messageError);

      return res.status(500).json({
        error: 'Não foi possível enviar a mensagem.',
        details: messageError.message,
      });
    }

    const { error: notificationError } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: receiverId,
        title: 'Nova mensagem',
        message: `${sender.nome} enviou uma mensagem.`,
        type: 'mensagem',
        read: false,
        resolved: false,
        data: {
          senderId,
          messageId: savedMessage.id,
        },
      });

    if (notificationError) {
      console.error(
        'Mensagem enviada, mas houve erro ao criar notificação:',
        notificationError,
      );
    }

    return res.status(201).json({
      message: 'Mensagem enviada com sucesso.',
      chatMessage: mapMessage(savedMessage),
    });
  } catch (error) {
    console.error('Erro inesperado ao enviar mensagem:', error);

    return res.status(500).json({
      error: 'Erro interno ao enviar mensagem.',
      details: error.message,
    });
  }
});

router.patch(
  '/conversation/:userId/:otherUserId/read',
  async (req, res) => {
    try {
      const userId = String(req.params.userId ?? '').trim();
      const otherUserId = String(
        req.params.otherUserId ?? '',
      ).trim();

      if (
        !UUID_PATTERN.test(userId) ||
        !UUID_PATTERN.test(otherUserId)
      ) {
        return res.status(400).json({
          error: 'IDs de usuário inválidos.',
        });
      }

      const participants = await validateChatParticipants(
        userId,
        otherUserId,
      );

      if (!participants.valid) {
        return res.status(participants.status).json({
          error: participants.error,
        });
      }

      const { error } = await supabaseAdmin
        .from('messages')
        .update({
          read: true,
        })
        .eq('receiver_id', userId)
        .eq('sender_id', otherUserId)
        .eq('read', false);

      if (error) {
        console.error(
          'Erro ao marcar mensagens como lidas:',
          error,
        );

        return res.status(500).json({
          error: 'Não foi possível marcar as mensagens como lidas.',
          details: error.message,
        });
      }

      return res.status(200).json({
        message: 'Conversa marcada como lida.',
      });
    } catch (error) {
      console.error(
        'Erro inesperado ao marcar conversa como lida:',
        error,
      );

      return res.status(500).json({
        error: 'Erro interno ao atualizar a conversa.',
        details: error.message,
      });
    }
  },
);

export default router;