export const NAV_LINKS = [
  ['sobre', 'Sobre'],
  ['diferenciais', 'Diferenciais'],
  ['cursos', 'Cursos'],
  ['contato', 'Contato'],
] as const;

export const MARQUEE_ITEMS = [
  'APRENDA INGLÊS', 'DOMINE O ENEM', 'TRANSFORME SEU FUTURO', 'CERTIFICAÇÃO MEC',
  'APRENDA INGLÊS', 'DOMINE O ENEM', 'TRANSFORME SEU FUTURO', 'CERTIFICAÇÃO MEC',
];

export const HERO_STATS = [
  { icon: 'users',  value: '10k+', label: 'Alunos formados',   color: 'emerald', delay: '0ms'   },
  { icon: 'play',   value: '500+', label: 'Aulas disponíveis', color: 'emerald', delay: '100ms' },
  { icon: 'trophy', value: '98%',  label: 'Taxa de aprovação', color: 'emerald', delay: '200ms', featured: true },
  { icon: 'globe',  value: '15+',  label: 'Países alcançados', color: 'lime',    delay: '300ms' },
];

export const FLOATING_CARDS = [
  {
    pos: 'top-32 right-0 md:right-8',
    delay: '0s',
    icon: 'book',
    value: '500+ Aulas',
    label: 'Conteúdo exclusivo',
    color: 'emerald',
    gradient: 'from-emerald-500 to-lime-400',
    iconColor: 'text-black',
    solid: true,
  },
  {
    pos: 'top-[30%] left-12 md:left-16',
    delay: '0.5s',
    icon: 'trophy',
    value: 'Top Alunos',
    label: 'Ranking semanal',
    color: 'emerald',
    gradient: 'from-emerald-500/20 to-emerald-500/5',
    iconColor: 'text-emerald-500',
    solid: false,
  },
  {
    pos: 'bottom-20 left-0 md:left-4',
    delay: '1s',
    icon: 'award',
    value: '98% Aprovação',
    label: 'Resultados reais',
    color: 'emerald',
    gradient: 'from-emerald-500/20 to-emerald-500/5',
    iconColor: 'text-emerald-500',
    solid: false,
  },
  {
    pos: 'bottom-8 right-4 md:right-12',
    delay: '2s',
    icon: 'users',
    value: '10k+ Alunos',
    label: 'Comunidade ativa',
    color: 'lime',
    gradient: 'from-lime-400/20 to-emerald-500/5',
    iconColor: 'text-lime-400',
    solid: false,
    hideMobile: true,
  },
];

export const INSTITUTIONAL_CARDS = [
  { pos: 'top-8 right-0 md:right-8',     delay: '0s',   icon: 'users', value: '+10.000', label: 'Alunos formados',   color: 'emerald' },
  { pos: 'bottom-24 left-0 md:left-4',   delay: '1.5s', icon: 'award', value: '98%',     label: 'Taxa de aprovação', color: 'lime'    },
  { pos: 'bottom-8 right-4 md:right-12', delay: '3s',   icon: 'globe', value: '+500',    label: 'Aulas disponíveis', color: 'emerald' },
];

export const FEATURES_GRID = [
  { icon: 'users', title: 'Turmas Reduzidas',  desc: 'Atenção individualizada' },
  { icon: 'book',  title: 'Material Exclusivo', desc: 'Conteúdo 100% próprio'  },
];

export const BENTO_CARDS = [
  { icon: 'monitor', title: 'Plataforma IA', desc: 'Correção automática de pronúncia com inteligência artificial em tempo real.', delay: '100ms' },
  { icon: 'clock',   title: 'Acesso 24/7',   desc: 'Estude quando e onde quiser. Conteúdo disponível permanentemente.',           delay: '200ms' },
];

export const CONTACT_INFO = [
  { icon: 'phone', label: 'WhatsApp', value: '(11) 99999-9999'        },
  { icon: 'mail',  label: 'E-mail',   value: 'contato@guienglish.com' },
  { icon: 'map',   label: 'Endereço', value: 'São Paulo, SP - Brasil'  },
];

export const CONTACT_FIELDS = [
  { id: 'name',  type: 'text',  label: 'Nome completo' },
  { id: 'email', type: 'email', label: 'E-mail'        },
];
