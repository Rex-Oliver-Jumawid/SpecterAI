import { setCors } from '../../../lib/cors.js';
import supabase from '../../../lib/supabase.js';

export default async function handler(req, res) {
  if (setCors(req, res)) return;

  const { id } = req.query;

  // GET /api/notebooks/:id — get single notebook
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('notebooks')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return res.status(404).json({ error: 'Notebook not found' });
      }
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // PUT /api/notebooks/:id — update notebook
  if (req.method === 'PUT') {
    try {
      const { title, content } = req.body || {};

      // Check exists
      const { data: existing, error: fetchErr } = await supabase
        .from('notebooks')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !existing) {
        return res.status(404).json({ error: 'Notebook not found' });
      }

      const { data, error } = await supabase
        .from('notebooks')
        .update({
          title: title ?? existing.title,
          content: content ?? existing.content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // DELETE /api/notebooks/:id — delete notebook
  if (req.method === 'DELETE') {
    try {
      const { error } = await supabase
        .from('notebooks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
