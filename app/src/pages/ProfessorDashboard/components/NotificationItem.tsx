import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

export function NotificationItem({
  notification,
  onAprovar,
  onRejeitar,
  onNotificationClick,
}: any) {
  return (
    <div
  onClick={() => onNotificationClick(notification)}
  className="p-6 hover:bg-white/5 transition-colors cursor-pointer"
>
      <div className="flex items-start gap-5">
        <div className="w-2.5 h-2.5 rounded-full bg-brand-neon mt-2.5 shadow-[0_0_10px_#00ff88]" />
        <div className="flex-1">
          <p className="font-bold text-lg mb-1">{notification.title}</p>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">{notification.message}</p>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{new Date(notification.createdAt).toLocaleString('pt-BR')}</span>
            {notification.type === 'autorizacao' && notification.data?.alunoId && (
              <div className="flex gap-3">
              <Button
  onClick={(event) => {
    event.stopPropagation();
    onAprovar(notification.data.alunoId);
  }}
  className="bg-brand-neon hover:bg-brand-lime text-black font-bold rounded-xl px-5 h-10 cursor-pointer"
>
                  <Check className="w-4 h-4 mr-2" /> Aprovar
                </Button>
               <Button
  onClick={(event) => {
    event.stopPropagation();
    onRejeitar(notification.data.alunoId);
  }}
  variant="outline"
  className="border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl px-5 h-10 cursor-pointer"
>
                  <X className="w-4 h-4 mr-2" /> Rejeitar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
