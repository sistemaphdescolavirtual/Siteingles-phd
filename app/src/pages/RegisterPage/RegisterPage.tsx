import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Mail,
  Lock,
  FileText,
  User,
  Check,
  X,
  Target,
  Globe,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Page } from '@/App';

import { useRegister } from './useRegister';
import { CourseCard } from './components/CourseCard';
import { MODULOS_INGLES, MODULOS_ENEM } from './constants';

interface RegisterPageProps {
  navigateTo: (page: Page) => void;
}

export default function RegisterPage({ navigateTo }: RegisterPageProps) {
  const {
    step,
    setStep,

    inglesAtivado,
    setInglesAtivado,

    enemAtivado,
    setEnemAtivado,

    moduloSelecionado,
    setModuloSelecionado,

    preSelected,
    perfil,

    nome,
    setNome,

    email,
    setEmail,

    senha,
    setSenha,

    documento,
    setDocumento,

    codigoProfessor,
    setCodigoProfessor,

    showPassword,
    setShowPassword,

    isLoading,
    error,
    success,

    codigoValido,
    validandoCodigo,

    handleIsProfessor,
    handleCourseNext,
    handleSubmit,
  } = useRegister();

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4 relative overflow-hidden">
        <div className="noise-overlay" />

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center relative z-10 p-12 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-xl"
        >
          <div className="w-20 h-20 bg-brand-green/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-green/30">
            <Check className="w-10 h-10 text-brand-green" />
          </div>

          <h2 className="text-3xl font-bold font-display text-white mb-3">
            {perfil === 'professor'
              ? 'Bem-vindo, Professor!'
              : 'Cadastro realizado!'}
          </h2>

          <p className="text-gray-400 max-w-xs mx-auto">
            {perfil === 'professor'
              ? 'Redirecionando para sua área...'
              : 'Aguarde a aprovação do professor.'}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex text-white font-sans selection:bg-brand-green selection:text-black">
      <div className="noise-overlay" />

      {/* Left Side */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #0d1f15 100%)',
        }}
      >
        <div className="absolute inset-0">
          <div
            className="absolute top-20 right-20 w-64 h-64 rounded-full blur-3xl"
            style={{ background: 'rgba(16,185,129,0.15)' }}
          />

          <div
            className="absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl"
            style={{ background: 'rgba(0,255,136,0.08)' }}
          />

          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(0,255,136,0.3) 40px, rgba(0,255,136,0.3) 41px)',
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-10">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  border: '1px solid rgba(0,255,136,0.3)',
                  background: 'rgba(0,255,136,0.1)',
                }}
              >
                <span className="text-xl font-bold gradient-text">G</span>
              </div>

              <span className="text-xl font-bold font-display">
                GuiEnglish
              </span>
            </div>

            <h2 className="text-4xl font-bold font-display mb-4 leading-tight">
              Comece sua
              <br />
              <span className="gradient-text">jornada épica.</span>
            </h2>

            <p className="text-gray-400 max-w-md leading-relaxed">
              Crie sua conta e tenha acesso a cursos de qualidade.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 space-y-4"
          >
            {[
              { text: 'Escolha seu curso ideal', active: step === 'curso' },
              { text: 'Preencha seus dados pessoais', active: step === 'dados' },
              { text: 'Acesse sua área exclusiva', active: false },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    item.active
                      ? 'bg-brand-green/40 border-brand-green'
                      : 'bg-white/5 border-white/10'
                  }`}
                  style={{ border: '1px solid' }}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.active ? 'bg-brand-green' : 'bg-gray-700'
                    }`}
                  />
                </div>

                <span
                  className={`text-sm transition-colors ${
                    item.active ? 'text-white font-medium' : 'text-gray-500'
                  }`}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 lg:px-16 py-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.3,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="max-w-md w-full mx-auto"
        >
          <motion.button
            onClick={() => {
              if (step === 'dados' && !preSelected && perfil !== 'professor') {
                setStep('curso');
              } else {
                navigateTo('home');
              }
            }}
            whileHover={{ x: -5 }}
            className="flex items-center gap-2 text-gray-500 hover:text-brand-green transition-colors mb-10 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />

            {step === 'dados' && !preSelected && perfil !== 'professor'
              ? 'Voltar'
              : 'Voltar para início'}
          </motion.button>

          <AnimatePresence mode="wait">
            {step === 'curso' ? (
              <motion.div
                key="step-curso"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold font-display text-white mb-2">
                    Escolha seu curso
                  </h1>

                  <p className="text-gray-500">
                    Selecione o que você deseja estudar
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <CourseCard
                    title="ENEM"
                    icon={<Target className="w-5 h-5" />}
                    active={enemAtivado}
                    onClick={() => {
                      setEnemAtivado(true);
                      setInglesAtivado(false);
                      setModuloSelecionado('');
                    }}
                  />

                  <CourseCard
                    title="Inglês"
                    icon={<Globe className="w-5 h-5" />}
                    active={inglesAtivado}
                    onClick={() => {
                      setInglesAtivado(true);
                      setEnemAtivado(false);
                      setModuloSelecionado('');
                    }}
                  />
                </div>

                {(inglesAtivado || enemAtivado) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-8 space-y-3"
                  >
                    <Label className="text-gray-400 text-xs uppercase tracking-wider">
                      {inglesAtivado ? 'Modalidade de Inglês' : 'Modalidade ENEM'}
                    </Label>

                    <RadioGroup
                      value={moduloSelecionado}
                      onValueChange={setModuloSelecionado}
                      className="grid gap-2"
                    >
                      {(inglesAtivado ? MODULOS_INGLES : MODULOS_ENEM).map(
                        (mod) => (
                          <label
                            key={mod.id}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                              moduloSelecionado === mod.id
                                ? 'bg-brand-green/10 border-brand-green/50'
                                : 'bg-white/5 border-white/10 hover:border-white/20'
                            }`}
                          >
                            <div className="flex flex-col">
                              <span
                                className={`text-sm font-bold ${
                                  moduloSelecionado === mod.id
                                    ? 'text-brand-green'
                                    : 'text-white'
                                }`}
                              >
                                {mod.label}
                              </span>

                              <span className="text-[10px] text-gray-500">
                                {mod.desc}
                              </span>
                            </div>

                            <RadioGroupItem value={mod.id} className="sr-only" />

                            {moduloSelecionado === mod.id && (
                              <Check className="w-4 h-4 text-brand-green" />
                            )}
                          </label>
                        ),
                      )}
                    </RadioGroup>
                  </motion.div>
                )}

                {error && (
                  <div className="mb-4 p-3 rounded-xl text-xs text-red-400 bg-red-400/10 border border-red-400/20">
                    {error}
                  </div>
                )}

                <div className="space-y-3">
                  <Button
                    onClick={handleCourseNext}
                    className="w-full h-12 font-semibold rounded-xl text-black"
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #00ff88)',
                      boxShadow: '0 0 20px rgba(16,185,129,0.3)',
                    }}
                  >
                    Continuar para Cadastro
                  </Button>

                  <button
                    onClick={handleIsProfessor}
                    className="w-full h-12 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Sou Professor
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step-dados"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold font-display text-white mb-2">
                    {perfil === 'professor'
                      ? 'Cadastro Professor'
                      : 'Seus Dados'}
                  </h1>

                  <p className="text-gray-500">
                    Complete as informações para criar sua conta
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-gray-400 text-sm">
                      Nome completo
                    </Label>

                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />

                      <Input
                        value={nome}
                        onChange={e => setNome(e.target.value)}
                        placeholder="Seu nome completo"
                        required
                        className="pl-10 h-12 bg-white/5 border-white/10 text-white rounded-xl focus:border-brand-green"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-400 text-sm">
                      Email
                    </Label>

                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />

                      <Input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        required
                        className="pl-10 h-12 bg-white/5 border-white/10 text-white rounded-xl focus:border-brand-green"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-400 text-sm">
                      Senha
                    </Label>

                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />

                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={senha}
                        onChange={e => setSenha(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="pl-10 pr-10 h-12 bg-white/5 border-white/10 text-white rounded-xl focus:border-brand-green"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-400 text-sm">
                      CPF ou Documento
                    </Label>

                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />

                      <Input
                        value={documento}
                        onChange={e => setDocumento(e.target.value)}
                        placeholder="000.000.000-00"
                        required
                        className="pl-10 h-12 bg-white/5 border-white/10 text-white rounded-xl focus:border-brand-green"
                      />
                    </div>
                  </div>

                  {perfil !== 'professor' && (
                    <div className="space-y-2">
                      <Label className="text-gray-400 text-sm">
                        Código do Professor
                      </Label>

                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />

                        <Input
                          value={codigoProfessor}
                          onChange={e =>
                            setCodigoProfessor(e.target.value.toUpperCase())
                          }
                          placeholder="PROF-SIODGN"
                          required
                          className={`pl-10 pr-10 h-12 bg-white/5 border-white/10 text-white rounded-xl focus:border-brand-green ${
                            codigoValido === false ? 'border-red-500/50' : ''
                          }`}
                        />

                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {validandoCodigo ? (
                            <div className="w-4 h-4 border-2 border-brand-green/30 border-t-brand-green rounded-full animate-spin" />
                          ) : codigoValido === true ? (
                            <Check className="w-4 h-4 text-brand-green" />
                          ) : codigoValido === false ? (
                            <X className="w-4 h-4 text-red-500" />
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 rounded-xl text-sm text-red-400 bg-red-400/10 border border-red-400/20">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 font-semibold rounded-xl text-black"
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #00ff88)',
                      boxShadow: '0 0 20px rgba(16,185,129,0.3)',
                    }}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full"
                      />
                    ) : (
                      'Finalizar Cadastro'
                    )}
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Já tem uma conta?{' '}
              <button
                onClick={() => navigateTo('login')}
                className="text-brand-green hover:underline font-medium"
              >
                Faça login
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
