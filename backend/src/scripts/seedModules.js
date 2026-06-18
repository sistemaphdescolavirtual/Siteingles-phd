import 'dotenv/config';

import { supabase } from '../config/supabase.js';

const modules = [
  {
    aulas: 1,
    titulo: '1 Aula Semanal',
    descricao: 'Ideal para quem tem pouco tempo disponível. Ritmo tranquilo de aprendizado.',
    preco: 'R$ 99',
    periodo: '/mês',
    recomendado: false,
    color: 'emerald',
    ativo: true,
    features: [
      '1 aula ao vivo por semana',
      'Material didático incluso',
      'Suporte por email',
    ],
  },
  {
    aulas: 2,
    titulo: '2 Aulas Semanais',
    descricao: 'Equilíbrio perfeito entre aprendizado e prática. Nosso plano mais popular.',
    preco: 'R$ 179',
    periodo: '/mês',
    recomendado: true,
    color: 'lime',
    ativo: true,
    features: [
      '2 aulas ao vivo por semana',
      'Material didático incluso',
      'Suporte prioritário',
      'Exercícios extras',
    ],
  },
  {
    aulas: 3,
    titulo: '3 Aulas Semanais',
    descricao: 'Progresso acelerado com mais tempo de prática e interação.',
    preco: 'R$ 249',
    periodo: '/mês',
    recomendado: false,
    color: 'emerald',
    ativo: true,
    features: [
      '3 aulas ao vivo por semana',
      'Material didático incluso',
      'Suporte 24/7',
      'Conversação em grupo',
    ],
  },
  {
    aulas: 4,
    titulo: '4 Aulas Semanais',
    descricao: 'Imersão no idioma com aulas quase diárias. Resultados rápidos.',
    preco: 'R$ 319',
    periodo: '/mês',
    recomendado: false,
    color: 'lime',
    ativo: true,
    features: [
      '4 aulas ao vivo por semana',
      'Material didático incluso',
      'Suporte 24/7',
      'Aula particular mensal',
    ],
  },
  {
    aulas: 5,
    titulo: '5 Aulas Semanais',
    descricao: 'Experiência completa de imersão. O caminho mais rápido para a fluência.',
    preco: 'R$ 389',
    periodo: '/mês',
    recomendado: false,
    color: 'emerald',
    ativo: true,
    features: [
      '5 aulas ao vivo por semana',
      'Material didático incluso',
      'Aula particular semanal',
      'Certificado prioritário',
    ],
  },
];

async function seedModules() {
  console.log('Enviando módulos para o Supabase...');

  const { data, error } = await supabase
    .from('english_modules')
    .upsert(modules, {
      onConflict: 'aulas',
    })
    .select();

  if (error) {
    console.error('Erro ao cadastrar módulos:');
    console.error(error);
    process.exitCode = 1;
    return;
  }

  console.log(`${data.length} módulos cadastrados ou atualizados.`);
}

await seedModules();