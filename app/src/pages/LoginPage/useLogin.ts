import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import { loginSchema } from '@/lib/validation';
import { checkRateLimit } from '@/lib/rateLimiter';

export function useLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check rate limit first
    const limit = checkRateLimit('login', 5, 60000);
    if (!limit.allowed) {
      setError(`Muitas tentativas de login. Tente novamente em ${limit.retryAfter} segundos.`);
      return;
    }

    // Validate inputs with Zod
    const validation = loginSchema.safeParse({ email, password: senha });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    try {
      setError('');
      setIsLoading(true);

      const result = await api.login({
        email,
        password: senha,
      });

      localStorage.setItem('authSession', JSON.stringify(result.session));

      useAuthStore.setState({
        currentUser: result.user,
        isAuthenticated: true,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Erro ao fazer login',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    senha,
    setSenha,
    showPassword,
    setShowPassword,
    isLoading,
    error,
    handleSubmit,
  };
}