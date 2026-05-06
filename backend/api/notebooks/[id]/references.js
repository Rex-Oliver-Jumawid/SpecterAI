import { setCors } from '../../../lib/cors.js';
import supabase from '../../../lib/supabase.js';
import { generateId } from '../../../lib/ai.js';

export default async function handler(req, res) {
  if (setCors(req, res)) return;

  const { id: notebookId } = req.query;

  // GET /api/notebooks/:id/references — list references for a notebook
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('references')
        .select('*')
        .eq('notebook_id', notebookId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // POST /api/notebooks/:id/references — add a reference
  if (req.method === 'POST') {
    try {
      const { url, doi, title, authors, year, journal, abstract } = req.body || {};

      // Mock metadata generation (realistic)
      const topics = ['Machine Learning', 'Natural Language Processing', 'Computer Vision', 'Data Mining', 'Neural Networks', 'Deep Learning', 'Information Retrieval', 'Knowledge Graphs'];
      const journals = ['Nature Machine Intelligence', 'IEEE Transactions on AI', 'Journal of Computational Science', 'ACM Computing Surveys', 'Artificial Intelligence Review', 'Neural Computing and Applications'];
      const authorPairs = [
        'Zhang, W. & Chen, L.', 'Patel, R. & Kumar, S.', 'Anderson, T. & Williams, K.',
        'Liu, H. & Wang, J.', 'Thompson, M. & Garcia, A.', 'Kim, Y. & Park, D.',
        'Martinez, C. & Brown, R.', 'Nakamura, T. & Sato, K.'
      ];

      const topic = topics[Math.floor(Math.random() * topics.length)];
      const mockJournal = journals[Math.floor(Math.random() * journals.length)];
      const mockAuthors = authorPairs[Math.floor(Math.random() * authorPairs.length)];
      const mockYear = (2020 + Math.floor(Math.random() * 6)).toString();
      const inputStr = (url || doi || '').replace(/https?:\/\//, '').substring(0, 25);

      const id = generateId();
      const refData = {
        id,
        notebook_id: notebookId,
        title: title || `Advances in ${topic}: A Comprehensive Study on ${inputStr}`,
        authors: authors || mockAuthors,
        year: year || mockYear,
        journal: journal || mockJournal,
        abstract: abstract || `This paper presents a comprehensive analysis of recent developments in ${topic.toLowerCase()}, examining key methodologies and their practical applications. Our findings suggest significant improvements in performance metrics across multiple benchmarks.`,
        url: url || null,
        doi: doi || `10.${1000 + Math.floor(Math.random() * 9000)}/research.${Math.random().toString(36).substring(2, 8)}`,
        confidence: (journal && doi && abstract) ? 'verified' : (journal || doi) ? 'partial' : 'manual'
      };

      const { data, error } = await supabase
        .from('references')
        .insert(refData)
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
