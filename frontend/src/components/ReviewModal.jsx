import React from 'react';

export default function ReviewModal({ plan, onConfirm, onReject, onClose }) {
  if (!plan) return null;
  const wordCount = (plan.ai_output || '').split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="modal-backdrop" style={{
      position: 'fixed', inset: 0, display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 50, padding: '24px',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div className="glass-card" style={{
        width: '100%', maxWidth: '680px', maxHeight: '85vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: 'var(--shadow-lg), 0 0 60px oklch(0.55 0.22 275 / 0.06)',
        animation: 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, var(--color-specter-500), oklch(0.45 0.18 285), var(--color-ghost-500))',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <span style={{ fontSize: '1.5rem' }}>✦</span>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white', margin: 0 }}>Specter completed your task</h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
            "{plan.title}" — Review what your ghost writer produced.
          </p>
        </div>

        {/* Summary */}
        <div style={{
          padding: '16px',
          background: 'var(--bg-tertiary)',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div className="glass-card" style={{ padding: '12px' }}>
            <pre style={{
              fontSize: '0.78rem', fontFamily: 'var(--font-mono)',
              lineHeight: 1.6, whiteSpace: 'pre-wrap',
              color: 'var(--text-secondary)', margin: 0
            }}>
              {plan.ai_summary || 'No summary available.'}
            </pre>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          <h3 style={{
            fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px',
            display: 'flex', alignItems: 'center', gap: '8px',
            color: 'var(--text-primary)'
          }}>
            <div className="section-icon" style={{ background: 'var(--accent-bg)', color: 'var(--color-specter-500)' }}>✍️</div>
            Generated Content
            <span className="badge status-review" style={{ marginLeft: '4px' }}>{wordCount} words</span>
          </h3>
          <div style={{
            padding: '16px', borderRadius: '8px', fontSize: '0.85rem',
            lineHeight: 1.7, whiteSpace: 'pre-wrap',
            background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
            borderLeft: '3px solid var(--color-specter-500)',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-serif)'
          }}>
            {plan.ai_output || 'No content generated.'}
          </div>
        </div>

        {/* Actions */}
        <div style={{
          padding: '16px 20px', display: 'flex', gap: '12px',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-tertiary)'
        }}>
          <button onClick={() => onConfirm(plan.id)} className="btn-specter" style={{ flex: 1, padding: '10px' }} id="confirm-ai-output">
            ✓ Add to Notebook
          </button>
          <button onClick={() => onReject(plan.id)} className="btn-ghost-outline" style={{ flex: 1, padding: '10px' }} id="reject-ai-output">
            ✗ Reject & Redo
          </button>
          <button onClick={onClose} className="btn-ghost-outline" style={{ padding: '10px 16px' }}>Later</button>
        </div>
      </div>
    </div>
  );
}
