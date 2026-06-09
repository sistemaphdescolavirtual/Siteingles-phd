import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { MODULES } from '../constants';

type Module = typeof MODULES[0];

interface ModuleCardProps {
  module: Module;
  isSelected: boolean;
  onSelect: () => void;
  onSubscribe: () => void;
  index: number;
}

export function ModuleCard({ module, isSelected, onSelect, onSubscribe, index }: ModuleCardProps) {
  const isLime = module.color === 'lime';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onClick={onSelect}
      className={`group relative rounded-[2.5rem] p-8 cursor-pointer transition-all duration-500 border ${
        isSelected
          ? isLime ? 'bg-lime-500/10 border-lime-500/50 ring-1 ring-lime-500/50' : 'bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/50'
          : 'bg-white/5 border-white/10 hover:border-white/20 hover:-translate-y-2'
      }`}
    >
      {module.recomendado && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-emerald-500 to-lime-500 text-black text-[10px] font-black uppercase tracking-tighter rounded-full shadow-lg shadow-emerald-500/20 z-20">
          Mais Popular
        </div>
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
            isSelected
              ? isLime ? 'bg-lime-500 text-black' : 'bg-emerald-500 text-black'
              : 'bg-white/5 text-gray-400 group-hover:text-white'
          }`}>
            {module.icon}
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Aulas</div>
            <div className={`text-2xl font-display font-bold ${isSelected ? isLime ? 'text-lime-400' : 'text-emerald-400' : 'text-white'}`}>
              {module.aulas}x <span className="text-sm font-normal text-gray-500">/sem</span>
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-display font-bold mb-3 group-hover:text-brand-green transition-colors">{module.titulo}</h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-8 h-12 overflow-hidden">{module.descricao}</p>

        <div className="mb-8 flex items-baseline gap-1">
          <span className={`text-4xl font-display font-bold ${isSelected ? 'text-white' : 'text-gray-300'}`}>{module.preco}</span>
          <span className="text-gray-600 text-sm">{module.periodo}</span>
        </div>

        <ul className="space-y-4 mb-10">
          {module.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-gray-400">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-brand-green/20' : 'bg-white/5'}`}>
                <Check className={`w-3 h-3 ${isSelected ? 'text-brand-green' : 'text-gray-600'}`} />
              </div>
              {feature}
            </li>
          ))}
        </ul>

        <motion.button
          onClick={(e) => { e.stopPropagation(); onSubscribe(); }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            isSelected
              ? isLime
                ? 'bg-lime-500 text-black shadow-lg shadow-lime-500/20'
                : 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
              : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
          }`}
        >
          Matricular-se
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>

      <div className={`absolute -right-4 -bottom-4 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${isLime ? 'bg-lime-500' : 'bg-emerald-500'}`} />
    </motion.div>
  );
}
