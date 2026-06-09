import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import type { User, Activity, ActivityCorrectionStatus } from '@/types';

export type TabValue = 'turmas' | 'atividades' | 'chat' | 'notificacoes';

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

  const {
    currentUser, getPendingNotifications, getResolvedNotifications,
    getAlunosByProfessor, getAtividadesByProfessor,
    aprovarAluno, rejeitarAluno, markNotificationAsResolved,
    corrigirAtividade, getAlunoById,
  } = useAuthStore();

  const pendingNotifications = currentUser ? getPendingNotifications(currentUser.id) : [];
  const resolvedNotifications = currentUser ? getResolvedNotifications(currentUser.id) : [];
  const alunos = currentUser ? getAlunosByProfessor(currentUser.id) : [];
  const atividades = currentUser ? getAtividadesByProfessor(currentUser.id) : [];

  const alunosPorCurso = alunos.reduce((acc, aluno) => {
    const curso = aluno.cursoAdquirido === 'ingles' ? 'Inglês' : 'ENEM';
    if (!acc[curso]) acc[curso] = [];
    acc[curso].push(aluno);
    return acc;
  }, {} as Record<string, User[]>);

  const filteredAlunos = selectedCurso
    ? (alunosPorCurso[selectedCurso] || []).filter(a => a.nome.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const atividadesPorCurso = atividades.reduce((acc, atividade) => {
    const curso = atividade.curso === 'ingles' ? 'Inglês' : 'ENEM';
    if (!acc[curso]) acc[curso] = [];
    acc[curso].push(atividade);
    return acc;
  }, {} as Record<string, Activity[]>);

  const handleAprovar = (alunoId: string, notificationId: string) => {
    aprovarAluno(alunoId);
    markNotificationAsResolved(notificationId, 'aprovado');
  };
  const handleRejeitar = (alunoId: string, notificationId: string) => {
    rejeitarAluno(alunoId);
    markNotificationAsResolved(notificationId, 'rejeitado');
  };
  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowActivityDetail(true);
  };
  const handleCorrigir = (status: ActivityCorrectionStatus, feedback?: string) => {
    if (selectedActivity) {
      corrigirAtividade(selectedActivity.id, status, feedback);
      setShowActivityDetail(false);
      setSelectedActivity(null);
    }
  };
  const handleChatClick = (alunoId: string) => {
    const aluno = getAlunoById(alunoId);
    if (aluno) { setSelectedChatAluno(aluno); setShowChatModal(true); }
  };

  return {
    activeTab, setActiveTab,
    showNotifications, setShowNotifications,
    selectedCurso, setSelectedCurso,
    selectedAluno, setSelectedAluno,
    showCreateActivity, setShowCreateActivity,
    showActivityDetail, setShowActivityDetail,
    selectedActivity,
    showChatModal, setShowChatModal,
    selectedChatAluno,
    searchTerm, setSearchTerm,
    currentUser,
    pendingNotifications, resolvedNotifications,
    alunos, atividades,
    alunosPorCurso, filteredAlunos, atividadesPorCurso,
    getAlunoById,
    handleAprovar, handleRejeitar,
    handleActivityClick, handleCorrigir, handleChatClick,
  };
}
