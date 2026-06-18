const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

export interface EnglishModule {
  id: number;
  aulas: number;
  titulo: string;
  descricao: string;
  preco: string;
  periodo: string;
  recomendado: boolean;
  color: string | null;
  ativo: boolean;
  features: string[] | null;
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body?.error ??
      `A API respondeu com o código ${response.status}.`;

    throw new Error(message);
  }

  return body as T;
}

export const api = {
  health: () =>
    request<{
      ok: boolean;
      server: string;
      database: string;
    }>('/health'),

  getEnglishModules: () =>
    request<EnglishModule[]>('/modules'),
};