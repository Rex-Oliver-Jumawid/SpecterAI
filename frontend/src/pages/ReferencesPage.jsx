import React, { useState } from 'react';
import { FiSearch, FiTrash2, FiChevronDown, FiChevronRight, FiCopy, FiPlus, FiStar, FiBookOpen, FiCheck, FiExternalLink } from 'react-icons/fi';
import { references as refsApi } from '../api';

export default function ReferencesPage({ references, onAddReference, onAddReferenceToNotebook, onDeleteReference, notebookId, allNotebooks = [] }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Topic search
  const [topicQuery, setTopicQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [addedIds, setAddedIds] = useState(new Set());
  const [activeTab, setActiveTab] = useState('library');
  const [selectedNotebookId, setSelectedNotebookId] = useState(notebookId || '');
  const [searchError, setSearchError] = useState('');

  const handleAdd = async () => {
    if (!url.trim()) return;
    setLoading(true);
    await onAddReference(url.trim());
    setUrl('');
    setLoading(false);
  };

  const handleTopicSearch = async () => {
    if (!topicQuery.trim()) return;
    setSearching(true);
    setSearchError('');
    try {
      const results = await refsApi.search(topicQuery.trim());
      setSearchResults(results);
      setAddedIds(new Set());
    } catch (e) {
      console.error(e);
      setSearchError('Search failed. Please try again.');
    }
    finally { setSearching(false); }
  };

  const handleSaveSearchResult = async (ref) => {
    const targetNbId = selectedNotebookId;
    if (!targetNbId) return alert('Please select a notebook to save to.');
    try {
      if (onAddReferenceToNotebook) {
        await onAddReferenceToNotebook(targetNbId, {
          title: ref.title, authors: ref.authors, year: ref.year,
          journal: ref.journal, doi: ref.doi, abstract: ref.abstract, url: ref.url
        });
      } else {
        await onAddReference(null, {
          title: ref.title, authors: ref.authors, year: ref.year,
          journal: ref.journal, doi: ref.doi, abstract: ref.abstract, url: ref.url
        });
      }
      setAddedIds(prev => new Set([...prev, ref.id]));
    } catch (e) { console.error(e); }
  };

  const copyApa = (ref) => {
    const apa = `${ref.authors || 'Unknown'} (${ref.year || 'n.d.'}). ${ref.title}. ${ref.journal || ''}.`;
    navigator.clipboard.writeText(apa);
    setCopiedId(ref.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = references.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (r.title || '').toLowerCase().includes(q) ||
      (r.authors || '').toLowerCase().includes(q) ||
      (r.journal || '').toLowerCase().includes(q);
  });

  const getConfBadge = (ref) => {
    if (ref.journal && ref.doi && ref.abstract) return { icon: '✓', label: 'Verified', cls: 'badge-verified' };
    if (ref.journal || ref.doi) return { icon: '⚠', label: 'Partial', cls: 'badge-partial' };
    return { icon: '?', label: 'Manual', cls: 'badge-manual' };
  };

  const getScoreColor = (score) => {
    if (score >= 80) return { bg: 'rgba(34, 197, 94, 0.12)', color: '#4ade80', border: 'rgba(34, 197, 94, 0.25)' };
    if (score >= 60) return { bg: 'rgba(251, 191, 36, 0.12)', color: '#fbbf24', border: 'rgba(251, 191, 36, 0.25)' };
    if (score >= 40) return { bg: 'rgba(251, 146, 60, 0.1)', color: '#fb923c', border: 'rgba(251, 146, 60, 0.2)' };
    return { bg: 'var(--bg-tertiary)', color: 'var(--text-muted)', border: 'var(--border-color)' };
  };

  const [expandedScoreId, setExpandedScoreId] = useState(null);

  const getScoreExplanation = (ref) => {
    const factors = [];
    let score = ref.relevance_score || 0;

    // Citation impact
    if (ref.cited_by_count > 100) {
      factors.push({ label: 'High citation count', detail: `${ref.cited_by_count.toLocaleString()} citations — widely recognized`, impact: '+', color: '#4ade80' });
    } else if (ref.cited_by_count > 20) {
      factors.push({ label: 'Moderate citations', detail: `${ref.cited_by_count.toLocaleString()} citations — established work`, impact: '+', color: '#fbbf24' });
    } else {
      factors.push({ label: 'Few citations', detail: `${(ref.cited_by_count || 0).toLocaleString()} citations — may be new or niche`, impact: '○', color: 'var(--text-muted)' });
    }

    // Journal presence
    if (ref.journal) {
      factors.push({ label: 'Published in journal', detail: ref.journal, impact: '+', color: '#4ade80' });
    } else {
      factors.push({ label: 'No journal listed', detail: 'May be a preprint or grey literature', impact: '−', color: '#fb923c' });
    }

    // DOI verification
    if (ref.doi) {
      factors.push({ label: 'DOI verified', detail: 'Registered with a persistent identifier', impact: '+', color: '#4ade80' });
    } else {
      factors.push({ label: 'No DOI', detail: 'Cannot verify through DOI registry', impact: '−', color: '#fb923c' });
    }

    // Recency
    const currentYear = new Date().getFullYear();
    const age = currentYear - (ref.year || 2000);
    if (age <= 3) {
      factors.push({ label: 'Very recent', detail: `Published ${ref.year} — cutting-edge`, impact: '+', color: '#4ade80' });
    } else if (age <= 7) {
      factors.push({ label: 'Recent', detail: `Published ${ref.year} — still relevant`, impact: '+', color: '#fbbf24' });
    } else {
      factors.push({ label: 'Older publication', detail: `Published ${ref.year} — may need newer sources`, impact: '○', color: 'var(--text-muted)' });
    }

    // Abstract quality
    if (ref.abstract && ref.abstract.length > 100) {
      factors.push({ label: 'Detailed abstract', detail: 'Rich metadata for AI analysis', impact: '+', color: '#4ade80' });
    } else {
      factors.push({ label: 'Limited abstract', detail: 'Less context available', impact: '○', color: 'var(--text-muted)' });
    }

    // Overall verdict
    let verdict;
    if (score >= 80) verdict = '🟢 Excellent source — highly recommended';
    else if (score >= 60) verdict = '🟡 Good source — suitable for most papers';
    else if (score >= 40) verdict = '🟠 Acceptable — verify relevance to your topic';
    else verdict = '🔴 Low relevance — consider alternatives';

    return { factors, verdict };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '24px 32px 0', background: 'var(--bg-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h1 style={{
              fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0,
              fontFamily: 'var(--font-serif)', display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <FiSearch size={18} color="white" />
              </div>
              References
            </h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0', paddingLeft: '46px' }}>
              {references.length} saved · Search topics to discover new sources
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border-color)' }}>
          {[{ id: 'library', label: 'My Library', icon: <FiBookOpen size={13} /> },
          { id: 'search', label: 'Discover', icon: <FiSearch size={13} /> }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 20px', border: 'none', cursor: 'pointer',
              fontSize: '0.78rem', fontWeight: 600, fontFamily: 'var(--font-sans)',
              background: 'transparent',
              color: activeTab === tab.id ? '#7c3aed' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid #7c3aed' : '2px solid transparent',
              transition: 'all 0.2s', marginBottom: '-1px'
            }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* LIBRARY TAB */}
      {activeTab === 'library' && (
        <>
          <div style={{ padding: '16px 32px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: references.length > 0 ? '10px' : '0' }}>
              <input type="text" value={url} onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="Paste a URL or DOI to add a reference..."
                className="input-specter" style={{ flex: 1 }} />
              <button onClick={handleAdd} disabled={loading || !url.trim()} className="btn-specter" style={{ flexShrink: 0 }}>
                {loading ? 'Adding...' : '+ Add'}
              </button>
            </div>
            {references.length > 0 && (
              <div style={{ position: 'relative' }}>
                <FiSearch size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter your references..."
                  className="input-specter" style={{ paddingLeft: '34px' }} />
              </div>
            )}
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px' }}>
            {filtered.length === 0 && references.length === 0 ? (
              <div className="empty-state" style={{ paddingTop: '60px' }}>
                <FiBookOpen size={40} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: '8px' }} />
                <div className="empty-state-title" style={{ fontSize: '1rem' }}>No references yet</div>
                <div className="empty-state-text" style={{ fontSize: '0.85rem', maxWidth: '300px' }}>
                  Paste a URL above or switch to <strong>Discover</strong> to search for references by topic.
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state" style={{ paddingTop: '40px' }}>
                <FiSearch size={28} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                <div className="empty-state-title">No matches</div>
                <div className="empty-state-text">Try a different search term.</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '12px' }}>
                {filtered.map(ref => {
                  const conf = getConfBadge(ref);
                  const isOpen = expandedId === ref.id;
                  return (
                    <div key={ref.id} className="glass-card group" style={{ padding: '18px', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'start', gap: '10px' }}>
                        <button onClick={() => setExpandedId(isOpen ? null : ref.id)} style={{
                          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', marginTop: '2px', padding: 0
                        }}>
                          {isOpen ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
                        </button>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
                            {ref.title || 'Untitled'}
                          </h3>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                            {ref.authors || 'Unknown'} · {ref.year || 'N/A'}
                            {ref.journal && <> · <em>{ref.journal}</em></>}
                          </p>
                        </div>
                        <span className={`badge ${conf.cls}`} style={{ flexShrink: 0 }}>{conf.icon} {conf.label}</span>
                      </div>
                      {isOpen && (
                        <div className="animate-slide-down" style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                          {ref.abstract && <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', lineHeight: 1.6, marginBottom: '10px' }}>{ref.abstract}</p>}
                          {ref.doi && (
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                              DOI: <a href={`https://doi.org/${ref.doi}`} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none' }}>{ref.doi}</a>
                            </p>
                          )}
                          {(ref.url || ref.doi) && (
                            <a href={ref.url || `https://doi.org/${ref.doi}`} target="_blank" rel="noopener noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#3b82f6', textDecoration: 'none', marginTop: '4px' }}>
                              <FiExternalLink size={11} /> Open Paper
                            </a>
                          )}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '6px', marginTop: isOpen ? '12px' : '10px' }}>
                        <button onClick={() => copyApa(ref)} className="btn-ghost-outline btn-xs" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <FiCopy size={11} /> {copiedId === ref.id ? 'Copied!' : 'Copy APA'}
                        </button>
                        <button onClick={() => onDeleteReference(ref.id)} className="btn-ghost-outline btn-xs" style={{
                          color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.2)',
                          display: 'flex', alignItems: 'center', gap: '4px'
                        }}>
                          <FiTrash2 size={11} /> Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* DISCOVER TAB — real OpenAlex search */}
      {activeTab === 'search' && (
        <>
          <div style={{ padding: '16px 32px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
            {/* Search bar */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <FiSearch size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" value={topicQuery} onChange={e => setTopicQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleTopicSearch()}
                  placeholder="Search real academic papers (e.g., machine learning in education)..."
                  className="input-specter" style={{ paddingLeft: '36px' }} />
              </div>
              <button onClick={handleTopicSearch} disabled={searching || !topicQuery.trim()} className="btn-specter" style={{ flexShrink: 0 }}>
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>
            {/* Notebook selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Save to:</span>
              <select
                value={selectedNotebookId}
                onChange={e => setSelectedNotebookId(e.target.value)}
                className="input-specter"
                style={{ flex: 1, maxWidth: '300px', padding: '6px 10px', fontSize: '0.75rem' }}
              >
                <option value=""> Select a notebook </option>
                {allNotebooks.map(nb => (
                  <option key={nb.id} value={nb.id}>{nb.title || 'Untitled'}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px' }}>
            {searchError && (
              <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', fontSize: '0.78rem', marginBottom: '12px' }}>
                {searchError}
              </div>
            )}
            {searchResults.length === 0 ? (
              <div className="empty-state" style={{ paddingTop: '60px' }}>
                <FiSearch size={40} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: '8px' }} />
                <div className="empty-state-title" style={{ fontSize: '1rem' }}>
                  {searching ? 'Searching OpenAlex...' : 'Search for real papers'}
                </div>
                <div className="empty-state-text" style={{ fontSize: '0.85rem', maxWidth: '340px' }}>
                  Powered by OpenAlex — search millions of real academic papers. Results include actual authors, journals, DOIs, and citation counts.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  {searchResults.length} results for "{topicQuery}" · sorted by relevance · powered by OpenAlex
                </div>
                {searchResults.map((ref) => {
                  const scoreStyle = getScoreColor(ref.relevance_score);
                  const isSaved = addedIds.has(ref.id);
                  const targetNb = allNotebooks.find(n => n.id === selectedNotebookId);
                  return (
                    <div key={ref.id} className="glass-card" style={{ padding: '18px', display: 'flex', gap: '14px', alignItems: 'start' }}>
                      {/* Score badge — clickable for explanation */}
                      <div
                        onClick={() => setExpandedScoreId(expandedScoreId === ref.id ? null : ref.id)}
                        style={{
                          width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
                          background: scoreStyle.bg, border: `1px solid ${scoreStyle.border}`,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1px',
                          cursor: 'pointer', transition: 'transform 0.15s',
                        }}
                        title="Click to see score breakdown"
                      >
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: scoreStyle.color, lineHeight: 1 }}>
                          {ref.relevance_score}
                        </span>
                        <span style={{ fontSize: '0.5rem', fontWeight: 600, color: scoreStyle.color, opacity: 0.7, textTransform: 'uppercase' }}>
                          score
                        </span>
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>
                          {(ref.url || ref.doi) ? (
                            <a href={ref.url || `https://doi.org/${ref.doi}`} target="_blank" rel="noopener noreferrer"
                              style={{ color: 'inherit', textDecoration: 'none' }}
                              onMouseEnter={e => e.currentTarget.style.color = '#3b82f6'}
                              onMouseLeave={e => e.currentTarget.style.color = 'inherit'}>
                              {ref.title} <FiExternalLink size={11} style={{ display: 'inline', opacity: 0.5 }} />
                            </a>
                          ) : ref.title}
                        </h3>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                          {ref.authors} · {ref.year}
                          {ref.journal && <> · <em>{ref.journal}</em></>}
                        </p>
                        {ref.abstract && (
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '8px 0 0', lineHeight: 1.6, maxHeight: '3.2em', overflow: 'hidden' }}>
                            {ref.abstract}
                          </p>
                        )}
                        <div style={{ display: 'flex', gap: '6px', marginTop: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span className={`badge ${ref.confidence === 'verified' ? 'badge-verified' : ref.confidence === 'partial' ? 'badge-partial' : 'badge-manual'}`}>
                            {ref.confidence === 'verified' ? '✓ Verified' : ref.confidence === 'partial' ? '⚠ Partial' : '? Manual'}
                          </span>
                          {ref.cited_by_count > 0 && (
                            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                              {ref.cited_by_count.toLocaleString()} citations
                            </span>
                          )}
                          {ref.doi && (
                            <a href={`https://doi.org/${ref.doi}`} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: '0.6rem', color: '#3b82f6', fontFamily: 'var(--font-mono)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <FiExternalLink size={9} /> {ref.doi}
                            </a>
                          )}
                        </div>

                        {/* Score Explanation Dropdown */}
                        {expandedScoreId === ref.id && (() => {
                          const explanation = getScoreExplanation(ref);
                          return (
                            <div className="animate-slide-down" style={{
                              marginTop: '10px', padding: '12px', borderRadius: '8px',
                              background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)'
                            }}>
                              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                📊 Score Breakdown — {ref.relevance_score}/100
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                {explanation.factors.map((f, i) => (
                                  <div key={i} style={{ display: 'flex', alignItems: 'start', gap: '6px', fontSize: '0.68rem' }}>
                                    <span style={{
                                      width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      fontSize: '0.6rem', fontWeight: 700, color: f.color,
                                      background: f.impact === '+' ? 'rgba(74, 222, 128, 0.1)' : f.impact === '−' ? 'rgba(251, 146, 60, 0.1)' : 'var(--bg-card)'
                                    }}>{f.impact}</span>
                                    <div>
                                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{f.label}</span>
                                      <span style={{ color: 'var(--text-muted)' }}> — {f.detail}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div style={{
                                marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color)',
                                fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)'
                              }}>
                                {explanation.verdict}
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Save button */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
                        <button
                          onClick={() => handleSaveSearchResult(ref)}
                          disabled={isSaved || !selectedNotebookId}
                          className={isSaved ? 'btn-ghost-outline btn-sm' : 'btn-specter btn-sm'}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            opacity: isSaved ? 0.6 : !selectedNotebookId ? 0.4 : 1
                          }}
                          title={!selectedNotebookId ? 'Select a notebook first' : ''}
                        >
                          {isSaved ? <><FiCheck size={12} /> Saved</> : <><FiPlus size={12} /> Save</>}
                        </button>
                        {isSaved && targetNb && (
                          <span style={{ fontSize: '0.58rem', color: '#4ade80', textAlign: 'center' }}>
                            → {targetNb.title}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
