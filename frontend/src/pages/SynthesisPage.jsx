import React, { useState, useEffect } from 'react';
import { FiZap, FiBookOpen, FiRefreshCw, FiAlertCircle, FiTrendingUp, FiTarget, FiLayers, FiGrid } from 'react-icons/fi';
import { notebooks as notebooksApi, references as refsApi } from '../api';

export default function SynthesisPage({ allNotebooks = [] }) {
  const [activeTab, setActiveTab] = useState('gaps');
  // Research gaps state
  const [selectedNotebookId, setSelectedNotebookId] = useState('');
  const [refs, setRefs] = useState([]);
  const [loadingRefs, setLoadingRefs] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [gapAnalysis, setGapAnalysis] = useState(null);
  // Cross-notebook state
  const [crossQuery, setCrossQuery] = useState('');
  const [crossAnalyzing, setCrossAnalyzing] = useState(false);
  const [crossResult, setCrossResult] = useState(null);

  // Load refs for selected notebook
  useEffect(() => {
    if (!selectedNotebookId) { setRefs([]); setGapAnalysis(null); return; }
    setLoadingRefs(true);
    refsApi.list(selectedNotebookId)
      .then(data => setRefs(data))
      .catch(() => setRefs([]))
      .finally(() => setLoadingRefs(false));
  }, [selectedNotebookId]);

  // Deep synthesis — research gap analysis
  const analyzeGaps = () => {
    if (refs.length === 0) return;
    setAnalyzing(true);

    setTimeout(() => {
      const years = refs.map(r => r.year).filter(Boolean).sort();
      const minYear = years[0] || 2015;
      const maxYear = years[years.length - 1] || 2024;
      const journals = [...new Set(refs.map(r => r.journal).filter(Boolean))];
      const hasAbstracts = refs.filter(r => r.abstract).length;
      const totalCitations = refs.reduce((sum, r) => sum + (r.cited_by_count || 0), 0);

      // Extract themes from titles
      const allWords = refs.flatMap(r => (r.title || '').toLowerCase().split(/\s+/));
      const stopWords = new Set(['the', 'of', 'and', 'in', 'a', 'to', 'for', 'on', 'with', 'is', 'an', 'by', 'from', 'at', 'as', 'its', 'are', 'was', 'that', 'this', 'be', 'or', 'not']);
      const wordCounts = {};
      allWords.filter(w => w.length > 3 && !stopWords.has(w)).forEach(w => { wordCounts[w] = (wordCounts[w] || 0) + 1; });
      const topThemes = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([word, count]) => ({ word, count }));

      const result = {
        overview: {
          totalRefs: refs.length,
          yearRange: `${minYear}–${maxYear}`,
          uniqueJournals: journals.length,
          abstractCoverage: `${Math.round((hasAbstracts / refs.length) * 100)}%`,
          totalCitations: totalCitations,
          avgCitations: refs.length > 0 ? Math.round(totalCitations / refs.length) : 0,
        },
        themes: topThemes,
        gaps: [
          {
            type: 'temporal',
            severity: maxYear < 2023 ? 'high' : maxYear < 2025 ? 'medium' : 'low',
            title: 'Temporal Coverage Gap',
            detail: maxYear < 2023
              ? `Your most recent source is from ${maxYear}. You're missing 2+ years of recent research. Consider adding sources from 2024–2025.`
              : `Your literature coverage extends to ${maxYear}. Consider checking for very recent publications in 2025–2026.`,
          },
          {
            type: 'methodological',
            severity: refs.length < 5 ? 'high' : 'medium',
            title: 'Methodological Diversity',
            detail: refs.length < 5
              ? `Only ${refs.length} sources — insufficient for methodological triangulation. Aim for 10+ sources combining quantitative, qualitative, and mixed methods.`
              : `${refs.length} sources provide moderate coverage. Ensure you include both empirical studies and theoretical frameworks for balance.`,
          },
          {
            type: 'geographic',
            severity: 'medium',
            title: 'Geographic & Cultural Scope',
            detail: 'Analysis based on metadata only. Consider whether your sources represent diverse geographic and cultural perspectives, especially for topics with global relevance.',
          },
          {
            type: 'citation',
            severity: totalCitations < 100 ? 'medium' : 'low',
            title: 'Citation Authority',
            detail: totalCitations > 500
              ? `Strong citation base (${totalCitations.toLocaleString()} total citations). Your sources are well-established in the field.`
              : `Total citation count is ${totalCitations.toLocaleString()}. Consider adding seminal/highly-cited foundational papers to strengthen your literature base.`,
          },
          {
            type: 'thematic',
            severity: topThemes.length < 3 ? 'high' : 'low',
            title: 'Thematic Coverage',
            detail: topThemes.length < 3
              ? 'Your sources cluster around a narrow theme. Broaden your search to include adjacent sub-topics and contrasting perspectives.'
              : `${topThemes.length} distinct themes identified across your sources. Consider whether contrasting viewpoints are adequately represented.`,
          },
        ],
        recommendations: [
          `Search for systematic reviews or meta-analyses published after ${maxYear} to ensure currency.`,
          journals.length < 3 ? 'Diversify your journal sources — drawing from only a few journals limits perspective.' : null,
          hasAbstracts < refs.length * 0.5 ? 'Many of your sources lack abstracts. Consider replacing with better-documented sources.' : null,
          `Add at least ${Math.max(0, 10 - refs.length)} more sources to reach a robust literature base of 10+.`,
          'Include at least one source that directly contradicts your thesis for balanced argumentation.',
        ].filter(Boolean),
      };

      setGapAnalysis(result);
      setAnalyzing(false);
    }, 2000);
  };

  // Cross-notebook synthesis
  const runCrossSynthesis = () => {
    if (!crossQuery.trim()) return;
    setCrossAnalyzing(true);

    setTimeout(() => {
      // Analyze all notebooks for the query
      const notebookInsights = allNotebooks
        .filter(nb => nb.content && nb.content.length > 50)
        .map(nb => {
          const plainText = (nb.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
          const words = plainText.split(/\s+/);
          const queryTerms = crossQuery.toLowerCase().split(/\s+/);
          const mentions = queryTerms.reduce((sum, term) => {
            const regex = new RegExp(term, 'gi');
            return sum + (plainText.match(regex) || []).length;
          }, 0);

          // Extract sentences mentioning the query
          const sentences = plainText.split(/(?<=[.!?])\s+/);
          const relevantSentences = sentences
            .filter(s => queryTerms.some(t => s.toLowerCase().includes(t)))
            .slice(0, 3);

          return {
            id: nb.id,
            title: nb.title || 'Untitled',
            wordCount: words.length,
            mentions,
            relevance: mentions > 5 ? 'high' : mentions > 0 ? 'moderate' : 'none',
            excerpts: relevantSentences,
          };
        })
        .filter(nb => nb.mentions > 0)
        .sort((a, b) => b.mentions - a.mentions);

      const result = {
        query: crossQuery,
        notebooksAnalyzed: allNotebooks.length,
        notebooksWithMentions: notebookInsights.length,
        insights: notebookInsights,
        synthesis: notebookInsights.length > 0
          ? `Across ${notebookInsights.length} notebook${notebookInsights.length !== 1 ? 's' : ''}, the topic "${crossQuery}" appears ${notebookInsights.reduce((s, n) => s + n.mentions, 0)} times. ${notebookInsights[0] ? `The most relevant notebook is "${notebookInsights[0].title}" with ${notebookInsights[0].mentions} mentions.` : ''} Consider consolidating overlapping content and identifying unique perspectives each notebook contributes.`
          : `No mentions of "${crossQuery}" found across your ${allNotebooks.length} notebooks. This could represent an unexplored area worth investigating.`,
        patterns: [
          notebookInsights.length > 2 ? `Multiple notebooks discuss "${crossQuery}" — consider whether arguments are consistent or contradictory across documents.` : null,
          notebookInsights.some(n => n.mentions > 10) ? 'Heavy concentration in one notebook detected. Consider distributing analysis more evenly if writing a multi-chapter work.' : null,
          notebookInsights.length === 0 ? `"${crossQuery}" is not covered in any notebook. This is either a gap or an opportunity for a new document.` : null,
        ].filter(Boolean),
      };

      setCrossResult(result);
      setCrossAnalyzing(false);
    }, 1800);
  };

  const getSeverityStyle = (severity) => {
    if (severity === 'high') return { color: '#f87171', bg: 'rgba(248, 113, 113, 0.08)', border: 'rgba(248, 113, 113, 0.2)', icon: '🔴' };
    if (severity === 'medium') return { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.06)', border: 'rgba(251, 191, 36, 0.15)', icon: '🟡' };
    return { color: '#4ade80', bg: 'rgba(74, 222, 128, 0.06)', border: 'rgba(74, 222, 128, 0.15)', icon: '🟢' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '24px 32px 0', background: 'var(--bg-secondary)' }}>
        <h1 style={{
          fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0,
          fontFamily: 'var(--font-serif)', display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FiZap size={18} color="white" />
          </div>
          Deep Synthesis
        </h1>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 16px', paddingLeft: '46px' }}>
          Uncover research gaps, themes, and cross-notebook patterns
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border-color)' }}>
          {[
            { id: 'gaps', label: 'Research Gaps', icon: <FiTarget size={13} /> },
            { id: 'cross', label: 'Cross-Notebook', icon: <FiGrid size={13} /> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 20px', border: 'none', cursor: 'pointer',
              fontSize: '0.78rem', fontWeight: 600, fontFamily: 'var(--font-sans)',
              background: 'transparent',
              color: activeTab === tab.id ? '#8b5cf6' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid #8b5cf6' : '2px solid transparent',
              transition: 'all 0.2s', marginBottom: '-1px'
            }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* RESEARCH GAPS TAB */}
      {activeTab === 'gaps' && (
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 32px' }}>
          {/* Notebook selector */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
            <FiBookOpen size={15} style={{ color: 'var(--text-muted)' }} />
            <select
              value={selectedNotebookId}
              onChange={e => { setSelectedNotebookId(e.target.value); setGapAnalysis(null); }}
              className="input-specter"
              style={{ flex: 1, maxWidth: '400px', padding: '8px 12px', fontSize: '0.78rem' }}
            >
              <option value="">Select a notebook</option>
              {allNotebooks.map(nb => (
                <option key={nb.id} value={nb.id}>{nb.title || 'Untitled'}</option>
              ))}
            </select>
            {loadingRefs && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Loading...</span>}
            {selectedNotebookId && !loadingRefs && (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{refs.length} refs</span>
            )}
            <button
              onClick={analyzeGaps}
              disabled={refs.length === 0 || analyzing}
              className="btn-specter"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {analyzing ? <><FiRefreshCw size={14} className="spin" /> Analyzing...</> : <><FiZap size={14} /> Find Gaps</>}
            </button>
          </div>

          {!gapAnalysis && !analyzing && (
            <div className="empty-state" style={{ paddingTop: '50px' }}>
              <FiTarget size={40} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: '8px' }} />
              <div className="empty-state-title" style={{ fontSize: '1rem' }}>
                {refs.length === 0 && selectedNotebookId ? 'No references in this notebook' : 'Select a notebook to analyze'}
              </div>
              <div className="empty-state-text" style={{ fontSize: '0.85rem', maxWidth: '340px' }}>
                Specter will analyze your saved references to identify temporal gaps, methodological blind spots, and thematic coverage issues.
              </div>
            </div>
          )}

          {gapAnalysis && (
            <div className="animate-slide-down">
              {/* Overview Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                {[
                  { label: 'Sources', value: gapAnalysis.overview.totalRefs, icon: '📚' },
                  { label: 'Year Range', value: gapAnalysis.overview.yearRange, icon: '📅' },
                  { label: 'Journals', value: gapAnalysis.overview.uniqueJournals, icon: '📰' },
                  { label: 'Total Citations', value: gapAnalysis.overview.totalCitations.toLocaleString(), icon: '📊' },
                  { label: 'Avg. Citations', value: gapAnalysis.overview.avgCitations, icon: '📈' },
                  { label: 'Abstract Coverage', value: gapAnalysis.overview.abstractCoverage, icon: '📝' },
                ].map((stat, i) => (
                  <div key={i} className="glass-card" style={{ padding: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{stat.icon}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stat.value}</div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Theme Cloud */}
              {gapAnalysis.themes.length > 0 && (
                <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiTrendingUp size={14} style={{ color: '#8b5cf6' }} /> Identified Themes
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {gapAnalysis.themes.map((t, i) => (
                      <span key={i} style={{
                        padding: '5px 14px', borderRadius: '20px',
                        fontSize: `${Math.min(0.85, 0.65 + t.count * 0.05)}rem`,
                        fontWeight: i < 2 ? 700 : 500,
                        background: i === 0 ? 'rgba(139, 92, 246, 0.12)' : i === 1 ? 'rgba(236, 72, 153, 0.1)' : 'var(--bg-tertiary)',
                        color: i === 0 ? '#8b5cf6' : i === 1 ? '#ec4899' : 'var(--text-secondary)',
                        border: `1px solid ${i < 2 ? 'rgba(139, 92, 246, 0.2)' : 'var(--border-color)'}`,
                      }}>
                        {t.word} ({t.count})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Gaps */}
              <div className="glass-card" style={{ padding: '20px', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiAlertCircle size={15} style={{ color: '#f59e0b' }} /> Research Gaps Detected
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {gapAnalysis.gaps.map((gap, i) => {
                    const style = getSeverityStyle(gap.severity);
                    return (
                      <div key={i} style={{
                        padding: '14px 16px', borderRadius: '10px',
                        background: style.bg, border: `1px solid ${style.border}`,
                        borderLeft: `4px solid ${style.color}`
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <span>{style.icon}</span>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{gap.title}</span>
                          <span style={{ fontSize: '0.6rem', padding: '2px 8px', borderRadius: '4px', background: `${style.color}18`, color: style.color, fontWeight: 600, marginLeft: 'auto' }}>
                            {gap.severity.toUpperCase()}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{gap.detail}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommendations */}
              <div className="glass-card" style={{ padding: '18px' }}>
                <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#8b5cf6', margin: '0 0 10px' }}>💡 Recommendations</h3>
                <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {gapAnalysis.recommendations.map((r, i) => (
                    <li key={i} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CROSS-NOTEBOOK TAB */}
      {activeTab === 'cross' && (
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 32px' }}>
          {/* Query input */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input
              type="text"
              value={crossQuery}
              onChange={e => setCrossQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && runCrossSynthesis()}
              placeholder="Enter a topic to search across all notebooks..."
              className="input-specter"
              style={{ flex: 1, padding: '10px 14px', fontSize: '0.82rem' }}
            />
            <button
              onClick={runCrossSynthesis}
              disabled={!crossQuery.trim() || crossAnalyzing}
              className="btn-specter"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {crossAnalyzing ? <><FiRefreshCw size={14} className="spin" /> Searching...</> : <><FiLayers size={14} /> Synthesize</>}
            </button>
          </div>

          {!crossResult && !crossAnalyzing && (
            <div className="empty-state" style={{ paddingTop: '50px' }}>
              <FiGrid size={40} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: '8px' }} />
              <div className="empty-state-title" style={{ fontSize: '1rem' }}>Cross-Notebook Synthesis</div>
              <div className="empty-state-text" style={{ fontSize: '0.85rem', maxWidth: '380px' }}>
                Enter a topic to discover how it's discussed across all your notebooks. Find overlapping arguments, contradictions, and gaps between documents.
              </div>
            </div>
          )}

          {crossResult && (
            <div className="animate-slide-down">
              {/* Summary */}
              <div className="glass-card" style={{ padding: '20px', marginBottom: '16px', borderLeft: '4px solid #8b5cf6' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                  Synthesis for "{crossResult.query}"
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 10px' }}>
                  {crossResult.synthesis}
                </p>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {crossResult.notebooksAnalyzed} notebooks analyzed · {crossResult.notebooksWithMentions} with mentions
                </div>
              </div>

              {/* Per-notebook findings */}
              {crossResult.insights.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  {crossResult.insights.map((nb, i) => (
                    <div key={nb.id} className="glass-card" style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{
                          width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.65rem', fontWeight: 800, color: 'white',
                          background: nb.relevance === 'high' ? '#8b5cf6' : '#6366f1'
                        }}>{i + 1}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{nb.title}</span>
                        <span style={{
                          fontSize: '0.6rem', padding: '2px 8px', borderRadius: '4px', marginLeft: 'auto',
                          background: nb.relevance === 'high' ? 'rgba(139, 92, 246, 0.12)' : 'var(--bg-tertiary)',
                          color: nb.relevance === 'high' ? '#8b5cf6' : 'var(--text-muted)', fontWeight: 600
                        }}>
                          {nb.mentions} mention{nb.mentions !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {nb.excerpts.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {nb.excerpts.map((ex, j) => (
                            <div key={j} style={{
                              padding: '8px 12px', borderRadius: '6px',
                              background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                              fontSize: '0.72rem', color: 'var(--text-tertiary)', lineHeight: 1.5,
                              borderLeft: '3px solid rgba(139, 92, 246, 0.3)'
                            }}>
                              "{ex.length > 200 ? ex.substring(0, 200) + '...' : ex}"
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Patterns */}
              {crossResult.patterns.length > 0 && (
                <div className="glass-card" style={{ padding: '16px' }}>
                  <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ec4899', margin: '0 0 10px' }}>🔗 Patterns Detected</h3>
                  <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {crossResult.patterns.map((p, i) => (
                      <li key={i} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
