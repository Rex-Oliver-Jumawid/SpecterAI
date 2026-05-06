import React, { useRef, useEffect, forwardRef, useState, useCallback } from 'react';

const Editor = forwardRef(({ content, onChange, wordCount, documentTitle, onTitleChange, references, pendingEdit, onAcceptEdit, onRejectEdit }, ref) => {
  const contentEditableRef = useRef(null);
  const isInternalChange = useRef(false);
  const [tooltip, setTooltip] = useState(null);

  // Convert markdown-ish syntax to HTML for display
  function markdownToHtml(text) {
    if (!text) return '';
    // If content already has HTML block tags, it's already formatted
    if (/<(h[1-6]|p|ul|ol|blockquote)\b/i.test(text)) return text;

    let html = text;

    // Normalize line breaks: <br> and <div> to newlines for processing
    html = html.replace(/<br\s*\/?>/gi, '\n');
    html = html.replace(/<\/div>\s*<div>/gi, '\n');
    html = html.replace(/<\/?div>/gi, '\n');
    html = html.replace(/<[^>]*>/g, ''); // strip remaining tags

    // Split into lines
    const lines = html.split('\n');
    const result = [];
    let inParagraph = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        if (inParagraph) {
          result.push('</p>');
          inParagraph = false;
        }
        continue;
      }

      // Headings
      if (/^#{1,6}\s/.test(trimmed)) {
        if (inParagraph) { result.push('</p>'); inParagraph = false; }
        const level = trimmed.match(/^(#{1,6})/)[1].length;
        const text = trimmed.replace(/^#{1,6}\s+/, '');
        result.push(`<h${level}>${text}</h${level}>`);
        continue;
      }

      // Horizontal rules
      if (/^[-*_]{3,}\s*$/.test(trimmed)) {
        if (inParagraph) { result.push('</p>'); inParagraph = false; }
        result.push('<hr/>');
        continue;
      }

      // Regular text — group into paragraphs
      if (!inParagraph) {
        result.push('<p>');
        inParagraph = true;
      } else {
        result.push('<br/>');
      }
      // Inline formatting
      let formatted = trimmed;
      formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
      formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
      result.push(formatted);
    }
    if (inParagraph) result.push('</p>');

    return result.join('\n');
  }

  // Convert HTML back to clean markdown-ish text for storage
  function htmlToMarkdown(html) {
    if (!html) return '';
    let md = html;
    // Convert heading tags back to markdown
    md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n');
    md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n');
    md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n');
    md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n');
    md = md.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n');
    md = md.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n');
    // Convert hr to ---
    md = md.replace(/<hr\s*\/?>/gi, '\n---\n');
    // Convert p tags
    md = md.replace(/<p[^>]*>/gi, '');
    md = md.replace(/<\/p>/gi, '\n\n');
    // Convert br
    md = md.replace(/<br\s*\/?>/gi, '\n');
    // Convert inline formatting back
    md = md.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
    md = md.replace(/<em>(.*?)<\/em>/gi, '*$1*');
    md = md.replace(/<code>(.*?)<\/code>/gi, '`$1`');
    // Strip remaining tags
    md = md.replace(/<\/div>\s*<div>/gi, '\n');
    md = md.replace(/<\/?div>/gi, '\n');
    md = md.replace(/<[^>]*>/g, '');
    // Clean up excessive newlines
    md = md.replace(/\n{3,}/g, '\n\n');
    // Decode HTML entities
    md = md.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"');
    return md.trim();
  }

  useEffect(() => {
    if (contentEditableRef.current && !isInternalChange.current) {
      const html = markdownToHtml(content || '');
      contentEditableRef.current.innerHTML = html;
    }
    isInternalChange.current = false;
  }, [content]);

  const handleInput = () => {
    if (contentEditableRef.current) {
      isInternalChange.current = true;
      const rawHtml = contentEditableRef.current.innerHTML;
      const md = htmlToMarkdown(rawHtml);
      onChange(md);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  // Handle keyboard shortcuts for headings
  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === '1') { e.preventDefault(); document.execCommand('formatBlock', false, 'h1'); }
      else if (e.key === '2') { e.preventDefault(); document.execCommand('formatBlock', false, 'h2'); }
      else if (e.key === '3') { e.preventDefault(); document.execCommand('formatBlock', false, 'h3'); }
      else if (e.key === 'b') { e.preventDefault(); document.execCommand('bold'); }
      else if (e.key === 'i') { e.preventDefault(); document.execCommand('italic'); }
    }
  };

  // Compute diff between original and new content for inline display
  const computeInlineDiff = useCallback(() => {
    if (!pendingEdit) return null;
    const origLines = (content || '').split('\n');
    const newLines = (pendingEdit.newContent || '').split('\n');

    const diffBlocks = [];
    const maxLen = Math.max(origLines.length, newLines.length);

    // Simple line-level diff
    let i = 0, j = 0;
    while (i < origLines.length || j < newLines.length) {
      if (i < origLines.length && j < newLines.length) {
        if (origLines[i].trim() === newLines[j].trim()) {
          diffBlocks.push({ type: 'same', text: newLines[j] });
          i++; j++;
        } else {
          // Look ahead to find match
          let foundInNew = -1;
          for (let k = j + 1; k < Math.min(j + 5, newLines.length); k++) {
            if (origLines[i].trim() === newLines[k].trim()) { foundInNew = k; break; }
          }
          if (foundInNew >= 0) {
            // Lines j to foundInNew-1 are additions
            for (let k = j; k < foundInNew; k++) {
              diffBlocks.push({ type: 'added', text: newLines[k] });
            }
            diffBlocks.push({ type: 'same', text: newLines[foundInNew] });
            j = foundInNew + 1;
            i++;
          } else {
            let foundInOrig = -1;
            for (let k = i + 1; k < Math.min(i + 5, origLines.length); k++) {
              if (j < newLines.length && origLines[k].trim() === newLines[j].trim()) { foundInOrig = k; break; }
            }
            if (foundInOrig >= 0) {
              for (let k = i; k < foundInOrig; k++) {
                diffBlocks.push({ type: 'removed', text: origLines[k] });
              }
              i = foundInOrig;
            } else {
              // Changed line
              diffBlocks.push({ type: 'removed', text: origLines[i] });
              diffBlocks.push({ type: 'added', text: newLines[j] });
              i++; j++;
            }
          }
        }
      } else if (j < newLines.length) {
        diffBlocks.push({ type: 'added', text: newLines[j] });
        j++;
      } else {
        diffBlocks.push({ type: 'removed', text: origLines[i] });
        i++;
      }
    }
    return diffBlocks;
  }, [pendingEdit, content]);

  // Handle text selection for attribution check
  const handleMouseUp = useCallback(() => {
    if (pendingEdit) return; // Disable selection tooltip during diff
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

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    const hasCitation = /\[cite:[^\]]+\]/.test(selectedText);
    let matchedRef = null;
    if (references && references.length > 0) {
      for (const ref of references) {
        const abstract = (ref.abstract || '').toLowerCase();
        const selected = selectedText.toLowerCase();
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
  }, [references, pendingEdit]);

  useEffect(() => {
    const hideTooltip = () => setTooltip(null);
    document.addEventListener('mousedown', (e) => {
      if (e.target.closest('.attribution-tooltip')) return;
      hideTooltip();
    });
    return () => document.removeEventListener('mousedown', hideTooltip);
  }, []);

  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const diffBlocks = pendingEdit ? computeInlineDiff() : null;

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

      {/* Diff accept/reject bar */}
      {pendingEdit && (
        <div style={{
          padding: '8px 32px',
          background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(6,182,212,0.05))',
          borderBottom: '1px solid rgba(37,99,235,0.15)',
          display: 'flex', alignItems: 'center', gap: '10px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
            AI changes preview
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            {pendingEdit.description}
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
            <button onClick={onAcceptEdit} className="btn-specter btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem' }}>
              ✓ Keep Changes
            </button>
            <button onClick={onRejectEdit} className="btn-ghost-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem' }}>
              ✕ Undo
            </button>
          </div>
        </div>
      )}

      {/* Editor */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 32px 80px', position: 'relative' }}>
        {!content && !pendingEdit && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
            justifyContent: 'center', pointerEvents: 'none', opacity: 0.3
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }} className="animate-haunt">✦</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-tertiary)' }}>
                Start writing here...
              </div>
              <div style={{ fontSize: '0.72rem', marginTop: '4px', color: 'var(--text-muted)' }}>
                Specter will save your work automatically
              </div>
            </div>
          </div>
        )}

        {/* DIFF VIEW — shows when AI edit is pending */}
        {pendingEdit && diffBlocks ? (
          <div className="editor-content diff-view" id="editor-diff-view">
            {diffBlocks.map((block, idx) => {
              const trimmed = block.text.trim();
              if (!trimmed && block.type === 'same') return null;

              // Determine if this is a heading
              const isH1 = /^#\s/.test(trimmed);
              const isH2 = /^##\s/.test(trimmed);
              const isH3 = /^###\s/.test(trimmed);
              const isHr = /^[-*_]{3,}\s*$/.test(trimmed);
              const headingText = trimmed.replace(/^#{1,6}\s+/, '');

              // Inline markdown
              let displayText = (isH1 || isH2 || isH3) ? headingText : trimmed;
              displayText = displayText.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
              displayText = displayText.replace(/\*(.+?)\*/g, '<em>$1</em>');

              if (isHr) {
                return <hr key={idx} style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '16px 0' }} />;
              }

              const baseStyle = {
                padding: '2px 4px',
                borderRadius: '3px',
                transition: 'all 0.2s',
                ...(block.type === 'added' ? {
                  background: 'rgba(74, 222, 128, 0.1)',
                  borderLeft: '3px solid #4ade80',
                  paddingLeft: '12px',
                  marginLeft: '-4px'
                } : block.type === 'removed' ? {
                  background: 'rgba(248, 113, 113, 0.08)',
                  borderLeft: '3px solid #f87171',
                  paddingLeft: '12px',
                  marginLeft: '-4px',
                  textDecoration: 'line-through',
                  opacity: 0.5
                } : {})
              };

              const Tag = isH1 ? 'h1' : isH2 ? 'h2' : isH3 ? 'h3' : 'p';
              if (!trimmed) return null;

              return (
                <Tag key={idx} style={baseStyle} dangerouslySetInnerHTML={{ __html: displayText }} />
              );
            })}
          </div>
        ) : (
          /* NORMAL EDITOR — contentEditable with markdown rendering */
          <div
            ref={contentEditableRef}
            onInput={handleInput}
            onPaste={handlePaste}
            onMouseUp={handleMouseUp}
            onKeyDown={handleKeyDown}
            contentEditable
            suppressContentEditableWarning
            className="editor-content"
            id="editor-content"
            style={{ caretColor: '#3b82f6', outline: 'none', position: 'relative', zIndex: 10 }}
          />
        )}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{
                    fontSize: '0.65rem', padding: '2px 8px', borderRadius: '999px',
                    background: 'rgba(74,222,128,0.12)', color: '#22c55e',
                    border: '1px solid rgba(74,222,128,0.2)', fontWeight: 600
                  }}>✓ Cited</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  This text contains a citation reference.
                </div>
              </div>
            ) : tooltip.matchedRef ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{
                    fontSize: '0.65rem', padding: '2px 8px', borderRadius: '999px',
                    background: 'rgba(251,191,36,0.12)', color: '#f59e0b',
                    border: '1px solid rgba(251,191,36,0.2)', fontWeight: 600
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{
                    fontSize: '0.65rem', padding: '2px 8px', borderRadius: '999px',
                    background: 'rgba(59,130,246,0.1)', color: '#3b82f6',
                    border: '1px solid rgba(59,130,246,0.18)', fontWeight: 600
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
