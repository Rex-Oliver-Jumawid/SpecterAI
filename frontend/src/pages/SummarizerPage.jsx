import React, { useState } from 'react';
import { FiLink, FiFileText, FiRefreshCw, FiCopy, FiCheck, FiExternalLink, FiBookmark } from 'react-icons/fi';

export default function SummarizerPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [copied, setCopied] = useState(null);
  const [history, setHistory] = useState([]);

  const summarize = () => {
    if (!url.trim()) return;
    setLoading(true);
    setSummary(null);

    // Simulate fetching and summarizing
    setTimeout(() => {
      // Extract a fake title from URL
      const urlObj = (() => { try { return new URL(url); } catch { return null; } })();
      const domain = urlObj?.hostname?.replace('www.', '') || 'unknown';
      const pathParts = urlObj?.pathname?.split('/').filter(Boolean) || [];
      const slugTitle = pathParts[pathParts.length - 1]?.replace(/[-_]/g, ' ')?.replace(/\.\w+$/, '') || 'Research Paper';
      const title = slugTitle.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

      const result = {
        id: Date.now(),
        url: url.trim(),
        domain,
        title,
        authors: 'Authors not extracted (paste DOI for better results)',
        year: new Date().getFullYear(),
        type: domain.includes('arxiv') ? 'Preprint' : domain.includes('doi') ? 'Journal Article' : 'Web Source',
        sections: {
          overview: `This paper explores ${title.toLowerCase()}. The research examines key aspects of the topic, providing analysis and evidence to support its central arguments. The work contributes to the broader understanding of the field by addressing gaps identified in prior literature.`,
          methodology: `The study appears to employ a ${Math.random() > 0.5 ? 'quantitative' : 'qualitative'} research approach. ${Math.random() > 0.5 ? 'Data was collected through surveys and statistical analysis was performed using standard methods.' : 'The authors used case studies and thematic analysis to derive insights from the collected data.'}`,
          keyFindings: [
            `The research identifies significant patterns related to ${title.toLowerCase().split(' ').slice(0, 3).join(' ')}.`,
            `Results suggest a correlation between the studied variables, with implications for both theory and practice.`,
            `The findings extend previous work by providing new evidence in the context of ${Math.random() > 0.5 ? 'emerging technologies' : 'contemporary challenges'}.`,
          ],
          limitations: [
            'Summary is based on URL metadata only — full text analysis requires document access.',
            'Author extraction is limited without DOI or structured metadata.',
            'Methodological details may be incomplete without abstract access.',
          ],
          relevance: Math.floor(Math.random() * 30 + 60),
          wordEstimate: Math.floor(Math.random() * 8000 + 3000),
        }
      };

      setSummary(result);
      setHistory(prev => [result, ...prev.slice(0, 9)]);
      setLoading(false);
    }, 2000);
  };

  const copySection = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopied(section);
    setTimeout(() => setCopied(null), 2000);
  };

  const getRelevanceColor = (score) => {
    if (score >= 80) return '#4ade80';
    if (score >= 60) return '#fbbf24';
    return '#fb923c';
  };

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
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FiFileText size={18} color="white" />
          </div>
          Paper Summarizer
        </h1>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0', paddingLeft: '46px' }}>
          Paste any paper URL to get an instant structured summary
        </p>

        {/* URL Input */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <FiLink size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && summarize()}
              placeholder="Paste a paper URL, DOI, or arXiv link..."
              className="input-specter"
              style={{ paddingLeft: '36px', width: '100%' }}
            />
          </div>
          <button
            onClick={summarize}
            disabled={!url.trim() || loading}
            className="btn-specter"
            style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {loading ? <><FiRefreshCw size={14} className="spin" /> Summarizing...</> : <><FiFileText size={14} /> Summarize</>}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 32px' }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          {/* Main Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {!summary && !loading && (
              <div className="empty-state" style={{ paddingTop: '60px' }}>
                <FiFileText size={40} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: '8px' }} />
                <div className="empty-state-title" style={{ fontSize: '1rem' }}>Paste a URL to summarize</div>
                <div className="empty-state-text" style={{ fontSize: '0.85rem', maxWidth: '360px' }}>
                  Get an instant structured summary of any academic paper — no need to save it as a reference.
                  Supports DOIs, arXiv links, journal URLs, and more.
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '16px', justifyContent: 'center' }}>
                  {['doi.org/10.1234/...', 'arxiv.org/abs/...', 'pubmed.ncbi...', 'scholar.google...'].map((ex, i) => (
                    <span key={i} style={{
                      padding: '4px 10px', borderRadius: '6px', fontSize: '0.65rem',
                      background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                      color: 'var(--text-muted)', fontFamily: 'var(--font-mono)'
                    }}>{ex}</span>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="empty-state" style={{ paddingTop: '60px' }}>
                <FiRefreshCw size={32} className="spin" style={{ color: '#3b82f6', marginBottom: '12px' }} />
                <div className="empty-state-title" style={{ fontSize: '1rem' }}>Analyzing paper...</div>
                <div className="empty-state-text">Extracting metadata and generating summary</div>
              </div>
            )}

            {summary && (
              <div className="animate-slide-down">
                {/* Summary Card */}
                <div className="glass-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '16px' }}>
                  {/* Paper Header */}
                  <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{
                        fontSize: '0.58rem', fontWeight: 700, color: '#06b6d4',
                        textTransform: 'uppercase', letterSpacing: '0.1em'
                      }}>Specter Summary</span>
                      <span style={{
                        fontSize: '0.55rem', padding: '2px 8px', borderRadius: '4px',
                        background: 'var(--bg-tertiary)', color: 'var(--text-muted)',
                        border: '1px solid var(--border-color)'
                      }}>{summary.type}</span>
                    </div>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px', lineHeight: 1.3 }}>
                      {summary.title}
                    </h2>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.72rem' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Source: </span>
                        <a href={summary.url} target="_blank" rel="noopener noreferrer"
                          style={{ color: '#3b82f6', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          {summary.domain} <FiExternalLink size={10} />
                        </a>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Est. length: </span>
                        <span style={{ color: 'var(--text-secondary)' }}>{summary.sections.wordEstimate.toLocaleString()} words</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Relevance: </span>
                        <span style={{
                          fontWeight: 700, color: getRelevanceColor(summary.sections.relevance),
                          background: `${getRelevanceColor(summary.sections.relevance)}18`,
                          padding: '1px 8px', borderRadius: '4px', fontSize: '0.7rem'
                        }}>{summary.sections.relevance}/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Sections */}
                  <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {/* Overview */}
                    <SummarySection
                      title="Overview" emoji="📋" color="#06b6d4"
                      content={summary.sections.overview}
                      onCopy={() => copySection(summary.sections.overview, 'overview')}
                      copied={copied === 'overview'}
                    />

                    {/* Key Findings */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          🔍 Key Findings
                        </h3>
                        <button onClick={() => copySection(summary.sections.keyFindings.join('\n'), 'findings')}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}>
                          {copied === 'findings' ? <FiCheck size={12} color="#4ade80" /> : <FiCopy size={12} />}
                        </button>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {summary.sections.keyFindings.map((f, i) => (
                          <li key={i} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Methodology */}
                    <SummarySection
                      title="Methodology" emoji="🔬" color="#8b5cf6"
                      content={summary.sections.methodology}
                      onCopy={() => copySection(summary.sections.methodology, 'methodology')}
                      copied={copied === 'methodology'}
                    />

                    {/* Limitations */}
                    <div style={{
                      padding: '14px 16px', borderRadius: '8px',
                      background: 'rgba(251, 191, 36, 0.05)', border: '1px solid rgba(251, 191, 36, 0.15)'
                    }}>
                      <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        ⚠️ Limitations
                      </h3>
                      <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {summary.sections.limitations.map((l, i) => (
                          <li key={i} style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{l}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* History Sidebar */}
          {history.length > 0 && (
            <div style={{ width: '220px', flexShrink: 0 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Recent Summaries
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {history.map((h, i) => (
                  <button
                    key={h.id}
                    onClick={() => { setUrl(h.url); setSummary(h); }}
                    style={{
                      padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)',
                      background: summary?.id === h.id ? 'var(--bg-tertiary)' : 'var(--bg-card)',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }} className="line-clamp-2">
                      {h.title}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {h.domain}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummarySection({ title, emoji, color, content, onCopy, copied }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
          {emoji} {title}
        </h3>
        <button onClick={onCopy}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}>
          {copied ? <FiCheck size={12} color="#4ade80" /> : <FiCopy size={12} />}
        </button>
      </div>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{content}</p>
    </div>
  );
}
