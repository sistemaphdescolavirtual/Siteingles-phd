import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Page } from '@/App';
import { useLogin } from './useLogin';
import logoPhd from '@/assets/logo_phd.png';

interface LoginPageProps {
  navigateTo: (page: Page) => void;
}

export default function LoginPage({ navigateTo }: LoginPageProps) {
  const {
    email, setEmail, senha, setSenha,
    showPassword, setShowPassword, isLoading, error,
    handleSubmit,
  } = useLogin();

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 text-white bg-[#050505] font-sans relative overflow-hidden cursor-default">
      <style>{`
        .noise-overlay { pointer-events: none !important; cursor: default !important; }
        * { cursor: inherit; }
        a, button, [role="button"] { cursor: pointer; }
        input { cursor: text; }
      `}</style>
      <div className="noise-overlay" />

      {/* Left side: Graphic/Intro */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex flex-col justify-between p-16 relative bg-gradient-to-br from-brand-black to-[#0a0a0a] border-r border-white/5"
      >
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full blur-3xl" style={{ background: 'rgba(16,185,129,0.15)' }} />
          <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(0,255,136,0.08)' }} />
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(0,255,136,0.3) 40px, rgba(0,255,136,0.3) 41px)' }} />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <div className="flex items-center gap-3 mb-10">
              <img src={logoPhd} alt="PHD" className="h-10 w-auto object-contain" />
              <span className="text-xl font-bold font-display">PHD Escola Virtual</span>
            </div>
            <h2 className="text-4xl font-bold font-display mb-4">Bem-vindo<br />de volta.</h2>
            <p className="text-gray-400 max-w-md leading-relaxed">Continue sua jornada de aprendizado.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-12 space-y-4">
            {['Acesse suas atividades e cursos', 'Comunique-se com seu professor', 'Acompanhe seu progresso'].map((text) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)' }}>
                  <div className="w-2 h-2 rounded-full bg-brand-green" />
                </div>
                <span className="text-gray-300 text-sm">{text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 lg:px-16 py-12">
        <motion.div
          initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md w-full mx-auto"
        >
          <motion.button onClick={() => navigateTo('home')} whileHover={{ x: -5 }} className="flex items-center gap-2 text-gray-500 hover:text-brand-green transition-colors mb-10 text-sm">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </motion.button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold font-display text-white mb-2">Faça seu login</h1>
            <p className="text-gray-500">Entre com suas credenciais para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-400 text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com" required
                  className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-600 rounded-xl focus:border-brand-green focus:ring-brand-green/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
  <Label
    htmlFor="senha"
    className="text-gray-400 text-sm"
  >
    Senha
  </Label>

  <button
    type="button"
    onClick={() => navigateTo('forgot-password')}
    className="text-xs font-medium text-brand-green hover:underline"
  >
    Esqueci minha senha
  </button>
</div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <Input id="senha" type={showPassword ? 'text' : 'password'} value={senha}
                  onChange={e => setSenha(e.target.value)} placeholder="••••••••" required
                  className="pl-10 pr-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-600 rounded-xl focus:border-brand-green focus:ring-brand-green/20"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl text-sm text-red-400"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </motion.div>
            )}

            <Button type="submit" disabled={isLoading}
              className="w-full h-12 font-semibold rounded-xl text-black transition-all"
              style={{ background: 'linear-gradient(135deg, #10b981, #00ff88)', boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}>
              {isLoading
                ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full" />
                : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Ainda não tem conta?{' '}
              <button onClick={() => navigateTo('register')} className="text-brand-green hover:underline font-medium">Cadastre-se</button>
            </p>
          </div>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600">
            <button
              type="button"
              onClick={() => navigateTo('terms-of-use')}
              className="hover:text-brand-green transition-colors"
            >
              Termos de Uso
            </button>

            <span>•</span>

            <button
              type="button"
              onClick={() => navigateTo('privacy-policy')}
              className="hover:text-brand-green transition-colors"
            >
              Política de Privacidade
            </button>
          </div>
          
        </motion.div>
      </div>
    </div>
  );
}
