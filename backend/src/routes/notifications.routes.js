import { Router } from 'express';
import { supabaseAdmin, supabaseAuth } from '../config/supabase.js';

const router = Router();

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getBearerToken(req) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return null;
  }

  const [type, token] = authorization.split(' ');

  if (type !== 'Bearer' || !token) {
    return null;
  }

  return token.trim();
}

async function requireAuthenticated(req, res, next) {
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
      console.error('Token inválido em notifications:', authError);

      return res.status(401).json({
        error: 'Token inválido ou expirado.',
        details: authError?.message,
      });
    }

    const { data: publicUser, error: publicUserError } =
      await supabaseAdmin
        .from('users')
        .select('id, role, status, nome, email')
        .eq('id', authData.user.id)
        .maybeSingle();

    if (publicUserError) {
      console.error(
        'Erro ao buscar usuário autenticado em notifications:',
        publicUserError,
      );

      return res.status(500).json({
        error: 'Erro ao validar usuário autenticado.',
        details: publicUserError.message,
      });
    }

    if (!publicUser) {
      return res.status(404).json({
        error: 'Usuário autenticado não encontrado.',
      });
    }

    if (publicUser.status !== 'aprovado') {
      return res.status(403).json({
        error: 'Usuário não aprovado para acessar notificações.',
      });
    }

    req.authUser = publicUser;

    return next();
  } catch (error) {
    console.error('Erro inesperado ao autenticar notifications:', error);

    return res.status(500).json({
      error: 'Erro interno ao autenticar usuário.',
      details: error.message,
    });
  }
}

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

router.use(requireAuthenticated);

router.get('/:userId', async (req, res) => {
  try {
    const userId = String(req.params.userId ?? '').trim();

    if (!UUID_PATTERN.test(userId)) {
      return res.status(400).json({
        error: 'ID do usuário inválido.',
      });
    }

    if (req.authUser.id !== userId) {
      return res.status(403).json({
        error: 'Você só pode acessar suas próprias notificações.',
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

            if (req.authUser.id !== userId) {
        return res.status(403).json({
          error: 'Você só pode atualizar suas próprias notificações.',
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