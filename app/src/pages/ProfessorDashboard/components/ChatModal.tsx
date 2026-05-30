import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from '@/components/shared/Avatar';

export function ChatModal({ isOpen, onClose, aluno }: any) {
  const [message, setMessage] = useState('');
  const { currentUser, getMensagensByAluno, enviarMensagem } = useAuthStore();
  const mensagens = aluno && currentUser ? getMensagensByAluno(aluno.id, currentUser.id) : [];
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [mensagens, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && aluno && currentUser) { enviarMensagem(aluno.id, message); setMessage(''); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl h-[700px] bg-[#0a0a0a] border border-white/10 text-white rounded-[2.5rem] p-0 overflow-hidden flex flex-col cursor-default">
        <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar nome={aluno?.nome || '?'} />
            <div>
              <h2 className="font-bold text-lg">{aluno?.nome}</h2>
              <p className="text-[10px] text-brand-neon font-black uppercase tracking-widest">Online</p>
            </div>
          </div>
          <MessageSquare className="w-5 h-5 text-gray-500" />
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-black/20">
          {mensagens.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
              <MessageSquare className="w-16 h-16 mb-4" />
              <p className="font-bold uppercase tracking-widest text-xs">Inicie a conversa com seu aluno</p>
            </div>
          ) : mensagens.map((msg: any, idx: number) => (
            <div key={idx} className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[85%]">
                <div className={`px-6 py-4 rounded-[1.5rem] text-sm leading-relaxed ${msg.senderId === currentUser?.id ? 'bg-brand-green text-black font-medium rounded-br-none' : 'bg-white/5 border border-white/10 text-white rounded-bl-none'}`}>
                  {msg.message}
                </div>
                <p className={`text-[9px] mt-2 font-black uppercase tracking-widest opacity-30 ${msg.senderId === currentUser?.id ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-8 border-t border-white/5 bg-white/[0.02]">
          <div className="flex gap-3">
            <Input value={message} onChange={e => setMessage(e.target.value)} placeholder="Escreva sua mensagem..." className="flex-1 h-14 bg-white/5 border-white/10 rounded-2xl focus:border-brand-green/50 cursor-text" />
            <Button type="submit" className="w-14 h-14 bg-brand-neon hover:bg-brand-lime text-black rounded-2xl p-0 cursor-pointer">
              <Send className="w-6 h-6" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
