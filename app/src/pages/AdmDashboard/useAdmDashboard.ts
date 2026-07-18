import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import type { Activity, User } from '@/types';

export type AdmTab = 'operacao' | 'professores' | 'alunos' | 'gestores' | 'notificacoes';
export type ProfView = 'list' | 'detail' | 'aluno-detail';

export function useAdmDashboard() {
  const [activeTab, setActiveTab] = useState<AdmTab>('operacao');
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Professores drill-down
  const [profView, setProfView] = useState<ProfView>('list');
  const [selectedProfessor, setSelectedProfessor] = useState<User | null>(null);
  const [selectedAluno, setSelectedAluno] = useState<User | null>(null);

  // Alunos tab
  const [alunoFiltroStatus, setAlunoFiltroStatus] = useState<'todos' | 'aprovado' | 'pendente' | 'rejeitado'>('todos');
  const [alunoSearch, setAlunoSearch] = useState('');

   const currentUser = useAuthStore((state) => state.currentUser);

    const [professores, setProfessores] = useState<User[]>([]);
  const [todosAlunos, setTodosAlunos] = useState<User[]>([]);
  const [gestores, setGestores] = useState<User[]>([]);
  const [todasAtividades, setTodasAtividades] = useState<Activity[]>([]);

  const recarregarDados = async () => {
    try {
          const [
        usuariosData,
        professoresData,
        alunosData,
        atividadesData,
      ] = await Promise.all([
        api.getAdminUsers(),
        api.getAdminProfessors(),
        api.getAdminStudents(),
        api.getAdminActivities(),
      ]);

            setGestores(
        usuariosData.filter((usuario) =>
          ['gestor', 'admin'].includes(usuario.role ?? ''),
        ),
      );
      setProfessores(professoresData);
      setTodosAlunos(alunosData);
      setTodasAtividades(atividadesData);
    } catch (error) {
      console.error(
        'Erro ao carregar dados do gestor:',
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : 'Erro ao carregar dados do gestor.',
      );
    }
  };

  useEffect(() => {
    void recarregarDados();
  }, []);


  // Métricas globais
  const metrics = {
    professoresAtivos: professores.filter(p => p.status === 'aprovado').length,
    alunosAtivos: todosAlunos.filter(a => a.status === 'aprovado').length,
    alunosPendentes: todosAlunos.filter(a => a.status === 'pendente').length,
    atividadesPendentes: todasAtividades.filter(a => a.correctionStatus === 'pendente').length,
    totalCursos: [...new Set(todosAlunos.map(a => a.cursoAdquirido).filter(Boolean))].length,
  };

  // Notificações globais (admin vê todas)
  const allPendingNotifs: any[] = [];
  const allResolvedNotifs: any[] = [];

  // Alertas dinâmicos para painel de operação
  const alertas = [
    ...(metrics.alunosPendentes > 0
      ? [{ id: 'pendentes', tipo: 'warning' as const, texto: `${metrics.alunosPendentes} aluno${metrics.alunosPendentes > 1 ? 's' : ''} aguardando aprovação`, acao: 'Verificar', onClick: () => setActiveTab('alunos') }]
      : []),
    ...(metrics.atividadesPendentes > 0
      ? [{ id: 'atividades', tipo: 'info' as const, texto: `${metrics.atividadesPendentes} atividade${metrics.atividadesPendentes > 1 ? 's' : ''} sem correção`, acao: 'Ver lista', onClick: () => setActiveTab('professores') }]
      : []),
    ...professores
      .filter(p => todosAlunos.filter(a => a.professorId === p.id && a.status === 'aprovado').length === 0)
      .map(p => ({ id: `prof-sem-aluno-${p.id}`, tipo: 'danger' as const, texto: `Prof. sem alunos ativos`, sub: p.nome, acao: 'Ver perfil', onClick: () => { setSelectedProfessor(p); setProfView('detail'); setActiveTab('professores'); } })),
  ];

  // Últimas atividades globais para tabela de operação
  const atividadesRecentes = [...todasAtividades]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  // Alunos de um professor selecionado
  const alunosDoProfessor = selectedProfessor
    ? todosAlunos.filter(a => a.professorId === selectedProfessor.id)
    : [];

  // Atividades do aluno selecionado
  const atividadesDoAluno = selectedAluno
    ? todasAtividades.filter(a => a.alunoId === selectedAluno.id)
    : [];

  // Atividades do professor selecionado
  const atividadesDoProfessor = selectedProfessor
    ? todasAtividades.filter(
        (atividade) =>
          atividade.professorId === selectedProfessor.id,
      )
    : [];

  // Alunos filtrados na aba Alunos
  const alunosFiltrados = todosAlunos.filter(a => {
    const matchStatus = alunoFiltroStatus === 'todos' || a.status === alunoFiltroStatus;
    const matchSearch = a.nome.toLowerCase().includes(alunoSearch.toLowerCase()) || a.email.toLowerCase().includes(alunoSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Handlers drill-down
  const handleSelectProfessor = (prof: User) => {
    setSelectedProfessor(prof);
    setProfView('detail');
  };

  const handleSelectAluno = (aluno: User) => {
    setSelectedAluno(aluno);
    setProfView('aluno-detail');
  };

  const handleBackToList = () => {
    setProfView('list');
    setSelectedProfessor(null);
    setSelectedAluno(null);
  };

  const handleBackToDetail = () => {
    setProfView('detail');
    setSelectedAluno(null);
  };

    const atualizarStatusAluno = async (
    alunoId: string,
    status: 'aprovado' | 'rejeitado',
  ) => {
    try {
      const response = await api.updateAdminUserStatus(
        alunoId,
        status,
      );

      const alunoAtualizado = response.user;

      setTodosAlunos((alunosAtuais) =>
        alunosAtuais.map((aluno) =>
          aluno.id === alunoAtualizado.id
            ? alunoAtualizado
            : aluno,
        ),
      );

      setProfessores((professoresAtuais) =>
        professoresAtuais.map((professor) =>
          professor.id === alunoAtualizado.id ? alunoAtualizado : professor,
        ),
      );

      if (selectedAluno?.id === alunoAtualizado.id) {
        setSelectedAluno(alunoAtualizado);
      }

      if (selectedProfessor?.id === alunoAtualizado.id) {
        setSelectedProfessor(alunoAtualizado);
      }

      await recarregarDados();
    } catch (error) {
      console.error(
        'Erro ao atualizar aluno pelo gestor:',
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : 'Erro ao atualizar aluno.',
      );
    }
  };

  const handleAprovarAluno = (alunoId: string) => {
    void atualizarStatusAluno(alunoId, 'aprovado');
  };

  const handleRejeitarAluno = (alunoId: string) => {
    void atualizarStatusAluno(alunoId, 'rejeitado');
  };

  const handleResolveNotif = (
    _notifId: string,
    _resolution: 'aprovado' | 'rejeitado',
  ) => {
    // Notificações do gestor serão tratadas depois, se necessário.
  };

  // Helper: encontrar professor de um aluno
  const getProfessorDoAluno = (aluno: User) =>
    professores.find(p => p.id === aluno.professorId);

  return {
    activeTab, setActiveTab,
    showNotifDropdown, setShowNotifDropdown,
    profView,
    selectedProfessor, selectedAluno,
    alunoFiltroStatus, setAlunoFiltroStatus,
    alunoSearch, setAlunoSearch,
    currentUser,
    professores,
    todosAlunos,
    gestores,
    metrics,
    alertas,
    atividadesRecentes,
    alunosDoProfessor,
    atividadesDoAluno,
    atividadesDoProfessor,
    alunosFiltrados,
    allPendingNotifs,
    allResolvedNotifs,
    handleSelectProfessor,
    handleSelectAluno,
    handleBackToList,
    handleBackToDetail,
    handleAprovarAluno,
    handleRejeitarAluno,
    handleResolveNotif,
    getProfessorDoAluno,
    recarregarDados,
  };
}