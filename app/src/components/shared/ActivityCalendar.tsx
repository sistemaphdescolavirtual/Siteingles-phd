import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Activity } from '@/types';

interface ActivityCalendarProps {
  atividades: Activity[];
  selectedDay: string | null;
  onSelectDay: (day: string | null) => void;
}

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const DAYS_PT = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function getStatusColor(status: Activity['correctionStatus']): string {
  switch (status) {
    case 'correta': return '#10b981';
    case 'em_analise': return '#22d3ee';
    case 'incorreta':
    case 'devolvida': return '#ef4444';
    default: return '#f59e0b';
  }
}

export function ActivityCalendar({ atividades, selectedDay, onSelectDay }: ActivityCalendarProps) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Map: 'YYYY-MM-DD' -> list of activities
  const dayMap = useMemo(() => {
    const map: Record<string, Activity[]> = {};
    atividades.forEach((atv) => {
      const d = new Date(atv.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map[key]) map[key] = [];
      map[key].push(atv);
    });
    return map;
  }, [atividades]);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Upcoming events (from today, this month)
  const upcomingEvents = useMemo(() => {
    return atividades
      .filter((a) => {
        const d = new Date(a.createdAt);
        return (
          d.getFullYear() === year &&
          d.getMonth() === month &&
          d.getDate() >= today.getDate()
        );
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(0, 4);
  }, [atividades, year, month, today]);

  return (
    <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand-neon" />
          <span className="text-sm font-bold font-display">
            {MONTHS_PT[month]} {year}
          </span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={prevMonth}
            className="w-7 h-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={nextMonth}
            className="w-7 h-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="p-4">
        {/* Day labels */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS_PT.map((d, i) => (
            <div key={i} className="text-center text-[9px] font-bold text-gray-600 uppercase tracking-wider py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} />;

            const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayActivities = dayMap[key] ?? [];
            const isToday = key === todayKey;
            const isSelected = key === selectedDay;
            const hasActivities = dayActivities.length > 0;

            return (
              <motion.button
                key={key}
                whileTap={{ scale: 0.88 }}
                onClick={() => onSelectDay(isSelected ? null : key)}
                className={`
                  relative aspect-square flex items-center justify-center rounded-lg text-[11px] font-semibold transition-all cursor-pointer
                  ${isToday ? 'bg-brand-green text-black font-black' : ''}
                  ${isSelected && !isToday ? 'bg-brand-green/15 text-brand-neon border border-brand-green/35 font-bold' : ''}
                  ${!isToday && !isSelected ? 'text-gray-500 hover:bg-white/[0.07] hover:text-gray-300' : ''}
                `}
              >
                {day}
                {hasActivities && (
                  <span
                    className="absolute bottom-[3px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: getStatusColor(dayActivities[0].correctionStatus) }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 pb-3 flex flex-col gap-1.5 border-t border-white/[0.04] pt-3">
        {[
          { color: '#10b981', label: 'Correta' },
          { color: '#f59e0b', label: 'Pendente' },
          { color: '#22d3ee', label: 'Em análise' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2 text-[9px] text-gray-600">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
            {label}
          </div>
        ))}
      </div>

      {/* Upcoming events */}
      {upcomingEvents.length > 0 && (
        <div className="border-t border-white/[0.04]">
          <p className="px-4 pt-3 pb-1.5 text-[9px] font-bold text-gray-600 uppercase tracking-[0.12em]">
            Próximas atividades
          </p>
          <div className="divide-y divide-white/[0.03]">
            {upcomingEvents.map((atv) => {
              const d = new Date(atv.createdAt);
              return (
                <div key={atv.id} className="flex items-center gap-3 px-4 py-2.5">
                  <div
                    className="w-[3px] self-stretch rounded-full flex-shrink-0"
                    style={{ background: getStatusColor(atv.correctionStatus) }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-gray-300 truncate">{atv.titulo}</p>
                    <p className="text-[9px] text-gray-600 mt-0.5">
                      {d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
