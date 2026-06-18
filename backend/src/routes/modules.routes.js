import { Router } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('english_modules')
      .select(`
        id,
        aulas,
        titulo,
        descricao,
        preco,
        periodo,
        recomendado,
        color,
        ativo,
        features
      `)
      .eq('ativo', true)
      .order('aulas', { ascending: true });

    if (error) {
      console.error('Erro do Supabase:', error);

      return res.status(500).json({
        error: 'Não foi possível buscar os módulos.',
        details: error.message,
      });
    }

    return res.status(200).json(data ?? []);
  } catch (error) {
    console.error('Erro inesperado:', error);

    return res.status(500).json({
      error: 'Erro interno do servidor.',
    });
  }
});

export default router;