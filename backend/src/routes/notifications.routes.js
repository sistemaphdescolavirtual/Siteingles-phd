import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function mapNotification(notification) {
  return {
    id: notification.id,
    userId: notification.user_id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    read: notification.read,
    resolved: notification.resolved,
    resolution: notification.resolution ?? undefined,
    data: notification.data ?? undefined,
    createdAt: notification.created_at,
  };
}

router.get('/:userId', async (req, res) => {
  try {
    const userId = String(req.params.userId ?? '').trim();

    if (!UUID_PATTERN.test(userId)) {
      return res.status(400).json({
        error: 'ID do usuário inválido.',
      });
    }

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select(`
        id,
        user_id,
        title,
        message,
        type,
        read,
        resolved,
        resolution,
        data,
        created_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error(
        'Erro ao buscar notificações:',
        error,
      );

      return res.status(500).json({
        error:
          'Não foi possível carregar as notificações.',
        details: error.message,
      });
    }

    return res.status(200).json(
      (data ?? []).map(mapNotification),
    );
  } catch (error) {
    console.error(
      'Erro inesperado ao buscar notificações:',
      error,
    );

    return res.status(500).json({
      error:
        'Erro interno ao carregar notificações.',
      details: error.message,
    });
  }
});

router.patch(
  '/:userId/:notificationId/read',
  async (req, res) => {
    try {
      const userId = String(
        req.params.userId ?? '',
      ).trim();

      const notificationId = String(
        req.params.notificationId ?? '',
      ).trim();

      if (
        !UUID_PATTERN.test(userId) ||
        !UUID_PATTERN.test(notificationId)
      ) {
        return res.status(400).json({
          error:
            'Usuário ou notificação inválidos.',
        });
      }

      const { data, error } = await supabaseAdmin
        .from('notifications')
        .update({
          read: true,
        })
        .eq('id', notificationId)
        .eq('user_id', userId)
        .select(`
          id,
          user_id,
          title,
          message,
          type,
          read,
          resolved,
          resolution,
          data,
          created_at
        `)
        .maybeSingle();

      if (error) {
        console.error(
          'Erro ao marcar notificação como lida:',
          error,
        );

        return res.status(500).json({
          error:
            'Não foi possível atualizar a notificação.',
          details: error.message,
        });
      }

      if (!data) {
        return res.status(404).json({
          error:
            'Notificação não encontrada para este usuário.',
        });
      }

      return res.status(200).json({
        message: 'Notificação marcada como lida.',
        notification: mapNotification(data),
      });
    } catch (error) {
      console.error(
        'Erro inesperado ao atualizar notificação:',
        error,
      );

      return res.status(500).json({
        error:
          'Erro interno ao atualizar notificação.',
        details: error.message,
      });
    }
  },
);

export default router;