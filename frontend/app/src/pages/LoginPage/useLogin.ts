import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCursorEffect } from '@/hooks/useCursorEffect';

export function useLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuthStore();

  useCursorEffect();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    const result = login(email, senha);
    if (!result.success) {
      setError(result.message || 'Erro ao fazer login');
      setIsLoading(false);
    }
  };

  return {
    email, setEmail,
    senha, setSenha,
    showPassword, setShowPassword,
    isLoading,
    error,
    handleSubmit,
  };
}
