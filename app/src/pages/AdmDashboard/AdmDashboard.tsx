import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Bell, LogOut, Users, Shield,
  BookOpen, FileText, AlertTriangle, CheckCircle,
  ChevronLeft, Search, TrendingUp, Activity,
    Clock, UserCheck, BarChart3, Settings,
  Paperclip, ExternalLink, Download, MessageSquare,
  UserPlus, KeyRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/shared/Avatar';
import { CorrectionStatusBadge } from '@/components/shared/CorrectionStatusBadge';
import { SettingsModal } from '@/components/shared/SettingsModal';
import { useAdmDashboard } from './useAdmDashboard';
import { api } from '@/services/api';
import type { User, Activity as ActivityType } from '@/types';
import logoPhd from '@/assets/logo_phd.png';

interface AdmDashboardProps {
  onLogout: () => void;
}

// ─── helpers ────────────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -40 }),
};

function StatusBadge({ status }: { status: User['status'] }) {
  const map = {
    aprovado: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pendente: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rejeitado: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  const label = { aprovado: 'Aprovado', pendente: 'Pendente', rejeitado: 'Vetado' };
  return (
    <Badge className={`${map[status]} uppercase tracking-widest px-2 py-0.5 font-black text-[9px] w-fit border`}>
      {label[status]}
    </Badge>
  );
}


function UserStatusActions({
  user,
  onAprovar,
  onRejeitar,
  label,
}: {
  user: User;
  onAprovar: (userId: string) => void;
  onRejeitar: (userId: string) => void;
  label: 'aluno' | 'professor';
}) {
  const handleAprovar = (event: any) => {
    event.stopPropagation();

    const acao = user.status === 'rejeitado' ? 'desvetar' : 'aprovar';

    const confirmed = window.confirm(
      `Deseja ${acao} ${label === 'aluno' ? 'o aluno' : 'o professor'} ${user.nome}?`,
    );

    if (!confirmed) return;

    onAprovar(user.id);
  };

  const handleRejeitar = (event: any) => {
    event.stopPropagation();

    const confirmed = window.confirm(
      `Deseja vetar ${label === 'aluno' ? 'o aluno' : 'o professor'} ${user.nome}?`,
    );

    if (!confirmed) return;

    onRejeitar(user.id);
  };

  if (user.status === 'aprovado') {
    return (
      <div className="flex gap-2 flex-wrap" onClick={(event) => event.stopPropagation()}>
        <button
          onClick={handleRejeitar}
          className="text-[10px] font-bold text-red-400 border border-red-500/30 rounded-lg px-2.5 py-1 hover:bg-red-500/10 transition-all cursor-pointer"
        >
          Vetar
        </button>
      </div>
    );
  }

  if (user.status === 'rejeitado') {
    return (
      <div className="flex gap-2 flex-wrap" onClick={(event) => event.stopPropagation()}>
        <button
          onClick={handleAprovar}
          className="text-[10px] font-bold text-emerald-400 border border-emerald-500/30 rounded-lg px-2.5 py-1 hover:bg-emerald-500/10 transition-all cursor-pointer"
        >
          Desvetar
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 flex-wrap" onClick={(event) => event.stopPropagation()}>
      <button
        onClick={handleAprovar}
        className="text-[10px] font-bold text-emerald-400 border border-emerald-500/30 rounded-lg px-2.5 py-1 hover:bg-emerald-500/10 transition-all cursor-pointer"
      >
        Aprovar
      </button>

      <button
        onClick={handleRejeitar}
        className="text-[10px] font-bold text-red-400 border border-red-500/30 rounded-lg px-2.5 py-1 hover:bg-red-500/10 transition-all cursor-pointer"
      >
        Vetar
      </button>
    </div>
  );
}

function MetricCard({ value, label, icon: Icon, accent = false }: { value: number; label: string; icon: any; accent?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative glass-panel rounded-2xl p-5 border overflow-hidden ${accent ? 'border-brand-green/30' : 'border-white/5'}`}
    >
      {accent && <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-green to-brand-neon" />}
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent ? 'bg-brand-green/15 border border-brand-green/30' : 'bg-white/5 border border-white/10'}`}>
          <Icon className={`w-4 h-4 ${accent ? 'text-brand-neon' : 'text-gray-500'}`} />
        </div>
      </div>
      <p className={`text-3xl font-bold font-display ${accent ? 'gradient-text' : 'text-white'}`}>{value}</p>
      <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold mt-1">{label}</p>
    </motion.div>
  );
}


function ActivityResponseBox({ atividade }: { atividade: ActivityType }) {
  if (!atividade.resposta) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <MessageSquare className="w-4 h-4" />
          Nenhuma resposta enviada pelo aluno.
        </div>
      </div>
    );
  }

  const resposta = atividade.resposta;

  return (
    <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
          <MessageSquare className="w-4 h-4" />
          Resposta do aluno
        </div>

        <span className="text-[11px] text-emerald-500/80">
          Enviada em {new Date(resposta.enviadoEm).toLocaleString('pt-BR')}
        </span>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold">
          Tipo: {resposta.tipo === 'concluido' ? 'Concluído' : 'Texto'}
        </p>

        <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
          {resposta.tipo === 'concluido'
            ? resposta.conteudo || 'Aluno marcou a atividade como concluída.'
            : resposta.conteudo}
        </p>
      </div>
    </div>
  );
}
// ─── Aba Operação ─────────────────────────────────────────────────────────────

function TabOperacao({ metrics, atividadesRecentes, alertas, professores, todosAlunos }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard value={metrics.professoresAtivos} label="Professores" icon={Users} accent />
        <MetricCard value={metrics.alunosAtivos} label="Alunos ativos" icon={UserCheck} accent />
        <MetricCard value={metrics.totalCursos} label="Cursos" icon={BookOpen} />
        <MetricCard value={metrics.atividadesPendentes} label="Ativ. pendentes" icon={FileText} />
        <MetricCard value={metrics.alunosPendentes} label="Aguard. aprovação" icon={AlertTriangle} />
      </div>

      {/* Split view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabela global */}
        <div className="lg:col-span-2 glass-panel rounded-3xl border border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
            <Activity className="w-4 h-4 text-brand-neon" />
            <h3 className="font-bold font-display text-sm uppercase tracking-widest text-gray-400">Atividades recentes</h3>
          </div>
          {atividadesRecentes.length === 0 ? (
            <div className="py-16 text-center text-gray-600">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Nenhuma atividade registrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Professor', 'Aluno', 'Curso', 'Status', 'Data'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] uppercase tracking-widest text-gray-600 font-bold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {atividadesRecentes.map((a: ActivityType) => {
                    const prof = professores.find((p: User) => p.id === a.professorId);
                    const aluno = todosAlunos.find((u: User) => u.id === a.alunoId);
                    return (
                      <tr key={a.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3 text-sm text-gray-300 font-medium">{prof?.nome ?? '—'}</td>
                        <td className="px-5 py-3 text-sm text-gray-400">{aluno?.nome ?? '—'}</td>
                        <td className="px-5 py-3 text-sm text-gray-500 capitalize">{a.curso === 'ingles' ? 'Inglês' : 'ENEM'}</td>
                        <td className="px-5 py-3"><CorrectionStatusBadge status={a.correctionStatus} /></td>
                        <td className="px-5 py-3 text-[11px] text-gray-600">{new Date(a.createdAt).toLocaleDateString('pt-BR')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Alertas */}
        <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-brand-neon" />
              <h3 className="font-bold font-display text-sm uppercase tracking-widest text-gray-400">Alertas</h3>
            </div>
            {alertas.length > 0 && (
              <span className="w-5 h-5 bg-amber-500 text-black text-[10px] font-black rounded-full flex items-center justify-center">{alertas.length}</span>
            )}
          </div>
          <div className="divide-y divide-white/[0.04]">
            {alertas.length === 0 ? (
              <div className="py-12 text-center text-gray-600">
                <CheckCircle className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p className="text-xs">Tudo em ordem</p>
              </div>
            ) : alertas.map((a: any) => (
              <div key={a.id} className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${a.tipo === 'warning' ? 'bg-amber-400' : a.tipo === 'danger' ? 'bg-red-400' : 'bg-brand-neon'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 leading-snug">{a.texto}</p>
                    {a.sub && <p className="text-[11px] text-gray-600 mt-0.5">{a.sub}</p>}
                  </div>
                </div>
                <button onClick={a.onClick} className="text-[11px] font-bold text-brand-neon border border-brand-green/30 rounded-lg px-3 py-1.5 hover:bg-brand-green/10 transition-all cursor-pointer">
                  {a.acao}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Aba Professores — Nível 1 ───────────────────────────────────────────────

function ProfessorList({
  professores,
  todosAlunos,
  todasAtividades,
  onSelect,
  onAprovar,
  onRejeitar,
}: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <p className="text-gray-500 text-sm">{professores.length} professor{professores.length !== 1 ? 'es' : ''} cadastrado{professores.length !== 1 ? 's' : ''}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {professores.length === 0 ? (
          <div className="col-span-2 py-20 text-center text-gray-600">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Nenhum professor cadastrado</p>
          </div>
        ) : professores.map((prof: User) => {
          const alunosProf = todosAlunos.filter((a: User) => a.professorId === prof.id);
          const atvsProf = todasAtividades.filter((a: ActivityType) => a.professorId === prof.id);
          const cursos = [...new Set(alunosProf.map((a: User) => a.cursoAdquirido).filter(Boolean))];

          return (
            <motion.div
              key={prof.id}
              whileHover={{ y: -4, scale: 1.01 }}
              onClick={() => onSelect(prof)}
              className="glass-panel rounded-3xl p-6 border border-white/5 hover:border-brand-green/30 transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-4 mb-5">
                <Avatar nome={prof.nome} size="lg" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg font-display group-hover:text-brand-neon transition-colors truncate">{prof.nome}</h3>
                                    <p className="text-gray-500 text-sm truncate">{prof.email}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <StatusBadge status={prof.status} />
                    {cursos.map((c: any) => (
                      <span key={c} className="text-[10px] bg-brand-green/10 text-brand-green border border-brand-green/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                        {c === 'ingles' ? 'Inglês' : 'ENEM'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { n: alunosProf.length, l: 'Alunos' },
                  { n: atvsProf.length, l: 'Atividades' },
                  { n: cursos.length, l: 'Cursos' },
                ].map(({ n, l }) => (
                  <div key={l} className="bg-white/[0.03] rounded-xl p-3 border border-white/5 text-center">
                    <p className="text-xl font-bold font-display text-white">{n}</p>
                    <p className="text-[10px] text-gray-600 uppercase tracking-wider">{l}</p>
                  </div>
                ))}
              </div>

                            <div className="space-y-3 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-[11px] text-brand-green/60 bg-brand-green/5 border border-brand-green/10 px-2.5 py-1 rounded-lg">
                    {prof.codigo ?? '—'}
                  </div>
                  <span className="text-brand-neon font-bold text-sm group-hover:translate-x-1 transition-transform inline-block">Ver detalhes →</span>
                </div>

                <UserStatusActions
                  user={prof}
                  label="professor"
                  onAprovar={onAprovar}
                  onRejeitar={onRejeitar}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Aba Professores — Nível 2 ───────────────────────────────────────────────

function ProfessorDetail({ professor, alunos, atividades, onBack, onSelectAluno, onAprovar, onRejeitar }: any) {
  const cursosSet = [...new Set(alunos.map((a: User) => a.cursoAdquirido).filter(Boolean))];

  return (
    <motion.div
      custom={1}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Breadcrumb + voltar */}
      <div className="flex items-center gap-3">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer text-sm">
          <ChevronLeft className="w-4 h-4" /> Professores
        </motion.button>
        <span className="text-gray-700">/</span>
        <span className="text-white font-medium text-sm">{professor.nome}</span>
      </div>

      {/* Hero card */}
      <div className="glass-panel rounded-[2rem] border border-white/10 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-brand-green via-brand-neon to-brand-lime" />
        <div className="p-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <Avatar nome={professor.nome} size="lg" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold font-display">{professor.nome}</h2>
                                <StatusBadge status={professor.status} />
              </div>
              <p className="text-gray-500 mb-5">{professor.email}</p>

              {/* Código */}
              <div className="inline-flex items-center gap-3 bg-brand-green/5 border border-brand-green/15 rounded-xl px-4 py-2.5 mb-6">
                <Shield className="w-4 h-4 text-brand-green/60" />
                <span className="text-xs text-gray-500 uppercase tracking-widest">Código</span>
                <code className="font-mono text-sm text-brand-neon font-bold">{professor.codigo ?? '—'}</code>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { n: alunos.length, l: 'Total alunos', icon: Users },
                  { n: alunos.filter((a: User) => a.status === 'aprovado').length, l: 'Aprovados', icon: UserCheck },
                  { n: alunos.filter((a: User) => a.status === 'pendente').length, l: 'Pendentes', icon: Clock },
                  { n: atividades.length, l: 'Atividades', icon: FileText },
                ].map(({ n, l, icon: Icon }) => (
                  <div key={l} className="bg-white/[0.03] rounded-2xl p-4 border border-white/5">
                    <Icon className="w-4 h-4 text-gray-600 mb-2" />
                    <p className="text-2xl font-bold font-display">{n}</p>
                    <p className="text-[10px] text-gray-600 uppercase tracking-wider mt-1">{l}</p>
                  </div>
                ))}
              </div>

              {/* Cursos */}
              <div className="flex gap-2 mt-5 flex-wrap">
                {cursosSet.map((c: any) => (
                  <span key={c} className="text-[11px] bg-brand-green/10 text-brand-green border border-brand-green/20 px-3 py-1 rounded-lg font-bold uppercase tracking-wider">
                    {c === 'ingles' ? 'Inglês' : 'ENEM'}
                  </span>
                ))}
              </div>
                            <div className="mt-5">
                <UserStatusActions
                  user={professor}
                  label="professor"
                  onAprovar={onAprovar}
                  onRejeitar={onRejeitar}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de alunos */}
      <div className="glass-panel rounded-[2rem] border border-white/5 overflow-hidden">
        <div className="px-8 py-5 border-b border-white/5 flex items-center gap-3">
          <Users className="w-4 h-4 text-brand-neon" />
          <h3 className="font-bold font-display uppercase tracking-widest text-sm text-gray-400">Alunos vinculados</h3>
          <span className="text-[11px] text-gray-600">({alunos.length})</span>
        </div>
        {alunos.length === 0 ? (
          <div className="py-16 text-center text-gray-600">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Nenhum aluno vinculado</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {alunos.map((aluno: User) => (
              <motion.div
                key={aluno.id}
                whileHover={{ x: 4 }}
                onClick={() => onSelectAluno(aluno)}
                className="flex items-center gap-5 px-8 py-4 hover:bg-white/[0.02] transition-all cursor-pointer group"
              >
                <Avatar nome={aluno.nome} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm group-hover:text-brand-neon transition-colors">{aluno.nome}</p>
                  <p className="text-[11px] text-gray-600">{aluno.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-gray-600 capitalize">
                    {aluno.cursoAdquirido === 'ingles' ? 'Inglês' : aluno.cursoAdquirido === 'enem' ? 'ENEM' : '—'}
                  </span>
                  <StatusBadge status={aluno.status} />
                                    <UserStatusActions
                    user={aluno}
                    label="aluno"
                    onAprovar={onAprovar}
                    onRejeitar={onRejeitar}
                  />
                </div>
                <ChevronLeft className="w-4 h-4 text-gray-600 group-hover:text-brand-neon rotate-180 transition-all" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Aba Professores — Nível 3 ───────────────────────────────────────────────

function AlunoDetail({
  aluno,
  professor,
  atividades,
  onBack,
  onAprovar,
  onRejeitar,
  onOpenAttachment,
}: any) {
  return (
    <motion.div
      custom={1}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 flex-wrap">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer text-sm">
          <ChevronLeft className="w-4 h-4" /> {professor?.nome ?? 'Professor'}
        </motion.button>
        <span className="text-gray-700">/</span>
        <span className="text-white font-medium text-sm">{aluno.nome}</span>
      </div>

      {/* Hero aluno */}
      <div className="glass-panel rounded-[2rem] border border-white/10 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-brand-green via-brand-neon to-brand-lime" />
        <div className="p-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <Avatar nome={aluno.nome} size="lg" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold font-display">{aluno.nome}</h2>
                <StatusBadge status={aluno.status} />
              </div>
              <p className="text-gray-500 mb-2">{aluno.email}</p>
              <p className="text-[11px] text-gray-600 mb-5">
                Professor: <span className="text-gray-400 font-medium">{professor?.nome ?? '—'}</span>
                {' · '}
                Curso: <span className="text-gray-400 font-medium">{aluno.cursoAdquirido === 'ingles' ? 'Inglês' : aluno.cursoAdquirido === 'enem' ? 'ENEM' : '—'}</span>
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { n: atividades.length, l: 'Total ativ.' },
                  { n: atividades.filter((a: ActivityType) => a.correctionStatus === 'correta').length, l: 'Corretas' },
                  { n: atividades.filter((a: ActivityType) => a.correctionStatus === 'pendente').length, l: 'Pendentes' },
                  { n: atividades.filter((a: ActivityType) => a.status === 'concluida').length, l: 'Entregues' },
                ].map(({ n, l }) => (
                  <div key={l} className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 text-center">
                    <p className="text-2xl font-bold font-display">{n}</p>
                    <p className="text-[10px] text-gray-600 uppercase tracking-wider mt-1">{l}</p>
                  </div>
                ))}
              </div>

                           <UserStatusActions
                user={aluno}
                label="aluno"
                onAprovar={onAprovar}
                onRejeitar={onRejeitar}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Atividades do aluno */}
      <div className="glass-panel rounded-[2rem] border border-white/5 overflow-hidden">
        <div className="px-8 py-5 border-b border-white/5 flex items-center gap-3">
          <FileText className="w-4 h-4 text-brand-neon" />
          <h3 className="font-bold font-display uppercase tracking-widest text-sm text-gray-400">Atividades</h3>
          <span className="text-[11px] text-gray-600">({atividades.length})</span>
        </div>
        {atividades.length === 0 ? (
          <div className="py-16 text-center text-gray-600">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Nenhuma atividade atribuída</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
                        {atividades.map((atv: ActivityType) => (
              <div key={atv.id} className="px-8 py-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base mb-1">{atv.titulo}</p>

                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
                        <Clock className="w-3 h-3" />
                        Criada em {new Date(atv.createdAt).toLocaleDateString('pt-BR')}
                      </div>

                      {atv.resposta && (
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-500">
                          <CheckCircle className="w-3 h-3" />
                          Entregue em {new Date(atv.resposta.enviadoEm).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>
                  </div>

                  <CorrectionStatusBadge status={atv.correctionStatus} />
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                  <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold mb-2">
                    Descrição da atividade
                  </p>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {atv.descricao}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="flex items-center gap-2 text-gray-400 font-bold text-sm mb-3">
                    <Paperclip className="w-4 h-4 text-brand-neon" />
                    Documentos da atividade
                  </div>

                  {atv.anexos.length === 0 ? (
                    <p className="text-sm text-gray-600">
                      Nenhum documento anexado pelo professor.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {atv.anexos.map((anexo) => (
                        <div
                          key={anexo.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/20 px-4 py-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm text-gray-300 font-medium truncate">
                              {anexo.nome}
                            </p>
                            <p className="text-[10px] text-gray-600 uppercase tracking-widest">
                              {anexo.tipo}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onOpenAttachment(atv.id, anexo.id, 'view')}
                              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-neon border border-brand-green/30 rounded-lg px-3 py-1.5 hover:bg-brand-green/10 transition-all cursor-pointer"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Abrir
                            </button>

                            {anexo.tipo !== 'link' && (
                              <button
                                onClick={() => onOpenAttachment(atv.id, anexo.id, 'download')}
                                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-300 border border-white/10 rounded-lg px-3 py-1.5 hover:bg-white/5 transition-all cursor-pointer"
                              >
                                <Download className="w-3 h-3" />
                                Baixar
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <ActivityResponseBox atividade={atv} />

                {atv.correctionFeedback && (
                  <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] p-4">
                    <p className="text-[11px] text-amber-400 uppercase tracking-widest font-bold mb-2">
                      Feedback da correção
                    </p>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">
                      {atv.correctionFeedback}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Aba Alunos ───────────────────────────────────────────────────────────────

function TabAlunos({ alunos, professores, alunoFiltroStatus, setAlunoFiltroStatus, alunoSearch, setAlunoSearch, onAprovar, onRejeitar }: any) {
  const filtros: Array<{ value: string; label: string }> = [
    { value: 'todos', label: 'Todos' },
    { value: 'aprovado', label: 'Aprovados' },
    { value: 'pendente', label: 'Pendentes' },
    { value: 'rejeitado', label: 'Rejeitados' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2 flex-wrap">
          {filtros.map(f => (
            <button key={f.value} onClick={() => setAlunoFiltroStatus(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${alunoFiltroStatus === f.value ? 'bg-brand-green text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input value={alunoSearch} onChange={e => setAlunoSearch(e.target.value)}
            placeholder="Buscar aluno..." className="pl-11 h-10 bg-white/5 border-white/10 rounded-xl focus:border-brand-green/50 text-sm" />
        </div>
      </div>

      {/* Lista */}
      <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <p className="text-[11px] text-gray-600 uppercase tracking-widest font-bold">{alunos.length} aluno{alunos.length !== 1 ? 's' : ''}</p>
        </div>
        {alunos.length === 0 ? (
          <div className="py-16 text-center text-gray-600">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Nenhum aluno encontrado</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {alunos.map((aluno: User) => {
              const prof = professores.find((p: User) => p.id === aluno.professorId);
              return (
                <div key={aluno.id} className="flex items-center gap-5 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                  <Avatar nome={aluno.nome} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{aluno.nome}</p>
                    <p className="text-[11px] text-gray-600 truncate">{aluno.email}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-[11px] text-gray-500">
                    <BookOpen className="w-3 h-3" />
                    {aluno.cursoAdquirido === 'ingles' ? 'Inglês' : aluno.cursoAdquirido === 'enem' ? 'ENEM' : '—'}
                  </div>
                  <div className="hidden md:block text-[11px] text-gray-600">
                    {prof?.nome ?? <span className="text-gray-700">Sem professor</span>}
                  </div>
                  <StatusBadge status={aluno.status} />
                                  <UserStatusActions
                    user={aluno}
                    label="aluno"
                    onAprovar={onAprovar}
                    onRejeitar={onRejeitar}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}


function TabGestores({
  gestores,
  form,
  setForm,
  isCreating,
  onCreateManager,
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="glass-panel rounded-[2rem] border border-white/5 overflow-hidden">
        <div className="px-8 py-5 border-b border-white/5 flex items-center gap-3">
          <UserPlus className="w-4 h-4 text-brand-neon" />
          <h3 className="font-bold font-display uppercase tracking-widest text-sm text-gray-400">
            Cadastrar novo gestor
          </h3>
        </div>

        <form
          onSubmit={onCreateManager}
          className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="space-y-2">
            <label className="text-[11px] text-gray-500 uppercase tracking-widest font-bold">
              Nome
            </label>
            <Input
              value={form.nome}
              onChange={(event) =>
                setForm((current: any) => ({
                  ...current,
                  nome: event.target.value,
                }))
              }
              placeholder="Nome do gestor"
              className="h-11 bg-white/5 border-white/10 rounded-xl focus:border-brand-green/50 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] text-gray-500 uppercase tracking-widest font-bold">
              Email
            </label>
            <Input
              value={form.email}
              onChange={(event) =>
                setForm((current: any) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              placeholder="email@exemplo.com"
              className="h-11 bg-white/5 border-white/10 rounded-xl focus:border-brand-green/50 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] text-gray-500 uppercase tracking-widest font-bold">
              Documento
            </label>
            <Input
              value={form.documento}
              onChange={(event) =>
                setForm((current: any) => ({
                  ...current,
                  documento: event.target.value,
                }))
              }
              placeholder="CPF ou CNPJ"
              className="h-11 bg-white/5 border-white/10 rounded-xl focus:border-brand-green/50 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] text-gray-500 uppercase tracking-widest font-bold">
              Senha temporária
            </label>
            <Input
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((current: any) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              placeholder="Mínimo 8 caracteres"
              className="h-11 bg-white/5 border-white/10 rounded-xl focus:border-brand-green/50 text-sm"
            />
          </div>

          <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
            <p className="text-xs text-gray-500 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-brand-green" />
              O novo gestor já nasce aprovado e poderá acessar o painel administrativo.
            </p>

            <Button
              type="submit"
              disabled={isCreating}
              className="bg-brand-green hover:bg-brand-neon text-black rounded-xl h-11 px-6 font-black transition-all cursor-pointer disabled:opacity-60"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {isCreating ? 'Cadastrando...' : 'Cadastrar gestor'}
            </Button>
          </div>
        </form>
      </div>

      <div className="glass-panel rounded-[2rem] border border-white/5 overflow-hidden">
        <div className="px-8 py-5 border-b border-white/5 flex items-center gap-3">
          <Shield className="w-4 h-4 text-brand-neon" />
          <h3 className="font-bold font-display uppercase tracking-widest text-sm text-gray-400">
            Gestores cadastrados
          </h3>
          <span className="text-[11px] text-gray-600">
            ({gestores.length})
          </span>
        </div>

        {gestores.length === 0 ? (
          <div className="py-16 text-center text-gray-600">
            <Shield className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Nenhum gestor encontrado</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {gestores.map((gestor: User) => (
              <div
                key={gestor.id}
                className="flex items-center gap-5 px-8 py-4 hover:bg-white/[0.02] transition-colors"
              >
                <Avatar nome={gestor.nome} size="sm" />

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{gestor.nome}</p>
                  <p className="text-[11px] text-gray-600 truncate">
                    {gestor.email}
                  </p>
                </div>

                <StatusBadge status={gestor.status} />

                <span className="text-[10px] bg-brand-green/10 text-brand-green border border-brand-green/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  {gestor.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}


// ─── Aba Notificações ─────────────────────────────────────────────────────────

function TabNotificacoes({ pendentes, resolvidas }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {pendentes.length > 0 && (
        <div className="glass-panel rounded-[2rem] border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-brand-green/20 bg-brand-green/5">
            <h3 className="font-bold text-brand-neon flex items-center gap-3 uppercase tracking-widest text-sm">
              <AlertTriangle className="w-4 h-4" /> Pendentes ({pendentes.length})
            </h3>
          </div>
          <div className="divide-y divide-white/5">
            {pendentes.map((n: any) => (
              <div key={n.id} className="px-8 py-5">
                <p className="font-bold text-sm mb-1">{n.title}</p>
                <p className="text-gray-500 text-sm">{n.message}</p>
                <p className="text-[11px] text-gray-700 mt-2">{new Date(n.createdAt).toLocaleString('pt-BR')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="glass-panel rounded-[2rem] border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
          <h3 className="font-bold text-gray-400 flex items-center gap-3 uppercase tracking-widest text-sm">
            <CheckCircle className="w-4 h-4" /> Histórico
          </h3>
        </div>
        {resolvidas.length === 0 ? (
          <div className="py-16 text-center text-gray-600"><p className="text-sm">Nenhuma notificação resolvida</p></div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {resolvidas.map((n: any) => (
              <div key={n.id} className="px-8 py-5">
                <p className="font-bold text-sm mb-1 text-gray-400">{n.title}</p>
                <p className="text-gray-600 text-sm">{n.message}</p>
                <p className="text-[11px] text-gray-700 mt-2">{new Date(n.createdAt).toLocaleString('pt-BR')}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AdmDashboard({ onLogout }: AdmDashboardProps) {
  const {
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
    getProfessorDoAluno,
    recarregarDados,
  } = useAdmDashboard();

      const [showSettings, setShowSettings] = useState(false);
  const [isCreatingManager, setIsCreatingManager] = useState(false);
  const [managerForm, setManagerForm] = useState({
    nome: '',
    email: '',
    documento: '',
    password: '',
  });

  const handleCreateManager = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!currentUser) {
      alert('Gestor atual não encontrado.');
      return;
    }

    if (
      !managerForm.nome.trim() ||
      !managerForm.email.trim() ||
      !managerForm.documento.trim() ||
      !managerForm.password
    ) {
      alert('Preencha nome, email, documento e senha.');
      return;
    }

    if (managerForm.password.length < 8) {
      alert('A senha precisa ter pelo menos 8 caracteres.');
      return;
    }

    setIsCreatingManager(true);

    try {
      await api.createAdminManager({
        requesterId: currentUser.id,
        nome: managerForm.nome.trim(),
        email: managerForm.email.trim(),
        documento: managerForm.documento.trim(),
        password: managerForm.password,
      });

      setManagerForm({
        nome: '',
        email: '',
        documento: '',
        password: '',
      });

      await recarregarDados();

      alert('Gestor cadastrado com sucesso.');
    } catch (error) {
      console.error('Erro ao cadastrar gestor:', error);

      alert(
        error instanceof Error
          ? error.message
          : 'Erro ao cadastrar gestor.',
      );
    } finally {
      setIsCreatingManager(false);
    }
  };

  const handleOpenAttachment = async (
    activityId: string,
    attachmentId: string,
    mode: 'view' | 'download',
  ) => {
    if (!currentUser) {
      alert('Usuário não encontrado.');
      return;
    }

    try {
      const access = await api.getActivityAttachmentAccess(
        activityId,
        attachmentId,
        currentUser.id,
      );

      const targetUrl =
        mode === 'download'
          ? access.downloadUrl ?? access.viewUrl
          : access.viewUrl;

      window.open(
        targetUrl,
        '_blank',
        'noopener,noreferrer',
      );
    } catch (error) {
      console.error(
        'Erro ao abrir anexo pelo gestor:',
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : 'Erro ao abrir anexo.',
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-brand-neon selection:text-black font-sans relative overflow-hidden cursor-default">
      <style>{`
        .noise-overlay, .grid-pattern { pointer-events: none !important; cursor: default !important; }
        * { cursor: inherit; }
        a, button, [role="button"] { cursor: pointer; }
        input, textarea { cursor: text; }
      `}</style>
      <div className="noise-overlay" />
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] bg-brand-green/10 opacity-50" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] bg-brand-neon/5 opacity-50" />
        <div className="absolute inset-0 grid-pattern opacity-20" />
      </div>

      {/* Nav */}
      <nav className="glass-panel sticky top-0 z-40 border-b border-white/5 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-brand-green/30 bg-brand-green/10">
                <GraduationCap className="w-7 h-7 text-brand-neon" />
              </div>
              <div>
                <img src={logoPhd} alt="PHD Escola Virtual" className="h-10 w-auto object-contain" />
                <p className="text-[10px] uppercase tracking-[0.2em] text-brand-green font-bold flex items-center gap-1.5">
                  <Shield className="w-3 h-3" /> Painel Admin
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-2.5 text-gray-400 hover:text-brand-neon transition-all rounded-xl hover:bg-white/5 cursor-pointer">
                <Bell className="w-6 h-6" />
                {allPendingNotifs.length > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-5 h-5 bg-brand-neon text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#050505]">
                    {allPendingNotifs.length}
                  </motion.span>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setShowSettings(true)}
                className="p-2.5 rounded-xl bg-brand-green/10 border border-brand-green/30 text-brand-neon hover:bg-brand-green/20 transition-all cursor-pointer"
                title="Configurações"
              >
                <Settings className="w-5 h-5" />
              </motion.button>
              <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold">{currentUser?.nome}</p>
                  <p className="text-[10px] text-brand-green uppercase tracking-wider font-bold">Admin</p>
                </div>
                <Avatar nome={currentUser?.nome ?? 'A'} size="md" />
              </div>
              <Button variant="ghost" onClick={onLogout}
                className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl px-3 h-10 transition-all cursor-pointer">
                <LogOut className="w-5 h-5 sm:mr-2" /> <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Notif dropdown */}
      <AnimatePresence>
        {showNotifDropdown && (
          <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-4 top-24 w-96 glass-panel rounded-3xl shadow-2xl z-50 border border-white/10 max-h-[70vh] overflow-y-auto">
            <div className="p-5 border-b border-white/5 bg-gradient-to-r from-brand-green/20 to-transparent">
              <h3 className="font-bold font-display text-white flex items-center gap-2"><Bell className="w-4 h-4 text-brand-neon" /> Notificações</h3>
            </div>
            {allPendingNotifs.length === 0 && allResolvedNotifs.length === 0 ? (
              <div className="p-12 text-center text-gray-500"><Bell className="w-12 h-12 mx-auto mb-4 opacity-20" /><p className="text-sm">Nenhuma notificação</p></div>
            ) : (
              <div className="p-3 space-y-2">
                {allPendingNotifs.map((n: any) => (
                  <div key={n.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                    <p className="text-sm font-bold mb-1">{n.title}</p>
                    <p className="text-xs text-gray-500">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <Tabs value={activeTab} onValueChange={v => { setActiveTab(v as import('./useAdmDashboard').AdmTab); }} className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-4xl sm:text-5xl font-bold font-display mb-3 tracking-tight">
                Olá, <span className="gradient-text">{currentUser?.nome ?? 'Admin'}</span>
              </h1>
              <p className="text-gray-400 text-lg">Visão global da plataforma em tempo real.</p>
            </motion.div>
            <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-14">
              <TabsTrigger value="operacao" className="flex items-center gap-2 rounded-xl px-5 data-[state=active]:bg-brand-green data-[state=active]:text-black font-bold transition-all cursor-pointer">
                <BarChart3 className="w-4 h-4" /><span className="hidden sm:inline">Operação</span>
              </TabsTrigger>
              <TabsTrigger value="professores" className="flex items-center gap-2 rounded-xl px-5 data-[state=active]:bg-brand-green data-[state=active]:text-black font-bold transition-all cursor-pointer">
                <Users className="w-4 h-4" /><span className="hidden sm:inline">Professores</span>
              </TabsTrigger>
              <TabsTrigger value="alunos" className="flex items-center gap-2 rounded-xl px-5 data-[state=active]:bg-brand-green data-[state=active]:text-black font-bold transition-all cursor-pointer relative">
                <TrendingUp className="w-4 h-4" /><span className="hidden sm:inline">Alunos</span>
                {metrics.alunosPendentes > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#050505]">
                    {metrics.alunosPendentes}
                  </span>
                )}
              </TabsTrigger>
                            <TabsTrigger value="gestores" className="flex items-center gap-2 rounded-xl px-5 data-[state=active]:bg-brand-green data-[state=active]:text-black font-bold transition-all cursor-pointer">
                <Shield className="w-4 h-4" /><span className="hidden sm:inline">Gestores</span>
              </TabsTrigger>
              <TabsTrigger value="notificacoes" className="flex items-center gap-2 rounded-xl px-5 data-[state=active]:bg-brand-green data-[state=active]:text-black font-bold transition-all cursor-pointer">
                <Bell className="w-4 h-4" /><span className="hidden sm:inline">Notificações</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Operação */}
          <TabsContent value="operacao">
            <TabOperacao
              metrics={metrics}
              atividadesRecentes={atividadesRecentes}
              alertas={alertas}
              professores={professores}
              todosAlunos={todosAlunos}
            />
          </TabsContent>

          {/* Professores */}
          <TabsContent value="professores">
            <AnimatePresence mode="wait">
              {profView === 'list' && (
                <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                   <ProfessorList
                    professores={professores}
                    todosAlunos={todosAlunos}
                    todasAtividades={atividadesRecentes}
                    onSelect={handleSelectProfessor}
                    onAprovar={handleAprovarAluno}
                    onRejeitar={handleRejeitarAluno}
                  />
                </motion.div>
              )}
              {profView === 'detail' && selectedProfessor && (
                <ProfessorDetail
                  key={selectedProfessor.id}
                  professor={selectedProfessor}
                  alunos={alunosDoProfessor}
                  atividades={atividadesDoProfessor}
                  onBack={handleBackToList}
                  onSelectAluno={handleSelectAluno}
                  onAprovar={handleAprovarAluno}
                  onRejeitar={handleRejeitarAluno}
                />
              )}
              {profView === 'aluno-detail' && selectedAluno && (
                                <AlunoDetail
                  key={selectedAluno.id}
                  aluno={selectedAluno}
                  professor={getProfessorDoAluno(selectedAluno)}
                  atividades={atividadesDoAluno}
                  onBack={handleBackToDetail}
                  onAprovar={handleAprovarAluno}
                  onRejeitar={handleRejeitarAluno}
                  onOpenAttachment={handleOpenAttachment}
                />
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Alunos */}
          <TabsContent value="alunos">
            <TabAlunos
              alunos={alunosFiltrados}
              professores={professores}
              alunoFiltroStatus={alunoFiltroStatus}
              setAlunoFiltroStatus={setAlunoFiltroStatus}
              alunoSearch={alunoSearch}
              setAlunoSearch={setAlunoSearch}
              onAprovar={handleAprovarAluno}
              onRejeitar={handleRejeitarAluno}
            />
          </TabsContent>


          {/* Gestores */}
          <TabsContent value="gestores">
            <TabGestores
              gestores={gestores}
              form={managerForm}
              setForm={setManagerForm}
              isCreating={isCreatingManager}
              onCreateManager={handleCreateManager}
            />
          </TabsContent>

          {/* Notificações */}
          <TabsContent value="notificacoes">
            <TabNotificacoes pendentes={allPendingNotifs} resolvidas={allResolvedNotifs} />
          </TabsContent>
        </Tabs>
      </main>
    <SettingsModal
  isOpen={showSettings}
  onClose={() => setShowSettings(false)}
  onLogout={onLogout}
  currentUser={currentUser}
/>
    </div>
  );
}