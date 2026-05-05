import React, { useRef, useEffect, forwardRef, useState, useCallback } from 'react';

const Editor = forwardRef(({ content, onChange, wordCount, documentTitle, onTitleChange, references }, ref) => {
  const contentEditableRef = useRef(null);
  const isInternalChange = useRef(false);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    if (contentEditableRef.current && !isInternalChange.current) {
      contentEditableRef.current.innerHTML = content || '';
    }
    isInternalChange.current = false;
  }, [content]);

  const handleInput = () => {
    if (contentEditableRef.current) {
      isInternalChange.current = true;
      onChange(contentEditableRef.current.innerHTML);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  // Handle text selection for attribution check
  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) {
      setTooltip(null);
      return;
    }

    const selectedText = selection.toString().trim();
    if (selectedText.length < 10) {
      setTooltip(null);
      return;
    }

    // Check if selected text matches any reference content
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Check for citation markers in selected text
    const hasCitation = /\[cite:[^\]]+\]/.test(selectedText);

    // Try to match against reference abstracts/titles
    let matchedRef = null;
    if (references && references.length > 0) {
      for (const ref of references) {
        const abstract = (ref.abstract || '').toLowerCase();
        const title = (ref.title || '').toLowerCase();
        const selected = selectedText.toLowerCase();

        // Check if substantial overlap with any reference content
        if (abstract && selected.length > 20) {
          const words = selected.split(/\s+/);
          const matchCount = words.filter(w => w.length > 3 && abstract.includes(w)).length;
          if (matchCount / words.length > 0.4) {
            matchedRef = ref;
            break;
          }
        }
      }
    }

    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
      text: selectedText,
      hasCitation,
      matchedRef,
      isOriginal: !hasCitation && !matchedRef
    });
  }, [references]);

  // Hide tooltip on click elsewhere
  useEffect(() => {
    const hideTooltip = () => setTooltip(null);
    document.addEventListener('mousedown', (e) => {
      if (e.target.closest('.attribution-tooltip')) return;
      hideTooltip();
    });
    return () => document.removeEventListener('mousedown', hideTooltip);
  }, []);

  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      {/* Title */}
      <div style={{ padding: '28px 32px 8px' }}>
        <input
          type="text"
          value={documentTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Untitled Notebook"
          id="document-title"
          style={{
            width: '100%',
            background: 'transparent',
            outline: 'none',
            border: 'none',
            fontSize: '1.85rem',
            fontWeight: 700,
            lineHeight: 1.2,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-serif)'
          }}
        />
        <div style={{
          marginTop: '6px', display: 'flex', alignItems: 'center', gap: '12px',
          color: 'var(--text-muted)', fontSize: '0.7rem'
        }}>
          <span>{wordCount} words</span>
          <span>·</span>
          <span>{readingTime} min read</span>
        </div>
      </div>

      <div className="divider" style={{ margin: '0 32px' }} />

      {/* Editor */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 32px 80px', position: 'relative' }}>
        {!content && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
            justifyContent: 'center', pointerEvents: 'none', opacity: 0.3
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }} className="animate-haunt">👻</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-tertiary)' }}>
                Start writing here...
              </div>
              <div style={{ fontSize: '0.72rem', marginTop: '4px', color: 'var(--text-muted)' }}>
                Specter will save your work automatically
              </div>
            </div>
          </div>
        )}
        <div
          ref={contentEditableRef}
          onInput={handleInput}
          onPaste={handlePaste}
          onMouseUp={handleMouseUp}
          contentEditable
          suppressContentEditableWarning
          className="editor-content"
          id="editor-content"
          style={{ caretColor: 'var(--color-specter-400)', outline: 'none', position: 'relative', zIndex: 10 }}
        />
      </div>

      {/* Attribution Tooltip */}
      {tooltip && (
        <div className="attribution-tooltip" style={{
          position: 'fixed',
          left: `${Math.max(120, Math.min(tooltip.x, window.innerWidth - 180))}px`,
          top: `${tooltip.y}px`,
          transform: 'translate(-50%, -100%)',
          zIndex: 100,
          animation: 'scaleIn 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '10px 14px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
            minWidth: '200px',
            maxWidth: '300px'
          }}>
            {tooltip.hasCitation ? (
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px'
                }}>
                  <span style={{
                    fontSize: '0.65rem', padding: '2px 8px', borderRadius: '999px',
                    background: 'oklch(0.66 0.17 155 / 0.12)', color: 'oklch(0.50 0.15 155)',
                    border: '1px solid oklch(0.66 0.17 155 / 0.2)', fontWeight: 600
                  }}>✓ Cited</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  This text contains a citation reference.
                </div>
              </div>
            ) : tooltip.matchedRef ? (
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px'
                }}>
                  <span style={{
                    fontSize: '0.65rem', padding: '2px 8px', borderRadius: '999px',
                    background: 'oklch(0.72 0.18 55 / 0.12)', color: 'oklch(0.58 0.16 55)',
                    border: '1px solid oklch(0.72 0.18 55 / 0.2)', fontWeight: 600
                  }}>⚠ Similar to Reference</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Matches: <strong>{tooltip.matchedRef.authors}</strong> ({tooltip.matchedRef.year})
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Consider adding a citation for attribution.
                </div>
              </div>
            ) : (
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px'
                }}>
                  <span style={{
                    fontSize: '0.65rem', padding: '2px 8px', borderRadius: '999px',
                    background: 'oklch(0.55 0.22 275 / 0.1)', color: 'var(--color-specter-500)',
                    border: '1px solid oklch(0.55 0.22 275 / 0.18)', fontWeight: 600
                  }}>✍ Your Writing</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  This is your original content. No matching references found.
                </div>
              </div>
            )}
            {/* Arrow */}
            <div style={{
              position: 'absolute', bottom: '-5px', left: '50%', transform: 'translateX(-50%) rotate(45deg)',
              width: '10px', height: '10px', background: 'var(--bg-card)',
              borderRight: '1px solid var(--border-color)',
              borderBottom: '1px solid var(--border-color)'
            }} />
          </div>
        </div>
      )}
    </div>
  );
});

Editor.displayName = 'Editor';
export default Editor;
