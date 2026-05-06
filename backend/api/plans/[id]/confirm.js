import { setCors } from '../../../lib/cors.js';
import supabase from '../../../lib/supabase.js';

export default async function handler(req, res) {
  if (setCors(req, res)) return;

  const { id } = req.query;

  // POST /api/plans/:id/confirm — confirm or reject AI output
  if (req.method === 'POST') {
    try {
      const { confirmed } = req.body || {};

      const { data: plan, error: fetchErr } = await supabase
        .from('plans')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !plan) {
        return res.status(404).json({ error: 'Plan not found' });
      }

      if (confirmed) {
        // Append AI output to notebook content
        const { data: notebook } = await supabase
          .from('notebooks')
          .select('*')
          .eq('id', plan.notebook_id)
          .single();

        const newContent = (notebook?.content || '') + '\n\n' + (plan.ai_output || '');

        await supabase
          .from('notebooks')
          .update({
            content: newContent,
            updated_at: new Date().toISOString(),
          })
          .eq('id', plan.notebook_id);

        const { data, error } = await supabase
          .from('plans')
          .update({
            user_confirmed: true,
            status: 'done',
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return res.status(200).json(data);
      } else {
        const { data, error } = await supabase
          .from('plans')
          .update({
            user_confirmed: false,
            status: 'planned',
            ai_output: null,
            ai_summary: null,
            ai_completed_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return res.status(200).json(data);
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
