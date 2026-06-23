import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import type { Activity, User } from '@/types';

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

  const store = useAuthStore() as any;

  const currentUser = store.currentUser as User | null;
  const users = (store.users ?? []) as User[];

  const todasAtividades: Activity[] = currentUser
    ? store.getAtividadesByAluno?.(currentUser.id) ?? []
    : [];

  const cursoAdquirido = currentUser?.cursoAdquirido ?? null;

  const atividades: Activity[] = cursoAdquirido
    ? todasAtividades.filter((atividade) => atividade.curso === cursoAdquirido)
    : todasAtividades;

  const pendingNotifications: any[] = currentUser
    ? store.getPendingNotifications?.(currentUser.id) ?? []
    : [];

  const resolvedNotifications: any[] = currentUser
    ? store.getResolvedNotifications?.(currentUser.id) ?? []
    : [];

  const professor =
    currentUser?.professorId
      ? users.find(
          (user) =>
            user.id === currentUser.professorId &&
            user.role === 'professor',
        ) ?? null
      : currentUser?.codigoProfessor
        ? store.getProfessorByCodigo?.(currentUser.codigoProfessor) ?? null
        : null;

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
  const pendentes = atividades.filter(
    (atividade) => atividade.correctionStatus === 'pendente',
  ).length;
  const emAnalise = atividades.filter(
    (atividade) => atividade.correctionStatus === 'em_analise',
  ).length;

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowActivityModal(true);
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
  };
}
