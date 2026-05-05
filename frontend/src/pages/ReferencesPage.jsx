import React, { useState } from 'react';
import { FiSearch, FiTrash2, FiChevronDown, FiChevronRight, FiCopy, FiPlus, FiStar, FiBookOpen } from 'react-icons/fi';
import { references as refsApi } from '../api';

export default function ReferencesPage({ references, onAddReference, onDeleteReference, notebookId }) {
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
  const [activeTab, setActiveTab] = useState('library'); // 'library' | 'search'

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
    try {
      const results = await refsApi.search(topicQuery.trim());
      setSearchResults(results);
      setAddedIds(new Set());
    } catch (e) { console.error(e); }
    finally { setSearching(false); }
  };

  const handleSaveSearchResult = async (ref) => {
    try {
      await onAddReference(null, {
        title: ref.title, authors: ref.authors, year: ref.year,
        journal: ref.journal, doi: ref.doi, abstract: ref.abstract, url: ref.url
      });
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
    if (score >= 80) return { bg: 'oklch(0.66 0.17 155 / 0.15)', color: 'oklch(0.70 0.16 155)', border: 'oklch(0.66 0.17 155 / 0.3)' };
    if (score >= 60) return { bg: 'oklch(0.72 0.18 55 / 0.15)', color: 'oklch(0.78 0.16 55)', border: 'oklch(0.72 0.18 55 / 0.3)' };
    if (score >= 40) return { bg: 'oklch(0.70 0.19 20 / 0.12)', color: 'oklch(0.75 0.17 20)', border: 'oklch(0.70 0.19 20 / 0.25)' };
    return { bg: 'var(--bg-tertiary)', color: 'var(--text-muted)', border: 'var(--border-color)' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '24px 32px 0',
        background: 'var(--bg-secondary)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h1 style={{
              fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0,
              fontFamily: 'var(--font-serif)', display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--color-ghost-500), var(--color-specter-500))',
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
              fontSize: '0.78rem', fontWeight: 600,
              fontFamily: 'var(--font-sans)',
              background: 'transparent',
              color: activeTab === tab.id ? 'var(--color-specter-500)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--color-specter-500)' : '2px solid transparent',
              transition: 'all 0.2s',
              marginBottom: '-1px'
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
            {/* Add by URL */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: references.length > 0 ? '10px' : '0' }}>
              <input type="text" value={url} onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="Paste a URL or DOI to add a reference..."
                className="input-specter" style={{ flex: 1 }} />
              <button onClick={handleAdd} disabled={loading || !url.trim()} className="btn-specter" style={{ flexShrink: 0 }}>
                {loading ? 'Adding...' : '+ Add'}
              </button>
            </div>
            {/* Filter */}
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
                <div className="empty-state-icon" style={{ fontSize: '3rem' }}>📚</div>
                <div className="empty-state-title" style={{ fontSize: '1rem' }}>No references yet</div>
                <div className="empty-state-text" style={{ fontSize: '0.85rem', maxWidth: '300px' }}>
                  Paste a URL above or switch to <strong>Discover</strong> to search for references by topic.
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state" style={{ paddingTop: '40px' }}>
                <div className="empty-state-icon">🔍</div>
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
                          {ref.doi && <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>DOI: {ref.doi}</p>}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '6px', marginTop: isOpen ? '12px' : '10px' }}>
                        <button onClick={() => copyApa(ref)} className="btn-ghost-outline btn-xs" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <FiCopy size={11} /> {copiedId === ref.id ? 'Copied!' : 'Copy APA'}
                        </button>
                        <button onClick={() => onDeleteReference(ref.id)} className="btn-ghost-outline btn-xs" style={{
                          color: 'var(--color-danger-400)', borderColor: 'oklch(0.62 0.21 20 / 0.15)',
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

      {/* DISCOVER TAB — topic search with scoring */}
      {activeTab === 'search' && (
        <>
          <div style={{ padding: '16px 32px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <FiSearch size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" value={topicQuery} onChange={e => setTopicQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleTopicSearch()}
                  placeholder="Search a topic (e.g., machine learning in education)..."
                  className="input-specter" style={{ paddingLeft: '36px' }} />
              </div>
              <button onClick={handleTopicSearch} disabled={searching || !topicQuery.trim()} className="btn-specter" style={{ flexShrink: 0 }}>
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px' }}>
            {searchResults.length === 0 ? (
              <div className="empty-state" style={{ paddingTop: '60px' }}>
                <div className="empty-state-icon" style={{ fontSize: '3rem' }}>🔍</div>
                <div className="empty-state-title" style={{ fontSize: '1rem' }}>Search for references</div>
                <div className="empty-state-text" style={{ fontSize: '0.85rem', maxWidth: '340px' }}>
                  Type a research topic above to discover academic papers, sorted by relevance score.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  {searchResults.length} results for "{topicQuery}" · sorted by relevance
                </div>
                {searchResults.map((ref, idx) => {
                  const scoreStyle = getScoreColor(ref.relevance_score);
                  const isSaved = addedIds.has(ref.id);
                  return (
                    <div key={ref.id} className="glass-card" style={{ padding: '18px', display: 'flex', gap: '14px', alignItems: 'start' }}>
                      {/* Score badge */}
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
                        background: scoreStyle.bg, border: `1px solid ${scoreStyle.border}`,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        gap: '1px'
                      }}>
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
                          {ref.title}
                        </h3>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                          {ref.authors} · {ref.year} · <em>{ref.journal}</em>
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '8px 0 0', lineHeight: 1.6 }} className="line-clamp-2">
                          {ref.abstract}
                        </p>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '10px', alignItems: 'center' }}>
                          <span className={`badge ${ref.confidence === 'verified' ? 'badge-verified' : ref.confidence === 'partial' ? 'badge-partial' : 'badge-manual'}`}>
                            {ref.confidence === 'verified' ? '✓ Verified' : ref.confidence === 'partial' ? '⚠ Partial' : '? Manual'}
                          </span>
                          {ref.doi && (
                            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                              {ref.doi}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Save button */}
                      <button
                        onClick={() => handleSaveSearchResult(ref)}
                        disabled={isSaved}
                        className={isSaved ? 'btn-ghost-outline btn-sm' : 'btn-specter btn-sm'}
                        style={{
                          flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px',
                          opacity: isSaved ? 0.6 : 1
                        }}
                      >
                        {isSaved ? <><FiStar size={12} /> Saved</> : <><FiPlus size={12} /> Save</>}
                      </button>
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
