import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/services/api';
import type { Page } from '@/App';
import logoPhd from '@/assets/logo_phd.png';

interface Props {
  navigateTo: (page: Page) => void;
}

export default function ForgotPasswordPage({
  navigateTo,
}: Props) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setError('');
      setMessage('');
      setIsLoading(true);

      const result = await api.forgotPassword(
        email.trim().toLowerCase(),
      );

      setMessage(result.message);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Não foi possível solicitar a recuperação.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.03] p-8"
      >
        <button
          type="button"
          onClick={() => navigateTo('login')}
          className="mb-8 flex items-center gap-2 text-sm text-gray-500 hover:text-brand-green"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao login
        </button>

        <img
          src={logoPhd}
          alt="PHD Escola Virtual"
          className="mb-8 h-10 w-auto"
        />

        <h1 className="text-3xl font-bold font-display">
          Recuperar senha
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Informe o e-mail da sua conta para receber o link de recuperação.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="recovery-email">E-mail</Label>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />

              <Input
                id="recovery-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="seu@email.com"
                className="h-12 rounded-xl border-white/10 bg-white/5 pl-10"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </p>
          )}

          {message && (
            <p className="rounded-xl border border-brand-green/20 bg-brand-green/10 p-3 text-sm text-brand-neon">
              {message}
            </p>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 w-full rounded-xl bg-brand-green font-bold text-black"
          >
            {isLoading
              ? 'Enviando...'
              : 'Enviar link de recuperação'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}