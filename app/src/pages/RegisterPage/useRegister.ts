import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCursorEffect } from '@/hooks/useCursorEffect';
import type { UserRole } from '@/types';

export type Step = 'curso' | 'dados';

export function useRegister() {
  const [step, setStep] = useState<Step>('curso');
  const [inglesAtivado, setInglesAtivado] = useState(false);
  const [enemAtivado, setEnemAtivado] = useState(false);
  const [moduloSelecionado, setModuloSelecionado] = useState('');
  const [preSelected, setPreSelected] = useState(false);

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [documento, setDocumento] = useState('');
  const [perfil, setPerfil] = useState<UserRole>(null);
  const [codigoProfessor, setCodigoProfessor] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [codigoValido, setCodigoValido] = useState<boolean | null>(null);
  const [validandoCodigo, setValidandoCodigo] = useState(false);

  const { register, getProfessorByCodigo } = useAuthStore();

  useCursorEffect();

  // Pre-select course from sessionStorage
  useEffect(() => {
    const curso = sessionStorage.getItem('cursoAdquirido') as 'ingles' | 'enem' | null;
    const modulo = sessionStorage.getItem('moduloAdquirido');
    if (curso) {
      if (curso === 'ingles') setInglesAtivado(true);
      if (curso === 'enem') setEnemAtivado(true);
      if (modulo) setModuloSelecionado(modulo);
      setPreSelected(true);
      setStep('dados');
    }
  }, []);

  // Validate professor code with debounce
  useEffect(() => {
    if (perfil === 'aluno' && codigoProfessor.trim().length >= 10) {
      setValidandoCodigo(true);
      const timer = setTimeout(() => {
        const professor = getProfessorByCodigo(codigoProfessor.trim().toUpperCase());
        setCodigoValido(!!professor);
        setValidandoCodigo(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setCodigoValido(null);
    }
  }, [codigoProfessor, perfil, getProfessorByCodigo]);

  const handleIsProfessor = () => {
    setPerfil('professor');
    setStep('dados');
  };

  const handleCourseNext = () => {
    setError('');
    if (!inglesAtivado && !enemAtivado) {
      setError('Selecione ao menos um curso para continuar.');
      return;
    }
    if (inglesAtivado && !moduloSelecionado) {
      setError('Selecione uma modalidade do curso de Inglês.');
      return;
    }
    setPerfil('aluno');
    setStep('dados');
  };

  const cursoAdquirido = inglesAtivado ? 'ingles' : enemAtivado ? 'enem' : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!perfil) { setError('Selecione um perfil (Professor ou Aluno)'); return; }
    if (perfil === 'aluno') {
      if (!codigoProfessor.trim()) { setError('Informe o código do professor'); return; }
      const professor = getProfessorByCodigo(codigoProfessor.trim().toUpperCase());
      if (!professor) { setError('Código do professor inválido.'); return; }
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const result = register({
      email, senha, documento, role: perfil,
      codigoProfessor: perfil === 'aluno' ? codigoProfessor.trim().toUpperCase() : undefined,
      cursoAdquirido: perfil === 'aluno' ? cursoAdquirido : undefined,
      moduloAdquirido: perfil === 'aluno' && inglesAtivado ? moduloSelecionado : undefined,
    });
    if (result.success) {
      sessionStorage.removeItem('cursoAdquirido');
      sessionStorage.removeItem('moduloAdquirido');
      setSuccess(true);
    } else {
      setError(result.message || 'Erro ao criar conta');
      setIsLoading(false);
    }
  };

  return {
    step, setStep,
    inglesAtivado, setInglesAtivado,
    enemAtivado, setEnemAtivado,
    moduloSelecionado, setModuloSelecionado,
    preSelected,
    email, setEmail,
    senha, setSenha,
    documento, setDocumento,
    perfil, setPerfil,
    codigoProfessor, setCodigoProfessor,
    showPassword, setShowPassword,
    isLoading,
    error,
    success,
    codigoValido,
    validandoCodigo,
    handleIsProfessor,
    handleCourseNext,
    handleSubmit,
  };
}
