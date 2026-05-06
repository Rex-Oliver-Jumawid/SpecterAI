import { setCors } from '../../../lib/cors.js';
import supabase from '../../../lib/supabase.js';
import { generateAiContent } from '../../../lib/ai.js';

export default async function handler(req, res) {
  if (setCors(req, res)) return;

  const { id } = req.query;

  // POST /api/plans/:id/trigger — trigger AI generation for a plan
  if (req.method === 'POST') {
    try {
      const { data: plan, error: fetchErr } = await supabase
        .from('plans')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !plan) {
        return res.status(404).json({ error: 'Plan not found' });
      }

      // Get notebook references for context
      const { data: refs } = await supabase
        .from('references')
        .select('*')
        .eq('notebook_id', plan.notebook_id);

      // Generate AI content
      const { content, summary } = generateAiContent(plan, refs || []);

      // Update plan with AI output
      const { data, error } = await supabase
        .from('plans')
        .update({
          ai_output: content,
          ai_summary: summary,
          ai_completed_at: new Date().toISOString(),
          status: 'review',
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

  return res.status(405).json({ error: 'Method not allowed' });
}
