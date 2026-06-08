import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Key, Copy, CheckCircle2 } from 'lucide-react';

export function ProfessorCodeCard({ codigo }: { codigo?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    if (codigo) { await navigator.clipboard.writeText(codigo); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-16">
      <div className="glass-panel rounded-[2.5rem] p-10 border border-brand-green/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/5 blur-[80px] rounded-full -mr-20 -mt-20" />
        <div className="flex items-center justify-between flex-wrap gap-8 relative z-10">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-brand-green/10 rounded-3xl flex items-center justify-center border border-brand-green/20 group-hover:scale-110 transition-transform duration-500">
              <Key className="w-10 h-10 text-brand-neon" />
            </div>
            <div>
              <p className="text-brand-green font-bold text-[10px] uppercase tracking-[0.3em] mb-2">Acesso Exclusivo</p>
              <p className="text-4xl font-black font-display tracking-widest mb-2">{codigo || 'PROF-XXXXXX'}</p>
              <p className="text-gray-500 text-sm">Compartilhe este código para que novos alunos se vinculem a você.</p>
            </div>
          </div>
          <Button onClick={handleCopy} className="bg-white text-black hover:bg-brand-neon font-black rounded-2xl h-16 px-10 transition-all text-lg shadow-xl cursor-pointer">
            {copied ? <><CheckCircle2 className="w-6 h-6 mr-2" /> Copiado!</> : <><Copy className="w-6 h-6 mr-2" /> Copiar Código</>}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
