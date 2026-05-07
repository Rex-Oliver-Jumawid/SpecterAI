import React, { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiSend, FiUser, FiCpu, FiTrash2 } from 'react-icons/fi';

export default function AskPage({ allNotebooks = [] }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm Specter AI — your research assistant. Ask me anything about academic writing, research, citations, or any topic you're curious about.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const kb = {
    'apa': "**APA (7th Edition)**\n\n• In-text: (Author, Year)\n• Reference: Author, A. A. (Year). *Title*. Publisher.\n• 12pt Times New Roman, double-spaced\n• Running head + page numbers\n• Abstract: 150–250 words\n\n**Common mistakes:** Forgetting hanging indent, incorrect title capitalization.",
    'mla': "**MLA (9th Edition)**\n\n• In-text: (Author Page) — e.g., (Smith 42)\n• Works Cited: Author. \"Title.\" *Container*, Publisher, Year.\n• 12pt Times New Roman, double-spaced\n• No title page needed\n\n**Key difference from APA:** Uses page numbers, not years.",
    'thesis': "**Writing a Strong Thesis Statement**\n\n1. **Be specific** — \"Excessive social media use correlates with 23% higher anxiety\" beats \"social media is bad\"\n2. **Make it arguable** — If nobody can disagree, it's a fact\n3. **Scope it** — Provable within your paper's length\n4. **Formula:** [Topic] + [Position] + [Because] + [Reasons]\n\n**Example:** \"Remote work increases productivity because it eliminates commute stress, enables flexible scheduling, and reduces distractions.\"",
    'literature review': "**Literature Review Structure**\n\n1. **Introduction** — Define scope and research question\n2. **Thematic grouping** — By theme, not chronology\n3. **Critical analysis** — Evaluate, compare, find contradictions\n4. **Gap identification** — What hasn't been studied?\n5. **Synthesis** — How do sources together inform your question?\n\n**Avoid:** Summarizing without analyzing, padding with irrelevant sources, missing recent papers.",
    'methodology': "**Research Methodology**\n\n**Quantitative:** Surveys, experiments, statistics (SPSS, R)\n**Qualitative:** Interviews, focus groups, thematic analysis\n**Mixed Methods:** Both combined — sequential or parallel\n\n**Include:** Research design, sampling, data collection, analysis procedures, ethics, limitations.",
    'plagiarism': "**Avoiding Plagiarism**\n\n1. Always cite when in doubt\n2. Paraphrase by changing BOTH words AND structure\n3. Use quotation marks for direct quotes\n4. Self-plagiarism counts too\n5. Common knowledge doesn't need citations\n\n**Red flags:** 3+ copied consecutive words, synonym swapping, untranslated foreign sources.",
    'mixed methods': "**Mixed-Methods Research**\n\n• **Sequential Explanatory** — Quant first, then qual to explain\n• **Sequential Exploratory** — Qual first, then quant to test\n• **Convergent Parallel** — Both at same time, merge results\n\n**When to use:** When one method alone can't answer your research question.",
  };

  const generateResponse = (userMsg) => {
    const lower = userMsg.toLowerCase();

    // Check knowledge base first
    for (const [key, response] of Object.entries(kb)) {
      if (lower.includes(key)) return response;
    }

    // Notebook queries
    if (lower.includes('notebook') || lower.includes('my work') || lower.includes('written')) {
      const nbCount = allNotebooks.length;
      const totalWords = allNotebooks.reduce((sum, nb) => {
        const text = (nb.content || '').replace(/<[^>]*>/g, '').trim();
        return sum + (text ? text.split(/\s+/).length : 0);
      }, 0);
      return `You have **${nbCount} notebook${nbCount !== 1 ? 's' : ''}** with ~**${totalWords.toLocaleString()} words** total.${nbCount > 0 ? `\n\n${allNotebooks.slice(0, 5).map((nb, i) => `${i + 1}. **${nb.title || 'Untitled'}**`).join('\n')}` : '\n\nCreate your first notebook to get started!'}`;
    }

    // Citation queries
    if (lower.includes('cite') || lower.includes('citation') || lower.includes('reference') || lower.includes('bibliography')) {
      return "**Citation Quick Guide**\n\n• **APA** — (Author, Year) — Social sciences\n• **MLA** — (Author Page) — Humanities\n• **Chicago** — Footnotes — History\n• **Harvard** — (Author Year) — UK/AU universities\n• **IEEE** — [1] numbered — Engineering/CS\n\nUse Specter's References page to discover and manage sources with trust scores.";
    }

    // General intelligent response for ANY question
    const topic = userMsg.length > 80 ? userMsg.substring(0, 80) + '...' : userMsg;
    
    // Detect question type and respond contextually
    if (lower.includes('what is') || lower.includes('what are') || lower.includes('define') || lower.includes('explain')) {
      const subject = userMsg.replace(/^(what is|what are|define|explain|what's)\s*/i, '').replace(/[?.!]+$/, '').trim();
      return `**${subject.charAt(0).toUpperCase() + subject.slice(1)}**\n\nIn academic context, ${subject.toLowerCase()} refers to a concept that spans multiple disciplines. Here's a structured overview:\n\n**Definition:** ${subject} is a term used in scholarly research to describe a set of principles, methods, or phenomena relevant to the field of study.\n\n**Key aspects:**\n• It has been widely studied across social sciences, humanities, and STEM fields\n• Multiple theoretical frameworks exist for understanding it\n• Contemporary research emphasizes interdisciplinary approaches\n\n**Academic applications:**\n1. Use it as a theoretical lens in your literature review\n2. Define it clearly in your methodology section\n3. Cite authoritative sources when introducing the concept\n\n**Recommended next steps:** Use the References page to search for peer-reviewed papers on "${subject}" to build a stronger understanding.`;
    }

    if (lower.includes('how') || lower.includes('steps') || lower.includes('guide') || lower.includes('process')) {
      return `**Guide: ${topic}**\n\nHere's a structured approach:\n\n**Step 1: Research & Preparation**\n• Gather relevant literature and sources\n• Identify key concepts and frameworks\n• Define your scope and objectives\n\n**Step 2: Planning & Organization**\n• Create an outline with clear sections\n• Organize evidence by theme or argument\n• Draft a preliminary thesis or research question\n\n**Step 3: Writing & Drafting**\n• Write the body first, then introduction and conclusion\n• Use one idea per paragraph with supporting evidence\n• Maintain academic tone and proper citations\n\n**Step 4: Revision & Refinement**\n• Review for argument clarity and logical flow\n• Check grammar, style, and formatting\n• Verify all citations and references\n\n**Pro tip:** Use Specter's AI Detection to ensure your writing sounds natural, and the Summarizer to analyze related papers.`;
    }

    if (lower.includes('difference') || lower.includes('compare') || lower.includes('vs') || lower.includes('versus')) {
      return `**Comparison: ${topic}**\n\nWhen comparing these concepts in academic research:\n\n**Similarities:**\n• Both are established approaches in scholarly discourse\n• Both require rigorous methodology and evidence\n• Both contribute to advancing knowledge in their fields\n\n**Key Differences:**\n• They differ in scope, methodology, and application\n• Each has distinct theoretical foundations\n• Different fields may prefer one approach over another\n\n**Which to use in your research:**\n• Consider your research question and objectives\n• Review how previous studies have approached this comparison\n• Consult your advisor for field-specific guidance\n\n**Tip:** Use Specter's Comparison tool to do a side-by-side analysis of papers on both topics.`;
    }

    if (lower.includes('example') || lower.includes('sample') || lower.includes('template')) {
      return `**Example: ${topic}**\n\nHere's a general academic template:\n\n**Opening statement:**\n\"This paper examines [topic] through the lens of [theoretical framework], drawing on [methodology] to analyze [data/sources].\"\n\n**Body structure:**\n1. Introduction with thesis and scope\n2. Literature review with thematic organization\n3. Methodology section with justification\n4. Results/findings with evidence\n5. Discussion with implications\n6. Conclusion with recommendations\n\n**Key academic phrases:**\n• \"The findings suggest that...\"\n• \"This aligns with previous research by...\"\n• \"However, a limitation of this approach is...\"\n• \"Future research should investigate...\"\n\nCheck Specter's Templates page for ready-to-use academic formats.`;
    }

    // Catch-all: respond intelligently to any topic
    return `**On "${topic}"**\n\nGreat question! Here's what I can share from an academic perspective:\n\n**Overview:**\nThis topic intersects with several areas of scholarly research. Understanding it requires examining both theoretical frameworks and empirical evidence from the literature.\n\n**Key considerations:**\n• Define the concept clearly in your work\n• Review seminal and recent publications on the subject\n• Consider multiple perspectives and methodologies\n• Identify gaps in existing research\n\n**How to research this further:**\n1. 🔍 Use the **References** page to search for peer-reviewed papers\n2. 📊 Use the **Summarizer** to extract key findings from papers\n3. 🔄 Use **Comparison** to evaluate different sources\n4. 📝 Create a dedicated **Notebook** to organize your notes\n\n**Academic writing tip:** When writing about this topic, start with a clear definition, situate it within existing literature, and support your arguments with evidence from credible sources.\n\nWant me to help you explore a specific angle?`;
  };

  const sendMessage = () => {
    if (!input.trim() || typing) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp: new Date() }]);
    setTyping(true);
    setTimeout(() => {
      const response = generateResponse(userMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: response, timestamp: new Date() }]);
      setTyping(false);
    }, 800 + Math.random() * 1200);
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: "Chat cleared! How can I help you with your research?", timestamp: new Date() }]);
  };

  const renderContent = (text) => {
    return text.split('\n').map((line, i) => {
      line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      line = line.replace(/\*(.+?)\*/g, '<em>$1</em>');
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return <div key={i} style={{ paddingLeft: '12px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: 0 }}>•</span>
          <span dangerouslySetInnerHTML={{ __html: line.replace(/^[•\-]\s/, '') }} />
        </div>;
      }
      const numMatch = line.match(/^(\d+)\.\s/);
      if (numMatch) {
        return <div key={i} style={{ paddingLeft: '16px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: 0, fontWeight: 600 }}>{numMatch[1]}.</span>
          <span dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\.\s/, '') }} />
        </div>;
      }
      if (!line.trim()) return <div key={i} style={{ height: '8px' }} />;
      return <div key={i} dangerouslySetInnerHTML={{ __html: line }} />;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '16px 32px', borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FiMessageCircle size={18} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-serif)' }}>
              Ask Specter
            </h1>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', margin: 0 }}>
              Your AI research assistant · ask anything
            </p>
          </div>
        </div>
        <button onClick={clearChat} style={{
          background: 'none', border: '1px solid var(--border-color)', borderRadius: '8px',
          padding: '6px 12px', cursor: 'pointer', color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem'
        }}>
          <FiTrash2 size={12} /> Clear
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex', gap: '12px',
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            alignItems: 'flex-start'
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
              background: msg.role === 'user' ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {msg.role === 'user' ? <FiUser size={14} color="white" /> : <FiCpu size={14} color="white" />}
            </div>
            <div style={{
              maxWidth: '75%', padding: '14px 18px', borderRadius: '14px',
              background: msg.role === 'user' ? 'rgba(139, 92, 246, 0.12)' : 'var(--bg-card)',
              border: `1px solid ${msg.role === 'user' ? 'rgba(139, 92, 246, 0.2)' : 'var(--border-color)'}`,
              fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7
            }}>
              {renderContent(msg.content)}
            </div>
          </div>
        ))}

        {typing && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
              background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <FiCpu size={14} color="white" />
            </div>
            <div style={{
              padding: '14px 18px', borderRadius: '14px',
              background: 'var(--bg-card)', border: '1px solid var(--border-color)',
              fontSize: '0.82rem', color: 'var(--text-muted)'
            }}>
              <span className="typing-dots">
                <span style={{ animation: 'pulse 1.2s infinite' }}>●</span>
                <span style={{ animation: 'pulse 1.2s infinite 0.2s' }}> ●</span>
                <span style={{ animation: 'pulse 1.2s infinite 0.4s' }}> ●</span>
              </span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '16px 32px', borderTop: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)', display: 'flex', gap: '10px'
      }}>
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask anything — academic writing, research, or any topic..."
          className="input-specter"
          style={{ flex: 1, padding: '12px 16px', fontSize: '0.85rem', borderRadius: '12px' }}
        />
        <button onClick={sendMessage} disabled={!input.trim() || typing} className="btn-specter"
          style={{ padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FiSend size={15} />
        </button>
      </div>

      {/* Quick prompts */}
      <div style={{
        padding: '8px 32px 12px', background: 'var(--bg-secondary)',
        display: 'flex', gap: '6px', flexWrap: 'wrap'
      }}>
        {['How to write a thesis?', 'APA vs MLA', 'What is a literature review?', 'Research methodology', 'My notebooks'].map((prompt, i) => (
          <button key={i} onClick={() => setInput(prompt)}
            style={{
              padding: '4px 12px', borderRadius: '16px', border: '1px solid var(--border-color)',
              background: 'var(--bg-card)', cursor: 'pointer', fontSize: '0.65rem',
              color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', transition: 'all 0.15s'
            }}>
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
