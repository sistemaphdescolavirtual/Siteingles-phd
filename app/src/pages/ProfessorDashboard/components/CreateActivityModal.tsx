import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Paperclip, Check, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import type { User, Attachment } from '@/types';

export function CreateActivityModal({ isOpen, onClose, aluno, curso }: { isOpen: boolean; onClose: () => void; aluno: User | null; curso: string | null }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [anexos, setAnexos] = useState<Attachment[]>([]);
  const [linkInput, setLinkInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { criarAtividade, currentUser } = useAuthStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAnexos(prev => [...prev, ...files.map(f => ({
      id: `anexo-${Date.now()}-${Math.random()}`,
      nome: f.name,
      tipo: (f.name.endsWith('.pdf') ? 'pdf' : f.name.endsWith('.xls') || f.name.endsWith('.xlsx') ? 'xls' : 'txt') as 'pdf' | 'xls' | 'txt' | 'link',
      url: URL.createObjectURL(f),
    }))]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddLink = () => {
    if (!linkInput.trim()) return;
    setAnexos(prev => [...prev, { id: `link-${Date.now()}`, nome: linkInput, tipo: 'link', url: linkInput }]);
    setLinkInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aluno || !currentUser) return;
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    criarAtividade({ professorId: currentUser.id, alunoId: aluno.id, curso: (aluno.cursoAdquirido || curso) as 'ingles' | 'enem', titulo, descricao, anexos });
    setIsSubmitting(false); setSuccess(true);
    setTimeout(() => { setSuccess(false); setTitulo(''); setDescricao(''); setAnexos([]); onClose(); }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#0a0a0a] border border-white/10 text-white rounded-[2.5rem] p-0 overflow-hidden flex flex-col max-h-[90vh] cursor-default">
        <div className="p-10 flex-1 overflow-y-auto custom-scrollbar">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-bold font-display flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-green/10 flex items-center justify-center border border-brand-green/20">
                <Plus className="w-6 h-6 text-brand-neon" />
              </div>
              Nova Atividade
            </DialogTitle>
          </DialogHeader>

          {success ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-20 text-center">
              <div className="w-24 h-24 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-brand-green/20">
                <Check className="w-12 h-12 text-brand-neon" />
              </div>
              <h3 className="text-3xl font-bold font-display mb-2">Atividade Enviada!</h3>
              <p className="text-gray-500">O aluno {aluno?.nome} será notificado imediatamente.</p>
            </motion.div>
          ) : (
            <form id="create-activity-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Destinatário</p>
                  <p className="text-xl font-bold">{aluno?.nome}</p>
                </div>
                <Badge className="bg-brand-green/10 text-brand-neon border-brand-green/20 uppercase tracking-widest px-4 py-1.5 font-black text-[10px]">
                  {aluno?.cursoAdquirido === 'ingles' ? 'Inglês' : 'ENEM'}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Título da Atividade</Label>
                <Input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Practice: Present Continuous" required className="h-14 bg-white/5 border-white/10 rounded-xl focus:border-brand-green/50 text-lg cursor-text" />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Instruções / Descrição</Label>
                <Textarea value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descreva o que o aluno deve fazer..." required rows={5} className="bg-white/5 border-white/10 rounded-xl focus:border-brand-green/50 resize-none text-base cursor-text" />
              </div>

              <div className="space-y-4">
                <Label className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Recursos e Anexos</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-white/10 rounded-2xl hover:border-brand-neon/50 hover:bg-brand-green/5 transition-all group cursor-pointer">
                    <Paperclip className="w-6 h-6 text-gray-500 group-hover:text-brand-neon" />
                    <span className="text-xs font-bold text-gray-500 group-hover:text-white uppercase tracking-widest">Anexar Arquivo</span>
                  </button>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input value={linkInput} onChange={e => setLinkInput(e.target.value)} placeholder="Link externo..." className="bg-white/5 border-white/10 rounded-xl cursor-text" />
                      <Button type="button" onClick={handleAddLink} className="bg-white/10 hover:bg-white/20 text-white rounded-xl cursor-pointer">Add</Button>
                    </div>
                  </div>
                </div>
                {anexos.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {anexos.map(a => (
                      <div key={a.id} className="flex items-center gap-2 px-3 py-2 bg-brand-green/10 border border-brand-green/20 rounded-xl">
                        <span className="text-xs font-bold text-brand-neon truncate max-w-[150px]">{a.nome}</span>
                        <button type="button" onClick={() => setAnexos(p => p.filter(x => x.id !== a.id))} className="text-brand-neon/50 hover:text-red-400 transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6">
                <Button type="button" variant="ghost" onClick={onClose} className="flex-1 h-14 rounded-2xl text-gray-500 hover:text-white hover:bg-white/5 font-bold uppercase tracking-widest text-xs cursor-pointer">Cancelar</Button>
                <Button type="submit" disabled={isSubmitting} className="flex-[2] h-14 bg-brand-neon hover:bg-brand-lime text-black font-black rounded-2xl text-base cursor-pointer">
                  {isSubmitting ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full" /> : 'Lançar Atividade'}
                </Button>
              </div>
            </form>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept=".pdf,.xls,.xlsx,.txt" multiple className="hidden" onChange={handleFileChange} />
      </DialogContent>
    </Dialog>
  );
}
