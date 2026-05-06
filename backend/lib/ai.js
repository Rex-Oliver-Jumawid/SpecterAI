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

    const wordCount = content.split(/\s+/).length;
    summary = `👻 Specter wrote your draft while you were away.\n\n📋 Generated: Full academic draft\n📊 Word count: ~${wordCount} words (target: ${wordTarget})\n📑 Sections: 4 (Introduction, Literature Review, Analysis, Conclusions)\n🔗 References cited: ${Math.min(refList.length, 2)} sources\n${instructions ? `📝 Instructions followed: "${instructions.substring(0, 80)}..."` : ''}\n⏱️ Completed in: 3.4 seconds\n\nReview the draft and confirm when you're satisfied.`;
  }

  return { content, summary };
}

// AI chat response — IDE-style: reads document, returns edit blocks when applicable
export function generateChatResponse(message, notebookContent, references) {
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
    const continuation = `\n\nFurthermore, building upon the preceding analysis, it becomes evident that the interplay between theoretical frameworks and practical applications yields significant insights. The existing body of research provides a robust foundation for understanding these dynamics, while recent developments have introduced novel perspectives that challenge conventional approaches. This evolving landscape demands careful consideration of both established principles and emerging paradigms.\n\nMoreover, the implications of these findings extend beyond the immediate scope of this study. As the field continues to mature, the integration of diverse methodological approaches will prove essential in addressing the complex challenges that lie ahead. Future research should focus on bridging the gap between theory and practice, ensuring that academic contributions translate into meaningful real-world impact.`;
    const newContent = content + continuation;
    return `I've continued writing from where you left off, adding 2 new paragraphs that maintain your paper's tone and direction.\n\n\`\`\`edit\n${newContent}\n\`\`\``;
  }

  if (lowerMsg.includes('introduction') || lowerMsg.includes('add intro')) {
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
