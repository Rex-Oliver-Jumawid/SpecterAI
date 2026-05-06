import { setCors } from '../../../lib/cors.js';
import supabase from '../../../lib/supabase.js';
import { generateId, generateChatResponse } from '../../../lib/ai.js';

export default async function handler(req, res) {
  if (setCors(req, res)) return;

  const { id: notebookId } = req.query;

  // GET /api/notebooks/:id/chat — get chat history
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('notebook_id', notebookId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // POST /api/notebooks/:id/chat — send message, get AI response
  if (req.method === 'POST') {
    try {
      const { message } = req.body || {};

      if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Save user message
      const userMsgId = generateId();
      await supabase.from('chat_messages').insert({
        id: userMsgId,
        notebook_id: notebookId,
        role: 'user',
        content: message.trim(),
      });

      // Get context
      const { data: notebook } = await supabase
        .from('notebooks')
        .select('*')
        .eq('id', notebookId)
        .single();

      const { data: refs } = await supabase
        .from('references')
        .select('*')
        .eq('notebook_id', notebookId);

      // Generate AI response
      const aiResponse = generateChatResponse(message.trim(), notebook?.content, refs || []);

      // Save AI message
      const aiMsgId = generateId();
      await supabase.from('chat_messages').insert({
        id: aiMsgId,
        notebook_id: notebookId,
        role: 'assistant',
        content: aiResponse,
      });

      return res.status(200).json({
        userMessage: { id: userMsgId, notebook_id: notebookId, role: 'user', content: message.trim() },
        aiMessage: { id: aiMsgId, notebook_id: notebookId, role: 'assistant', content: aiResponse },
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // DELETE /api/notebooks/:id/chat — clear chat history
  if (req.method === 'DELETE') {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('notebook_id', notebookId);

      if (error) throw error;
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
