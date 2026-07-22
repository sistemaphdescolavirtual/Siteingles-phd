import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Bell, LogOut, BookOpen, FileText, MessageSquare,
  Clock, ChevronRight, AlertCircle, CheckCircle, Trophy, TrendingUp,
  Lock, Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/shared/Avatar';
import { CorrectionStatusBadge } from '@/components/shared/CorrectionStatusBadge';
import { ActivityCalendar } from '@/components/shared/ActivityCalendar';
import { ActivityModal } from './components/ActivityModal';
import { SettingsModal } from '@/components/shared/SettingsModal';
import { useStudentDashboard } from './useStudentDashboard';
import type { Activity } from '@/types';
import logoPhd from '@/assets/logo_phd.png';
import { ChatPanel } from '@/components/shared/ChatPanel';

interface StudentDashboardProps { onLogout: () => void; }

export default function StudentDashboard({ onLogout }: StudentDashboardProps) {
  const {
    activeTab, setActiveTab,
    showNotifDropdown, setShowNotifDropdown,
    selectedActivity, showActivityModal, setShowActivityModal,
    expandedCurso, setExpandedCurso,
    showSettings, setShowSettings,
    selectedCalendarDay, setSelectedCalendarDay,
    currentUser,
    atividades, atividadesRecentes,
    pendingNotifications, resolvedNotifications,
    professor, cursoNome, cursoBloqueado,
    totalAtividades, corretas, pendentes, emAnalise,
   handleActivityClick,
  handleNotificationClick,
  recarregarAtividades,
  } = useStudentDashboard();

  const filteredAtividades = selectedCalendarDay
    ? atividades.filter((a) => {
        const d = new Date(a.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return key === selectedCalendarDay;
      })
    : [...atividades].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

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
                <p className="text-[10px] uppercase tracking-[0.2em] text-brand-green font-bold">Área do Aluno</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowNotifDropdown(v => !v)} className="relative p-2.5 text-gray-400 hover:text-brand-neon transition-all rounded-xl hover:bg-white/5 cursor-pointer">
                <Bell className="w-6 h-6" />
                {pendingNotifications.length > 0 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1 right-1 w-5 h-5 bg-brand-neon text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#050505]">{pendingNotifications.length}</motion.span>}
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
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">{cursoNome}</p>
                </div>
                <Avatar nome={currentUser?.nome || 'A'} size="md" />
              </div>
              <Button variant="ghost" onClick={onLogout} className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl px-3 h-10 transition-all cursor-pointer">
                <LogOut className="w-5 h-5 sm:mr-2" /><span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {showNotifDropdown && (
          <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} className="absolute right-4 top-24 w-96 glass-panel rounded-3xl shadow-2xl z-50 border border-white/10 max-h-[80vh] overflow-hidden">
            <div className="p-5 border-b border-white/5 bg-gradient-to-r from-brand-green/20 to-transparent">
              <h3 className="font-bold font-display text-white flex items-center gap-2"><Bell className="w-4 h-4 text-brand-neon" /> Notificações</h3>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {[...pendingNotifications, ...resolvedNotifications].length === 0 ? (
                <div className="p-12 text-center text-gray-500"><Bell className="w-12 h-12 mx-auto mb-4 opacity-20" /><p className="text-sm">Nenhuma notificação</p></div>
              ) : [...pendingNotifications, ...resolvedNotifications].map((n: any) => (
                <div
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className="p-3 rounded-2xl hover:bg-white/5 transition-colors m-2 cursor-pointer"
                            >
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-2 shrink-0 bg-brand-neon shadow-[0_0_8px_#00ff88]" />
                    <div>
                      <p className="font-bold text-sm">{n.title || n.tipo}</p>
                      {n.message && <p className="text-gray-400 text-xs mt-0.5">{n.message}</p>}
                      <p className="text-[10px] text-gray-600 mt-1 uppercase font-bold tracking-widest">{new Date(n.createdAt).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold font-display">Olá, <span className="gradient-text">{currentUser?.nome?.split(' ')[0] || 'Aluno'}</span>!</h1>
              <p className="text-gray-500 mt-1">Pronto para continuar seus estudos hoje?</p>
            </div>
            <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-14">
              {[['cursos','Meus Cursos'],['atividades','Atividades'],['chat','Chat'],['notificacoes','Notificações']].map(([v,l]) => (
                <TabsTrigger key={v} value={v} className="rounded-xl px-6 data-[state=active]:bg-brand-green data-[state=active]:text-black font-bold transition-all cursor-pointer">{l}</TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Atividades', val: totalAtividades, icon: FileText, color: 'text-gray-400' },
              { label: 'Corretas', val: corretas, icon: CheckCircle, color: 'text-brand-neon' },
              { label: 'Pendentes', val: pendentes, icon: Clock, color: 'text-amber-400' },
              { label: 'Em Análise', val: emAnalise, icon: TrendingUp, color: 'text-cyan-400' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-panel p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${s.color}`}><s.icon className="w-5 h-5" /></div>
                  <span className="text-2xl font-bold font-display">{s.val}</span>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* CURSOS */}
          <TabsContent value="cursos" className="space-y-8 outline-none">
            <AnimatePresence mode="wait">
              {expandedCurso === 'ativo' ? (
                <motion.div key="expanded" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="grid lg:grid-cols-2 gap-8 items-start">
                  <div className="glass-panel rounded-[2.5rem] border border-brand-green/20 overflow-hidden p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-brand-green/10 border border-brand-green/20 flex items-center justify-center"><BookOpen className="w-7 h-7 text-brand-neon" /></div>
                      <Badge className="bg-brand-green/20 text-brand-neon border-brand-green/30 px-4 py-1 rounded-full font-bold uppercase tracking-widest text-[10px]">Ativo</Badge>
                    </div>
                    <h3 className="text-2xl font-bold font-display mb-2">Curso de {cursoNome}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">Acesse suas aulas, materiais e acompanhe seu progresso.</p>
                    <Button onClick={() => setExpandedCurso(null)} variant="outline" className="h-11 px-6 border-white/10 text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl font-bold transition-all cursor-pointer text-sm">Fechar Detalhes</Button>
                  </div>
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-panel rounded-[2.5rem] border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                      <div className="flex items-center gap-3"><FileText className="w-5 h-5 text-brand-neon" /><h4 className="font-bold font-display text-lg">Atividades Recentes</h4></div>
                      <Badge className="bg-brand-green/10 text-brand-neon border-brand-green/20 font-black text-[10px] uppercase tracking-widest">{atividadesRecentes.length} de {totalAtividades}</Badge>
                    </div>
                    {atividadesRecentes.length === 0 ? (
                      <div className="p-16 text-center opacity-30"><FileText className="w-12 h-12 mx-auto mb-4" /><p className="font-bold uppercase tracking-widest text-xs">Nenhuma atividade ainda</p></div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {atividadesRecentes.map((atv: Activity, idx: number) => (
                          <motion.div key={atv.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + idx * 0.05 }} onClick={() => handleActivityClick(atv)} className="flex items-center gap-4 p-5 hover:bg-white/[0.03] transition-all cursor-pointer group">
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm truncate group-hover:text-brand-neon transition-colors">{atv.titulo}</p>
                              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-0.5">{new Date(atv.createdAt).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <CorrectionStatusBadge status={atv.correctionStatus} />
                          </motion.div>
                        ))}
                      </div>
                    )}
                    {totalAtividades > 5 && (
                      <div className="p-4 border-t border-white/5">
                        <button onClick={() => setActiveTab('atividades')} className="w-full text-center text-[11px] font-black text-brand-neon/70 hover:text-brand-neon uppercase tracking-widest transition-colors cursor-pointer">Ver todas as {totalAtividades} atividades →</button>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div key="collapsed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="grid lg:grid-cols-2 gap-8">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-[2.5rem] border border-brand-green/20 overflow-hidden p-8">
                    <div className="flex items-start justify-between mb-8">
                      <div className="w-16 h-16 rounded-2xl bg-brand-green/10 border border-brand-green/20 flex items-center justify-center"><BookOpen className="w-8 h-8 text-brand-neon" /></div>
                      <Badge className="bg-brand-green/20 text-brand-neon border-brand-green/30 px-4 py-1 rounded-full font-bold uppercase tracking-widest text-[10px]">Ativo</Badge>
                    </div>
                    <h3 className="text-3xl font-bold font-display mb-3">Curso de {cursoNome}</h3>
                    <p className="text-gray-400 leading-relaxed mb-8">Acesse suas aulas, materiais e acompanhe seu progresso.</p>
                    <Button onClick={() => setExpandedCurso('ativo')} className="w-full sm:w-auto h-14 px-8 bg-brand-green hover:bg-brand-neon text-black font-bold rounded-2xl shadow-lg shadow-brand-green/20 transition-all cursor-pointer">Acessar Curso <ChevronRight className="ml-2 w-5 h-5" /></Button>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel rounded-[2.5rem] border border-white/5 overflow-hidden opacity-60 grayscale relative">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-8 text-center">
                      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 border border-white/10"><Lock className="w-8 h-8 text-gray-400" /></div>
                      <h4 className="text-xl font-bold font-display mb-2">Módulo Bloqueado</h4>
                      <p className="text-sm text-gray-500 max-w-[200px]">Adquira o curso de {cursoBloqueado} para liberar.</p>
                    </div>
                    <div className="p-8">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8"><Trophy className="w-8 h-8 text-gray-600" /></div>
                      <h3 className="text-3xl font-bold font-display mb-3">Curso de {cursoBloqueado}</h3>
                      <Button disabled className="w-full sm:w-auto h-14 px-8 bg-white/10 text-gray-500 font-bold rounded-2xl">Bloqueado</Button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* ATIVIDADES + CALENDÁRIO */}
          <TabsContent value="atividades" className="space-y-6 outline-none">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Lista */}
                <div className="flex-1 min-w-0 glass-panel rounded-[2.5rem] border border-white/5 overflow-hidden">
                  <div className="p-6 sm:p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-brand-green/10 to-transparent">
                    <h3 className="text-xl sm:text-2xl font-bold font-display flex items-center gap-3"><FileText className="w-6 h-6 text-brand-neon" /> Minhas Atividades</h3>
                    <div className="flex items-center gap-2">
                      {selectedCalendarDay && (
                        <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-[10px] font-bold text-brand-neon bg-brand-green/10 border border-brand-green/25 px-3 py-1 rounded-full uppercase tracking-wider">
                          {new Date(selectedCalendarDay + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </motion.span>
                      )}
                      <Badge className="bg-white/5 text-gray-400 border-white/10">{filteredAtividades.length} {selectedCalendarDay ? 'neste dia' : 'total'}</Badge>
                    </div>
                  </div>
                  <div className="p-4 sm:p-6">
                    {filteredAtividades.length === 0 ? (
                      <div className="text-center py-16">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-700" />
                        <h4 className="text-lg font-bold text-gray-500">{selectedCalendarDay ? 'Nenhuma atividade neste dia' : 'Nenhuma atividade ainda'}</h4>
                        {selectedCalendarDay && (
                          <button onClick={() => setSelectedCalendarDay(null)} className="mt-3 text-[11px] font-bold text-brand-neon/70 hover:text-brand-neon uppercase tracking-widest transition-colors cursor-pointer">Ver todas →</button>
                        )}
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {filteredAtividades.map((atv: Activity) => {
                          const isHighlighted = selectedCalendarDay !== null;
                          return (
                            <motion.div
                              key={atv.id}
                              layout
                              whileHover={{ x: 4 }}
                              onClick={() => handleActivityClick(atv)}
                              className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer group ${
                                isHighlighted
                                  ? 'bg-brand-green/5 border-brand-green/25'
                                  : 'bg-white/5 border-white/5 hover:border-brand-green/30 hover:bg-brand-green/5'
                              }`}
                            >
                              <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${isHighlighted ? 'bg-brand-green/20' : 'bg-white/5 group-hover:bg-brand-green/20'}`}>
                                  <FileText className={`w-5 h-5 transition-colors ${isHighlighted ? 'text-brand-neon' : 'text-gray-400 group-hover:text-brand-neon'}`} />
                                </div>
                                <div>
                                  <h4 className={`font-bold text-base transition-colors ${isHighlighted ? 'text-brand-neon' : 'group-hover:text-brand-neon'}`}>{atv.titulo}</h4>
                                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" />{new Date(atv.createdAt).toLocaleDateString('pt-BR')}</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between sm:justify-end gap-4">
                                <CorrectionStatusBadge status={atv.correctionStatus} />
                                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-brand-neon transition-all group-hover:translate-x-1" />
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Calendário lateral */}
                <div className="w-full lg:w-72 flex-shrink-0">
                  <ActivityCalendar
                    atividades={atividades}
                    selectedDay={selectedCalendarDay}
                    onSelectDay={setSelectedCalendarDay}
                  />
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* CHAT INLINE */}
          <TabsContent value="chat" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
             {professor && currentUser?.id ? (
  <div
    className="glass-panel rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col"
    style={{ height: '550px' }}
  >
    <ChatPanel
      currentUserId={currentUser.id}
      recipient={professor}
      headerLabel="Seu Instrutor"
      emptyMessage="Inicie uma conversa"
    />
  </div>
) : (
  <div className="glass-panel rounded-[2.5rem] p-20 border border-white/5 text-center opacity-30">
    <MessageSquare className="w-16 h-16 mx-auto mb-4" />

    <p className="font-bold uppercase tracking-widest text-sm">
      Nenhum professor vinculado
    </p>
  </div>
)}
            </motion.div>
          </TabsContent>

          {/* NOTIFICAÇÕES */}
          <TabsContent value="notificacoes" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {pendingNotifications.length > 0 && (
                <div className="glass-panel rounded-[2rem] border border-white/5 overflow-hidden">
                  <div className="p-6 border-b border-brand-green/20 bg-brand-green/5"><h3 className="font-bold text-brand-neon flex items-center gap-3 uppercase tracking-widest text-sm"><AlertCircle className="w-5 h-5" /> Pendentes ({pendingNotifications.length})</h3></div>
                  <div className="divide-y divide-white/5">
                    {pendingNotifications.map((n: any) => (
                     <div  key={n.id} onClick={() => handleNotificationClick(n)} className="p-6 hover:bg-white/[0.02] transition-colors cursor-pointer"> 
                        <div className="flex items-start gap-4">
                          <div className="w-2.5 h-2.5 rounded-full bg-brand-neon mt-2 shrink-0 shadow-[0_0_10px_#00ff88]" />
                          <div className="flex-1">
                            <p className="font-bold text-base mb-1">{n.title || n.tipo}</p>
                            {n.message && <p className="text-gray-400 text-sm leading-relaxed mb-2">{n.message}</p>}
                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{new Date(n.createdAt).toLocaleString('pt-BR')}</span>
                          </div>
                          <Badge className="bg-brand-neon/10 text-brand-neon border-brand-neon/20 text-[10px] font-black uppercase tracking-widest shrink-0">Nova</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="glass-panel rounded-[2rem] border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 bg-white/[0.02]"><h3 className="font-bold text-gray-400 flex items-center gap-3 uppercase tracking-widest text-sm"><CheckCircle className="w-5 h-5" /> Histórico</h3></div>
                {resolvedNotifications.length === 0 && pendingNotifications.length === 0 ? (
                  <div className="p-20 text-center opacity-20"><Bell className="w-16 h-16 mx-auto mb-4" /><p className="font-bold uppercase tracking-widest text-sm">Nenhuma notificação</p></div>
                ) : resolvedNotifications.length === 0 ? (
                  <div className="p-12 text-center text-gray-600"><p className="text-sm">Nenhuma notificação resolvida ainda.</p></div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {resolvedNotifications.map((n: any) => (
                     <div key={n.id}  onClick={() => handleNotificationClick(n)} className="p-6 opacity-60 hover:opacity-100 transition-all cursor-pointer"> 
                        <div className="flex items-start gap-4">
                          <CheckCircle className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-bold text-base mb-1">{n.title || n.tipo}</p>
                            {n.message && <p className="text-gray-500 text-sm leading-relaxed mb-2">{n.message}</p>}
                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{new Date(n.createdAt).toLocaleString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      <ActivityModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        activity={selectedActivity}
        onSubmitted={recarregarAtividades}
      />
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onLogout={onLogout}
        currentUser={currentUser}
      />
    </div>
  );
}
