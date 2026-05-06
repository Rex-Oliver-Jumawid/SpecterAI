import { setCors } from '../../lib/cors.js';
import supabase from '../../lib/supabase.js';
import { generateId } from '../../lib/ai.js';

export default async function handler(req, res) {
  if (setCors(req, res)) return;

  // GET /api/notebooks — list all notebooks
  if (req.method === 'GET') {
    try {
      // Get notebooks with counts
      const { data: notebooks, error } = await supabase
        .from('notebooks')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Get ref and plan counts for each notebook
      for (const nb of notebooks) {
        const { count: refCount } = await supabase
          .from('references')
          .select('*', { count: 'exact', head: true })
          .eq('notebook_id', nb.id);

        const { count: planCount } = await supabase
          .from('plans')
          .select('*', { count: 'exact', head: true })
          .eq('notebook_id', nb.id);

        nb.ref_count = refCount || 0;
        nb.plan_count = planCount || 0;
      }

      return res.status(200).json(notebooks);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // POST /api/notebooks — create a notebook
  if (req.method === 'POST') {
    try {
      const { title, content } = req.body || {};
      const id = generateId();

      const { data, error } = await supabase
        .from('notebooks')
        .insert({
          id,
          title: title || 'Untitled Notebook',
          content: content || '',
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
