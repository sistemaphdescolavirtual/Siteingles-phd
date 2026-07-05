import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types';
import { api } from '@/services/api';
import { registerSchema, formatarCPF } from '@/lib/validation';
import { checkRateLimit } from '@/lib/rateLimiter';

export type Step = 'curso' | 'dados';

export function useRegister() {
  const [step, setStep] = useState<Step>('curso');
  const [inglesAtivado, setInglesAtivado] = useState(false);
  const [enemAtivado, setEnemAtivado] = useState(false);
  const [moduloSelecionado, setModuloSelecionado] = useState('');
  const [preSelected, setPreSelected] = useState(false);

  const [nome, setNome] = useState('');
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

  useEffect(() => {
    const curso = sessionStorage.getItem('cursoAdquirido') as 'ingles' | 'enem' | null;
    const modulo = sessionStorage.getItem('moduloAdquirido');

   if (curso) {
  if (curso === 'ingles') setInglesAtivado(true);
  if (curso === 'enem') setEnemAtivado(true);
  if (modulo) setModuloSelecionado(modulo);

  setPerfil('aluno');
  setPreSelected(true);
  setStep('dados');
}
  }, []);

  useEffect(() => {
    if (perfil !== 'aluno') {
      setCodigoValido(null);
      return;
    }

    const codigo = codigoProfessor.trim().toUpperCase();

    if (codigo.length < 10) {
      setCodigoValido(null);
      return;
    }

    let ativo = true;

    async function validarCodigo() {
      try {
        setValidandoCodigo(true);

        await api.validateProfessorCode(codigo);

        if (ativo) {
          setCodigoValido(true);
        }
      } catch {
        if (ativo) {
          setCodigoValido(false);
        }
      } finally {
        if (ativo) {
          setValidandoCodigo(false);
        }
      }
    }

    const timer = setTimeout(() => {
      void validarCodigo();
    }, 500);

    return () => {
      ativo = false;
      clearTimeout(timer);
    };
  }, [codigoProfessor, perfil]);

const handleIsProfessor = () => {
  setError('');

  sessionStorage.removeItem('cursoAdquirido');
  sessionStorage.removeItem('moduloAdquirido');

  setInglesAtivado(false);
  setEnemAtivado(false);
  setModuloSelecionado('');
  setCodigoProfessor('');
  setCodigoValido(null);

  setPerfil('professor');
  setPreSelected(false);
  setStep('dados');
};

  const handleCourseNext = () => {
    setError('');


if (!inglesAtivado && !enemAtivado) {
  setError('Selecione ao menos um curso para continuar.');
  return;
}

if ((inglesAtivado || enemAtivado) && !moduloSelecionado) {
  setError('Selecione uma modalidade para continuar.');
  return;
}


    setPerfil('aluno');
    setStep('dados');
  };

  const cursoAdquirido = inglesAtivado
    ? 'ingles'
    : enemAtivado
      ? 'enem'
      : undefined;

  const handleDocumentoChange = (value: string) => {
    setDocumento(formatarCPF(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check rate limit
    const limit = checkRateLimit('register', 5, 60000);
    if (!limit.allowed) {
      setError(`Muitas tentativas de cadastro. Tente novamente em ${limit.retryAfter} segundos.`);
      return;
    }

    try {
      setError('');

      if (!perfil) {
        setError('Selecione um perfil (Professor ou Aluno).');
        return;
      }

      // Validate with Zod
      const validation = registerSchema.safeParse({ nome, email, senha, documento });
      if (!validation.success) {
        setError(validation.error.issues[0].message);
        return;
      }

      if (perfil === 'aluno' && !codigoProfessor.trim()) {
        setError('Informe o código do professor.');
        return;
      }

      setIsLoading(true);

      const result = await api.register({
        nome: nome.trim(),
        email: email.trim(),
        password: senha,
        documento: documento.trim(),
        role: perfil === 'professor' ? 'professor' : 'aluno',
        codigoProfessor:
          perfil === 'aluno'
            ? codigoProfessor.trim().toUpperCase()
            : undefined,
        cursoAdquirido:
          perfil === 'aluno'
            ? cursoAdquirido
            : undefined,
        moduloAdquirido:
          perfil === 'aluno' 
            ? moduloSelecionado
            : undefined,
      });

      sessionStorage.removeItem('cursoAdquirido');
      sessionStorage.removeItem('moduloAdquirido');

      useAuthStore.setState({
        currentUser: result.user,
        isAuthenticated: true,
      });

      setSuccess(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Erro ao criar conta',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    step,
    setStep,
    inglesAtivado,
    setInglesAtivado,
    enemAtivado,
    setEnemAtivado,
    moduloSelecionado,
    setModuloSelecionado,
    preSelected,
    nome,
    setNome,
    email,
    setEmail,
    senha,
    setSenha,
    documento,
    setDocumento,
    handleDocumentoChange,
    perfil,
    setPerfil,
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
  };
}
