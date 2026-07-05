import { z } from 'zod';

// Brazilian CPF validation algorithm
export function validarCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/[^\d]/g, '');

  if (cleanCPF.length !== 11) return false;
  
  // Avoid common sequences like 111.111.111-11
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

  return true;
}

// Automatic CPF formatting helper (adds dots and dashes as they type)
export function formatarCPF(value: string): string {
  const cleanValue = value.replace(/[^\d]/g, '');
  if (cleanValue.length <= 3) return cleanValue;
  if (cleanValue.length <= 6) return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3)}`;
  if (cleanValue.length <= 9) return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6)}`;
  return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6, 9)}-${cleanValue.slice(9, 11)}`;
}

// Password criteria description
const passwordCriteria = "A senha deve ter pelo menos 8 caracteres, com letras maiúsculas, minúsculas, número e símbolo. Ex: Abc@1234";

// Strict password validator regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido."),
  password: z.string().min(1, "Informe sua senha."),
});

export const registerSchema = z.object({
  nome: z.string()
    .min(3, "O nome deve ter no mínimo 3 caracteres.")
    .max(100, "O nome não deve exceder 100 caracteres."),
  email: z.string().email("E-mail inválido."),
  senha: z.string().regex(passwordRegex, passwordCriteria),
  documento: z.string().refine((val) => validarCPF(val), {
    message: "CPF inválido. Verifique os 11 dígitos informados.",
  }),
});

export const settingsSchema = z.object({
  nome: z.string()
    .min(3, "O nome deve ter no mínimo 3 caracteres.")
    .max(100, "O nome não deve exceder 100 caracteres."),
  email: z.string().email("Endereço de e-mail inválido."),
  senhaAtual: z.string().optional().or(z.literal('')),
  novaSenha: z.string().optional().or(z.literal('')).refine(
    (val) => !val || passwordRegex.test(val),
    { message: passwordCriteria }
  ),
});
