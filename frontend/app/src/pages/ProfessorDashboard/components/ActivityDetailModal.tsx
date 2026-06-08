import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Clock, Paperclip, CheckCircle, XCircle, RotateCcw, UserCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { CorrectionStatusBadge } from '@/components/shared/CorrectionStatusBadge';
import type { Activity, ActivityCorrectionStatus } from '@/types';

export function ActivityDetailModal({ isOpen, onClose, activity, onCorrigir }: { isOpen: boolean; onClose: () => void; activity: Activity | null; onCorrigir: (status: ActivityCorrectionStatus, feedback?: string) => void }) {
  const [feedback, setFeedback] = useState('');
  const { getAlunoById } = useAuthStore();
  const aluno = activity ? getAlunoById(activity.alunoId) : null;
  if (!activity) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#0a0a0a] border border-white/10 text-white rounded-[2.5rem] p-0 overflow-hidden flex flex-col max-h-[90vh] cursor-default">
        <div className="p-10 flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex items-start justify-between gap-6 mb-8">
            <div className="flex-1">
              <CorrectionStatusBadge status={activity.correctionStatus} />
              <h2 className="text-4xl font-bold font-display tracking-tight leading-tight mt-2">{activity.titulo}</h2>
              <div className="flex items-center gap-4 text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-2">
                <span className="flex items-center gap-2"><UserCircle className="w-4 h-4" /> {aluno?.nome || 'Desconhecido'}</span>
                <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {new Date(activity.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <FileText className="w-8 h-8 text-brand-neon" />
            </div>
          </div>

          <div className="space-y-10">
            <section>
              <h4 className="text-brand-green font-black uppercase tracking-[0.2em] text-[10px] mb-4">Instruções</h4>
              <div className="p-8 bg-white/[0.03] border border-white/5 rounded-3xl leading-relaxed text-gray-300 italic">"{activity.descricao}"</div>
            </section>

            {activity.anexos?.length > 0 && (
              <section>
                <h4 className="text-brand-green font-black uppercase tracking-[0.2em] text-[10px] mb-4">Materiais de Apoio</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activity.anexos.map((a: any) => (
                    <a key={a.id} href={a.url} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-brand-neon/30 hover:bg-brand-green/5 transition-all group cursor-pointer">
                      <Paperclip className="w-5 h-5 text-gray-500 group-hover:text-brand-neon" />
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate group-hover:text-brand-neon transition-colors">{a.nome}</p>
                        <p className="text-[10px] text-gray-600 uppercase font-black">{a.tipo}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {activity.resposta && (
              <section className="relative">
                <div className="relative p-8 bg-brand-green/5 border border-brand-green/20 rounded-3xl">
                  <h4 className="text-brand-neon font-black uppercase tracking-[0.2em] text-[10px] mb-4 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Entrega do Aluno
                  </h4>
                  <p className="text-lg text-white leading-relaxed font-medium mb-6">{activity.resposta.conteudo}</p>
                  <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">Enviada em: {new Date(activity.resposta.enviadoEm).toLocaleString('pt-BR')}</p>
                </div>
              </section>
            )}

            {activity.correctionStatus === 'em_analise' && (
              <section className="pt-10 border-t border-white/5 space-y-6">
                <h4 className="text-white font-bold font-display text-xl mb-4">Avaliação do Professor</h4>
                <Textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Escreva seu feedback para o aluno..." rows={4} className="bg-white/5 border-white/10 rounded-2xl focus:border-brand-green/50 text-base p-6 cursor-text" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button onClick={() => onCorrigir('correta', feedback)} className="h-16 bg-emerald-500 hover:bg-emerald-600 text-black font-black rounded-2xl text-base cursor-pointer">
                    <CheckCircle className="w-5 h-5 mr-2" /> Atividade Correta
                  </Button>
                  <Button onClick={() => onCorrigir('incorreta', feedback)} variant="outline" className="h-16 border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-2xl font-black text-base cursor-pointer">
                    <XCircle className="w-5 h-5 mr-2" /> Atividade Incorreta
                  </Button>
                </div>
                <Button onClick={() => onCorrigir('devolvida', feedback)} variant="ghost" className="w-full h-12 text-gray-500 hover:text-white font-bold uppercase tracking-widest text-[10px] cursor-pointer">
                  <RotateCcw className="w-4 h-4 mr-2" /> Devolver para Revisão
                </Button>
              </section>
            )}

            {activity.correctionFeedback && (
              <section className="p-8 bg-white/5 border border-white/5 rounded-3xl">
                <h4 className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px] mb-3">Seu Feedback</h4>
                <p className="text-gray-300 italic">"{activity.correctionFeedback}"</p>
              </section>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
