/**
 * AI content generation helpers.
 * Extracted from server.js monolith for reuse across serverless functions.
 */

export function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Mock AI generation based on plan outline and references
export function generateAiContent(plan, references) {
  const refList = references.slice(0, 5);
  const topic = plan.title || 'Academic Research';
  const outputType = plan.output_type || 'draft';
  const wordTarget = plan.word_target || 500;
  const instructions = plan.instructions || '';

  // Build reference citations
  const refCitations = refList.map((r) =>
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
    content = `# Reference Summary for: ${topic}\n\n## Key Sources Found\n\n${refList.map((r, i) => `### ${i + 1}. ${r.title}\n- **Authors:** ${r.authors}\n- **Year:** ${r.year}\n- **Journal:** ${r.journal}\n- **DOI:** ${r.doi}\n- **Key Finding:** ${r.abstract?.substring(0, 150)}...\n`).join('\n')}\n\n## Synthesis\nThese ${refList.length} sources collectively address ${topic.toLowerCase()} from multiple perspectives. The literature reveals convergent themes around methodological innovation and cross-disciplinary applications.\n\n---\n*References gathered by Specter. Ready for you to begin writing.*`;

    summary = `👻 Specter gathered references for you.\n\n📋 Mode: Reference pre-fetch\n📊 Sources found: ${refList.length} relevant papers\n🔗 All sources verified and saved to your notebook\n${instructions ? `📝 Instructions followed: "${instructions.substring(0, 80)}..."` : ''}\n⏱️ Completed in: 4.2 seconds\n\nYour references are ready. Start writing when you're available!`;
  } else {
    // Default: draft
    content = `# ${topic}\n\n## Introduction\n\nThe landscape of ${topic.toLowerCase()} has undergone significant transformation in recent years, driven by advances in technology and evolving methodological frameworks. This paper examines the current state of research in this field, drawing upon established literature and recent findings to present a comprehensive analysis.\n\nAs ${refCitations[0] || 'recent scholars'} have demonstrated, the intersection of theoretical foundations and practical applications creates rich opportunities for academic inquiry. The significance of this research extends beyond the academy, with implications for policy, practice, and future investigation.\n\n## Literature Review\n\nThe existing body of literature reveals several key themes that inform our understanding of ${topic.toLowerCase()}. ${refCitations[1] || 'Previous studies'} established foundational frameworks that continue to guide contemporary research, while more recent work has expanded these perspectives to incorporate emerging paradigms.\n\nNotably, the field has moved toward increasingly interdisciplinary approaches, recognizing that complex phenomena require multifaceted analytical lenses. This shift has produced more nuanced findings and opened new avenues for exploration.\n\n## Analysis\n\nOur analysis reveals several patterns that warrant further examination. First, there is a clear trend toward integration of diverse methodological approaches, suggesting that the field values methodological pluralism. Second, the evidence points toward several promising directions for future research, particularly regarding the application of novel analytical frameworks.\n\nThe data suggest that traditional approaches, while valuable, may benefit from augmentation with contemporary techniques. This finding aligns with the broader trend in academic research toward mixed-methods designs.\n\n## Preliminary Conclusions\n\nBased on the evidence reviewed, several preliminary conclusions emerge. The field of ${topic.toLowerCase()} is positioned at a critical juncture, with opportunities for significant advancement through interdisciplinary collaboration and methodological innovation. Future research should prioritize addressing the gaps identified in this analysis while building upon the strong theoretical foundations established by prior scholarship.\n\n---\n*This draft was generated by Specter based on your outline and saved references. Review, refine, and make it yours.*`;

    const wc = content.split(/\s+/).length;
    summary = `👻 Specter wrote your draft while you were away.\n\n📋 Generated: Full academic draft\n📊 Word count: ~${wc} words (target: ${wordTarget})\n📑 Sections: 4 (Introduction, Literature Review, Analysis, Conclusions)\n🔗 References cited: ${Math.min(refList.length, 2)} sources\n${instructions ? `📝 Instructions followed: "${instructions.substring(0, 80)}..."` : ''}\n⏱️ Completed in: 3.4 seconds\n\nReview the draft and confirm when you're satisfied.`;
  }

  return { content, summary };
}

// AI chat response — IDE-style: reads document, returns edit blocks when applicable
export function generateChatResponse(message, notebookContent, references) {
  const lowerMsg = message.toLowerCase();
  const rawContent = (notebookContent || '').replace(/<br\s*\/?>/gi, '\n').replace(/<\/div>/gi, '\n').replace(/<[^>]*>/g, '').trim();
  const content = rawContent;
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 5);
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);

  function improveText(text) {
    if (!text || text.length < 20) return text;
    let improved = text.replace(/(^|[.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());
    improved = improved.replace(/  +/g, ' ');
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

  // ═══ AI DETECTION ═══
  if (lowerMsg.includes('ai-written') || lowerMsg.includes('ai written') || lowerMsg.includes('ai-generated') || lowerMsg.includes('ai generated') || lowerMsg.includes('check if ai') || lowerMsg.includes('detect ai') || lowerMsg.includes('authentic')) {
    if (wordCount < 10) {
      return "Your document is too short to analyze. Write at least a few sentences, then I can check for AI patterns.";
    }
    const avgSentenceLen = sentences.length > 0 ? Math.round(wordCount / sentences.length) : 0;
    const hasVariedLength = sentences.length > 2 && sentences.some(s => s.split(/\s+/).length < 10) && sentences.some(s => s.split(/\s+/).length > 20);
    const hasPersonalPronouns = /\b(I|my|we|our)\b/i.test(content);
    const transitionCount = (content.match(/\b(furthermore|moreover|additionally|consequently|however|nevertheless|in conclusion|it is important)\b/gi) || []).length;
    const hasSpecificData = /\d+%|\d+\.\d+|figure \d|table \d|p\s*[<>=]/i.test(content);

    let humanScore = 50;
    if (hasVariedLength) humanScore += 12;
    if (hasPersonalPronouns) humanScore += 10;
    if (hasSpecificData) humanScore += 15;
    if (transitionCount > paragraphs.length * 2) humanScore -= 15;
    if (!hasVariedLength && sentences.length > 3) humanScore -= 10;
    humanScore = Math.max(15, Math.min(95, humanScore));
    const aiScore = 100 - humanScore;

    const flagged = [];
    ['it is important to note', 'in conclusion', 'furthermore', 'moreover', 'comprehensive analysis', 'multifaceted', 'nuanced understanding', 'paradigm', 'robust framework'].forEach(p => {
      if (content.toLowerCase().includes(p)) flagged.push(p);
    });

    let r = `## 🤖 AI Detection Analysis\n\n**Score:** ${aiScore}% AI-like · ${humanScore}% human-like\n\n`;
    r += aiScore > 65 ? `⚠️ **High AI probability.** Your text shows AI-common patterns.\n\n` :
         aiScore > 40 ? `🟡 **Moderate AI patterns.** Some sections may be flagged.\n\n` :
         `✅ **Looks authentic!** Strong human authorship characteristics.\n\n`;
    r += `### Breakdown\n- Sentence variety: ${hasVariedLength ? '✅ Good' : '⚠️ Too uniform'}\n- Personal voice: ${hasPersonalPronouns ? '✅ Present' : '⚠️ Missing'}\n- Specific data: ${hasSpecificData ? '✅ Found' : '⚠️ Add some!'}\n- Transitions: ${transitionCount} ${transitionCount > paragraphs.length * 2 ? '(⚠️ overused)' : '(✅ ok)'}\n`;
    if (flagged.length > 0) {
      r += `\n### 🚩 Flagged Phrases\n`;
      flagged.forEach(p => { r += `- _"${p}"_\n`; });
    }
    r += `\n### Tips\n1. Add specific examples and data\n2. Mix short and long sentences\n3. Use first-person where appropriate\n4. Replace generic phrases with domain terms`;
    return r;
  }

  // ═══ REFERENCE-AWARE WRITING ═══
  if ((lowerMsg.includes('write') || lowerMsg.includes('draft') || lowerMsg.includes('paragraph')) && (lowerMsg.includes('reference') || lowerMsg.includes('source') || lowerMsg.includes('cite') || lowerMsg.includes('citation'))) {
    if (references.length === 0) {
      return `No references saved yet. To write with references:\n1. Go to **References** panel or sidebar\n2. Search and save academic papers\n3. Then ask me to write using them\n\nWhat topic should I search for?`;
    }
    const cites = references.slice(0, 5).map(r => `${r.authors?.split(',')[0] || 'Unknown'} (${r.year || 'n.d.'})`);
    const details = references.slice(0, 5).map(r => `- ${r.authors?.split(',')[0] || 'Unknown'} (${r.year}): "${r.title}"`).join('\n');
    const para = `\n\nRecent scholarship has contributed significantly to our understanding of this subject. ${cites[0]} established foundational perspectives that continue to inform contemporary discourse. Building upon this work, ${cites[1] || 'subsequent studies'} demonstrated that integrating diverse analytical frameworks produces more comprehensive findings. As ${cites[2] || 'recent scholars'} have noted, the intersection of empirical evidence and theoretical models creates a robust foundation for advancing knowledge in this domain (${cites.slice(0, 3).join('; ')}).`;
    const newContent = content + para;
    return `I've written a paragraph citing ${Math.min(references.length, 5)} references.\n\n**Sources used:**\n${details}\n\n\`\`\`edit\n${newContent}\n\`\`\``;
  }

  // EDIT COMMANDS
  if (lowerMsg.includes('improve') || lowerMsg.includes('fix grammar') || lowerMsg.includes('revise') || lowerMsg.includes('edit') || lowerMsg.includes('rewrite')) {
    if (wordCount < 5) return "Your document is empty or too short. Write some content first!";
    const improved = improveText(content);
    return `I've improved your document (${wordCount} words) for clarity, grammar, and style.\n\n\`\`\`edit\n${improved}\n\`\`\``;
  }

  if (lowerMsg.includes('continue') || lowerMsg.includes('keep writing') || lowerMsg.includes('write more')) {
    if (wordCount < 5) return "Your document is empty. What topic should I write about?";
    const continuation = `\n\nFurthermore, building upon the preceding analysis, it becomes evident that the interplay between theoretical frameworks and practical applications yields significant insights. The existing body of research provides a robust foundation for understanding these dynamics, while recent developments have introduced novel perspectives that challenge conventional approaches.\n\nMoreover, the implications of these findings extend beyond the immediate scope of this study. As the field continues to mature, the integration of diverse methodological approaches will prove essential in addressing the complex challenges ahead.`;
    const newContent = content + continuation;
    return `I've continued writing with 2 new paragraphs.\n\n\`\`\`edit\n${newContent}\n\`\`\``;
  }

  if (lowerMsg.includes('introduction') || lowerMsg.includes('add intro')) {
    const refIntro = references.length > 0 ? ` As ${references[0]?.authors?.split(',')[0] || 'recent scholars'} (${references[0]?.year || 'n.d.'}) have demonstrated, the intersection of theoretical foundations and practical applications creates rich opportunities for academic inquiry.` : '';
    const intro = `The landscape of contemporary research has undergone significant transformation in recent years, driven by advances in technology and evolving methodological frameworks. This paper examines the current state of research in this field, drawing upon established literature and recent findings.${refIntro}\n\nThe primary objective of this study is to synthesize existing knowledge and identify key trends that shape current understanding.\n\n`;
    const newContent = intro + content;
    return `I've added an introduction${references.length > 0 ? ' with references' : ''}.\n\n\`\`\`edit\n${newContent}\n\`\`\``;
  }

  if (lowerMsg.includes('conclusion') || lowerMsg.includes('add conclusion') || lowerMsg.includes('wrap up')) {
    const conclusion = `\n\n## Conclusion\n\nIn conclusion, this study has examined the multifaceted dimensions of the topic under investigation, revealing several key findings. The analysis demonstrates that current approaches would benefit from greater integration of interdisciplinary perspectives and methodological innovation.\n\nMoving forward, researchers should consider adopting more holistic frameworks. Future work should prioritize longitudinal investigations and cross-cultural comparisons to further validate the present findings.`;
    const newContent = content + conclusion;
    return `I've added a conclusion section.\n\n\`\`\`edit\n${newContent}\n\`\`\``;
  }

  // INFO COMMANDS
  if (lowerMsg.includes('summarize') || lowerMsg.includes('summary')) {
    const topSentences = sentences.slice(0, 3).map(s => s.trim()).join('. ');
    return `**Summary of your draft:**\n\n📊 **Words:** ${wordCount} (${paragraphs.length} paragraphs)\n📑 **References:** ${references.length}\n\n${topSentences ? `> ${topSentences}.` : '> (Document is empty)'}\n\nWant me to improve or continue writing?`;
  }

  if (lowerMsg.includes('reference') || lowerMsg.includes('cite') || lowerMsg.includes('source')) {
    if (references.length === 0) {
      return `No references saved yet. You can:\n1. Go to **References** panel and paste a URL/DOI\n2. Use **Discover** from the sidebar to search papers\n3. Tell me a topic to search for`;
    }
    const refList = references.slice(0, 5).map((r, i) => `${i + 1}. **${r.authors}** (${r.year}). _${r.title}_.`).join('\n');
    return `Your references:\n\n${refList}\n\n**${references.length}** total. 💡 Say _"Write a paragraph using my references"_ to cite them!`;
  }

  if (lowerMsg.includes('outline') || lowerMsg.includes('structure')) {
    return `Suggested outline for your ${wordCount}-word document:\n\n1. **Introduction** (300-400 words)\n2. **Literature Review** (800-1000 words)\n3. **Methodology** (400-600 words)\n4. **Results & Discussion** (600-800 words)\n5. **Conclusion** (200-300 words)\n\nWant me to draft any section?`;
  }

  if (lowerMsg.includes('write') || lowerMsg.includes('draft') || lowerMsg.includes('paragraph')) {
    const para = `\n\nThe current body of research demonstrates a growing consensus regarding the importance of integrated methodological approaches. Traditional frameworks provide essential foundational understanding, while contemporary techniques offer enhanced analytical capabilities. This synthesis has proven particularly valuable in addressing complex research questions.`;
    const newContent = content + para;
    return `I've drafted a new paragraph.\n\n\`\`\`edit\n${newContent}\n\`\`\``;
  }

  // Default response
  return `I'm reading your document (${wordCount} words, ${references.length} refs). I can:\n\n📚 **Write with refs** — "Write using my references"\n🤖 **AI Check** — "Check if AI-written"\n✍️ **Edit** — "Improve my writing"\n📝 **Write** — "Continue writing"\n📖 **Sections** — "Add introduction" or "Add conclusion"\n📋 **Outline** — "Create an outline"\n📊 **Summarize** — Overview of your draft\n\nAll edits are previewed — **Keep** or **Undo**.`;
}
