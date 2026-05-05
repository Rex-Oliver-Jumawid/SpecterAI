import React, { useState } from 'react';
import { FiTrash2, FiChevronDown, FiChevronRight, FiChevronsRight } from 'react-icons/fi';

export default function ReferencePanel({ references, onAddReference, onDeleteReference, onInsertCitation, onCollapse }) {
  const [newRefUrl, setNewRefUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedRef, setExpandedRef] = useState(null);

  const handleAddReference = async () => {
    if (newRefUrl.trim()) {
      setLoading(true);
      await onAddReference(newRefUrl.trim());
      setNewRefUrl('');
      setLoading(false);
    }
  };

  const getConfidenceBadge = (ref) => {
    const c = ref.confidence || 'manual';
    if (c === 'verified' || (ref.journal && ref.doi && ref.abstract)) return { icon: '✓', label: 'Verified', cls: 'badge-verified' };
    if (c === 'partial' || ref.journal || ref.doi) return { icon: '⚠', label: 'Partial', cls: 'badge-partial' };
    return { icon: '?', label: 'Manual', cls: 'badge-manual' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="section-icon" style={{ background: 'oklch(0.62 0.14 195 / 0.1)', color: 'var(--color-ghost-500)' }}>🔍</div>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>References</span>
          {references.length > 0 && (
            <span className="badge" style={{ fontSize: '0.6rem' }}>{references.length}</span>
          )}
        </div>
        {onCollapse && (
          <button onClick={onCollapse} className="panel-collapse-btn" title="Collapse panel">
            <FiChevronsRight size={14} />
          </button>
        )}
      </div>

      {/* Add URL */}
      <div style={{
        padding: '10px 12px', display: 'flex', gap: '8px',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <input type="text" value={newRefUrl} onChange={(e) => setNewRefUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddReference()}
          placeholder="Paste URL or DOI..." className="input-specter" id="reference-url-input"
          style={{ flex: 1, fontSize: '0.72rem', padding: '6px 10px' }} />
        <button onClick={handleAddReference} disabled={loading || !newRefUrl.trim()}
          className="btn-specter btn-sm" style={{ flexShrink: 0 }} id="add-reference-btn">
          {loading ? '...' : '+ Add'}
        </button>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {references.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px 0' }}>
            <div className="empty-state-icon">📄</div>
            <div className="empty-state-title">No references yet</div>
            <div className="empty-state-text">Paste a URL or DOI above to add your first reference.</div>
          </div>
        ) : (
          references.map((ref) => {
            const conf = getConfidenceBadge(ref);
            const isExpanded = expandedRef === ref.id;

            return (
              <div key={ref.id} className="glass-card" style={{ padding: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: '6px' }}>
                  <button onClick={() => setExpandedRef(isExpanded ? null : ref.id)}
                    style={{
                      flexShrink: 0, marginTop: '2px', background: 'none', border: 'none',
                      cursor: 'pointer', padding: 0, color: 'var(--text-muted)'
                    }}>
                    {isExpanded ? <FiChevronDown size={12} /> : <FiChevronRight size={12} />}
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-primary)' }} className="line-clamp-1">{ref.title || 'Untitled'}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }} className="line-clamp-1">
                      {ref.authors || 'Unknown'} · {ref.year || 'N/A'}
                    </div>
                  </div>
                  <span className={`badge ${conf.cls}`} style={{ flexShrink: 0, fontSize: '0.55rem' }}>{conf.icon} {conf.label}</span>
                </div>

                {isExpanded && (
                  <div style={{
                    marginTop: '8px', paddingTop: '8px',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex', flexDirection: 'column', gap: '6px',
                    animation: 'slideDown 0.2s ease'
                  }}>
                    {ref.journal && <p style={{ fontSize: '0.68rem', margin: 0, color: 'var(--text-tertiary)' }}><strong style={{ color: 'var(--text-secondary)' }}>Journal:</strong> {ref.journal}</p>}
                    {ref.doi && <p style={{ fontSize: '0.62rem', margin: 0, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}><strong style={{ color: 'var(--text-secondary)' }}>DOI:</strong> {ref.doi}</p>}
                    {ref.abstract && <p style={{ fontSize: '0.68rem', margin: 0, color: 'var(--text-tertiary)', lineHeight: '1.5' }} className="line-clamp-2">{ref.abstract}</p>}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                  <button onClick={() => onInsertCitation(ref.id)} className="btn-specter btn-xs" style={{ flex: 1 }}>Cite</button>
                  <button onClick={() => onDeleteReference(ref.id)} className="btn-ghost-outline btn-xs" style={{
                    color: 'var(--color-danger-400)', borderColor: 'oklch(0.62 0.21 20 / 0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px'
                  }}>
                    <FiTrash2 size={10} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
