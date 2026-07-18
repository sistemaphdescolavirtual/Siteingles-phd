import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Bell, LogOut, Users, Plus, FileText, MessageSquare, AlertCircle, CheckCircle, BookOpen, Clock, ChevronDown, ChevronRight, Search, UserCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/shared/Avatar';
import { CorrectionStatusBadge } from '@/components/shared/CorrectionStatusBadge';
import { ChatPanel } from '@/components/shared/ChatPanel';
import { NotificationItem } from './components/NotificationItem';
import { ResolvedNotificationItem } from './components/ResolvedNotificationItem';
import { ProfessorCodeCard } from './components/ProfessorCodeCard';
import { CreateActivityModal } from './components/CreateActivityModal';
import { ActivityDetailModal } from './components/ActivityDetailModal';
import { useProfessorDashboard } from './useProfessorDashboard';
import type { User } from '@/types';
import logoPhd from '@/assets/logo_phd.png';


interface ProfessorDashboardProps { onLogout: () => void; }

export default function ProfessorDashboard({ onLogout }: ProfessorDashboardProps) {
  const {
    activeTab, setActiveTab,
    showNotifications, setShowNotifications,
    selectedCurso, setSelectedCurso,
    selectedAluno, setSelectedAluno,
    showCreateActivity, setShowCreateActivity,
    showActivityDetail, setShowActivityDetail,
    selectedActivity,
    selectedChatAluno,
    searchTerm, setSearchTerm,
    currentUser,
    pendingNotifications, resolvedNotifications,
    atividades, alunosPorCurso, alunosVetados, filteredAlunos, atividadesPorCurso,
    getAlunoById,
    handleAprovar, handleRejeitar,
    handleActivityClick,
    handleCorrigir,
    handleChatClick,
    handleNotificationClick,
recarregarDados,
  } = useProfessorDashboard();

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
                <p className="text-[10px] uppercase tracking-[0.2em] text-brand-green font-bold">Painel do Instrutor</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowNotifications(!showNotifications)} className="relative p-2.5 text-gray-400 hover:text-brand-neon transition-all rounded-xl hover:bg-white/5 cursor-pointer">
                <Bell className="w-6 h-6" />
                {pendingNotifications.length > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1 right-1 w-5 h-5 bg-brand-neon text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#050505]">
                    {pendingNotifications.length}
                  </motion.span>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('configuracoes')}
                className="p-2.5 rounded-xl bg-brand-green/10 border border-brand-green/30 text-brand-neon hover:bg-brand-green/20 transition-all cursor-pointer"
                title="Configurações"
              >
                <Settings className="w-5 h-5" />
              </motion.button>
              <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold">{currentUser?.nome}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Online</p>
                </div>
                <Avatar nome={currentUser?.nome || 'P'} size="md" />
              </div>
              <Button variant="ghost" onClick={onLogout} className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl px-3 h-10 transition-all cursor-pointer">
                <LogOut className="w-5 h-5 sm:mr-2" /> <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} className="absolute right-4 top-24 w-96 glass-panel rounded-3xl shadow-2xl z-50 border border-white/10 max-h-[80vh] overflow-hidden">
            <div className="p-5 border-b border-white/5 bg-gradient-to-r from-brand-green/20 to-transparent">
              <h3 className="font-bold font-display text-white flex items-center gap-2"><Bell className="w-4 h-4 text-brand-neon" /> Notificações</h3>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {pendingNotifications.length > 0 && (
                <div className="p-2">
                  <p className="px-3 py-2 text-[10px] font-black text-brand-neon uppercase tracking-widest">Pendentes</p>
                 {pendingNotifications.map((n: any) => (
  <NotificationItem
    key={n.id}
    notification={n}
    onAprovar={(id: string) => handleAprovar(id)}
    onRejeitar={(id: string) => handleRejeitar(id)}
    onNotificationClick={handleNotificationClick}
  />
))}
                </div>
              )}
              {resolvedNotifications.length > 0 && (
                <div className="p-2 border-t border-white/5">
                  <p className="px-3 py-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">Resolvidas</p>
                  {resolvedNotifications.slice(0, 5).map((n: any) => <ResolvedNotificationItem key={n.id} notification={n} />)}
                </div>
              )}
              {pendingNotifications.length === 0 && resolvedNotifications.length === 0 && (
                <div className="p-12 text-center text-gray-500"><Bell className="w-12 h-12 mx-auto mb-4 opacity-20" /><p className="text-sm">Nenhuma notificação</p></div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-4xl sm:text-5xl font-bold font-display mb-3 tracking-tight">Olá, <span className="gradient-text">{currentUser?.nome || 'Professor'}</span></h1>
              <p className="text-gray-400 text-lg">Seu dashboard de ensino está pronto.</p>
            </motion.div>
            <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-14">
              <TabsTrigger value="turmas" className="flex items-center gap-2 rounded-xl px-6 data-[state=active]:bg-brand-green data-[state=active]:text-black font-bold transition-all cursor-pointer"><Users className="w-4 h-4" /><span className="hidden sm:inline">Turmas</span></TabsTrigger>
              <TabsTrigger value="atividades" className="flex items-center gap-2 rounded-xl px-6 data-[state=active]:bg-brand-green data-[state=active]:text-black font-bold transition-all relative cursor-pointer"><FileText className="w-4 h-4" /><span className="hidden sm:inline">Atividades</span>{atividades.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-neon text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#050505]">{atividades.length}</span>}</TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2 rounded-xl px-6 data-[state=active]:bg-brand-green data-[state=active]:text-black font-bold transition-all cursor-pointer"><MessageSquare className="w-4 h-4" /><span className="hidden sm:inline">Chat</span></TabsTrigger>
              <TabsTrigger value="notificacoes" className="flex items-center gap-2 rounded-xl px-6 data-[state=active]:bg-brand-green data-[state=active]:text-black font-bold transition-all cursor-pointer"><Bell className="w-4 h-4" /><span className="hidden sm:inline">Notificações</span></TabsTrigger>
              <TabsTrigger value="configuracoes" className="flex items-center gap-2 rounded-xl px-5 data-[state=active]:bg-brand-green data-[state=active]:text-black font-bold transition-all cursor-pointer"><Settings className="w-4 h-4" /><span className="hidden sm:inline">Config.</span></TabsTrigger>
            </TabsList>
          </div>

          {/* TURMAS */}
          <TabsContent value="turmas" className="space-y-8">
            {selectedCurso ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-4">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setSelectedCurso(null); setSelectedAluno(null); setSearchTerm(''); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer text-gray-400 hover:text-white">
                      <ChevronDown className="w-4 h-4 rotate-90" /> Voltar
                    </motion.button>
                    <div>
                      <h2 className="text-3xl font-bold font-display">{selectedCurso}</h2>
                      <p className="text-gray-500 text-sm">{alunosPorCurso[selectedCurso]?.length || 0} alunos inscritos</p>
                    </div>
                  </div>
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar aluno..." className="pl-12 h-12 bg-white/5 border-white/10 rounded-2xl focus:border-brand-green/50 cursor-text" />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 space-y-6 max-h-[600px] overflow-y-auto pr-2">
                    {filteredAlunos.length === 0 ? (
                      <div className="py-20 text-center opacity-20"><Users className="w-12 h-12 mx-auto mb-4" /><p className="font-bold uppercase tracking-widest text-xs">Nenhum aluno encontrado</p></div>
                    ) : filteredAlunos.map((aluno: User) => (
                      <motion.div key={aluno.id} whileHover={{ x: 4 }} onClick={() => setSelectedAluno(aluno)} className={`p-4 rounded-2xl border transition-all cursor-pointer group ${selectedAluno?.id === aluno.id ? 'bg-brand-green/10 border-brand-green/30' : 'bg-white/[0.02] border-white/5 hover:bg-white/5'}`}>
                        <div className="flex items-center gap-4">
                          <Avatar nome={aluno.nome} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className={`font-bold text-sm truncate transition-colors ${selectedAluno?.id === aluno.id ? 'text-brand-neon' : 'group-hover:text-brand-neon'}`}>{aluno.nome}</p>
                            <p className="text-[10px] text-gray-500 uppercase font-bold">{aluno.email}</p>
                          </div>
                          <ChevronRight className={`w-4 h-4 transition-all ${selectedAluno?.id === aluno.id ? 'text-brand-neon translate-x-1' : 'text-gray-600'}`} />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                      {selectedAluno ? (
                        <motion.div key={selectedAluno.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-panel rounded-[2.5rem] p-10 border border-white/10 h-full">
                          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
                            <Avatar nome={selectedAluno.nome} size="lg" />
                            <div className="flex-1 text-center md:text-left">
                              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                                <h3 className="text-3xl font-bold font-display">{selectedAluno.nome}</h3>
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase tracking-widest px-3 py-1 font-black text-[10px] w-fit mx-auto md:mx-0">Ativo</Badge>
                              </div>
                              <p className="text-gray-500 mb-6">{selectedAluno.email}</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center border border-brand-green/20"><BookOpen className="w-5 h-5 text-brand-neon" /></div>
                                  <div><p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Módulo</p><p className="font-bold text-sm">{(selectedAluno as any).moduloAtual || 'Módulo 1'}</p></div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center border border-brand-green/20"><Clock className="w-5 h-5 text-brand-neon" /></div>
                                  <div><p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Status</p><p className="font-bold text-sm">Matriculado</p></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Atividades do Aluno */}
                          <div className="border-t border-white/5 pt-8 mt-6">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">
                              Histórico de Atividades ({atividades.filter(a => a.alunoId === selectedAluno.id).length})
                            </h4>
                            {atividades.filter(a => a.alunoId === selectedAluno.id).length === 0 ? (
                              <p className="text-sm text-gray-500 py-4">Nenhuma atividade criada para este aluno.</p>
                            ) : (
                              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
                                {atividades
                                  .filter(a => a.alunoId === selectedAluno.id)
                                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                  .map((atv) => (
                                    <div
                                      key={atv.id}
                                      onClick={() => handleActivityClick(atv)}
                                      className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between hover:bg-white/[0.08] transition-all cursor-pointer group"
                                    >
                                      <div>
                                        <h5 className="font-bold text-sm text-white group-hover:text-brand-green transition-colors">{atv.titulo}</h5>
                                        <span className="text-[10px] text-gray-500 uppercase font-semibold">{new Date(atv.createdAt).toLocaleDateString('pt-BR')}</span>
                                      </div>
                                      <CorrectionStatusBadge status={atv.correctionStatus} />
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-4 pt-8 border-t border-white/5 mt-6">
                            <Button onClick={() => setShowCreateActivity(true)} className="flex-1 h-14 bg-brand-green hover:bg-emerald-600 text-black font-black rounded-2xl transition-all cursor-pointer"><Plus className="w-5 h-5 mr-2" /> Nova Atividade</Button>
                            <Button onClick={() => handleChatClick(selectedAluno.id)} variant="outline" className="flex-1 h-14 border-white/10 text-white hover:bg-white/5 rounded-2xl transition-all cursor-pointer"><MessageSquare className="w-5 h-5 mr-2" /> Abrir Chat</Button>
                            <Button
                              onClick={() => {
                                if (window.confirm(`Deseja vetar o aluno ${selectedAluno.nome}? Ele perderá o acesso à plataforma.`)) {
                                  handleRejeitar(selectedAluno.id);
                                  setSelectedAluno(null);
                                }
                              }}
                              variant="outline"
                              className="h-14 border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-2xl transition-all cursor-pointer"
                            >
                              Vetar aluno
                            </Button>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="glass-panel rounded-[2.5rem] p-12 border border-white/5 h-full flex flex-col items-center justify-center text-center">
                          <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 mb-6 opacity-50"><UserCircle className="w-12 h-12 text-gray-500" /></div>
                          <h3 className="text-2xl font-bold font-display mb-2">Selecione um Aluno</h3>
                          <p className="text-gray-500 max-w-xs text-sm">Escolha um aluno na lista ao lado para gerenciar atividades e progresso.</p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <h2 className="text-2xl font-bold font-display mb-8">Selecione um Curso</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(alunosPorCurso).map(([curso, alunosDosCurso]) => (
                    <motion.button key={curso} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -8, scale: 1.02 }} onClick={() => setSelectedCurso(curso)} className="glass-panel rounded-3xl p-8 border border-white/10 hover:border-brand-green/50 transition-all group text-left cursor-pointer">
                      <div className="w-16 h-16 rounded-2xl bg-brand-green/10 flex items-center justify-center border border-brand-green/20 mb-6 group-hover:scale-110 transition-transform"><BookOpen className="w-8 h-8 text-brand-neon" /></div>
                      <h3 className="text-3xl font-bold font-display mb-2 capitalize">{curso}</h3>
                      <p className="text-gray-500 mb-6">{(alunosDosCurso as User[]).length} aluno{(alunosDosCurso as User[]).length !== 1 ? 's' : ''}</p>
                      <div className="flex items-center gap-2 text-brand-neon font-bold group-hover:gap-4 transition-all">Acessar <ChevronRight className="w-5 h-5" /></div>
                    </motion.button>
                  ))}
                </div>
                {alunosVetados.length > 0 && (
                  <div className="glass-panel rounded-3xl border border-red-500/15 overflow-hidden mt-8">
                    <div className="px-6 py-4 border-b border-white/5">
                      <h3 className="font-bold text-red-400">Alunos vetados ({alunosVetados.length})</h3>
                      <p className="text-xs text-gray-500 mt-1">Eles não conseguem entrar nem usar atividades, chat ou notificações.</p>
                    </div>
                    <div className="divide-y divide-white/5">
                      {alunosVetados.map((aluno: User) => (
                        <div key={aluno.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                          <Avatar nome={aluno.nome} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm">{aluno.nome}</p>
                            <p className="text-xs text-gray-500 truncate">{aluno.email}</p>
                          </div>
                          <Button
                            onClick={() => {
                              if (window.confirm(`Deseja desvetar o aluno ${aluno.nome}? O acesso será restaurado.`)) {
                                handleAprovar(aluno.id);
                              }
                            }}
                            variant="outline"
                            className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 rounded-xl cursor-pointer"
                          >
                            Desvetar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
            <ProfessorCodeCard codigo={currentUser?.codigo} />
          </TabsContent>

          {/* ATIVIDADES */}
          <TabsContent value="atividades" className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
              {Object.entries(atividadesPorCurso).length > 0 ? Object.entries(atividadesPorCurso).map(([curso, atividadesDosCurso]) => (
                <div key={curso} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-green/10 flex items-center justify-center border border-brand-green/20"><BookOpen className="w-6 h-6 text-brand-neon" /></div>
                    <div><h3 className="text-2xl font-bold font-display capitalize">{curso}</h3><p className="text-gray-500 text-sm">{(atividadesDosCurso as any[]).length} atividades</p></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(atividadesDosCurso as any[]).map((atividade: any) => {
                      const aluno = getAlunoById(atividade.alunoId);
                      return (
                        <motion.div key={atividade.id} whileHover={{ y: -5 }} onClick={() => handleActivityClick(atividade)} className="glass-panel rounded-3xl p-8 border border-white/10 hover:border-brand-green/30 transition-all cursor-pointer group">
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex-1">
                              <h4 className="text-xl font-bold mb-3 group-hover:text-brand-neon transition-colors leading-tight">{atividade.titulo}</h4>
                              <div className="flex items-center gap-3">
                                <Avatar nome={aluno?.nome || '?'} size="sm" />
                                <div><p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Aluno</p><p className="text-sm font-bold text-white">{aluno?.nome || 'Desconhecido'}</p></div>
                              </div>
                            </div>
                            <CorrectionStatusBadge status={atividade.correctionStatus} />
                          </div>
                          <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">{atividade.descricao}</p>
                          <div className="flex items-center justify-between pt-6 border-t border-white/5">
                            <div className="flex items-center gap-2 text-[10px] text-gray-600 uppercase font-bold"><Clock className="w-3 h-3" />{new Date(atividade.createdAt).toLocaleDateString('pt-BR')}</div>
                            {atividade.resposta && <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] font-black uppercase px-3 py-1">Entregue</Badge>}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )) : (
                <div className="text-center py-20"><FileText className="w-16 h-16 mx-auto mb-4 opacity-20" /><p className="text-gray-500 text-lg">Nenhuma atividade criada ainda</p></div>
              )}
            </motion.div>
          </TabsContent>

          {/* CHAT INLINE */}
          <TabsContent value="chat" className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {Object.values(alunosPorCurso).flat().length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ height: '580px' }}>
                  {/* Lista de alunos */}
                  <div className="md:col-span-1 glass-panel rounded-3xl border border-white/10 overflow-y-auto flex flex-col">
                    <div className="p-4 border-b border-white/5 shrink-0">
                      <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400">Conversas</h3>
                    </div>
                    {Object.values(alunosPorCurso).flat().map((aluno: any) => (
                      <button
                        key={aluno.id}
                        onClick={() => handleChatClick(aluno.id)}
                        className={`w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5 text-left cursor-pointer ${
                          selectedChatAluno?.id === aluno.id ? 'bg-brand-green/10 border-l-2 border-l-brand-green' : ''
                        }`}
                      >
                        <Avatar nome={aluno.nome} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">{aluno.nome}</p>
                          <p className="text-[10px] text-brand-green uppercase tracking-widest font-bold">Online</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  {/* Painel de chat */}
                  <div className="md:col-span-2 glass-panel rounded-3xl border border-white/10 flex flex-col overflow-hidden">
                 {selectedChatAluno && currentUser?.id ? (
  <ChatPanel
    currentUserId={currentUser.id}
    recipient={selectedChatAluno}
    headerLabel="Aluno vinculado"
    emptyMessage="Inicie a conversa com seu aluno"
  />
) : (
  <div className="flex-1 flex flex-col items-center justify-center opacity-20">
    <MessageSquare className="w-16 h-16 mb-4" />

    <p className="font-bold uppercase tracking-widest text-sm">
      Selecione uma conversa
    </p>
  </div>
)}
                  </div>
                </div>
              ) : (
                <div className="text-center py-20"><MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" /><p className="text-gray-500 text-lg">Nenhum aluno disponível para chat</p></div>
              )}
            </motion.div>
          </TabsContent>

          {/* NOTIFICAÇÕES */}
          <TabsContent value="notificacoes" className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              {pendingNotifications.length > 0 && (
                <div className="glass-panel rounded-[2rem] border border-white/5 overflow-hidden">
                  <div className="p-6 border-b border-brand-green/20 bg-brand-green/5">
                    <h3 className="font-bold text-brand-neon flex items-center gap-3 uppercase tracking-widest text-sm"><AlertCircle className="w-5 h-5" /> Ações Pendentes ({pendingNotifications.length})</h3>
                  </div>
                  <div className="divide-y divide-white/5">
                   {pendingNotifications.map((n: any) => (
  <NotificationItem
    key={n.id}
    notification={n}
    onAprovar={(id: string) => handleAprovar(id)}
    onRejeitar={(id: string) => handleRejeitar(id)}
    onNotificationClick={handleNotificationClick}
  />
))}
                  </div>
                </div>
              )}
              <div className="glass-panel rounded-[2rem] border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                  <h3 className="font-bold text-gray-400 flex items-center gap-3 uppercase tracking-widest text-sm"><CheckCircle className="w-5 h-5" /> Histórico</h3>
                </div>
                {resolvedNotifications.length > 0 ? (
                  <div className="divide-y divide-white/5">{resolvedNotifications.map((n: any) => <ResolvedNotificationItem key={n.id} notification={n} />)}</div>
                ) : (
                  <div className="p-20 text-center text-gray-600"><p>Nenhuma notificação resolvida.</p></div>
                )}
              </div>
            </motion.div>
          </TabsContent>
          {/* CONFIGURAÇÕES */}
          <TabsContent value="configuracoes" className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
              <div className="glass-panel rounded-[2.5rem] border border-white/10 overflow-hidden">
                <div className="p-8 border-b border-white/5">
                  <h2 className="text-3xl font-bold font-display flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-green/10 flex items-center justify-center border border-brand-green/20">
                      <Settings className="w-6 h-6 text-brand-green" />
                    </div>
                    Configurações do Perfil
                  </h2>
                  <p className="text-gray-500 mt-2">Gerencie seus dados pessoais e preferências</p>
                </div>
                <div className="p-8 space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Nome completo</label>
                    <input
                      type="text"
                      defaultValue={currentUser?.nome}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white outline-none focus:border-brand-green/50 transition-colors cursor-text"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">E-mail</label>
                    <input
                      type="email"
                      defaultValue={currentUser?.email}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white outline-none focus:border-brand-green/50 transition-colors cursor-text"
                    />
                  </div>
                  {currentUser?.codigo && (
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Código de turma</label>
                      <div className="flex items-center gap-3 bg-brand-green/5 border border-brand-green/15 rounded-xl px-4 py-3">
                        <code className="font-mono text-brand-green font-bold tracking-wider flex-1">{currentUser.codigo}</code>
                        <span className="text-[9px] text-gray-600 uppercase tracking-widest font-bold">somente leitura</span>
                      </div>
                    </div>
                  )}
                  <div className="border-t border-white/5 pt-6">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Segurança</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Senha atual</label>
                        <input type="password" placeholder="••••••••" className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white outline-none focus:border-brand-green/50 transition-colors cursor-text" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Nova senha</label>
                        <input type="password" placeholder="••••••••" className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white outline-none focus:border-brand-green/50 transition-colors cursor-text" />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <Button className="flex-1 h-12 bg-brand-green hover:bg-emerald-600 text-black font-bold rounded-xl cursor-pointer">Salvar Alterações</Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      <CreateActivityModal
        isOpen={showCreateActivity}
        onClose={() => setShowCreateActivity(false)}
        aluno={selectedAluno}
        curso={selectedCurso}
        professorId={currentUser?.id}
        onCreated={recarregarDados}
      />
      <ActivityDetailModal isOpen={showActivityDetail} onClose={() => setShowActivityDetail(false)} activity={selectedActivity} onCorrigir={handleCorrigir} />
    </div>
  );
}