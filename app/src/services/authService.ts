/**
 * Auth Service — módulo isolado de autenticação admin.
 * Substitua este arquivo por integração real com backend sem tocar em nenhum componente.
 *
 * Credenciais via variáveis de ambiente (.env):
 *   VITE_ADMIN_EMAIL=admin@phdescolavirtual.com.br
 *   VITE_ADMIN_PASSWORD=admin123
 */

interface AdminCredentials {
  email: string;
  password: string;
  role: 'admin';
}

interface AuthResult {
  email: string;
  role: 'admin';
  token: string;
  nome: string;
}

const ADMIN: AdminCredentials = {
  email: import.meta.env.VITE_ADMIN_EMAIL ?? 'admin@phdescolavirtual.com.br',
  password: import.meta.env.VITE_ADMIN_PASSWORD ?? 'admin123',
  role: 'admin',
};

export function adminLogin(email: string, password: string): AuthResult {
  if (email === ADMIN.email && password === ADMIN.password) {
    return {
      email: ADMIN.email,
      role: 'admin',
      token: 'fake-jwt-admin-token',
      nome: 'Administrador',
    };
  }
  throw new Error('Credenciais inválidas');
}

export function isAdminToken(token: string | null): boolean {
  return token === 'fake-jwt-admin-token';
}
