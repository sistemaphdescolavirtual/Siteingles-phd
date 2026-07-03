import type { Activity, Attachment, User, UserRole, UserStatus } from '@/types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

export interface EnglishModule {
  id: number;
  aulas: number;
  titulo: string;
  descricao: string;
  preco: string;
  periodo: string;
  recomendado: boolean;
  color: string | null;
  ativo: boolean;
  features: string[] | null;
}

interface ApiUser {
  id: string;
  email: string;
  documento: string;
  role: UserRole;
  nome: string;
  codigo?: string | null;
  codigo_professor?: string | null;
  status: UserStatus;
  professor_id?: string | null;
  curso_adquirido?: 'ingles' | 'enem' | null;
  modulo_adquirido?: string | null;
  data_cadastro?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface AuthResponse {
  message: string;
  user: ApiUser;
  session?: unknown;
}

interface RegisterPayload {
  nome?: string;
  email: string;
  password: string;
  documento: string;
  role: 'professor' | 'aluno';
  codigoProfessor?: string;
  cursoAdquirido?: 'ingles' | 'enem';
  moduloAdquirido?: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface ApiAttachment {
  id: string;
  nome: string;
  tipo: Attachment['tipo'];
  url: string;
}

interface ApiActivity {
  id: string;
  professorId: string;
  alunoId: string;
  curso: 'ingles' | 'enem';
  titulo: string;
  descricao: string;
  status: Activity['status'];
  correctionStatus: Activity['correctionStatus'];
  correctionFeedback?: string;
  createdAt: string;
  publishAt?: string | null;
  dueAt?: string | null;
  anexos: ApiAttachment[];
  resposta?: {
    tipo: 'arquivo' | 'texto' | 'concluido';
    conteudo: string;
    enviadoEm: string;
  };
}

interface CreateActivityPayload {
  professorId: string;
  alunoId: string;
  curso: 'ingles' | 'enem';
  titulo: string;
  descricao: string;
  publishAt?: string;
  dueAt?: string;
  anexos?: Array<{
    nome: string;
    tipo: Attachment['tipo'];
    url: string;
  }>;
}
interface SubmitActivityResponsePayload {
  alunoId: string;
  tipo?: 'texto' | 'concluido';
  conteudo: string;
}
interface SubmitActivityCorrectionPayload {
  professorId: string;
  correctionStatus: 'correta' | 'incorreta' | 'devolvida';
  correctionFeedback?: string;
}

function mapApiUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    documento: apiUser.documento,
    role: apiUser.role,
    nome: apiUser.nome,
    codigo: apiUser.codigo ?? undefined,
    codigoProfessor: apiUser.codigo_professor ?? undefined,
    status: apiUser.status,
    professorId: apiUser.professor_id ?? undefined,
    cursoAdquirido: apiUser.curso_adquirido ?? undefined,
    moduloAdquirido: apiUser.modulo_adquirido ?? undefined,
    dataCadastro: new Date(
      apiUser.data_cadastro ??
        apiUser.created_at ??
        new Date().toISOString(),
    ),
  };
}

function mapApiActivity(apiActivity: ApiActivity): Activity {
  return {
    id: apiActivity.id,
    professorId: apiActivity.professorId,
    alunoId: apiActivity.alunoId,
    curso: apiActivity.curso,
    titulo: apiActivity.titulo,
    descricao: apiActivity.descricao,
    status: apiActivity.status,
    correctionStatus: apiActivity.correctionStatus,
    correctionFeedback: apiActivity.correctionFeedback,
    createdAt: new Date(apiActivity.createdAt),
    publishAt: apiActivity.publishAt
  ? new Date(apiActivity.publishAt)
  : undefined,
dueAt: apiActivity.dueAt
  ? new Date(apiActivity.dueAt)
  : undefined,
    anexos: apiActivity.anexos ?? [],
    resposta: apiActivity.resposta
      ? {
          tipo: apiActivity.resposta.tipo,
          conteudo: apiActivity.resposta.conteudo,
          enviadoEm: new Date(apiActivity.resposta.enviadoEm),
        }
      : undefined,
  };
}

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body?.error ??
      body?.message ??
      `A API respondeu com o código ${response.status}.`;

    throw new Error(message);
  }

  return body as T;
}

export const api = {
  health: () =>
    request<{
      ok: boolean;
      server: string;
      database: string;
    }>('/health'),

  getEnglishModules: () =>
    request<EnglishModule[]>('/modules'),

  validateProfessorCode: async (codigo: string) => {
    return request<{
      valid: boolean;
      professor?: {
        id: string;
        nome: string;
        codigo: string;
      };
    }>(`/auth/professor/${encodeURIComponent(codigo)}`);
  },

  login: async (payload: LoginPayload) => {
    const response = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return {
      message: response.message,
      user: mapApiUser(response.user),
      session: response.session,
    };
  },

  register: async (payload: RegisterPayload) => {
    const response = await request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return {
      message: response.message,
      user: mapApiUser(response.user),
    };
  },

  createActivity: async (payload: CreateActivityPayload) => {
    const response = await request<{
      message: string;
      activity: ApiActivity;
    }>('/activities', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return {
      message: response.message,
      activity: mapApiActivity(response.activity),
    };
  },

  getProfessorActivities: async (professorId: string) => {
    const response = await request<ApiActivity[]>(
      `/activities/professor/${encodeURIComponent(professorId)}`,
    );

    return response.map(mapApiActivity);
  },


  getStudentActivities: async (studentId: string) => {
    const response = await request<ApiActivity[]>(
      `/activities/student/${encodeURIComponent(studentId)}`,
    );

    return response.map(mapApiActivity);
  },

  submitActivityResponse: async (
    activityId: string,
    payload: SubmitActivityResponsePayload,
  ) => {
    const response = await request<{
      message: string;
      activity: ApiActivity;
    }>(`/activities/${encodeURIComponent(activityId)}/response`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return {
      message: response.message,
      activity: mapApiActivity(response.activity),
    };
  },

  submitActivityCorrection: async (
    activityId: string,
    payload: SubmitActivityCorrectionPayload,
  ) => {
    const response = await request<{
      message: string;
      activity: ApiActivity;
    }>(`/activities/${encodeURIComponent(activityId)}/correction`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    return {
      message: response.message,
      activity: mapApiActivity(response.activity),
    };
  },
};

