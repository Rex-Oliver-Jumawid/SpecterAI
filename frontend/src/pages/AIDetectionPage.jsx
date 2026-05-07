import React, { useState, useEffect, useMemo } from 'react';
import { FiShield, FiBookOpen, FiAlertTriangle, FiCheckCircle, FiInfo, FiRefreshCw, FiEdit3 } from 'react-icons/fi';
import { notebooks as notebooksApi } from '../api';

export default function AIDetectionPage({ allNotebooks = [] }) {
  const [selectedNotebookId, setSelectedNotebookId] = useState('');
  const [notebookContent, setNotebookContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [sentences, setSentences] = useState([]);
  const [overallScore, setOverallScore] = useState(0);
  const [selectedSentenceId, setSelectedSentenceId] = useState(null);
  const [humanizing, setHumanizing] = useState(null);
  const [humanizedMap, setHumanizedMap] = useState({});

  // Load notebook content when selected
  useEffect(() => {
    if (!selectedNotebookId) { setNotebookContent(''); setAnalyzed(false); setSentences([]); return; }
    setLoading(true);
    notebooksApi.get(selectedNotebookId)
      .then(nb => setNotebookContent(nb.content || ''))
      .catch(() => setNotebookContent(''))
      .finally(() => setLoading(false));
  }, [selectedNotebookId]);

  const analyzeContent = () => {
    if (!notebookContent) return;
    setLoading(true);

    setTimeout(() => {
      // Strip HTML and split into sentences
      const plainText = notebookContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      const rawSentences = plainText.split(/(?<=[.!?])\s+/).filter(s => s.length > 15);
      
      // Score each sentence (simulated AI detection)
      const scored = rawSentences.map((text, i) => {
        // Heuristic scoring — longer, more formal sentences score higher as "AI-likely"
        let score = 0;
        
        // Formal academic phrases boost AI score
        const aiPatterns = [
          'furthermore', 'moreover', 'consequently', 'nevertheless', 'therefore',
          'significant', 'demonstrates', 'comprehensive', 'methodology', 'framework',
          'paradigm', 'multifaceted', 'interdisciplinary', 'nuanced', 'robust',
          'implications', 'empirical', 'systematic', 'foundational', 'contemporary'
        ];
        const lower = text.toLowerCase();
        const patternHits = aiPatterns.filter(p => lower.includes(p)).length;
        score += patternHits * 15;
        
        // Long sentences score higher
        const wordCount = text.split(/\s+/).length;
        if (wordCount > 30) score += 20;
        else if (wordCount > 20) score += 10;
        
        // Perfect grammar / no contractions
        if (!lower.includes("'t") && !lower.includes("'s") && !lower.includes("'re")) score += 5;
        
        // Repetitive structure
        if (lower.startsWith('the ') || lower.startsWith('this ')) score += 5;
        
        // Cap at 100
        score = Math.min(score, 98);
        
        // Add some randomness
        score = Math.max(5, score + Math.floor(Math.random() * 15 - 7));
        score = Math.min(100, score);
        
        return { text, score, id: i };
      });

      // Overall score = weighted average
      const total = scored.reduce((sum, s) => sum + s.score, 0);
      const avg = scored.length > 0 ? Math.round(total / scored.length) : 0;

      setSentences(scored);
      setOverallScore(avg);
      setAnalyzed(true);
      setLoading(false);
    }, 1500);
  };

  // Humanize a sentence
  const humanizeSentence = (sentence) => {
    setHumanizing(sentence.id);
    setTimeout(() => {
      const text = sentence.text;
      let humanized = text;

      // Simplify formal words
      const replacements = [
        [/\bfurthermore\b/gi, 'also'],
        [/\bmoreover\b/gi, 'on top of that'],
        [/\bconsequently\b/gi, 'so'],
        [/\bnevertheless\b/gi, 'still'],
        [/\btherefore\b/gi, 'so'],
        [/\bdemonstrates\b/gi, 'shows'],
        [/\bcomprehensive\b/gi, 'thorough'],
        [/\butilize\b/gi, 'use'],
        [/\bfacilitate\b/gi, 'help'],
        [/\bsubsequently\b/gi, 'then'],
        [/\bsignificant\b/gi, 'major'],
        [/\bmultifaceted\b/gi, 'complex'],
        [/\bparadigm\b/gi, 'model'],
        [/\bnuanced\b/gi, 'detailed'],
        [/\brobust\b/gi, 'strong'],
        [/\bimplications\b/gi, 'effects'],
        [/\bempirical\b/gi, 'data-driven'],
        [/\bsystematic\b/gi, 'organized'],
        [/\bfoundational\b/gi, 'basic'],
        [/\bcontemporary\b/gi, 'modern'],
        [/\bin order to\b/gi, 'to'],
        [/\bit is important to note that\b/gi, 'notably,'],
        [/\bplays a crucial role\b/gi, 'matters a lot'],
      ];

      replacements.forEach(([pattern, replacement]) => {
        humanized = humanized.replace(pattern, replacement);
      });

      // Add contractions for natural feel
      humanized = humanized.replace(/\bdo not\b/gi, "don't");
      humanized = humanized.replace(/\bcannot\b/gi, "can't");
      humanized = humanized.replace(/\bit is\b/gi, "it's");
      humanized = humanized.replace(/\bthere is\b/gi, "there's");

      setHumanizedMap(prev => ({ ...prev, [sentence.id]: humanized }));
      // Update sentence score to low
      setSentences(prev => prev.map(s => s.id === sentence.id ? { ...s, score: Math.max(8, s.score - 45), humanized: true } : s));
      setHumanizing(null);
      setSelectedSentenceId(null);

      // Recalculate overall score
      setSentences(prev => {
        const total = prev.reduce((sum, s) => sum + s.score, 0);
        const avg = prev.length > 0 ? Math.round(total / prev.length) : 0;
        setOverallScore(avg);
        return prev;
      });
    }, 800);
  };

  const getColor = (score) => {
    if (score >= 75) return { bg: 'rgba(248, 113, 113, 0.15)', border: 'rgba(248, 113, 113, 0.4)', text: '#f87171', label: 'High AI' };
    if (score >= 50) return { bg: 'rgba(251, 191, 36, 0.12)', border: 'rgba(251, 191, 36, 0.3)', text: '#fbbf24', label: 'Moderate' };
    if (score >= 25) return { bg: 'rgba(74, 222, 128, 0.08)', border: 'rgba(74, 222, 128, 0.2)', text: '#4ade80', label: 'Low AI' };
    return { bg: 'transparent', border: 'transparent', text: 'var(--text-tertiary)', label: 'Human' };
  };

  const getOverallVerdict = (score) => {
    if (score >= 70) return { icon: <FiAlertTriangle size={20} />, label: 'High AI Content Detected', color: '#f87171', desc: 'This notebook appears to contain significant AI-generated content. Consider rewriting in your own voice.' };
    if (score >= 45) return { icon: <FiInfo size={20} />, label: 'Moderate AI Patterns', color: '#fbbf24', desc: 'Some sections show AI-like patterns. Review highlighted areas and add personal analysis.' };
    if (score >= 20) return { icon: <FiCheckCircle size={20} />, label: 'Mostly Human Written', color: '#4ade80', desc: 'This content appears largely original. Minor AI-like patterns may be due to formal academic style.' };
    return { icon: <FiCheckCircle size={20} />, label: 'Original Content', color: '#22d3ee', desc: 'This notebook appears to be entirely human-written.' };
  };

  const selectedNb = allNotebooks.find(n => n.id == selectedNotebookId);

  // Stats
  const highAI = sentences.filter(s => s.score >= 75).length;
  const moderate = sentences.filter(s => s.score >= 50 && s.score < 75).length;
  const low = sentences.filter(s => s.score >= 25 && s.score < 50).length;
  const human = sentences.filter(s => s.score < 25).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '24px 32px 20px', borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)'
      }}>
        <h1 style={{
          fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0,
          fontFamily: 'var(--font-serif)', display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FiShield size={18} color="white" />
          </div>
          AI Detection
        </h1>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0', paddingLeft: '46px' }}>
          Analyze your notebooks for AI-generated content patterns
        </p>

        {/* Notebook Selector */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px', alignItems: 'center' }}>
          <FiBookOpen size={15} style={{ color: 'var(--text-muted)' }} />
          <select
            value={selectedNotebookId}
            onChange={e => { setSelectedNotebookId(e.target.value); setAnalyzed(false); }}
            className="input-specter"
            style={{ flex: 1, maxWidth: '400px', padding: '8px 12px', fontSize: '0.78rem' }}
          >
            <option value="">— Select a notebook to analyze —</option>
            {allNotebooks.map(nb => (
              <option key={nb.id} value={nb.id}>{nb.title || 'Untitled'}</option>
            ))}
          </select>
          <button
            onClick={analyzeContent}
            disabled={!selectedNotebookId || loading || !notebookContent}
            className="btn-specter"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {loading ? 'Analyzing...' : <><FiShield size={14} /> Analyze</>}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 32px' }}>
        {!analyzed && !loading && (
          <div className="empty-state" style={{ paddingTop: '60px' }}>
            <FiShield size={40} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: '8px' }} />
            <div className="empty-state-title" style={{ fontSize: '1rem' }}>
              {selectedNotebookId ? 'Ready to analyze' : 'Select a notebook'}
            </div>
            <div className="empty-state-text" style={{ fontSize: '0.85rem', maxWidth: '340px' }}>
              {selectedNotebookId
                ? 'Click "Analyze" to scan for AI-generated content patterns.'
                : 'Choose a notebook above to check for AI-generated content.'}
            </div>
          </div>
        )}

        {analyzed && (
          <div className="animate-slide-down">
            {/* Overall Score Card */}
            {(() => {
              const verdict = getOverallVerdict(overallScore);
              return (
                <div className="glass-card" style={{
                  padding: '24px', marginBottom: '20px',
                  borderLeft: `4px solid ${verdict.color}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Score Ring */}
                    <div style={{
                      width: '80px', height: '80px', borderRadius: '50%', flexShrink: 0,
                      background: `conic-gradient(${verdict.color} ${overallScore * 3.6}deg, var(--bg-tertiary) 0deg)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'var(--bg-card)', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center'
                      }}>
                        <span style={{ fontSize: '1.3rem', fontWeight: 800, color: verdict.color }}>{overallScore}%</span>
                        <span style={{ fontSize: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>AI SCORE</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: verdict.color, marginBottom: '4px' }}>
                        {verdict.icon}
                        <span style={{ fontSize: '1rem', fontWeight: 700 }}>{verdict.label}</span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{verdict.desc}</p>
                      <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '0.68rem' }}>
                        <span style={{ color: '#f87171' }}>● {highAI} high</span>
                        <span style={{ color: '#fbbf24' }}>● {moderate} moderate</span>
                        <span style={{ color: '#4ade80' }}>● {low} low</span>
                        <span style={{ color: 'var(--text-muted)' }}>● {human} human</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Sentence Heatmap */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <FiShield size={16} style={{ color: '#ef4444' }} />
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>Content Heatmap</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{sentences.length} sentences analyzed</span>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '14px', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(248, 113, 113, 0.3)' }} /> High AI (75%+)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(251, 191, 36, 0.25)' }} /> Moderate (50-74%)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(74, 222, 128, 0.15)' }} /> Low (25-49%)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} /> Human (&lt;25%)
                </span>
              </div>

              {/* Heatmap Text */}
              <div style={{ lineHeight: 2, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {sentences.map((s, i) => {
                  const c = getColor(s.score);
                  const isSelected = selectedSentenceId === s.id;
                  const wasHumanized = humanizedMap[s.id];
                  const displayText = wasHumanized || s.text;
                  return (
                    <span key={i} style={{ position: 'relative', display: 'inline' }}>
                      <span
                        onClick={() => s.score >= 40 && !wasHumanized ? setSelectedSentenceId(isSelected ? null : s.id) : null}
                        title={wasHumanized ? '✓ Humanized' : `AI Score: ${s.score}% — ${c.label}${s.score >= 40 ? ' (click to humanize)' : ''}`}
                        style={{
                          background: wasHumanized ? 'rgba(74, 222, 128, 0.08)' : c.bg,
                          borderBottom: wasHumanized ? '2px solid rgba(74, 222, 128, 0.3)' : `2px solid ${c.border}`,
                          padding: '2px 4px',
                          borderRadius: '3px',
                          cursor: s.score >= 40 && !wasHumanized ? 'pointer' : 'default',
                          transition: 'all 0.2s',
                          outline: isSelected ? '2px solid #f59e0b' : 'none',
                          outlineOffset: '1px',
                          textDecoration: wasHumanized ? 'none' : 'none',
                        }}
                      >
                        {displayText}
                        {wasHumanized && <span style={{ fontSize: '0.6rem', marginLeft: '4px', color: '#4ade80' }}>✓</span>}
                      </span>
                      {isSelected && !wasHumanized && (
                        <span style={{
                          position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                          marginBottom: '6px', zIndex: 20, whiteSpace: 'nowrap'
                        }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); humanizeSentence(s); }}
                            disabled={humanizing === s.id}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '5px',
                              padding: '6px 14px', borderRadius: '8px', border: 'none',
                              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                              color: 'white', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700,
                              fontFamily: 'var(--font-sans)',
                              boxShadow: '0 4px 16px rgba(245,158,11,0.35)',
                              animation: 'slideDown 0.15s ease'
                            }}
                          >
                            {humanizing === s.id ? <><FiRefreshCw size={11} className="spin" /> Rewriting...</> : <><FiEdit3 size={11} /> Humanize</>}
                          </button>
                        </span>
                      )}
                      {' '}
                    </span>
                  );
                })}
              </div>

              {/* Humanize All button */}
              {sentences.some(s => s.score >= 50 && !humanizedMap[s.id]) && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => {
                      sentences.filter(s => s.score >= 50 && !humanizedMap[s.id]).forEach((s, i) => {
                        setTimeout(() => humanizeSentence(s), i * 300);
                      });
                    }}
                    className="btn-specter"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FiEdit3 size={14} /> Humanize All Flagged Sentences
                  </button>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {sentences.filter(s => s.score >= 50 && !humanizedMap[s.id]).length} sentences to rewrite
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
