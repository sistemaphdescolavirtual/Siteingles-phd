import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import type { Activity, Notification, User } from '@/types';

export type TabValue = 'cursos' | 'atividades' | 'chat' | 'notificacoes';

export function useStudentDashboard() {
  const [activeTab, setActiveTab] = useState<TabValue>('cursos');
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [expandedCurso, setExpandedCurso] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string | null>(null);
  const [atividadesReais, setAtividadesReais] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [professor, setProfessor] = useState<User | null>(null);

  const currentUser = useAuthStore((state) => state.currentUser) as User | null;

  const cursoAdquirido = currentUser?.cursoAdquirido ?? null;

  const recarregarAtividades = async () => {
    if (!currentUser?.id || currentUser.role !== 'aluno') {
      return;
    }

try {
  const [atividadesData, notificationsData] =
    await Promise.all([
      api.getStudentActivities(currentUser.id),
      api.getNotifications(currentUser.id),
    ]);

  setAtividadesReais(atividadesData);
  setNotifications(notificationsData);
} catch (error) {
  console.error('Erro ao carregar dados do aluno:', error);
}
  };

  const carregarProfessor = async () => {
    if (!currentUser?.codigoProfessor) {
      setProfessor(null);
      return;
    }

    try {
      const response = await api.validateProfessorCode(currentUser.codigoProfessor);

      if (!response.professor) {
        setProfessor(null);
        return;
      }

      setProfessor({
        id: response.professor.id,
        nome: response.professor.nome,
        codigo: response.professor.codigo,
        email: '',
        documento: '',
        role: 'professor',
        status: 'aprovado',
        dataCadastro: new Date(),
      });
    } catch (error) {
      console.error('Erro ao carregar professor do aluno:', error);
      setProfessor(null);
    }
  };

  useEffect(() => {
    void recarregarAtividades();
    void carregarProfessor();
  }, [currentUser?.id, currentUser?.role, currentUser?.codigoProfessor]);

  const atividades: Activity[] = cursoAdquirido
    ? atividadesReais.filter((atividade) => atividade.curso === cursoAdquirido)
    : atividadesReais;

  const actionableStatuses: Activity['correctionStatus'][] = [
    'pendente',
    'incorreta',
    'devolvida',
  ];

 const pendingNotifications = notifications.filter(
  (notification) => !notification.read,
);

const resolvedNotifications = notifications.filter(
  (notification) => notification.read,
);

  const cursoNome =
    cursoAdquirido === 'ingles'
      ? 'Inglês'
      : cursoAdquirido === 'enem'
        ? 'ENEM'
        : 'Nenhum curso';

  const cursoBloqueado =
    cursoAdquirido === 'ingles'
      ? 'ENEM'
      : cursoAdquirido === 'enem'
        ? 'Inglês'
        : 'Inglês ou ENEM';

  const atividadesRecentes = [...atividades]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const totalAtividades = atividades.length;

  const corretas = atividades.filter(
    (atividade) => atividade.correctionStatus === 'correta',
  ).length;

  const pendentes = atividades.filter((atividade) =>
    actionableStatuses.includes(atividade.correctionStatus),
  ).length;

  const emAnalise = atividades.filter(
    (atividade) => atividade.correctionStatus === 'em_analise',
  ).length;

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowActivityModal(true);
  };
  const handleNotificationClick = async (
  notification: Notification,
) => {
  if (!currentUser?.id) {
    return;
  }

  try {
    const updatedNotification =
      await api.markNotificationAsRead(
        currentUser.id,
        notification.id,
      );

    setNotifications((notificationsAtuais) =>
      notificationsAtuais.map((notificationAtual) =>
        notificationAtual.id === updatedNotification.id
          ? updatedNotification
          : notificationAtual,
      ),
    );

    setShowNotifDropdown(false);

    if (
      notification.type === 'atividade' &&
      notification.data?.atividadeId
    ) {
      const atividade = atividades.find(
        (atividadeAtual) =>
          atividadeAtual.id ===
          notification.data.atividadeId,
      );

      if (atividade) {
        setSelectedActivity(atividade);
        setShowActivityModal(true);
        setActiveTab('atividades');
      }

      return;
    }

    if (notification.type === 'mensagem') {
      setActiveTab('chat');
      return;
    }

    setActiveTab('notificacoes');
  } catch (error) {
    console.error(
      'Erro ao abrir notificação:',
      error,
    );

    alert(
      error instanceof Error
        ? error.message
        : 'Erro ao abrir notificação.',
    );
  }
};

  return {
    activeTab,
    setActiveTab,

    showNotifDropdown,
    setShowNotifDropdown,

    selectedActivity,

    showActivityModal,
    setShowActivityModal,

    showChatModal,
    setShowChatModal,

    expandedCurso,
    setExpandedCurso,

    showSettings,
    setShowSettings,

    selectedCalendarDay,
    setSelectedCalendarDay,

    currentUser,

    atividades,
    atividadesRecentes,

    pendingNotifications,
    resolvedNotifications,

    professor,

    cursoAdquirido,
    cursoNome,
    cursoBloqueado,

    totalAtividades,
    corretas,
    pendentes,
    emAnalise,

  handleActivityClick,
  handleNotificationClick,
  recarregarAtividades,
  };
}
