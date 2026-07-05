import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole, Notification, Activity, ChatMessage, UserStatus, ActivityCorrectionStatus, ChatConversation } from '@/types';

interface AuthState {
  // User state
  currentUser: User | null;
  isAuthenticated: boolean;
  
  // Data stores
  users: User[];
  notifications: Notification[];
  activities: Activity[];
  messages: ChatMessage[];
  
  // Actions
  login: (email: string, senha: string) => { success: boolean; message?: string };
  loginAdmin: (email: string, senha: string) => { success: boolean; message?: string };
  register: (userData: Partial<User> & { email: string; senha: string; documento: string; role: UserRole; codigoProfessor?: string; cursoAdquirido?: 'ingles' | 'enem'; moduloAdquirido?: string }) => { success: boolean; message?: string };
  logout: () => void;
  
  // Professor actions
  aprovarAluno: (alunoId: string) => void;
  rejeitarAluno: (alunoId: string) => void;
  criarAtividade: (atividade: Omit<Activity, 'id' | 'createdAt' | 'status' | 'correctionStatus'>) => void;
  corrigirAtividade: (atividadeId: string, status: ActivityCorrectionStatus, feedback?: string) => void;
  
  // Aluno actions
  responderAtividade: (atividadeId: string, resposta: any) => void;
  enviarMensagem: (receiverId: string, mensagem: string) => void;
  
  // Notification actions
  markNotificationAsRead: (notificationId: string) => void;
  markNotificationAsResolved: (notificationId: string, resolution: 'aprovado' | 'rejeitado') => void;
  getUnreadNotifications: (userId: string) => Notification[];
  getPendingNotifications: (userId: string) => Notification[];
  getResolvedNotifications: (userId: string) => Notification[];
  
  // Getters
  getAlunosByProfessor: (professorId: string) => User[];
  getAtividadesByAluno: (alunoId: string) => Activity[];
  getAtividadesByProfessor: (professorId: string) => Activity[];
  getMensagensByAluno: (alunoId: string, professorId: string) => ChatMessage[];
  getConversasByProfessor: (professorId: string) => ChatConversation[];
  getProfessorByCodigo: (codigo: string) => User | undefined;
  getProfessorCode: (professorId: string) => string | undefined;
  getAlunoById: (alunoId: string) => User | undefined;
  getAllProfessores: () => User[];
  getAllAlunos: () => User[];
  getAllAtividades: () => Activity[];
}

// Generate unique code for professor - formato: PROF-XXXXXX
const generateProfessorCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'PROF-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Check if code already exists
const isCodeUnique = (code: string, users: User[]): boolean => {
  return !users.some(u => u.role === 'professor' && u.codigo === code);
};

// Generate unique code
const generateUniqueCode = (users: User[]): string => {
  let code = generateProfessorCode();
  while (!isCodeUnique(code, users)) {
    code = generateProfessorCode();
  }
  return code;
};

// Mock initial data - Professor com código pré-gerado
const mockProfessor: User = {
  id: 'prof-1',
  email: 'professor@phdescolavirtual.com.br',
  documento: '123.456.789-00',
  role: 'professor',
  nome: 'Prof. Ana Silva',
  codigo: 'PROF-A1B2C3',
  status: 'aprovado',
  dataCadastro: new Date(),
};

// Mock admin — substituir por lookup de API no futuro
const mockAdmin: User = {
  id: 'admin-1',
  email: (import.meta as any).env?.VITE_ADMIN_EMAIL ?? 'admin@phdescolavirtual.com.br',
  documento: '000.000.000-00',
  role: 'admin',
  nome: 'Administrador',
  status: 'aprovado',
  dataCadastro: new Date(),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      users: [mockProfessor, mockAdmin],
      notifications: [],
      activities: [],
      messages: [],

      login: (email, _senha) => {
        const { users } = get();
        const user = users.find(u => u.email === email);
        
        if (!user) {
          return { success: false, message: 'Usuário não encontrado' };
        }
        
        set({ currentUser: user, isAuthenticated: true });
        return { success: true };
      },

      loginAdmin: (email: string, senha: string) => {
        const { VITE_ADMIN_EMAIL, VITE_ADMIN_PASSWORD } = (import.meta as any).env ?? {};
        const adminEmail = VITE_ADMIN_EMAIL ?? 'admin@phdescolavirtual.com.br';
        const adminPassword = VITE_ADMIN_PASSWORD ?? 'admin123';
        if (email !== adminEmail || senha !== adminPassword) {
          return { success: false, message: 'Credenciais inválidas' };
        }
        const { users } = get();
        const adminUser = users.find(u => u.role === 'admin' && u.email === adminEmail);
        if (adminUser) {
          set({ currentUser: adminUser, isAuthenticated: true });
          return { success: true };
        }
        return { success: false, message: 'Usuário admin não encontrado' };
      },

      register: (userData) => {
        const { users } = get();
        
        if (users.some(u => u.email === userData.email)) {
          return { success: false, message: 'Email já cadastrado' };
        }

        // If student, validate professor code
        if (userData.role === 'aluno' && userData.codigoProfessor) {
          const professor = users.find(u => u.role === 'professor' && u.codigo === userData.codigoProfessor);
          
          if (!professor) {
            return { success: false, message: 'Código do professor inválido' };
          }

          const newUser: User = {
            id: `user-${Date.now()}`,
            email: userData.email,
            documento: userData.documento,
            role: userData.role,
            nome: userData.email.split('@')[0],
            codigoProfessor: userData.codigoProfessor,
            status: 'pendente',
            professorId: professor.id,
            cursoAdquirido: userData.cursoAdquirido,
            moduloAdquirido: userData.moduloAdquirido,
            dataCadastro: new Date(),
          };

          set({ users: [...users, newUser] });

          // Create notification for professor
          const notification: Notification = {
            id: `notif-${Date.now()}`,
            userId: professor.id,
            title: 'Novo aluno aguardando aprovação',
            message: `${newUser.nome} solicitou acesso à plataforma${userData.cursoAdquirido ? ` para o curso de ${userData.cursoAdquirido === 'ingles' ? 'Inglês' : 'ENEM'}` : ''}.`,
            type: 'autorizacao',
            read: false,
            resolved: false,
            createdAt: new Date(),
            data: { alunoId: newUser.id, curso: userData.cursoAdquirido },
          };
          set(state => ({ notifications: [...state.notifications, notification] }));

          set({ currentUser: newUser, isAuthenticated: true });
          return { success: true };
        }

        // Create professor with generated code
        if (userData.role === 'professor') {
          const uniqueCode = generateUniqueCode(users);
          
          const newUser: User = {
            id: `prof-${Date.now()}`,
            email: userData.email,
            documento: userData.documento,
            role: userData.role,
            nome: userData.email.split('@')[0],
            codigo: uniqueCode,
            status: 'aprovado',
            dataCadastro: new Date(),
          };

          set({ users: [...users, newUser] });
          set({ currentUser: newUser, isAuthenticated: true });
          return { success: true };
        }

        return { success: false, message: 'Perfil inválido' };
      },

      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
      },

      aprovarAluno: (alunoId) => {
        const { users } = get();
        const updatedUsers = users.map(u => 
          u.id === alunoId ? { ...u, status: 'aprovado' as UserStatus } : u
        );
        set({ users: updatedUsers });

        // Create notification for student
        const notification: Notification = {
          id: `notif-${Date.now()}`,
          userId: alunoId,
          title: 'Aprovação concedida!',
          message: 'Você foi aprovado e agora tem acesso completo à plataforma.',
          type: 'sistema',
          read: false,
          resolved: false,
          createdAt: new Date(),
        };
        set(state => ({ notifications: [...state.notifications, notification] }));
      },

      rejeitarAluno: (alunoId) => {
        const { users } = get();
        const updatedUsers = users.map(u => 
          u.id === alunoId ? { ...u, status: 'rejeitado' as UserStatus } : u
        );
        set({ users: updatedUsers });

        // Create notification for student
        const notification: Notification = {
          id: `notif-${Date.now()}`,
          userId: alunoId,
          title: 'Solicitação rejeitada',
          message: 'Infelizmente sua solicitação foi rejeitada. Entre em contato com o suporte.',
          type: 'sistema',
          read: false,
          resolved: false,
          createdAt: new Date(),
        };
        set(state => ({ notifications: [...state.notifications, notification] }));
      },

      criarAtividade: (atividade) => {
        const newActivity: Activity = {
          ...atividade,
          id: `act-${Date.now()}`,
          createdAt: new Date(),
          status: 'pendente',
          correctionStatus: 'pendente',
        };
        set(state => ({ activities: [...state.activities, newActivity] }));

        // Create notification for student
        const notification: Notification = {
          id: `notif-${Date.now()}`,
          userId: atividade.alunoId,
          title: 'Nova atividade atribuída',
          message: `Você recebeu uma nova atividade: ${atividade.titulo}`,
          type: 'atividade',
          read: false,
          resolved: false,
          createdAt: new Date(),
          data: { atividadeId: newActivity.id },
        };
        set(state => ({ notifications: [...state.notifications, notification] }));
      },

      corrigirAtividade: (atividadeId, status, feedback) => {
        const { activities } = get();
        const updatedActivities = activities.map(a => 
          a.id === atividadeId 
            ? { ...a, correctionStatus: status, correctionFeedback: feedback } 
            : a
        );
        set({ activities: updatedActivities });

        // Create notification for student
        const atividade = activities.find(a => a.id === atividadeId);
        if (atividade) {
          const statusText = status === 'correta' ? 'correta' : status === 'incorreta' ? 'incorreta' : 'devolvida para correção';
          const notification: Notification = {
            id: `notif-${Date.now()}`,
            userId: atividade.alunoId,
            title: 'Atividade corrigida',
            message: `Sua atividade "${atividade.titulo}" foi ${statusText}.${feedback ? ` Feedback: ${feedback}` : ''}`,
            type: 'correcao',
            read: false,
            resolved: false,
            createdAt: new Date(),
            data: { atividadeId, status, feedback },
          };
          set(state => ({ notifications: [...state.notifications, notification] }));
        }
      },

      responderAtividade: (atividadeId, resposta) => {
        const { activities } = get();
        const updatedActivities = activities.map(a => 
          a.id === atividadeId 
            ? { ...a, resposta, status: 'concluida' as const, correctionStatus: 'em_analise' as ActivityCorrectionStatus } 
            : a
        );
        set({ activities: updatedActivities });

        // Notify professor
        const atividade = activities.find(a => a.id === atividadeId);
        if (atividade) {
          const notification: Notification = {
            id: `notif-${Date.now()}`,
            userId: atividade.professorId,
            title: 'Atividade respondida',
            message: `O aluno enviou uma resposta para a atividade "${atividade.titulo}".`,
            type: 'atividade',
            read: false,
            resolved: false,
            createdAt: new Date(),
            data: { atividadeId, alunoId: atividade.alunoId },
          };
          set(state => ({ notifications: [...state.notifications, notification] }));
        }
      },

      enviarMensagem: (receiverId, mensagem) => {
        const { currentUser } = get();
        if (!currentUser) return;

        const newMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          senderId: currentUser.id,
          receiverId: receiverId,
          message: mensagem,
          createdAt: new Date(),
          read: false,
        };
        set(state => ({ messages: [...state.messages, newMessage] }));

        // Create notification for receiver
        const notification: Notification = {
          id: `notif-${Date.now()}`,
          userId: receiverId,
          title: 'Nova mensagem',
          message: `${currentUser.nome} enviou uma mensagem.`,
          type: 'mensagem',
          read: false,
          resolved: false,
          createdAt: new Date(),
        };
        set(state => ({ notifications: [...state.notifications, notification] }));
      },

      markNotificationAsRead: (notificationId) => {
        const { notifications } = get();
        const updatedNotifications = notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        );
        set({ notifications: updatedNotifications });
      },

      markNotificationAsResolved: (notificationId, resolution) => {
        const { notifications } = get();
        const updatedNotifications = notifications.map(n => 
          n.id === notificationId ? { ...n, resolved: true, resolution } : n
        );
        set({ notifications: updatedNotifications });
      },

      getUnreadNotifications: (userId) => {
        const { notifications } = get();
        return notifications.filter(n => n.userId === userId && !n.read);
      },

      getPendingNotifications: (userId) => {
        const { notifications } = get();
        return notifications.filter(n => n.userId === userId && !n.resolved).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      },

      getResolvedNotifications: (userId) => {
        const { notifications } = get();
        return notifications.filter(n => n.userId === userId && n.resolved).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      },

      getAlunosByProfessor: (professorId) => {
        const { users } = get();
        return users.filter(u => 
          u.role === 'aluno' && u.professorId === professorId && u.status === 'aprovado'
        );
      },

      getAtividadesByAluno: (alunoId) => {
        const { activities } = get();
        return activities.filter(a => a.alunoId === alunoId);
      },

      getAtividadesByProfessor: (professorId) => {
        const { activities } = get();
        return activities.filter(a => a.professorId === professorId);
      },

      getMensagensByAluno: (alunoId, professorId) => {
        const { messages } = get();
        return messages.filter(m => 
          (m.senderId === alunoId && m.receiverId === professorId) ||
          (m.senderId === professorId && m.receiverId === alunoId)
        ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      },

      getConversasByProfessor: (professorId) => {
        const { messages, users } = get();
        const alunos = users.filter(u => u.role === 'aluno' && u.professorId === professorId);
        
        return alunos.map(aluno => {
          const msgs = messages.filter(m => 
            (m.senderId === aluno.id && m.receiverId === professorId) ||
            (m.senderId === professorId && m.receiverId === aluno.id)
          ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

          const ultima = msgs[0];
          const naoLidas = msgs.filter(m => m.receiverId === professorId && !m.read).length;

          return {
            alunoId: aluno.id,
            alunoNome: aluno.nome,
            ultimaMensagem: ultima?.message || '',
            dataUltimaMensagem: ultima?.createdAt || new Date(),
            naoLidas,
          };
        }).filter(c => c.ultimaMensagem).sort((a, b) => b.dataUltimaMensagem.getTime() - a.dataUltimaMensagem.getTime());
      },

      getProfessorByCodigo: (codigo) => {
        const { users } = get();
        return users.find(u => u.role === 'professor' && u.codigo === codigo);
      },

      getProfessorCode: (professorId) => {
        const { users } = get();
        const professor = users.find(u => u.id === professorId && u.role === 'professor');
        return professor?.codigo;
      },

      getAlunoById: (alunoId) => {
        const { users } = get();
        return users.find(u => u.id === alunoId && u.role === 'aluno');
      },

      getAllProfessores: () => {
        const { users } = get();
        return users.filter(u => u.role === 'professor');
      },

      getAllAlunos: () => {
        const { users } = get();
        return users.filter(u => u.role === 'aluno');
      },

      getAllAtividades: () => {
        const { activities } = get();
        return activities;
      },
    }),
    {
    name: 'phdescolavirtual-storage',
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const toDate = (v: any) => v ? new Date(v) : v;
        state.notifications = state.notifications.map(n => ({ ...n, createdAt: toDate(n.createdAt) }));
        state.activities = state.activities.map(a => ({ ...a, createdAt: toDate(a.createdAt) }));
        state.messages = state.messages.map(m => ({ ...m, createdAt: toDate(m.createdAt) }));
        state.users = state.users.map(u => ({ ...u, dataCadastro: toDate(u.dataCadastro) }));
      
        // Garante que mockAdmin sempre existe, mesmo em estados persistidos antigos
        const temAdmin = state.users.some(u => u.role === 'admin');
        if (!temAdmin) {
          state.users.push({
            id: 'admin-1',
            email: 'admin@phdescolavirtual.com.br',
            documento: '000.000.000-00',
            role: 'admin',
            nome: 'Administrador',
            status: 'aprovado',
            dataCadastro: new Date(),
          });
        }
      }
    }
  )
);
