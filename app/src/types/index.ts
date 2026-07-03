// Tipos da Plataforma de Ensino

export type UserRole = 'professor' | 'aluno' | 'admin' | null;

export type UserStatus = 'pendente' | 'aprovado' | 'rejeitado';

export type ActivityCorrectionStatus = 'pendente' | 'em_analise' | 'correta' | 'incorreta' | 'devolvida';

export interface User {
  id: string;
  email: string;
  documento: string;
  role: UserRole;
  nome: string;
  codigo?: string; // Código único do professor (apenas para professores)
  codigoProfessor?: string; // Código informado pelo aluno no cadastro
  status: UserStatus;
  professorId?: string; // ID do professor vinculado (apenas para alunos)
  // Curso e módulo adquirido pelo aluno
  cursoAdquirido?: 'ingles' | 'enem';
  moduloAdquirido?: string; // ID do módulo (ex: "ingles-2" para 2 aulas/semana)
  dataCadastro: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'autorizacao' | 'atividade' | 'mensagem' | 'sistema' | 'correcao';
  read: boolean;
  resolved: boolean; // Nova flag para notificações resolvidas
  resolution?: 'aprovado' | 'rejeitado'; // Tipo de resolução
  createdAt: Date;
  data?: any;
}

export interface Activity {
  id: string;
  professorId: string;
  alunoId: string;
  curso: 'ingles' | 'enem';
  titulo: string;
  descricao: string;
  anexos: Attachment[];
  status: 'pendente' | 'concluida';
  correctionStatus: ActivityCorrectionStatus; // Status de correção
  correctionFeedback?: string; // Feedback do professor
  createdAt: Date;
  publishAt?: Date;
  dueAt?: Date;

  resposta?: ActivityResponse;
}

export interface Attachment {
  id: string;
  nome: string;
  tipo: 'pdf' | 'xls' | 'txt' | 'link';
  url: string;
}

export interface ActivityResponse {
  tipo: 'arquivo' | 'texto' | 'concluido';
  conteudo: string;
  arquivo?: Attachment;
  enviadoEm: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: Date;
  read: boolean;
}

export interface ChatConversation {
  alunoId: string;
  alunoNome: string;
  ultimaMensagem: string;
  dataUltimaMensagem: Date;
  naoLidas: number;
}

export interface Curso {
  id: string;
  nome: string;
  slug: 'ingles' | 'enem';
  descricao: string;
  imagem: string;
}

export interface Turma {
  id: string;
  professorId: string;
  curso: 'ingles' | 'enem';
  alunos: string[];
}

export interface EnglishModule {
  id: string;
  aulas: number;
  titulo: string;
  descricao: string;
  preco: string;
}
