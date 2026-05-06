import { setCors } from '../../lib/cors.js';
import { generateId } from '../../lib/ai.js';

export default async function handler(req, res) {
  if (setCors(req, res)) return;

  // GET /api/references/search?q=... — search OpenAlex for academic papers
  if (req.method === 'GET') {
    try {
      const { q } = req.query;
      if (!q || !q.trim()) return res.status(200).json([]);

      const topic = q.trim();
      const url = `https://api.openalex.org/works?search=${encodeURIComponent(topic)}&per_page=15&sort=relevance_score:desc&filter=type:article&select=id,title,authorships,publication_year,primary_location,doi,abstract_inverted_index,cited_by_count`;

      const response = await fetch(url, {
        headers: { 'User-Agent': 'Specter/1.0 (mailto:specter@academic.app)' }
      });

      if (!response.ok) {
        throw new Error(`OpenAlex API error: ${response.status}`);
      }

      const data = await response.json();
      const maxCitations = Math.max(1, ...data.results.map(r => r.cited_by_count || 0));

      const results = data.results.map((work, index) => {
        // Reconstruct abstract from inverted index
        let abstract = '';
        if (work.abstract_inverted_index) {
          const words = [];
          for (const [word, positions] of Object.entries(work.abstract_inverted_index)) {
            positions.forEach(pos => { words[pos] = word; });
          }
          abstract = words.filter(Boolean).join(' ');
        }

        // Extract authors
        const authors = (work.authorships || [])
          .slice(0, 3)
          .map(a => a.author?.display_name || 'Unknown')
          .join(', ')
          + (work.authorships?.length > 3 ? ' et al.' : '');

        // Extract journal
        const journal = work.primary_location?.source?.display_name || '';

        // Compute relevance score
        const positionScore = Math.max(0, 95 - (index * 5));
        const citationBoost = Math.round((work.cited_by_count || 0) / maxCitations * 10);
        const relevanceScore = Math.min(99, positionScore + citationBoost);

        // Extract DOI
        const doiFull = work.doi || null;
        const doiShort = doiFull ? doiFull.replace('https://doi.org/', '') : null;

        return {
          id: generateId(),
          title: work.title || 'Untitled',
          authors: authors || 'Unknown',
          year: (work.publication_year || '').toString(),
          journal,
          doi: doiShort,
          abstract: abstract.substring(0, 500),
          url: doiFull,
          confidence: (journal && doiShort) ? 'verified' : doiShort ? 'partial' : 'manual',
          relevance_score: relevanceScore,
          cited_by_count: work.cited_by_count || 0,
        };
      });

      // Sort by relevance score descending
      results.sort((a, b) => b.relevance_score - a.relevance_score);
      return res.status(200).json(results);
    } catch (error) {
      console.error('Search error:', error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
