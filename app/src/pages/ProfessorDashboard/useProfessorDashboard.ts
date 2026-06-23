
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import type {
  User,
  Activity,
  ActivityCorrectionStatus,
  Notification,
} from '@/types';

export type TabValue = 'turmas' | 'atividades' | 'chat' | 'notificacoes';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

interface ApiUser {
  id: string;
  email: string;
  documento: string;
  role: User['role'];
  nome: string;
  codigo?: string | null;
  codigo_professor?: string | null;
  status: User['status'];
  professor_id?: string | null;
  curso_adquirido?: 'ingles' | 'enem' | null;
  modulo_adquirido?: string | null;
  data_cadastro?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
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

export function useProfessorDashboard() {
  const [activeTab, setActiveTab] = useState<TabValue>('turmas');
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedCurso, setSelectedCurso] = useState<string | null>(null);
  const [selectedAluno, setSelectedAluno] = useState<User | null>(null);
  const [showCreateActivity, setShowCreateActivity] = useState(false);
  const [showActivityDetail, setShowActivityDetail] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedChatAluno, setSelectedChatAluno] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [alunosReais, setAlunosReais] = useState<User[]>([]);
  const [atividades] = useState<Activity[]>([]);

  const currentUser = useAuthStore((state) => state.currentUser);

  useEffect(() => {
    if (!currentUser?.id || currentUser.role !== 'professor') {
      return;
    }

    let ativo = true;

    async function carregarAlunos() {
      try {
        const data = await request<ApiUser[]>(
          `/professor/${currentUser.id}/students`,
        );

        if (ativo) {
          setAlunosReais(data.map(mapApiUser));
        }
      } catch (error) {
        console.error('Erro ao carregar alunos do professor:', error);
      }
    }

    void carregarAlunos();

    return () => {
      ativo = false;
    };
  }, [currentUser?.id, currentUser?.role]);

  const alunosAprovados = alunosReais.filter(
    (aluno) => aluno.status === 'aprovado',
  );

  const alunosPendentes = alunosReais.filter(
    (aluno) => aluno.status === 'pendente',
  );

  const alunosResolvidos = alunosReais.filter(
    (aluno) => aluno.status === 'aprovado' || aluno.status === 'rejeitado',
  );

  const pendingNotifications: Notification[] = alunosPendentes.map((aluno) => ({
    id: `pendente-${aluno.id}`,
    userId: currentUser?.id ?? '',
    title: 'Novo aluno aguardando aprovação',
    message: `${aluno.nome} solicitou acesso ao curso de ${
      aluno.cursoAdquirido === 'ingles' ? 'Inglês' : 'ENEM'
    }.`,
    type: 'autorizacao',
    read: false,
    resolved: false,
    createdAt: aluno.dataCadastro,
    data: {
      alunoId: aluno.id,
      curso: aluno.cursoAdquirido,
    },
  }));

  const resolvedNotifications: Notification[] = alunosResolvidos.map((aluno) => ({
    id: `resolvido-${aluno.id}`,
    userId: currentUser?.id ?? '',
    title:
      aluno.status === 'aprovado'
        ? 'Aluno aprovado'
        : 'Aluno rejeitado',
    message: `${aluno.nome} - ${
      aluno.cursoAdquirido === 'ingles' ? 'Inglês' : 'ENEM'
    }.`,
    type: 'autorizacao',
    read: true,
    resolved: true,
    resolution: aluno.status === 'aprovado' ? 'aprovado' : 'rejeitado',
    createdAt: aluno.dataCadastro,
    data: {
      alunoId: aluno.id,
      curso: aluno.cursoAdquirido,
    },
  }));

  const alunosPorCurso = alunosAprovados.reduce((acc, aluno) => {
    const curso = aluno.cursoAdquirido === 'ingles' ? 'Inglês' : 'ENEM';

    if (!acc[curso]) {
      acc[curso] = [];
    }

    acc[curso].push(aluno);

    return acc;
  }, {} as Record<string, User[]>);

  const filteredAlunos = selectedCurso
    ? (alunosPorCurso[selectedCurso] || []).filter((aluno) =>
        aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : [];

  const atividadesPorCurso = atividades.reduce((acc, atividade) => {
    const curso = atividade.curso === 'ingles' ? 'Inglês' : 'ENEM';

    if (!acc[curso]) {
      acc[curso] = [];
    }

    acc[curso].push(atividade);

    return acc;
  }, {} as Record<string, Activity[]>);

  const getAlunoById = (alunoId: string) => {
    return alunosReais.find((aluno) => aluno.id === alunoId);
  };

  const atualizarStatusAluno = async (
    alunoId: string,
    status: 'aprovado' | 'rejeitado',
  ) => {
    if (!currentUser?.id) {
      return;
    }

    try {
      const response = await request<{
        message: string;
        user: ApiUser;
      }>(`/professor/${currentUser.id}/students/${alunoId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });

      const alunoAtualizado = mapApiUser(response.user);

      setAlunosReais((alunosAtuais) =>
        alunosAtuais.map((aluno) =>
          aluno.id === alunoAtualizado.id ? alunoAtualizado : aluno,
        ),
      );

      if (selectedAluno?.id === alunoAtualizado.id) {
        setSelectedAluno(alunoAtualizado);
      }
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Erro ao atualizar aluno.',
      );
    }
  };

  const handleAprovar = (alunoId: string) => {
    void atualizarStatusAluno(alunoId, 'aprovado');
  };

  const handleRejeitar = (alunoId: string) => {
    void atualizarStatusAluno(alunoId, 'rejeitado');
  };

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowActivityDetail(true);
  };

  const handleCorrigir = (
    _status: ActivityCorrectionStatus,
    _feedback?: string,
  ) => {
    setShowActivityDetail(false);
    setSelectedActivity(null);
  };

  const handleChatClick = (alunoId: string) => {
    const aluno = getAlunoById(alunoId);

    if (aluno) {
      setSelectedChatAluno(aluno);
      setShowChatModal(true);
    }
  };

  return {
    activeTab,
    setActiveTab,

    showNotifications,
    setShowNotifications,

    selectedCurso,
    setSelectedCurso,

    selectedAluno,
    setSelectedAluno,

    showCreateActivity,
    setShowCreateActivity,

    showActivityDetail,
    setShowActivityDetail,

    selectedActivity,

    showChatModal,
    setShowChatModal,

    selectedChatAluno,

    searchTerm,
    setSearchTerm,

    currentUser,

    pendingNotifications,
    resolvedNotifications,

    alunos: alunosAprovados,
    atividades,

    alunosPorCurso,
    filteredAlunos,
    atividadesPorCurso,

    getAlunoById,

    handleAprovar,
    handleRejeitar,
    handleActivityClick,
    handleCorrigir,
    handleChatClick,
  };
}
