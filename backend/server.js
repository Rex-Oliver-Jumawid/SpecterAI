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

// AI chat response — IDE-style: reads document, returns edit blocks when applicable
function generateChatResponse(message, notebookContent, references) {
  const lowerMsg = message.toLowerCase();
  // Strip HTML tags from editor content
  const rawContent = (notebookContent || '').replace(/<br\s*\/?>/gi, '\n').replace(/<\/div>/gi, '\n').replace(/<[^>]*>/g, '').trim();
  const content = rawContent;
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 5);
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);

  // Helper: improve text quality
  function improveText(text) {
    if (!text || text.length < 20) return text;
    // Capitalize first letter of sentences
    let improved = text.replace(/(^|[.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());
    // Fix double spaces
    improved = improved.replace(/  +/g, ' ');
    // Improve common weak phrases
    improved = improved.replace(/\bvery important\b/gi, 'crucial');
    improved = improved.replace(/\ba lot of\b/gi, 'numerous');
    improved = improved.replace(/\bin order to\b/gi, 'to');
    improved = improved.replace(/\bdue to the fact that\b/gi, 'because');
    improved = improved.replace(/\bat this point in time\b/gi, 'currently');
    improved = improved.replace(/\bit is important to note that\b/gi, 'notably,');
    improved = improved.replace(/\bhas the ability to\b/gi, 'can');
    improved = improved.replace(/\bin the event that\b/gi, 'if');
    improved = improved.replace(/\bfor the purpose of\b/gi, 'for');
    improved = improved.replace(/\bwith regard to\b/gi, 'regarding');
    return improved;
  }

  // EDIT COMMANDS — return edit blocks
  if (lowerMsg.includes('improve') || lowerMsg.includes('fix grammar') || lowerMsg.includes('revise') || lowerMsg.includes('edit') || lowerMsg.includes('rewrite')) {
    if (wordCount < 5) {
      return "Your document is empty or too short. Write some content first, then I can help improve it!";
    }
    const improved = improveText(content);
    return `I've reviewed your document (${wordCount} words) and made improvements to clarity, grammar, and style.\n\n\`\`\`edit\n${improved}\n\`\`\``;
  }

  if (lowerMsg.includes('continue') || lowerMsg.includes('keep writing') || lowerMsg.includes('write more')) {
    if (wordCount < 5) {
      return "Your document is empty. What topic would you like me to start writing about?";
    }
    const lastPara = paragraphs[paragraphs.length - 1] || '';
    const continuation = `\n\nFurthermore, building upon the preceding analysis, it becomes evident that the interplay between theoretical frameworks and practical applications yields significant insights. The existing body of research provides a robust foundation for understanding these dynamics, while recent developments have introduced novel perspectives that challenge conventional approaches. This evolving landscape demands careful consideration of both established principles and emerging paradigms.\n\nMoreover, the implications of these findings extend beyond the immediate scope of this study. As the field continues to mature, the integration of diverse methodological approaches will prove essential in addressing the complex challenges that lie ahead. Future research should focus on bridging the gap between theory and practice, ensuring that academic contributions translate into meaningful real-world impact.`;
    const newContent = content + continuation;
    return `I've continued writing from where you left off, adding 2 new paragraphs that maintain your paper's tone and direction.\n\n\`\`\`edit\n${newContent}\n\`\`\``;
  }

  if (lowerMsg.includes('introduction') || lowerMsg.includes('add intro')) {
    const topicWords = content.substring(0, 200).split(/\s+/).slice(0, 10).join(' ');
    const intro = `The landscape of contemporary research has undergone significant transformation in recent years, driven by advances in technology and evolving methodological frameworks. This paper examines the current state of research in this field, drawing upon established literature and recent findings to present a comprehensive analysis. As the demand for evidence-based approaches continues to grow, understanding the theoretical underpinnings and practical implications becomes increasingly important.\n\nThe primary objective of this study is to synthesize existing knowledge and identify key trends that shape current understanding. By examining multiple perspectives and methodological approaches, this work aims to contribute meaningfully to the ongoing academic discourse.\n\n`;
    const newContent = intro + content;
    return `I've added a strong introduction to the beginning of your paper.\n\n\`\`\`edit\n${newContent}\n\`\`\``;
  }

  if (lowerMsg.includes('conclusion') || lowerMsg.includes('add conclusion') || lowerMsg.includes('wrap up')) {
    const conclusion = `\n\n## Conclusion\n\nIn conclusion, this study has examined the multifaceted dimensions of the topic under investigation, revealing several key findings that contribute to the existing body of knowledge. The analysis demonstrates that current approaches, while effective in many respects, would benefit from greater integration of interdisciplinary perspectives and methodological innovation.\n\nThe implications of these findings are significant for both academic research and practical application. Moving forward, researchers should consider adopting more holistic frameworks that account for the complex interactions between variables identified in this study. Future work should prioritize longitudinal investigations and cross-cultural comparisons to further validate and extend the present findings.\n\nUltimately, this research underscores the importance of continued scholarly inquiry in advancing our understanding of this critical area.`;
    const newContent = content + conclusion;
    return `I've added a conclusion section to wrap up your paper.\n\n\`\`\`edit\n${newContent}\n\`\`\``;
  }

  // INFO COMMANDS — no edit blocks
  if (lowerMsg.includes('summarize') || lowerMsg.includes('summary')) {
    const topSentences = sentences.slice(0, 3).map(s => s.trim()).join('. ');
    return `Here's a summary of your current draft:\n\n📊 **Word count:** ${wordCount} words (${paragraphs.length} paragraphs)\n📑 **References used:** ${references.length}\n\n**Key points from your text:**\n${topSentences ? `> ${topSentences}.` : '> (Document is empty)'}\n\nTo strengthen it, consider:\n1. Adding more specific data points and statistics\n2. Expanding the literature review section\n3. Including a methodology section if applicable\n\nWould you like me to improve or continue writing?`;
  }

  if (lowerMsg.includes('reference') || lowerMsg.includes('cite') || lowerMsg.includes('source')) {
    if (references.length === 0) {
      return `You don't have any references saved yet. You can:\n1. Go to the **References** panel and paste a URL or DOI\n2. Use the **Discover** page from the sidebar to search real papers\n3. Tell me a topic and I can suggest what to search for\n\nWhat topic are you working on?`;
    }
    const refList = references.slice(0, 5).map((r, i) =>
      `${i + 1}. **${r.authors}** (${r.year}). _${r.title}_. ${r.journal || 'N/A'}.`
    ).join('\n');
    return `Here are your saved references:\n\n${refList}\n\nYou have **${references.length}** total references. To cite one, click "Cite" in the References panel. Want me to write a paragraph incorporating these sources?`;
  }

  if (lowerMsg.includes('outline') || lowerMsg.includes('structure')) {
    return `Here's a suggested outline based on your ${wordCount}-word document:\n\n## Recommended Structure\n\n1. **Introduction** (300-400 words)\n   - Background context\n   - Research problem statement\n   - Objectives and scope\n\n2. **Literature Review** (800-1000 words)\n   - Theoretical framework\n   - Key studies and findings\n   - Research gaps\n\n3. **Methodology** (400-600 words)\n   - Research design\n   - Data collection\n   - Analysis approach\n\n4. **Results & Discussion** (600-800 words)\n   - Key findings\n   - Interpretation\n   - Comparison with literature\n\n5. **Conclusion** (200-300 words)\n   - Summary\n   - Implications\n   - Future research\n\nWant me to start drafting any section? I can add it directly to your document.`;
  }

  if (lowerMsg.includes('write') || lowerMsg.includes('draft') || lowerMsg.includes('paragraph')) {
    const newParagraph = `\n\nThe current body of research demonstrates a growing consensus regarding the importance of integrated methodological approaches. As the literature suggests, traditional frameworks provide essential foundational understanding, while contemporary techniques offer enhanced analytical capabilities. This synthesis of approaches has proven particularly valuable in addressing complex, multifaceted research questions that resist simple categorization. Recent empirical evidence further supports the notion that collaborative, interdisciplinary research yields more robust and generalizable outcomes.`;
    const newContent = content + newParagraph;
    return `I've drafted a new paragraph and added it to your document.\n\n\`\`\`edit\n${newContent}\n\`\`\``;
  }

  // Default response
  return `I'm reading your document (${wordCount} words). I can:\n\n✍️ **Edit** — "Improve my writing" or "Fix grammar"\n📝 **Write** — "Continue writing" or "Add a paragraph"\n📋 **Outline** — "Create an outline" for structure\n📖 **Sections** — "Add introduction" or "Add conclusion"\n📊 **Summarize** — Get an overview of your draft\n🔍 **References** — Help cite and organize sources\n\nAll edits are previewed first — you can **Keep** or **Undo** them.`;
}

// AI ask response — answers general knowledge questions (not document editing)
function generateAskResponse(question, notebookContent, references) {
  const q = question.toLowerCase().trim();
  const content = (notebookContent || '').replace(/<[^>]*>/g, '').trim();
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;

  // About the document
  if (q.includes('my document') || q.includes('my paper') || q.includes('my draft') || q.includes('my writing')) {
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 5);
    return `## 📄 About Your Document\n\n**Words:** ${wordCount}\n**Paragraphs:** ${paragraphs.length}\n**Sentences:** ${sentences.length}\n**References:** ${references.length}\n\n**Preview:**\n> ${content.substring(0, 200)}${content.length > 200 ? '...' : ''}\n\nSwitch to **✏️ Write mode** if you want me to edit your document.`;
  }

  const stopWords = ['what','is','the','a','an','of','in','to','for','and','or','how','why','does','do','can','could','would','should','between','vs','versus','difference','explain','define','describe','tell','me','about','are','was','were','been','being','have','has','had','it'];
  const keyTerms = q.split(/\s+/).filter(w => !stopWords.includes(w) && w.length > 2);
  const topic = keyTerms.join(' ') || question;

  let relevantRefs = [];
  if (references.length > 0) {
    relevantRefs = references.filter(r => {
      const refText = `${r.title || ''} ${r.abstract || ''} ${r.authors || ''}`.toLowerCase();
      return keyTerms.some(term => refText.includes(term));
    }).slice(0, 3);
  }

  let answer = `## 💡 ${question}\n\n`;

  // Comparison questions
  if (q.includes('difference') || q.includes(' vs ') || q.includes('versus') || q.includes('compare')) {
    const parts = q.replace(/what('s| is| are)? (the )?difference(s)? (between|of)/gi, '')
                   .replace(/\bvs\.?\b|\bversus\b/gi, '|')
                   .replace(/\band\b/gi, '|')
                   .split('|').map(p => p.trim()).filter(p => p.length > 1);
    const termA = (parts[0] || keyTerms[0] || 'Concept A').trim();
    const termB = (parts[1] || keyTerms[1] || 'Concept B').trim();

    answer += `**${termA}** and **${termB}** are related but distinct concepts:\n\n`;
    answer += `### ${termA}\n- A specific approach/technology/concept focused on its primary domain\n- Has particular characteristics that distinguish it\n- Used in certain contexts and applications\n\n`;
    answer += `### ${termB}\n- A different approach/technology/concept with its own focus\n- Distinguished by its own set of characteristics\n- Applied in different or overlapping contexts\n\n`;
    answer += `### Key Differences\n| Aspect | ${termA} | ${termB} |\n|--------|---------|----------|\n| Scope | Specific domain | Different/broader domain |\n| Purpose | Primary use case | Alternative use case |\n| Scale | Typical scale | Different scale |\n\n`;
    answer += `> 💡 Add references about these topics for a deeper, cited analysis!\n`;
  }
  // Definition questions
  else if (q.includes('what is') || q.includes('what are') || q.includes('define') || q.includes('explain') || q.includes('meaning')) {
    answer += `**${topic.charAt(0).toUpperCase() + topic.slice(1)}** is a concept within its respective field:\n\n`;
    answer += `### Definition\n${topic.charAt(0).toUpperCase() + topic.slice(1)} refers to a framework or concept that addresses specific needs within its domain. It encompasses theoretical and practical dimensions.\n\n`;
    answer += `### Key Aspects\n1. **Core concept** — The fundamental principles and foundations\n2. **Significance** — Its role in contemporary understanding\n3. **Applications** — Practical uses across various contexts\n4. **Current trends** — Recent developments and emerging perspectives\n\n`;
    answer += `### In Academic Writing\nWhen writing about ${topic}, consider:\n- Providing a clear operational definition\n- Citing foundational works\n- Discussing current debates and perspectives\n\n`;
    answer += `> 💡 Search for papers on "${topic}" in **References** to build stronger arguments!\n`;
  }
  // How questions
  else if (q.includes('how to') || q.includes('how do') || q.includes('how can') || q.includes('steps')) {
    answer += `Here's a structured approach to **${topic}**:\n\n`;
    answer += `### Steps\n1. **Research fundamentals** — Understand the core principles\n2. **Review literature** — Find academic sources on methods and approaches\n3. **Choose a framework** — Select the most relevant approach\n4. **Implement systematically** — Apply step by step with documentation\n5. **Evaluate** — Assess outcomes against objectives\n\n`;
    answer += `### Resources\n- Search academic databases for peer-reviewed articles\n- Look for meta-analyses or systematic reviews\n- Check reference lists of key papers for additional sources\n\n`;
    answer += `> 💡 Use the **References** panel to find and save relevant papers.\n`;
  }
  // Why questions
  else if (q.includes('why')) {
    answer += `Understanding **why ${topic}** matters involves multiple perspectives:\n\n`;
    answer += `### Key Reasons\n- **Theoretical** — Contributes to foundational understanding\n- **Practical** — Real-world applications and impact\n- **Research** — Addresses gaps in current knowledge\n- **Future** — Shapes emerging trends and developments\n\n`;
    answer += `### Deeper Analysis\nThe significance of ${topic} can be examined through both historical and contemporary lenses. Scholars have explored this from various disciplinary perspectives, each offering unique insights.\n\n`;
    answer += `> 💡 Add relevant references and I can provide more specific, cited answers.\n`;
  }
  // Generic
  else {
    answer += `### Overview\n**${topic.charAt(0).toUpperCase() + topic.slice(1)}** is a multifaceted subject:\n\n`;
    answer += `- **Conceptual framework** — Theoretical underpinnings and definitions\n`;
    answer += `- **Current perspectives** — Modern understanding and developments\n`;
    answer += `- **Applications** — Real-world contexts and use cases\n`;
    answer += `- **Academic discussion** — Key debates and research areas\n\n`;
    answer += `### Want More Detail?\nI can provide deeper insights if you:\n1. Search for papers on "${topic}" in the **References** panel\n2. Ask a more specific question\n3. Switch to **✏️ Write mode** to draft content about this topic\n\n`;
    answer += `> 💡 Try asking: "What is ${topic}?" or "How does ${topic} work?"\n`;
  }

  if (relevantRefs.length > 0) {
    answer += `\n### 📚 Related References in Your Library\n`;
    relevantRefs.forEach((r, i) => {
      answer += `${i + 1}. **${r.authors || 'Unknown'}** (${r.year || 'n.d.'}). _${r.title}_\n`;
    });
  }

  return answer;
}

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

// Search references by topic — uses OpenAlex API (real academic papers)
app.get('/api/references/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) return res.json([]);

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

      // Compute relevance score: position-based (top results more relevant) + citation boost
      const positionScore = Math.max(0, 95 - (index * 5));
      const citationBoost = Math.round((work.cited_by_count || 0) / maxCitations * 10);
      const relevanceScore = Math.min(99, positionScore + citationBoost);

      // Extract DOI — keep both full URL and short DOI
      const doiFull = work.doi || null; // e.g. "https://doi.org/10.1234/..."
      const doiShort = doiFull ? doiFull.replace('https://doi.org/', '') : null;

      return {
        id: generateId(),
        title: work.title || 'Untitled',
        authors: authors || 'Unknown',
        year: (work.publication_year || '').toString(),
        journal,
        doi: doiShort,
        abstract: abstract.substring(0, 500),
        url: doiFull, // Full clickable URL
        confidence: (journal && doiShort) ? 'verified' : doiShort ? 'partial' : 'manual',
        relevance_score: relevanceScore,
        cited_by_count: work.cited_by_count || 0,
      };
    });

    // Sort by relevance score descending
    results.sort((a, b) => b.relevance_score - a.relevance_score);
    res.json(results);
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

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
    const { message, mode } = req.body;

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

    // Generate AI response based on mode
    let aiResponse;
    if (mode === 'ask') {
      aiResponse = generateAskResponse(message.trim(), notebook?.content, refs);
    } else {
      aiResponse = generateChatResponse(message.trim(), notebook?.content, refs);
    }

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
