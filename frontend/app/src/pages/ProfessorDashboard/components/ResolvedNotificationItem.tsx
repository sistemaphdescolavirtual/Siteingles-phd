import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';

export function ResolvedNotificationItem({ notification }: any) {
  return (
    <div className="p-6 opacity-60 hover:opacity-100 transition-all">
      <div className="flex items-start gap-5">
        {notification.resolution === 'aprovado' ? <CheckCircle className="w-6 h-6 text-emerald-400" /> : <XCircle className="w-6 h-6 text-red-400" />}
        <div className="flex-1">
          <p className="font-bold text-white mb-1">{notification.title}</p>
          <p className="text-gray-500 text-sm mb-3">{notification.message}</p>
          <div className="flex items-center gap-3">
            <Badge className={`text-[10px] font-black uppercase tracking-widest ${notification.resolution === 'aprovado' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
              {notification.resolution === 'aprovado' ? 'Aprovado' : 'Rejeitado'}
            </Badge>
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{new Date(notification.createdAt).toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
