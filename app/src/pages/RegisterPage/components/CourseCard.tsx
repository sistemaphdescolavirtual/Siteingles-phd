interface CourseCardProps {
  title: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

export function CourseCard({ title, icon, active, onClick }: CourseCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all ${
        active
          ? 'bg-brand-green/10 border-brand-green shadow-[0_0_15px_rgba(16,185,129,0.2)]'
          : 'bg-white/5 border-white/10 hover:border-white/20'
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-brand-green text-black' : 'bg-white/5 text-gray-400'}`}>
        {icon}
      </div>
      <span className={`text-sm font-bold ${active ? 'text-brand-green' : 'text-gray-400'}`}>{title}</span>
    </button>
  );
}
