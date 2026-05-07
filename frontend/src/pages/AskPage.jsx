import React, { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiSend, FiUser, FiCpu, FiTrash2, FiBookOpen, FiSearch, FiFileText } from 'react-icons/fi';

export default function AskPage({ allNotebooks = [] }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm Specter AI — your research assistant. You can ask me anything about academic writing, research methodology, or your notebooks. Try:\n\n• \"What's the difference between APA and MLA?\"\n• \"How do I write a strong thesis statement?\"\n• \"Explain the mixed-methods approach\"\n• \"What should a literature review include?\"",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const knowledgeBase = {
    'apa': "**APA (7th Edition) Format**\n\nAPA style is the most commonly used citation format in social sciences, psychology, and education.\n\n**Key rules:**\n• In-text: (Author, Year) — e.g., (Smith, 2023)\n• Reference list: Author, A. A. (Year). *Title of work*. Publisher.\n• Double-spaced, 12pt Times New Roman or 11pt Calibri\n• Running head on every page\n• Abstract: 150–250 words\n\n**Common mistakes:** Forgetting hanging indent in references, incorrect capitalization in titles (only capitalize first word + proper nouns in reference entries).",
    'mla': "**MLA Format (9th Edition)**\n\nMLA is standard in humanities, literature, and arts.\n\n**Key rules:**\n• In-text: (Author Page) — e.g., (Smith 42)\n• Works Cited entry: Author. \"Title.\" *Container*, Publisher, Year.\n• Double-spaced, 12pt Times New Roman\n• No title page required (header with name, instructor, course, date)\n• No abstract needed\n\n**Key difference from APA:** MLA uses page numbers, not years. MLA doesn't need a running head.",
    'thesis': "**Writing a Strong Thesis Statement**\n\n1. **Be specific** — avoid vague claims. Instead of \"social media is bad,\" try \"Excessive social media use among college students correlates with a 23% increase in reported anxiety symptoms.\"\n\n2. **Make it arguable** — someone should be able to disagree. If nobody would argue against it, it's a fact, not a thesis.\n\n3. **Scope it** — your thesis should be provable within your paper's length.\n\n4. **Formula:** [Topic] + [Your position] + [Because/Through] + [Key reasons]\n\n**Example:** \"Remote work increases employee productivity in tech companies because it eliminates commute stress, enables flexible scheduling, and reduces office distractions.\"",
    'literature review': "**What a Literature Review Should Include**\n\n1. **Introduction** — Define scope, state the research question, explain selection criteria\n2. **Thematic Organization** — Group sources by theme, not chronologically\n3. **Critical Analysis** — Don't just summarize; evaluate methodology, compare findings, identify contradictions\n4. **Gap Identification** — What hasn't been studied? What questions remain?\n5. **Synthesis** — How do all sources together inform your research question?\n\n**Common mistakes:**\n• Writing a book report (summary without analysis)\n• Including irrelevant sources to pad the count\n• Not connecting sources to each other\n• Missing recent publications (last 2-3 years)",
    'mixed methods': "**Mixed-Methods Research**\n\nCombines quantitative (numbers) and qualitative (words/themes) approaches.\n\n**Types:**\n• **Sequential Explanatory** — Quant first, then qual to explain results\n• **Sequential Exploratory** — Qual first, then quant to test findings\n• **Convergent Parallel** — Both at same time, merge for comparison\n\n**When to use:** When one method alone can't answer your research question. Common in education, health sciences, and social policy research.\n\n**Example:** Survey 200 teachers (quantitative) + interview 15 in-depth (qualitative) about technology adoption.",
    'methodology': "**Research Methodology Guide**\n\n**Quantitative:** Numbers, statistics, hypothesis testing\n• Tools: Surveys, experiments, secondary data\n• Analysis: SPSS, R, Excel (t-tests, ANOVA, regression)\n\n**Qualitative:** Themes, meanings, lived experiences\n• Tools: Interviews, focus groups, observation\n• Analysis: Thematic analysis, grounded theory, narrative\n\n**Key sections to include:**\n1. Research design & justification\n2. Sampling strategy & size\n3. Data collection instruments\n4. Data analysis procedures\n5. Ethical considerations\n6. Limitations & validity measures",
    'plagiarism': "**Avoiding Plagiarism**\n\n1. **Always cite** — When in doubt, cite it\n2. **Paraphrase properly** — Change both words AND structure. Just swapping synonyms is still plagiarism.\n3. **Use quotation marks** for direct quotes, even short ones\n4. **Self-plagiarism** — Reusing your own previous work without disclosure\n5. **Common knowledge exception** — Facts widely known don't need citation (e.g., \"Water boils at 100°C\")\n\n**Red flags:**\n• Copying 3+ consecutive words without quotes\n• Changing a few words from a source\n• Translating from another language without citing",
  };

  const generateResponse = (userMsg) => {
    const lower = userMsg.toLowerCase();

    // Check knowledge base
    for (const [key, response] of Object.entries(knowledgeBase)) {
      if (lower.includes(key)) {
        return response;
      }
    }

    // Check for notebook-related questions
    if (lower.includes('notebook') || lower.includes('my work') || lower.includes('written')) {
      const nbCount = allNotebooks.length;
      const totalWords = allNotebooks.reduce((sum, nb) => {
        const text = (nb.content || '').replace(/<[^>]*>/g, '').trim();
        return sum + (text ? text.split(/\s+/).length : 0);
      }, 0);
      return `You currently have **${nbCount} notebook${nbCount !== 1 ? 's' : ''}** with approximately **${totalWords.toLocaleString()} total words**.\n\n${nbCount > 0 ? `Your notebooks are:\n${allNotebooks.slice(0, 5).map((nb, i) => `${i + 1}. **${nb.title || 'Untitled'}**`).join('\n')}${nbCount > 5 ? `\n...and ${nbCount - 5} more` : ''}` : 'Create your first notebook to get started!'}\n\nWant me to help with any specific notebook?`;
    }

    // Check for writing tips
    if (lower.includes('tip') || lower.includes('advice') || lower.includes('help') || lower.includes('how to')) {
      return "**Academic Writing Tips**\n\n1. 📝 **Start with an outline** — Structure before prose\n2. 🎯 **One idea per paragraph** — Topic sentence → evidence → analysis\n3. 📖 **Read similar papers** — Learn the conventions of your field\n4. ✏️ **Write first, edit later** — Don't perfectionism-block yourself\n5. 🔄 **Revise in layers** — First for argument, then for clarity, then for grammar\n6. 📊 **Use evidence** — Every claim needs support\n7. 🗣️ **Read aloud** — Catches awkward phrasing your eyes miss\n\nWhat specific aspect of writing do you need help with?";
    }

    // Check for citation questions
    if (lower.includes('cite') || lower.includes('citation') || lower.includes('reference') || lower.includes('bibliography')) {
      return "**Citation Quick Guide**\n\n| Style | In-text | Use Case |\n|-------|---------|----------|\n| **APA** | (Author, Year) | Social sciences, psychology |\n| **MLA** | (Author Page) | Humanities, literature |\n| **Chicago** | Footnotes or (Author Year) | History, some humanities |\n| **Harvard** | (Author Year) | UK/Australian universities |\n| **IEEE** | [1] numbered | Engineering, CS |\n\n**Pro tip:** Use Specter's References page to manage your sources — it auto-calculates trust scores and helps you discover relevant papers.\n\nWhich citation style do you need help with?";
    }

    // Default intelligent response
    return `That's a great question about **"${userMsg.length > 50 ? userMsg.substring(0, 50) + '...' : userMsg}"**.\n\nWhile I'm currently running in offline mode (no live AI API connected), here's what I can help you with right now:\n\n• 📚 **Citation formats** — Ask about APA, MLA, Chicago, Harvard\n• ✍️ **Writing tips** — Thesis statements, literature reviews, methodology\n• 📊 **Research methods** — Quantitative, qualitative, mixed methods\n• 🛡️ **Academic integrity** — Plagiarism avoidance, proper paraphrasing\n• 📒 **Your notebooks** — Ask about your current work\n\nTry asking something more specific and I'll give you a detailed answer!`;
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
    setMessages([{
      role: 'assistant',
      content: "Chat cleared! How can I help you with your research?",
      timestamp: new Date()
    }]);
  };

  // Simple markdown-ish renderer
  const renderContent = (text) => {
    return text.split('\n').map((line, i) => {
      // Bold
      line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      // Italic
      line = line.replace(/\*(.+?)\*/g, '<em>$1</em>');
      // Bullet
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return <div key={i} style={{ paddingLeft: '12px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: 0 }}>•</span>
          <span dangerouslySetInnerHTML={{ __html: line.replace(/^[•\-]\s/, '') }} />
        </div>;
      }
      // Numbered list
      const numMatch = line.match(/^(\d+)\.\s/);
      if (numMatch) {
        return <div key={i} style={{ paddingLeft: '16px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: 0, fontWeight: 600 }}>{numMatch[1]}.</span>
          <span dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\.\s/, '') }} />
        </div>;
      }
      // Table (simple | delimited)
      if (line.includes('|') && line.trim().startsWith('|')) {
        return null; // Skip for simplicity
      }
      // Empty line
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
              Your AI research assistant · ask anything about academic writing
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
            {/* Avatar */}
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
              background: msg.role === 'user' ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {msg.role === 'user' ? <FiUser size={14} color="white" /> : <FiCpu size={14} color="white" />}
            </div>
            {/* Bubble */}
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
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about academic writing, citations, methodology..."
          className="input-specter"
          style={{ flex: 1, padding: '12px 16px', fontSize: '0.85rem', borderRadius: '12px' }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || typing}
          className="btn-specter"
          style={{
            padding: '12px 20px', borderRadius: '12px',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >
          <FiSend size={15} />
        </button>
      </div>

      {/* Quick prompts */}
      <div style={{
        padding: '8px 32px 12px', background: 'var(--bg-secondary)',
        display: 'flex', gap: '6px', flexWrap: 'wrap'
      }}>
        {['How to write a thesis?', 'APA vs MLA', 'Mixed methods research', 'Avoiding plagiarism', 'My notebooks'].map((prompt, i) => (
          <button key={i} onClick={() => { setInput(prompt); }}
            style={{
              padding: '4px 12px', borderRadius: '16px', border: '1px solid var(--border-color)',
              background: 'var(--bg-card)', cursor: 'pointer', fontSize: '0.65rem',
              color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', transition: 'all 0.15s'
            }}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
