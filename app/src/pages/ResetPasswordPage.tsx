import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/store/authStore';
import type { Page } from '@/App';
import logoPhd from '@/assets/logo_phd.png';

interface Props {
  navigateTo: (page: Page) => void;
}

const strongPassword =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;

export default function ResetPasswordPage({
  navigateTo,
}: Props) {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!supabase) {
      setError(
        'A recuperação de senha não foi configurada no frontend.',
      );
      return;
    }

    const client = supabase;
    let active = true;

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if (
        active &&
        session &&
        [
          'PASSWORD_RECOVERY',
          'SIGNED_IN',
          'INITIAL_SESSION',
        ].includes(event)
      ) {
        setIsReady(true);
        setError('');
      }
    });

    void client.auth.getSession().then(({ data }) => {
      if (active && data.session) {
        setIsReady(true);
      }
    });

    const timeout = window.setTimeout(() => {
      void client.auth.getSession().then(({ data }) => {
        if (active && !data.session) {
          setError(
            'O link de recuperação é inválido ou expirou.',
          );
        }
      });
    }, 2500);

    return () => {
      active = false;
      window.clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!supabase || !isReady) {
      setError('O link de recuperação é inválido ou expirou.');
      return;
    }

    if (!strongPassword.test(password)) {
      setError(
        'A senha deve ter 8 caracteres, com maiúscula, minúscula, número e símbolo.',
      );
      return;
    }

    if (password !== confirmation) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      setError('');
      setIsLoading(true);

      const { error: updateError } =
        await supabase.auth.updateUser({ password });

      if (updateError) {
        throw updateError;
      }

      useAuthStore.getState().logout();
      await supabase.auth.signOut();

      window.history.replaceState(
        {},
        '',
        window.location.pathname,
      );

      setSuccess(
        'Senha alterada com sucesso. Voltando ao login...',
      );

      window.setTimeout(() => {
        navigateTo('login');
      }, 1500);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Não foi possível alterar a senha.',
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
        <img
          src={logoPhd}
          alt="PHD Escola Virtual"
          className="mb-8 h-10 w-auto"
        />

        <KeyRound className="mb-5 h-10 w-10 text-brand-neon" />

        <h1 className="text-3xl font-bold font-display">
          Criar nova senha
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Use no mínimo 8 caracteres, incluindo maiúscula, minúscula, número e símbolo.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nova senha</Label>

            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="h-12 rounded-xl border-white/10 bg-white/5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">
              Confirmar nova senha
            </Label>

            <Input
              id="confirm-password"
              type="password"
              value={confirmation}
              onChange={(event) =>
                setConfirmation(event.target.value)
              }
              required
              className="h-12 rounded-xl border-white/10 bg-white/5"
            />
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-xl border border-brand-green/20 bg-brand-green/10 p-3 text-sm text-brand-neon">
              {success}
            </p>
          )}

          <Button
            type="submit"
            disabled={!isReady || isLoading || Boolean(success)}
            className="h-12 w-full rounded-xl bg-brand-green font-bold text-black"
          >
            {isLoading ? 'Alterando...' : 'Salvar nova senha'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}