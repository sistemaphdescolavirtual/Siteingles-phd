function avatarColor(nome: string): string {
  const colors = [
    'bg-brand-green/20 text-brand-green border-brand-green/30',
    'bg-brand-lime/20 text-brand-lime border-brand-lime/30',
    'bg-brand-neon/20 text-brand-neon border-brand-neon/30',
    'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  ];
  let hash = 0;
  for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

interface AvatarProps {
  nome: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ nome, size = 'md' }: AvatarProps) {
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-14 h-14 text-xl' : 'w-11 h-11 text-sm';
  return (
    <div className={`${sz} ${avatarColor(nome)} rounded-xl border flex items-center justify-center font-bold shrink-0 backdrop-blur-sm`}>
      {nome.charAt(0).toUpperCase()}
    </div>
  );
}
