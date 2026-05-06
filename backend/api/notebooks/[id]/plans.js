import { setCors } from '../../../lib/cors.js';
import supabase from '../../../lib/supabase.js';
import { generateId } from '../../../lib/ai.js';

export default async function handler(req, res) {
  if (setCors(req, res)) return;

  const { id: notebookId } = req.query;

  // GET /api/notebooks/:id/plans — list plans for a notebook
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('notebook_id', notebookId)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // POST /api/notebooks/:id/plans — create a plan
  if (req.method === 'POST') {
    try {
      const {
        title, outline, output_type, word_target,
        scheduled_date, scheduled_time, auto_start,
        pre_fetch_refs, instructions
      } = req.body || {};

      const id = generateId();

      const { data, error } = await supabase
        .from('plans')
        .insert({
          id,
          notebook_id: notebookId,
          title,
          outline: outline || '',
          output_type: output_type || 'draft',
          word_target: word_target || 500,
          scheduled_date,
          scheduled_time: scheduled_time || '09:00',
          auto_start: auto_start || false,
          pre_fetch_refs: pre_fetch_refs || false,
          instructions: instructions || '',
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
