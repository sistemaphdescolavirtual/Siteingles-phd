import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCursorEffect } from '@/hooks/useCursorEffect';
import { api } from '@/services/api';

export function useLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useCursorEffect();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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