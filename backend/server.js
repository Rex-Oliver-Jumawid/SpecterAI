import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// ═══════════════════════════════════════
// Utility
// ═══════════════════════════════════════

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Mock AI generation based on plan outline and references
function generateAiContent(plan, references) {
  const refList = references.slice(0, 5);
  const topic = plan.title || 'Academic Research';
  const outputType = plan.output_type || 'draft';
  const wordTarget = plan.word_target || 500;
  const instructions = plan.instructions || '';

  // Build reference citations
  const refCitations = refList.map((r, i) =>
    `${r.authors?.split(',')[0] || 'Unknown'} (${r.year || 'n.d.'})`
  );

  let content = '';
  let summary = '';

  if (outputType === 'outline') {
    content = `# ${topic}\n\n## 1. Introduction\n- Context and background\n- Research significance\n- Objectives and scope\n\n## 2. Literature Review\n- Current state of research\n- Key theories and frameworks\n- Gaps identified in existing literature\n\n## 3. Methodology\n- Research approach\n- Data collection methods\n- Analysis framework\n\n## 4. Analysis & Findings\n- Key findings\n- Data interpretation\n- Comparison with existing research\n\n## 5. Discussion\n- Implications of findings\n- Limitations\n- Future research directions\n\n## 6. Conclusion\n- Summary of contributions\n- Practical recommendations`;

    summary = `👻 Specter completed your outline.\n\n📋 Generated: 6-section structured outline\n📊 Sections: Introduction, Literature Review, Methodology, Analysis, Discussion, Conclusion\n🔗 References available: ${refList.length} sources\n${instructions ? `📝 Instructions followed: "${instructions.substring(0, 80)}..."` : ''}\n⏱️ Completed in: 2.1 seconds`;
  } else if (outputType === 'bullet_points') {
    content = `# ${topic} — Key Points\n\n### Core Arguments\n• The field has seen significant evolution over the past decade, with emerging methodologies reshaping traditional approaches.\n• Recent studies (${refCitations[0] || 'various authors'}) highlight the intersection of theory and practice in this domain.\n• There is a growing consensus that interdisciplinary approaches yield more robust findings.\n\n### Evidence & Support\n• Empirical data suggests a strong correlation between the proposed variables.\n• Multiple meta-analyses confirm the validity of the central hypothesis.\n• ${refCitations[1] || 'Recent research'} provides compelling evidence for the proposed framework.\n\n### Implications\n• These findings have direct applications in both academic and professional contexts.\n• Policy recommendations should consider the multifaceted nature of the problem.\n• Further investigation is needed to address remaining gaps in the literature.\n\n### Action Items\n• Review and expand each bullet point into full paragraphs\n• Add specific data points and statistics\n• Ensure all claims are properly cited`;

    summary = `👻 Specter organized your key points.\n\n📋 Generated: Structured bullet points across 4 categories\n📊 Points: 12 key arguments and action items\n🔗 References cited: ${Math.min(refList.length, 2)} sources\n${instructions ? `📝 Instructions followed: "${instructions.substring(0, 80)}..."` : ''}\n⏱️ Completed in: 1.8 seconds`;
  } else if (outputType === 'references_only') {
    // Pre-fetch references mode
    content = `# Reference Summary for: ${topic}\n\n## Key Sources Found\n\n${refList.map((r, i) => `### ${i + 1}. ${r.title}\n- **Authors:** ${r.authors}\n- **Year:** ${r.year}\n- **Journal:** ${r.journal}\n- **DOI:** ${r.doi}\n- **Key Finding:** ${r.abstract?.substring(0, 150)}...\n`).join('\n')}\n\n## Synthesis\nThese ${refList.length} sources collectively address ${topic.toLowerCase()} from multiple perspectives. The literature reveals convergent themes around methodological innovation and cross-disciplinary applications.\n\n---\n*References gathered by Specter. Ready for you to begin writing.*`;

    summary = `👻 Specter gathered references for you.\n\n📋 Mode: Reference pre-fetch\n📊 Sources found: ${refList.length} relevant papers\n🔗 All sources verified and saved to your notebook\n${instructions ? `📝 Instructions followed: "${instructions.substring(0, 80)}..."` : ''}\n⏱️ Completed in: 4.2 seconds\n\nYour references are ready. Start writing when you're available!`;
  } else {
    // Default: draft
    content = `# ${topic}\n\n## Introduction\n\nThe landscape of ${topic.toLowerCase()} has undergone significant transformation in recent years, driven by advances in technology and evolving methodological frameworks. This paper examines the current state of research in this field, drawing upon established literature and recent findings to present a comprehensive analysis.\n\nAs ${refCitations[0] || 'recent scholars'} have demonstrated, the intersection of theoretical foundations and practical applications creates rich opportunities for academic inquiry. The significance of this research extends beyond the academy, with implications for policy, practice, and future investigation.\n\n## Literature Review\n\nThe existing body of literature reveals several key themes that inform our understanding of ${topic.toLowerCase()}. ${refCitations[1] || 'Previous studies'} established foundational frameworks that continue to guide contemporary research, while more recent work has expanded these perspectives to incorporate emerging paradigms.\n\nNotably, the field has moved toward increasingly interdisciplinary approaches, recognizing that complex phenomena require multifaceted analytical lenses. This shift has produced more nuanced findings and opened new avenues for exploration.\n\n## Analysis\n\nOur analysis reveals several patterns that warrant further examination. First, there is a clear trend toward integration of diverse methodological approaches, suggesting that the field values methodological pluralism. Second, the evidence points toward several promising directions for future research, particularly regarding the application of novel analytical frameworks.\n\nThe data suggest that traditional approaches, while valuable, may benefit from augmentation with contemporary techniques. This finding aligns with the broader trend in academic research toward mixed-methods designs.\n\n## Preliminary Conclusions\n\nBased on the evidence reviewed, several preliminary conclusions emerge. The field of ${topic.toLowerCase()} is positioned at a critical juncture, with opportunities for significant advancement through interdisciplinary collaboration and methodological innovation. Future research should prioritize addressing the gaps identified in this analysis while building upon the strong theoretical foundations established by prior scholarship.\n\n---\n*This draft was generated by Specter based on your outline and saved references. Review, refine, and make it yours.*`;

    const wordCount = content.split(/\s+/).length;
    summary = `👻 Specter wrote your draft while you were away.\n\n📋 Generated: Full academic draft\n📊 Word count: ~${wordCount} words (target: ${wordTarget})\n📑 Sections: 4 (Introduction, Literature Review, Analysis, Conclusions)\n🔗 References cited: ${Math.min(refList.length, 2)} sources\n${instructions ? `📝 Instructions followed: "${instructions.substring(0, 80)}..."` : ''}\n⏱️ Completed in: 3.4 seconds\n\nReview the draft and confirm when you're satisfied.`;
  }

  return { content, summary };
}

// Mock AI chat response
function generateChatResponse(message, notebookContent, references) {
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('summarize') || lowerMsg.includes('summary')) {
    const wordCount = (notebookContent || '').split(/\s+/).filter(w => w.length > 0).length;
    return `Here's a summary of your current draft:\n\n📊 **Word count:** ${wordCount} words\n📑 **References used:** ${references.length}\n\nYour paper currently covers the main themes outlined in your work. To strengthen it, consider:\n1. Adding more specific data points and statistics\n2. Expanding the literature review section\n3. Including a methodology section if applicable\n\nWould you like me to help with any of these areas?`;
  }

  if (lowerMsg.includes('reference') || lowerMsg.includes('cite') || lowerMsg.includes('source')) {
    if (references.length === 0) {
      return `You don't have any references saved yet. You can:\n1. Go to the **References** panel on the right and paste a URL or DOI\n2. Use the **Reference Finder** page from the sidebar\n3. Tell me a topic and I can suggest what to search for\n\nWhat topic are you working on?`;
    }
    const refList = references.slice(0, 3).map((r, i) =>
      `${i + 1}. **${r.authors}** (${r.year}). _${r.title}_. ${r.journal}.`
    ).join('\n');
    return `Here are your saved references:\n\n${refList}\n\nYou have **${references.length}** total references. To cite one, click the "Cite" button next to it in the References panel, or I can help you write a paragraph incorporating these sources.`;
  }

  if (lowerMsg.includes('write') || lowerMsg.includes('draft') || lowerMsg.includes('paragraph')) {
    return `I'd be happy to help draft content! Here's a paragraph based on your current work:\n\n---\n\nThe current body of research demonstrates a growing consensus regarding the importance of integrated methodological approaches. As the literature suggests, traditional frameworks provide essential foundational understanding, while contemporary techniques offer enhanced analytical capabilities. This synthesis of approaches has proven particularly valuable in addressing complex, multifaceted research questions that resist simple categorization.\n\n---\n\nWould you like me to:\n1. Adjust the tone or formality?\n2. Focus on a specific section?\n3. Add citations from your saved references?`;
  }

  if (lowerMsg.includes('outline') || lowerMsg.includes('structure')) {
    return `Here's a suggested outline for your paper:\n\n## Recommended Structure\n\n1. **Introduction** (300-400 words)\n   - Background context\n   - Research problem statement\n   - Objectives and scope\n\n2. **Literature Review** (800-1000 words)\n   - Theoretical framework\n   - Key studies and findings\n   - Research gaps\n\n3. **Methodology** (400-600 words)\n   - Research design\n   - Data collection\n   - Analysis approach\n\n4. **Results & Discussion** (600-800 words)\n   - Key findings\n   - Interpretation\n   - Comparison with literature\n\n5. **Conclusion** (200-300 words)\n   - Summary\n   - Implications\n   - Future research\n\nWant me to start drafting any section?`;
  }

  if (lowerMsg.includes('improve') || lowerMsg.includes('edit') || lowerMsg.includes('revise')) {
    return `I can help improve your writing! Here are some suggestions:\n\n✨ **Style improvements:**\n- Use more active voice constructions\n- Vary sentence length for better flow\n- Add transitional phrases between paragraphs\n\n📝 **Content improvements:**\n- Strengthen your thesis statement\n- Add more specific evidence and data\n- Include counterarguments for balance\n\n🔗 **Citation improvements:**\n- Ensure all claims are properly supported\n- Add in-text citations where needed\n- Cross-reference with your saved sources\n\nPaste a specific paragraph and I'll revise it for you!`;
  }

  // Default response
  return `I'm here to help with your paper! I can:\n\n📝 **Write** — Draft paragraphs, sections, or full papers\n📋 **Outline** — Create structured outlines for your topic\n🔍 **Research** — Help find and organize references\n✍️ **Edit** — Improve clarity, tone, and academic style\n📊 **Summarize** — Get an overview of your current draft\n\nWhat would you like help with?`;
}

// ═══════════════════════════════════════
// Notebook Routes
// ═══════════════════════════════════════

// List all notebooks
app.get('/api/notebooks', (req, res) => {
  try {
    const notebooks = db.prepare(`
      SELECT n.*, 
        (SELECT COUNT(*) FROM "references" WHERE notebook_id = n.id) as ref_count,
        (SELECT COUNT(*) FROM plans WHERE notebook_id = n.id) as plan_count
      FROM notebooks n 
      ORDER BY n.updated_at DESC
    `).all();
    res.json(notebooks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create notebook
app.post('/api/notebooks', (req, res) => {
  try {
    const id = generateId();
    const { title, content } = req.body;
    db.prepare(`INSERT INTO notebooks (id, title, content) VALUES (?, ?, ?)`)
      .run(id, title || 'Untitled Notebook', content || '');
    const notebook = db.prepare('SELECT * FROM notebooks WHERE id = ?').get(id);
    res.json(notebook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get notebook
app.get('/api/notebooks/:id', (req, res) => {
  try {
    const notebook = db.prepare('SELECT * FROM notebooks WHERE id = ?').get(req.params.id);
    if (!notebook) return res.status(404).json({ error: 'Notebook not found' });
    res.json(notebook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update notebook
app.put('/api/notebooks/:id', (req, res) => {
  try {
    const { title, content } = req.body;
    const existing = db.prepare('SELECT * FROM notebooks WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Notebook not found' });

    db.prepare(`UPDATE notebooks SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .run(title ?? existing.title, content ?? existing.content, req.params.id);

    const notebook = db.prepare('SELECT * FROM notebooks WHERE id = ?').get(req.params.id);
    res.json(notebook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete notebook
app.delete('/api/notebooks/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM notebooks WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════
// Reference Routes
// ═══════════════════════════════════════

// List references for a notebook
app.get('/api/notebooks/:id/references', (req, res) => {
  try {
    const refs = db.prepare('SELECT * FROM "references" WHERE notebook_id = ? ORDER BY created_at DESC')
      .all(req.params.id);
    res.json(refs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add reference to notebook
app.post('/api/notebooks/:id/references', (req, res) => {
  try {
    const notebookId = req.params.id;
    const { url, doi, title, authors, year, journal, abstract } = req.body;

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

    db.prepare(`
      INSERT INTO "references" (id, notebook_id, title, authors, year, journal, abstract, url, doi, confidence)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(refData.id, refData.notebook_id, refData.title, refData.authors, refData.year,
           refData.journal, refData.abstract, refData.url, refData.doi, refData.confidence);

    res.json(refData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete reference
app.delete('/api/references/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM "references" WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search references by topic with relevance scoring
app.get('/api/references/search', (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) return res.json([]);

    const topic = q.trim().toLowerCase();
    const words = topic.split(/\s+/).filter(w => w.length > 2);

    // Mock: generate scored references based on query
    const mockResults = generateSearchResults(topic, words);
    res.json(mockResults);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function generateSearchResults(topic, words) {
  const authorSets = [
    { authors: 'Zhang, W. & Chen, L.', year: '2024' },
    { authors: 'Patel, R., Kumar, S., & Singh, A.', year: '2023' },
    { authors: 'Anderson, T. & Williams, K.', year: '2025' },
    { authors: 'Liu, H., Wang, J., & Li, M.', year: '2022' },
    { authors: 'Thompson, M. & Garcia, A.', year: '2024' },
    { authors: 'Kim, Y., Park, D., & Lee, S.', year: '2023' },
    { authors: 'Martinez, C. & Brown, R.', year: '2025' },
    { authors: 'Nakamura, T. & Sato, K.', year: '2024' },
    { authors: 'Johnson, E., Davis, P., & Miller, F.', year: '2023' },
    { authors: 'Smith, A. & Robinson, G.', year: '2022' },
    { authors: 'Wilson, D. & Taylor, J.', year: '2025' },
    { authors: 'Chen, X., Zhao, Y., & Huang, R.', year: '2024' },
  ];

  const journals = [
    'Nature Machine Intelligence', 'IEEE Transactions on AI', 'Journal of Computational Science',
    'ACM Computing Surveys', 'Artificial Intelligence Review', 'Neural Computing and Applications',
    'Computers & Education', 'Educational Technology Research', 'Journal of Learning Analytics',
    'Science', 'PLOS ONE', 'Frontiers in Education', 'International Journal of STEM Education'
  ];

  const methodTerms = ['systematic review', 'meta-analysis', 'empirical study', 'case study',
    'experimental design', 'mixed-methods', 'longitudinal study', 'cross-sectional analysis'];

  const capTopic = topic.replace(/\b\w/g, l => l.toUpperCase());
  const results = [];

  for (let i = 0; i < Math.min(12, 6 + words.length * 2); i++) {
    const auth = authorSets[i % authorSets.length];
    const journal = journals[i % journals.length];
    const method = methodTerms[i % methodTerms.length];

    // Compute relevance score — higher for more specific matches
    const baseScore = 95 - (i * 6);
    const jitter = Math.floor(Math.random() * 8) - 4;
    const score = Math.max(20, Math.min(99, baseScore + jitter));

    const titles = [
      `A ${method} of ${capTopic}: Current Trends and Future Directions`,
      `Advancing ${capTopic} Through Computational Methods: A Comprehensive Review`,
      `The Impact of ${capTopic} on Contemporary Research Practices`,
      `Exploring ${capTopic}: Evidence from Recent Empirical Studies`,
      `${capTopic} in Practice: Lessons from a ${method}`,
      `Bridging Theory and Practice in ${capTopic}: New Insights`,
      `Rethinking ${capTopic}: A Critical Analysis of Recent Developments`,
      `${capTopic} and Its Applications: A ${method}`,
      `Novel Approaches to ${capTopic}: Integrating Multiple Perspectives`,
      `The Evolution of ${capTopic}: A Decade of Progress`,
      `Challenges and Opportunities in ${capTopic}: A Review`,
      `Foundations of ${capTopic}: A Theoretical Framework`,
    ];

    const abstracts = [
      `This ${method} examines the current state of ${topic} across ${15 + i * 3} peer-reviewed studies. Our findings reveal significant trends in methodology and a growing emphasis on interdisciplinary collaboration. Results indicate that ${topic} has seen a ${65 + i}% increase in research output over the past five years.`,
      `We present a comprehensive analysis of ${topic}, drawing upon data from multiple international research groups. Our approach combines quantitative metrics with qualitative assessments to provide a nuanced understanding of the field's trajectory. Key findings suggest important implications for both theory and practice.`,
      `This paper investigates the relationship between ${topic} and contemporary academic frameworks through a ${method}. Analyzing ${20 + i * 5} primary sources, we identify critical success factors and propose a unified model for future research endeavors in this rapidly evolving domain.`,
    ];

    results.push({
      id: generateId(),
      title: titles[i % titles.length],
      authors: auth.authors,
      year: auth.year,
      journal: journal,
      doi: `10.${1000 + Math.floor(Math.random() * 9000)}/research.${Math.random().toString(36).substring(2, 8)}`,
      abstract: abstracts[i % abstracts.length],
      url: null,
      confidence: score >= 80 ? 'verified' : score >= 50 ? 'partial' : 'manual',
      relevance_score: score,
    });
  }

  // Sort by relevance score descending
  results.sort((a, b) => b.relevance_score - a.relevance_score);
  return results;
}

// ═══════════════════════════════════════
// Plan Routes
// ═══════════════════════════════════════

// List plans for a notebook
app.get('/api/notebooks/:id/plans', (req, res) => {
  try {
    const plans = db.prepare('SELECT * FROM plans WHERE notebook_id = ? ORDER BY scheduled_date ASC')
      .all(req.params.id);
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create plan
app.post('/api/notebooks/:id/plans', (req, res) => {
  try {
    const notebookId = req.params.id;
    const { title, outline, output_type, word_target, scheduled_date, scheduled_time, auto_start, pre_fetch_refs, instructions } = req.body;
    const id = generateId();

    db.prepare(`
      INSERT INTO plans (id, notebook_id, title, outline, output_type, word_target, scheduled_date, scheduled_time, auto_start, pre_fetch_refs, instructions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, notebookId, title, outline || '', output_type || 'draft', word_target || 500,
           scheduled_date, scheduled_time || '09:00', auto_start ? 1 : 0, pre_fetch_refs ? 1 : 0,
           instructions || '');

    const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(id);
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update plan
app.put('/api/plans/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM plans WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Plan not found' });

    const { title, outline, output_type, word_target, scheduled_date, scheduled_time, auto_start, pre_fetch_refs, instructions, status } = req.body;

    db.prepare(`
      UPDATE plans SET title = ?, outline = ?, output_type = ?, word_target = ?, 
      scheduled_date = ?, scheduled_time = ?, auto_start = ?, pre_fetch_refs = ?,
      instructions = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(
      title ?? existing.title, outline ?? existing.outline,
      output_type ?? existing.output_type, word_target ?? existing.word_target,
      scheduled_date ?? existing.scheduled_date, scheduled_time ?? existing.scheduled_time,
      auto_start !== undefined ? (auto_start ? 1 : 0) : existing.auto_start,
      pre_fetch_refs !== undefined ? (pre_fetch_refs ? 1 : 0) : existing.pre_fetch_refs,
      instructions ?? existing.instructions,
      status ?? existing.status,
      req.params.id
    );

    const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(req.params.id);
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete plan
app.delete('/api/plans/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM plans WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trigger AI generation for a plan
app.post('/api/plans/:id/trigger', (req, res) => {
  try {
    const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    // Get notebook references for context
    const refs = db.prepare('SELECT * FROM "references" WHERE notebook_id = ?').all(plan.notebook_id);

    // Generate AI content
    const { content, summary } = generateAiContent(plan, refs);

    // Update plan with AI output
    db.prepare(`
      UPDATE plans SET ai_output = ?, ai_summary = ?, ai_completed_at = CURRENT_TIMESTAMP,
      status = 'review', updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(content, summary, req.params.id);

    const updatedPlan = db.prepare('SELECT * FROM plans WHERE id = ?').get(req.params.id);
    res.json(updatedPlan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Confirm/reject AI output
app.post('/api/plans/:id/confirm', (req, res) => {
  try {
    const { confirmed } = req.body;
    const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    if (confirmed) {
      // Append AI output to notebook content
      const notebook = db.prepare('SELECT * FROM notebooks WHERE id = ?').get(plan.notebook_id);
      const newContent = (notebook.content || '') + '\n\n' + (plan.ai_output || '');

      db.prepare('UPDATE notebooks SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(newContent, plan.notebook_id);

      db.prepare(`UPDATE plans SET user_confirmed = 1, status = 'done', updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
        .run(req.params.id);
    } else {
      db.prepare(`UPDATE plans SET user_confirmed = 0, status = 'planned', ai_output = NULL, ai_summary = NULL, ai_completed_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
        .run(req.params.id);
    }

    const updatedPlan = db.prepare('SELECT * FROM plans WHERE id = ?').get(req.params.id);
    res.json(updatedPlan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════
// Chat Routes
// ═══════════════════════════════════════

// Get chat history for a notebook
app.get('/api/notebooks/:id/chat', (req, res) => {
  try {
    const messages = db.prepare('SELECT * FROM chat_messages WHERE notebook_id = ? ORDER BY created_at ASC')
      .all(req.params.id);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send chat message and get AI response
app.post('/api/notebooks/:id/chat', (req, res) => {
  try {
    const notebookId = req.params.id;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Save user message
    const userMsgId = generateId();
    db.prepare('INSERT INTO chat_messages (id, notebook_id, role, content) VALUES (?, ?, ?, ?)')
      .run(userMsgId, notebookId, 'user', message.trim());

    // Get context
    const notebook = db.prepare('SELECT * FROM notebooks WHERE id = ?').get(notebookId);
    const refs = db.prepare('SELECT * FROM "references" WHERE notebook_id = ?').all(notebookId);

    // Generate AI response
    const aiResponse = generateChatResponse(message.trim(), notebook?.content, refs);

    // Save AI message
    const aiMsgId = generateId();
    db.prepare('INSERT INTO chat_messages (id, notebook_id, role, content) VALUES (?, ?, ?, ?)')
      .run(aiMsgId, notebookId, 'assistant', aiResponse);

    res.json({
      userMessage: { id: userMsgId, notebook_id: notebookId, role: 'user', content: message.trim() },
      aiMessage: { id: aiMsgId, notebook_id: notebookId, role: 'assistant', content: aiResponse }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear chat history
app.delete('/api/notebooks/:id/chat', (req, res) => {
  try {
    db.prepare('DELETE FROM chat_messages WHERE notebook_id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════
// Health Check
// ═══════════════════════════════════════

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'Specter API', version: '2.0.0' });
});

// Start server
app.listen(PORT, () => {
  console.log(`👻 Specter API running on http://localhost:${PORT}`);
});
