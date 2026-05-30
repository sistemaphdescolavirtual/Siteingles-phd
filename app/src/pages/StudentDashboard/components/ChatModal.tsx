import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from '@/components/shared/Avatar';

export function ChatModal({ isOpen, onClose, professor }: { isOpen: boolean; onClose: () => void; professor: any }) {
  const [msg, setMsg] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const store = useAuthStore() as any;
  const { currentUser, mensagens, enviarMensagem } = store;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [mensagens, isOpen]);

  if (!professor || !currentUser) return null;

  const chatMsgs = (mensagens || []).filter((m: any) =>
    (m.fromId === currentUser.id && m.toId === professor.id) ||
    (m.fromId === professor.id && m.toId === currentUser.id)
  ).sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim()) return;
    enviarMensagem?.(currentUser.id, professor.id, msg.trim());
    setMsg('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[80vh] bg-[#0a0a0a] border border-white/10 text-white rounded-[2.5rem] p-0 overflow-hidden flex flex-col cursor-default">
        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center gap-4">
          <Avatar nome={professor.nome} size="md" />
          <div>
            <h3 className="font-bold text-lg">{professor.nome}</h3>
            <p className="text-[10px] text-brand-neon font-black uppercase tracking-widest">Online</p>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {chatMsgs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
              <MessageSquare className="w-12 h-12 mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest">Inicie uma conversa</p>
            </div>
          ) : chatMsgs.map((m: any) => (
            <div key={m.id} className={`flex ${m.fromId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl ${m.fromId === currentUser.id ? 'bg-brand-green text-black rounded-tr-none' : 'bg-white/5 text-white rounded-tl-none border border-white/5'}`}>
                <p className="text-sm leading-relaxed">{m.content}</p>
                <p className={`text-[9px] mt-2 font-bold uppercase ${m.fromId === currentUser.id ? 'text-black/50' : 'text-gray-500'}`}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="p-6 border-t border-white/5 bg-white/[0.02] flex gap-3">
          <Input value={msg} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMsg(e.target.value)} placeholder="Digite sua mensagem..." className="h-14 bg-white/5 border-white/10 rounded-2xl focus:border-brand-green" />
          <Button type="submit" className="w-14 h-14 bg-brand-green hover:bg-brand-neon text-black rounded-2xl shrink-0 cursor-pointer"><Send className="w-5 h-5" /></Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
