import { Clock, Star, Zap, Shield, Globe } from 'lucide-react';

export const MODULES = [
  {
    id: 1, aulas: 1,
    titulo: '1 Aula Semanal',
    descricao: 'Ideal para quem tem pouco tempo disponível. Ritmo tranquilo de aprendizado.',
    preco: 'R$ 99', periodo: '/mês',
    features: ['1 aula ao vivo por semana', 'Material didático incluso', 'Suporte por email'],
    recomendado: false, icon: <Clock className="w-6 h-6" />, color: 'emerald',
  },
  {
    id: 2, aulas: 2,
    titulo: '2 Aulas Semanais',
    descricao: 'Equilíbrio perfeito entre aprendizado e prática. Nosso plano mais popular.',
    preco: 'R$ 179', periodo: '/mês',
    features: ['2 aulas ao vivo por semana', 'Material didático incluso', 'Suporte prioritário', 'Exercícios extras'],
    recomendado: true, icon: <Star className="w-6 h-6" />, color: 'lime',
  },
  {
    id: 3, aulas: 3,
    titulo: '3 Aulas Semanais',
    descricao: 'Progresso acelerado com mais tempo de prática e interação.',
    preco: 'R$ 249', periodo: '/mês',
    features: ['3 aulas ao vivo por semana', 'Material didático incluso', 'Suporte 24/7', 'Conversação em grupo'],
    recomendado: false, icon: <Zap className="w-6 h-6" />, color: 'emerald',
  },
  {
    id: 4, aulas: 4,
    titulo: '4 Aulas Semanais',
    descricao: 'Imersão no idioma com aulas quase diárias. Resultados rápidos.',
    preco: 'R$ 319', periodo: '/mês',
    features: ['4 aulas ao vivo por semana', 'Material didático incluso', 'Suporte 24/7', 'Aula particular mensal'],
    recomendado: false, icon: <Shield className="w-6 h-6" />, color: 'lime',
  },
  {
    id: 5, aulas: 5,
    titulo: '5 Aulas Semanais',
    descricao: 'Experiência completa de imersão. O caminho mais rápido para a fluência.',
    preco: 'R$ 389', periodo: '/mês',
    features: ['5 aulas ao vivo por semana', 'Material didático incluso', 'Aula particular semanal', 'Certificado prioritário'],
    recomendado: false, icon: <Globe className="w-6 h-6" />, color: 'emerald',
  },
];
