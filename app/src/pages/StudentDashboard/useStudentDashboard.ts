import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import type { Activity } from '@/types';

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
  const { currentUser, getAtividadesByAluno, getPendingNotifications, getResolvedNotifications } = store;

  const atividades: Activity[] = currentUser ? (getAtividadesByAluno?.(currentUser.id) ?? []) : [];
  const pendingNotifications: any[] = currentUser ? (getPendingNotifications?.(currentUser.id) ?? []) : [];
  const resolvedNotifications: any[] = currentUser ? (getResolvedNotifications?.(currentUser.id) ?? []) : [];
  const professor = currentUser ? (store.getProfessorByAluno?.(currentUser.id) ?? null) : null;

  const cursoAdquirido = currentUser?.cursoAdquirido || 'ingles';
  const cursoNome = cursoAdquirido === 'ingles' ? 'Inglês' : 'ENEM';
  const cursoBloqueado = cursoAdquirido === 'ingles' ? 'ENEM' : 'Inglês';

  const atividadesRecentes = [...atividades]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const totalAtividades = atividades.length;
  const corretas = atividades.filter(a => a.correctionStatus === 'correta').length;
  const pendentes = atividades.filter(a => a.correctionStatus === 'pendente').length;
  const emAnalise = atividades.filter(a => a.correctionStatus === 'em_analise').length;

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowActivityModal(true);
  };

  return {
    activeTab, setActiveTab,
    showNotifDropdown, setShowNotifDropdown,
    selectedActivity,
    showActivityModal, setShowActivityModal,
    showChatModal, setShowChatModal,
    expandedCurso, setExpandedCurso,
    showSettings, setShowSettings,
    selectedCalendarDay, setSelectedCalendarDay,
    currentUser,
    atividades, atividadesRecentes,
    pendingNotifications, resolvedNotifications,
    professor,
    cursoAdquirido, cursoNome, cursoBloqueado,
    totalAtividades, corretas, pendentes, emAnalise,
    handleActivityClick,
  };
}
