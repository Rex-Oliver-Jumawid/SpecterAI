import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2, FiEdit3, FiClock, FiFileText, FiBookOpen, FiLayers } from 'react-icons/fi';

export default function NotebooksPage({ allNotebooks, onCreateNotebook, onDeleteNotebook, onSelectNotebook, onRenameNotebook, currentNotebookId }) {
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const navigate = useNavigate();

  const handleRename = async (id) => {
    if (!editTitle.trim()) { setEditingId(null); return; }
    if (onRenameNotebook) await onRenameNotebook(id, editTitle.trim());
    setEditingId(null);
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    await onCreateNotebook(newTitle.trim());
    setNewTitle('');
    setShowCreate(false);
  };

  const handleOpen = (nb) => {
    onSelectNotebook(nb.id);
    navigate(`/notebooks/${nb.id}`);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this notebook? This cannot be undone.')) return;
    await onDeleteNotebook(id);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Just now';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getWordCount = (content) => {
    if (!content) return 0;
    return content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(w => w.length > 0).length;
  };

  const filtered = allNotebooks.filter(nb => {
    if (!searchQuery) return true;
    return nb.title?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '28px 36px 20px',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h1 style={{
              fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)',
              margin: 0, fontFamily: 'var(--font-serif)',
              display: 'flex', alignItems: 'center', gap: '12px'
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--color-specter-500), var(--color-ghost-500))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px oklch(0.55 0.22 275 / 0.25)'
              }}>
                <FiBookOpen size={20} color="white" />
              </div>
              My Notebooks
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '6px 0 0', paddingLeft: '52px' }}>
              {allNotebooks.length} notebook{allNotebooks.length !== 1 ? 's' : ''} · Click to open and continue writing
            </p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-specter" style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px'
          }}>
            <FiPlus size={16} /> New Notebook
          </button>
        </div>

        {/* Search */}
        {allNotebooks.length > 2 && (
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <FiFileText size={14} style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search notebooks..."
              className="input-specter" style={{ paddingLeft: '36px' }} />
          </div>
        )}
      </div>

      {/* Create Form */}
      {showCreate && (
        <div style={{
          padding: '16px 36px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-tertiary)',
          display: 'flex', gap: '10px', alignItems: 'center'
        }} className="animate-slide-down">
          <FiEdit3 size={16} style={{ color: 'var(--color-specter-500)', flexShrink: 0 }} />
          <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            placeholder="Enter notebook title..."
            className="input-specter" style={{ flex: 1 }} autoFocus />
          <button onClick={handleCreate} className="btn-specter btn-sm" disabled={!newTitle.trim()}>Create</button>
          <button onClick={() => { setShowCreate(false); setNewTitle(''); }} className="btn-ghost-outline btn-sm">Cancel</button>
        </div>
      )}

      {/* Notebooks Grid */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 36px' }}>
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ paddingTop: '80px' }}>
            <FiBookOpen size={48} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: '8px' }} />
            <div className="empty-state-title" style={{ fontSize: '1.1rem' }}>
              {searchQuery ? 'No matching notebooks' : 'No notebooks yet'}
            </div>
            <div className="empty-state-text" style={{ fontSize: '0.85rem', maxWidth: '300px' }}>
              {searchQuery ? 'Try a different search term.' : 'Create your first notebook to start writing.'}
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px'
          }}>
            {filtered.map(nb => {
              const wordCount = getWordCount(nb.content);
              const isActive = nb.id === currentNotebookId;

              return (
                <div key={nb.id}
                  onClick={() => handleOpen(nb)}
                  className="glass-card group"
                  style={{
                    padding: '22px',
                    cursor: 'pointer',
                    position: 'relative',
                    borderColor: isActive ? 'var(--color-specter-400)' : undefined,
                    background: isActive ? 'var(--accent-bg)' : undefined,
                    transition: 'all 0.25s ease'
                  }}>
                  {/* Active indicator */}
                  {isActive && (
                    <div style={{
                      position: 'absolute', top: '12px', right: '12px',
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: 'var(--color-phantom-500)',
                      boxShadow: '0 0 8px var(--color-phantom-400)'
                    }} />
                  )}

                  {/* Icon & Title */}
                  <div style={{ display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '14px' }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '10px',
                      background: isActive
                        ? 'linear-gradient(135deg, var(--color-specter-500), var(--color-ghost-500))'
                        : 'var(--bg-tertiary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: isActive ? 'none' : '1px solid var(--border-color)',
                      flexShrink: 0
                    }}>
                      <FiFileText size={18} style={{
                        color: isActive ? 'white' : 'var(--text-muted)'
                      }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {editingId === nb.id ? (
                        <input
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleRename(nb.id); if (e.key === 'Escape') setEditingId(null); }}
                          onBlur={() => handleRename(nb.id)}
                          onClick={e => e.stopPropagation()}
                          autoFocus
                          style={{
                            fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)',
                            background: 'var(--bg-tertiary)', border: '1px solid var(--color-specter-400)',
                            borderRadius: '4px', padding: '2px 6px', width: '100%',
                            outline: 'none', fontFamily: 'var(--font-sans)'
                          }}
                        />
                      ) : (
                        <h3 style={{
                          fontSize: '0.95rem', fontWeight: 700, margin: 0,
                          color: 'var(--text-primary)', lineHeight: 1.3
                        }} className="line-clamp-1">
                          {nb.title || 'Untitled Notebook'}
                        </h3>
                      )}
                      <p style={{
                        fontSize: '0.72rem', color: 'var(--text-muted)',
                        margin: '3px 0 0', display: 'flex', alignItems: 'center', gap: '4px'
                      }}>
                        <FiClock size={10} /> {formatDate(nb.updated_at)}
                      </p>
                    </div>
                  </div>

                  {/* Preview */}
                  {nb.content && (
                    <p style={{
                      fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: 1.6,
                      margin: '0 0 14px', maxHeight: '48px', overflow: 'hidden'
                    }} className="line-clamp-2">
                      {nb.content.replace(/<[^>]*>/g, '').substring(0, 150)}
                    </p>
                  )}

                  {/* Stats */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    paddingTop: '12px', borderTop: '1px solid var(--border-color)'
                  }}>
                    <span style={{
                      fontSize: '0.68rem', color: 'var(--text-muted)',
                      display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      <FiEdit3 size={10} /> {wordCount} words
                    </span>
                    {nb.ref_count > 0 && (
                      <span style={{
                        fontSize: '0.68rem', color: 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', gap: '4px'
                      }}>
                        <FiBookOpen size={10} /> {nb.ref_count} refs
                      </span>
                    )}
                    {nb.plan_count > 0 && (
                      <span style={{
                        fontSize: '0.68rem', color: 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', gap: '4px'
                      }}>
                        <FiLayers size={10} /> {nb.plan_count} tasks
                      </span>
                    )}
                    <div style={{ flex: 1 }} />
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingId(nb.id); setEditTitle(nb.title || ''); }}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', padding: '4px', borderRadius: '4px',
                        opacity: 0, transition: 'opacity 0.2s'
                      }}
                      className="group-hover-visible"
                      title="Rename notebook"
                    >
                      <FiEdit3 size={13} />
                    </button>
                      <button
                        onClick={(e) => handleDelete(e, nb.id)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#ef4444', padding: '4px', borderRadius: '4px',
                          opacity: 0.6, transition: 'opacity 0.2s'
                        }}
                        title="Delete notebook"
                      >
                        <FiTrash2 size={13} />
                      </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
