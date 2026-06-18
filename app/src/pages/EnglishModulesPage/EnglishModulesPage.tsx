import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowLeft, Sparkles } from 'lucide-react';
import type { Page } from '@/App';
import { useCursorEffect } from '@/hooks/useCursorEffect';
import { ModuleCard } from './components/ModuleCard';
import { MODULES } from './constants';
import { api } from '@/services/api';

interface EnglishModulesPageProps {
  navigateTo: (page: Page) => void;
}

type ModuleCardData = (typeof MODULES)[number];

export default function EnglishModulesPage({ navigateTo }: EnglishModulesPageProps) {
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [modules, setModules] = useState<ModuleCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useCursorEffect();

  useEffect(() => {
    let componentMounted = true;

    async function loadModules() {
      try {
        setIsLoading(true);
        setLoadError('');

        const data = await api.getEnglishModules();

        const convertedModules: ModuleCardData[] = data.map((module) => {
          const referenceModule = MODULES.find(
            (item) => item.aulas === module.aulas,
          );

          return {
            id: module.id,
            aulas: module.aulas,
            titulo: module.titulo,
            descricao: module.descricao,
            preco: module.preco,
            periodo: module.periodo,
            features: Array.isArray(module.features)
              ? module.features
              : [],
            recomendado: module.recomendado,
            icon: referenceModule?.icon ?? MODULES[0].icon,
            color:
              module.color ??
              referenceModule?.color ??
              (module.recomendado ? 'lime' : 'emerald'),
          };
        });

        if (componentMounted) {
          setModules(convertedModules);
        }
      } catch (error) {
        if (componentMounted) {
          setLoadError(
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar os módulos.',
          );
        }
      } finally {
        if (componentMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadModules();

    return () => {
      componentMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-brand-green selection:text-black overflow-x-hidden">
      <div className="noise-overlay" />

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-green/5 rounded-full blur-[120px]" />
      </div>

      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.button
              onClick={() => navigateTo('home')}
              whileHover={{ x: -5 }}
              className="flex items-center gap-2 text-gray-500 hover:text-brand-green transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Voltar</span>
            </motion.button>

            <div
              className="flex items-center gap-3 group cursor-pointer"
              onClick={() => navigateTo('home')}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-lime-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:rotate-12 transition-transform">
                <GraduationCap className="w-6 h-6 text-black" />
              </div>
              <span className="text-xl font-display font-bold tracking-tight">
                GuiEnglish
              </span>
            </div>

            <div className="hidden sm:block">
              <button
                onClick={() => navigateTo('login')}
                className="px-5 py-2 rounded-full border border-white/10 hover:border-brand-green/50 hover:bg-brand-green/5 transition-all text-sm font-medium"
              >
                Entrar
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      <section className="relative py-20 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-green/10 border border-brand-green/20 text-brand-green rounded-full text-xs font-bold uppercase tracking-widest mb-8">
              <Sparkles className="w-4 h-4" /> Planos de Estudo
            </div>

            <h1 className="text-5xl sm:text-7xl font-display font-bold mb-6 leading-tight">
              Escolha seu <br />
              <span className="gradient-text">ritmo de sucesso</span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Selecione a carga horária que melhor se adapta à sua rotina.
            </p>
          </motion.div>
        </div>

        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </section>

      <section className="pb-32 px-4 relative">
        <div className="max-w-7xl mx-auto">
          {isLoading && (
            <p className="text-center text-gray-400 mb-10">
              Carregando planos do banco de dados...
            </p>
          )}

          {loadError && (
            <div className="max-w-xl mx-auto mb-10 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-center text-red-300">
              {loadError}
            </div>
          )}

          {!isLoading && !loadError && modules.length === 0 && (
            <p className="text-center text-gray-400 mb-10">
              Nenhum módulo ativo foi encontrado.
            </p>
          )}

          <motion.div
            initial="initial"
            animate="animate"
            variants={{
              animate: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {modules.map((module, index) => (
              <ModuleCard
                key={module.id}
                module={module}
                isSelected={selectedModule === module.id}
                onSelect={() => setSelectedModule(module.id)}
                onSubscribe={() => {
                  sessionStorage.setItem('cursoAdquirido', 'ingles');
                  sessionStorage.setItem('moduloAdquirido', module.titulo);
                  navigateTo('register');
                }}
                index={index}
              />
            ))}
          </motion.div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            Dúvidas? Entre em contato com nosso suporte especializado.
          </p>

          <div className="mt-6 flex justify-center gap-6">
            {['Termos', 'Privacidade', 'Suporte'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs text-gray-600 hover:text-brand-green transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}