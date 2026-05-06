import { setCors } from '../../../lib/cors.js';
import supabase from '../../../lib/supabase.js';

export default async function handler(req, res) {
  if (setCors(req, res)) return;

  const { id } = req.query;

  // PUT /api/plans/:id — update a plan
  if (req.method === 'PUT') {
    try {
      const { data: existing, error: fetchErr } = await supabase
        .from('plans')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !existing) {
        return res.status(404).json({ error: 'Plan not found' });
      }

      const {
        title, outline, output_type, word_target,
        scheduled_date, scheduled_time, auto_start,
        pre_fetch_refs, instructions, status
      } = req.body || {};

      const { data, error } = await supabase
        .from('plans')
        .update({
          title: title ?? existing.title,
          outline: outline ?? existing.outline,
          output_type: output_type ?? existing.output_type,
          word_target: word_target ?? existing.word_target,
          scheduled_date: scheduled_date ?? existing.scheduled_date,
          scheduled_time: scheduled_time ?? existing.scheduled_time,
          auto_start: auto_start !== undefined ? auto_start : existing.auto_start,
          pre_fetch_refs: pre_fetch_refs !== undefined ? pre_fetch_refs : existing.pre_fetch_refs,
          instructions: instructions ?? existing.instructions,
          status: status ?? existing.status,
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

  // DELETE /api/plans/:id — delete a plan
  if (req.method === 'DELETE') {
    try {
      const { error } = await supabase
        .from('plans')
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
