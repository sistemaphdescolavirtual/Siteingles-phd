import { Router } from 'express';
import { supabaseAdmin, supabaseAuth } from '../config/supabase.js';
import { randomUUID } from 'node:crypto';

const router = Router();
const ACTIVITY_FILES_BUCKET = 'activity-files';
const MAX_ACTIVITY_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_ACTIVITY_FILES = 3; // LIMITA A QUANTIDADE DE ARQUIVOS POR ATIVIDADE PARA 3 

const ACTIVITY_FILE_TYPES = {
   '.pdf': {
    tipo: 'pdf',
    contentType: 'application/pdf',
  },
  '.txt': {
    tipo: 'txt',
    contentType: 'text/plain',
  },
  '.xls': {
    tipo: 'xls',
    contentType: 'application/vnd.ms-excel',
  },
  '.xlsx': {
    tipo: 'xls',
    contentType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
};

function getActivityFileConfig(fileName) {
  const normalizedFilename = String(fileName ?? '').trim().toLowerCase();
  const extension = Object.keys(ACTIVITY_FILE_TYPES).find((item)=>
  normalizedFilename.endsWith(item),
);

if (!extension) {
  return null;


}
return ACTIVITY_FILE_TYPES[extension];
}

function normalizeStorageFileName(fileName) {
  const normalized = String(fileName ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || 'arquivo';
}

function normalizeExternalUrl(value) {
  const rawUrl = String(value ?? '').trim();

  if (!rawUrl) {
    return null;
  }

  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(rawUrl)
    ? rawUrl
    : `https://${rawUrl}`;

  try {
    const parsedUrl = new URL(candidate);

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return null;
    }

    return parsedUrl.toString();
  } catch {
    return null;
  }
}


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
      console.error('Token inválido em activities:', authError);

      return res.status(401).json({
        error: 'Token inválido ou expirado.',
        details: authError?.message,
      });
    }

    const { data: publicUser, error: publicUserError } =
      await supabaseAdmin
        .from('users')
        .select('id, role, status, nome, email, professor_id')
        .eq('id', authData.user.id)
        .maybeSingle();

    if (publicUserError) {
      console.error(
        'Erro ao buscar usuário autenticado em activities:',
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
        error: 'Usuário não aprovado para acessar este recurso.',
      });
    }

    req.authUser = publicUser;

    return next();
  } catch (error) {
    console.error('Erro inesperado ao autenticar activities:', error);

    return res.status(500).json({
      error: 'Erro interno ao autenticar usuário.',
      details: error.message,
    });
  }
}

function isManager(user) {
  return ['gestor', 'admin'].includes(user?.role);
}


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

router.use(requireAuthenticated);

router.get('/student/:studentId', async (req, res) => {
  try {
    const studentId = String(req.params.studentId ?? '').trim();

    if (!studentId) {
      return res.status(400).json({
        error: 'ID do aluno é obrigatório.',
      });

          const authUser = req.authUser;

    if (authUser.role === 'aluno' && authUser.id !== studentId) {
      return res.status(403).json({
        error: 'Você só pode acessar suas próprias atividades.',
      });
    }

    if (authUser.role === 'professor') {
      const { data: student, error: studentError } =
        await supabaseAdmin
          .from('users')
          .select('id, professor_id')
          .eq('id', studentId)
          .eq('role', 'aluno')
          .maybeSingle();

      if (studentError) {
        console.error('Erro ao validar aluno da atividade:', studentError);

        return res.status(500).json({
          error: 'Erro ao validar aluno.',
          details: studentError.message,
        });
      }

      if (!student) {
        return res.status(404).json({
          error: 'Aluno não encontrado.',
        });
      }

      if (student.professor_id !== authUser.id) {
        return res.status(403).json({
          error: 'Este aluno não pertence a este professor.',
        });
      }
    }

    if (
      !['aluno', 'professor'].includes(authUser.role) &&
      !isManager(authUser)
    ) {
      return res.status(403).json({
        error: 'Perfil sem permissão para acessar atividades do aluno.',
      });
    }
    }

    const { data, error } = await supabaseAdmin
      .from('activities')
      .select(activitySelect)
      .eq('aluno_id', studentId)
      .lte('publish_at', new Date().toISOString())
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
        const authUser = req.authUser;

    if (authUser.role === 'professor' && authUser.id !== professorId) {
      return res.status(403).json({
        error: 'Você só pode acessar suas próprias atividades.',
      });
    }

    if (authUser.role === 'aluno') {
      return res.status(403).json({
        error: 'Alunos não podem acessar atividades por professor.',
      });
    }

    if (authUser.role !== 'professor' && !isManager(authUser)) {
      return res.status(403).json({
        error: 'Perfil sem permissão para acessar atividades do professor.',
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
    const professorId = String(req.authUser?.id ?? '').trim();
    const alunoId = String(req.body.alunoId ?? '').trim();
    const curso = String(req.body.curso ?? '').trim().toLowerCase();
    const titulo = String(req.body.titulo ?? '').trim();
    const descricao = String(req.body.descricao ?? '').trim();
        const anexos = Array.isArray(req.body.anexos) ? req.body.anexos : [];
    const publishAtRaw = req.body.publishAt;
    const dueAtRaw = req.body.dueAt;
    const normalizedLinkAttachments = [];

    for (const anexo of anexos) {
      if (String(anexo?.tipo ?? '').toLowerCase() !== 'link') {
        return res.status(400).json({
          error:
            'Arquivos devem ser enviados pela área de upload da atividade.',
        });
      }

      const normalizedUrl = normalizeExternalUrl(anexo?.url);

      if (!normalizedUrl) {
        return res.status(400).json({
          error:
            'Um dos links externos é inválido. Use um endereço HTTP ou HTTPS.',
        });
      }

      normalizedLinkAttachments.push({
        nome:
          String(anexo?.nome ?? '').trim() || normalizedUrl,
        tipo: 'link',
        url: normalizedUrl,
      });
    }

    const publishAt = publishAtRaw
  ? new Date(publishAtRaw)
  : new Date();

const dueAt = dueAtRaw
  ? new Date(dueAtRaw)
  : null;

if (Number.isNaN(publishAt.getTime())) {
  return res.status(400).json({
    error: 'Data de postagem inválida.',
  });
}

if (dueAt && Number.isNaN(dueAt.getTime())) {
  return res.status(400).json({
    error: 'Data de fechamento inválida.',
  });
}

if (dueAt && dueAt <= publishAt) {
  return res.status(400).json({
    error: 'A data de fechamento precisa ser depois da data de postagem.',
  });
}

    if (!professorId || !alunoId || !curso || !titulo || !descricao) {
      return res.status(400).json({
        error: 'Professor, aluno, curso, título e descrição são obrigatórios.',
      });
    }
        if (req.authUser.role !== 'professor') {
      return res.status(403).json({
        error: 'Apenas professores podem criar atividades.',
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
        publish_at: publishAt.toISOString(),
        due_at: dueAt ? dueAt.toISOString() : null,
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

   if (normalizedLinkAttachments.length > 0) {
     const attachmentsPayload = normalizedLinkAttachments.map((anexo) => ({
       activity_id: activity.id,
        nome: anexo.nome,
        tipo: anexo.tipo,
        url: anexo.url,
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

router.get(
  '/:activityId/attachments/:attachmentId/access',
  async (req, res) => {
    try {
      const activityId = String(
        req.params.activityId ?? '',
      ).trim();

      const attachmentId = String(
        req.params.attachmentId ?? '',
      ).trim();

      const userId = String(
        req.authUser?.id ?? '',
      ).trim();

      if (!activityId || !attachmentId || !userId) {
        return res.status(400).json({
          error:
            'Atividade, anexo e usuário são obrigatórios.',
        });
      }

      const {
        data: attachment,
        error: attachmentError,
      } = await supabaseAdmin
        .from('activity_attachments')
        .select(
          'id, activity_id, nome, tipo, url',
        )
        .eq('id', attachmentId)
        .eq('activity_id', activityId)
        .maybeSingle();

      if (attachmentError) {
        console.error(
          'Erro ao buscar anexo:',
          attachmentError,
        );

        return res.status(500).json({
          error: 'Erro ao buscar anexo.',
          details: attachmentError.message,
        });
      }

      if (!attachment) {
        return res.status(404).json({
          error: 'Anexo não encontrado.',
        });
      }

   

      const {
        data: activity,
        error: activityError,
      } = await supabaseAdmin
        .from('activities')
        .select('id, professor_id, aluno_id')
        .eq('id', activityId)
        .maybeSingle();

      if (activityError) {
        console.error(
          'Erro ao validar atividade:',
          activityError,
        );

        return res.status(500).json({
          error: 'Erro ao validar atividade.',
          details: activityError.message,
        });
      }

      if (!activity) {
        return res.status(404).json({
          error: 'Atividade não encontrada.',
        });
      }

     const requestingUser = req.authUser;

      const isGestor = isManager(requestingUser);

      const canAccess =
        activity.aluno_id === userId ||
        activity.professor_id === userId ||
        isGestor;

            if (!canAccess) {
        return res.status(403).json({
          error:
            'Você não possui acesso a este arquivo.',
        });
      }

            if (attachment.tipo === 'link') {
        const externalUrl = normalizeExternalUrl(attachment.url);

        if (!externalUrl) {
          return res.status(422).json({
            error:
              'O link desta atividade é inválido ou não está mais disponível.',
          });
        }

        return res.status(200).json({
          attachmentId: attachment.id,
          fileName: attachment.nome,
          tipo: attachment.tipo,
          viewUrl: externalUrl,
          downloadUrl: null,
          expiresIn: null,
        });
      }

      const expiresIn = 5 * 60;

      const {
        data: signedData,
        error: signedUrlError,
      } = await supabaseAdmin.storage
        .from(ACTIVITY_FILES_BUCKET)
        .createSignedUrl(
          attachment.url,
          expiresIn,
        );

      if (signedUrlError || !signedData?.signedUrl) {
        console.error(
          'Erro ao gerar acesso temporário:',
          signedUrlError,
        );

        return res.status(500).json({
          error:
            'Não foi possível liberar o arquivo.',
          details:
            signedUrlError?.message ??
            'URL assinada não foi gerada.',
        });
      }

      const downloadUrl = new URL(
        signedData.signedUrl,
      );

      downloadUrl.searchParams.set(
        'download',
        attachment.nome,
      );

      return res.status(200).json({
        attachmentId: attachment.id,
        fileName: attachment.nome,
        tipo: attachment.tipo,
        viewUrl: signedData.signedUrl,
        downloadUrl: downloadUrl.toString(),
        expiresIn,
      });
    } catch (error) {
      console.error(
        'Erro inesperado ao liberar anexo:',
        error,
      );

      return res.status(500).json({
        error:
          'Erro interno ao liberar o arquivo.',
        details: error.message,
      });
    }
  },
);

router.post('/:activityId/attachments/upload-url', async (req, res) => {
  try {
    const activityId = String(req.params.activityId ?? '').trim();
    const professorId = String(req.authUser?.id ?? '').trim();
    const fileName = String(req.body.fileName ?? '').trim();
    const fileSize = Number(req.body.fileSize ?? 0);

    if (!activityId || !professorId || !fileName) {
      return res.status(400).json({
        error: 'Atividade, professor e nome do arquivo são obrigatórios.',
      });
    }
        if (req.authUser.role !== 'professor') {
      return res.status(403).json({
        error: 'Apenas professores podem enviar anexos.',
      });
    }

    if (
      !Number.isFinite(fileSize) ||
      fileSize <= 0 ||
      fileSize > MAX_ACTIVITY_FILE_SIZE
    ) {
      return res.status(400).json({
        error: 'O arquivo deve ter no máximo 5 MB.',
      });
    }

    const fileConfig = getActivityFileConfig(fileName);

    if (!fileConfig) {
      return res.status(400).json({
        error: 'Formato inválido. Use PDF, TXT, XLS ou XLSX.',
      });
    }

    const { data: activity, error: activityError } = await supabaseAdmin
      .from('activities')
      .select('id, professor_id')
      .eq('id', activityId)
      .maybeSingle();

    if (activityError) {
      console.error('Erro ao validar atividade:', activityError);

      return res.status(500).json({
        error: 'Erro ao validar atividade.',
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

    const {
      count: currentFileCount,
      error: countError,
    } = await supabaseAdmin
      .from('activity_attachments')
      .select('id', {
        count: 'exact',
        head: true,
      })
      .eq('activity_id', activityId)
      .neq('tipo', 'link');

    if (countError) {
      console.error('Erro ao contar anexos:', countError);

      return res.status(500).json({
        error: 'Erro ao validar quantidade de anexos.',
        details: countError.message,
      });
    }

  if ((currentFileCount ?? 0) >= MAX_ACTIVITY_FILES) {
  return res.status(400).json({
    error: 'A atividade já possui o limite de 3 arquivos.',
  });

    }

    const safeFileName = normalizeStorageFileName(fileName);

    const path =
      `${activityId}/${randomUUID()}-${safeFileName}`;

    const { data: uploadData, error: uploadError } =
      await supabaseAdmin.storage
        .from(ACTIVITY_FILES_BUCKET)
        .createSignedUploadUrl(path);

    if (uploadError) {
      console.error(
        'Erro ao gerar URL de upload:',
        uploadError,
      );

      return res.status(500).json({
        error: 'Não foi possível preparar o upload.',
        details: uploadError.message,
      });
    }

    return res.status(200).json({
      path,
      token: uploadData.token,
      contentType: fileConfig.contentType,
      tipo: fileConfig.tipo,
      maxFileSize: MAX_ACTIVITY_FILE_SIZE,
    });
  } catch (error) {
    console.error(
      'Erro inesperado ao preparar upload:',
      error,
    );

    return res.status(500).json({
      error: 'Erro interno ao preparar upload.',
      details: error.message,
    });
  }
});

router.post('/:activityId/attachments/confirm', async (req, res) => {
  try {
    const activityId = String(req.params.activityId ?? '').trim();
        const professorId = String(req.authUser?.id ?? '').trim();
    const path = String(req.body.path ?? '').trim();
    const fileName = String(req.body.fileName ?? '').trim();

    if (!activityId || !professorId || !path || !fileName) {
      return res.status(400).json({
        error: 'Dados do anexo incompletos.',
      });
    }

        if (req.authUser.role !== 'professor') {
      return res.status(403).json({
        error: 'Apenas professores podem confirmar anexos.',
      });
    }

    if (!path.startsWith(`${activityId}/`)) {
      return res.status(400).json({
        error: 'Caminho do arquivo inválido.',
      });
    }

    const fileConfig = getActivityFileConfig(fileName);

    if (!fileConfig) {
      return res.status(400).json({
        error: 'Formato de arquivo inválido.',
      });
    }

    const { data: activity, error: activityError } = await supabaseAdmin
      .from('activities')
      .select('id, professor_id')
      .eq('id', activityId)
      .maybeSingle();

    if (activityError) {
      console.error('Erro ao validar atividade:', activityError);

      return res.status(500).json({
        error: 'Erro ao validar atividade.',
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

    const objectName = path.split('/').pop();

    const { data: storageFiles, error: storageError } =
      await supabaseAdmin.storage
        .from(ACTIVITY_FILES_BUCKET)
        .list(activityId, {
          limit: 10,
          search: objectName,
        });

    if (storageError) {
      console.error(
        'Erro ao confirmar arquivo no Storage:',
        storageError,
      );

      return res.status(500).json({
        error: 'Não foi possível confirmar o arquivo.',
        details: storageError.message,
      });
    }

    const fileExists = (storageFiles ?? []).some(
      (item) => item.name === objectName,
    );

    if (!fileExists) {
      return res.status(400).json({
        error: 'O arquivo ainda não foi enviado ao Storage.',
      });
    }

    const { data: attachment, error: attachmentError } =
      await supabaseAdmin
        .from('activity_attachments')
        .insert({
          activity_id: activityId,
          nome: fileName,
          tipo: fileConfig.tipo,
          url: path,
        })
        .select('id, nome, tipo, url')
        .single();

    if (attachmentError) {
      console.error(
        'Erro ao salvar anexo:',
        attachmentError,
      );

      await supabaseAdmin.storage
        .from(ACTIVITY_FILES_BUCKET)
        .remove([path]);

      return res.status(500).json({
        error: 'Não foi possível registrar o anexo.',
        details: attachmentError.message,
      });
    }

    return res.status(201).json({
      message: 'Anexo registrado com sucesso.',
      attachment,
    });
  } catch (error) {
    console.error(
      'Erro inesperado ao confirmar anexo:',
      error,
    );

    return res.status(500).json({
      error: 'Erro interno ao confirmar anexo.',
      details: error.message,
    });
  }
});

router.post('/:activityId/response', async (req, res) => {
  try {
    const activityId = String(req.params.activityId ?? '').trim();
       const alunoId = String(req.authUser?.id ?? '').trim();
    const tipo = String(req.body.tipo ?? 'texto').trim().toLowerCase();
    const conteudo = String(req.body.conteudo ?? '').trim();

    if (!activityId || !alunoId || !conteudo) {
      return res.status(400).json({
        error: 'Atividade, aluno e resposta são obrigatórios.',
      });
    }
  
      if (req.authUser.role !== 'aluno') {
      return res.status(403).json({
        error: 'Apenas alunos podem responder atividades.',
      });
    }

    if (!['texto', 'concluido'].includes(tipo)) {
      return res.status(400).json({
        error: 'Tipo de resposta inválido.',
      });
    }

    const { data: activity, error: activityError } = await supabaseAdmin
      .from('activities')
      .select('id, professor_id, aluno_id, titulo, due_at, publish_at, correction_status')
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

    const now = new Date();
    const publishAt = activity.publish_at
      ? new Date(activity.publish_at)
      : null;
    const dueAt = activity.due_at ? new Date(activity.due_at) : null;
    const canResubmit = ['incorreta', 'devolvida'].includes(
      activity.correction_status,
    );

    if (publishAt && publishAt > now) {
      return res.status(400).json({
        error: 'Esta atividade ainda não foi publicada.',
      });
    }

    if (activity.correction_status === 'correta') {
      return res.status(409).json({
        error: 'Esta atividade já foi marcada como correta.',
      });
    }

    if (activity.correction_status === 'em_analise') {
      return res.status(409).json({
        error: 'A resposta desta atividade já está em análise.',
      });
    }

    if (!canResubmit && dueAt && dueAt < now) {
      return res.status(400).json({
        error: 'O prazo para responder esta atividade já foi encerrado.',
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
    const professorId = String(req.authUser?.id ?? '').trim();
    const correctionStatus = String(req.body.correctionStatus ?? '').trim();
    const correctionFeedback = String(req.body.correctionFeedback ?? '').trim();

    if (!activityId || !professorId || !correctionStatus) {
      return res.status(400).json({
        error: 'Atividade, professor e status da correção são obrigatórios.',
      });
    }

    if (req.authUser.role !== 'professor') {
      return res.status(403).json({
        error: 'Apenas professores podem corrigir atividades.',
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
     ['devolvida','incorreta'].includes(correctionStatus) ? 'pendente' : 'concluida';

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

    const notificationTitle =
      correctionStatus === 'devolvida'
        ? 'Atividade devolvida para revisão'
        : correctionStatus === 'incorreta'
          ? 'Atividade incorreta — reenvio liberado'
          : 'Atividade corrigida';

    const notificationMessage =
      correctionStatus === 'devolvida'
        ? `Sua atividade "${activity.titulo}" foi devolvida para revisão.`
        : correctionStatus === 'incorreta'
          ? `Sua atividade "${activity.titulo}" foi marcada como incorreta. Corrija e reenvie.`
          : `Sua atividade "${activity.titulo}" foi corrigida pelo professor.`;

    await supabaseAdmin.from('notifications').insert({
      user_id: activity.aluno_id,
      title: notificationTitle,
      message: notificationMessage,
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