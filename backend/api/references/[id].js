import { setCors } from '../../lib/cors.js';
import supabase from '../../lib/supabase.js';

export default async function handler(req, res) {
  if (setCors(req, res)) return;

  const { id } = req.query;

  // DELETE /api/references/:id — delete a reference
  if (req.method === 'DELETE') {
    try {
      const { error } = await supabase
        .from('references')
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
