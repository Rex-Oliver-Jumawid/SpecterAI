import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table';
import { TableHeader } from '@tiptap/extension-table';
import { TextAlign } from '@tiptap/extension-text-align';
import { FiBold, FiItalic, FiUnderline, FiAlignLeft, FiAlignCenter, FiAlignRight, FiList, FiCheck, FiX } from 'react-icons/fi';
import { TbTablePlus, TbColumnInsertRight, TbRowInsertBottom, TbTableOff } from 'react-icons/tb';

const MenuBar = ({ editor }) => {
  if (!editor) return null;
  return (
    <div className="notebook-toolbar" style={{ position: 'sticky', top: 0, zIndex: 30, background: 'var(--bg-secondary)', padding: '8px 16px' }}>
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`} title="Bold (Cmd+B)">
          <FiBold size={14}/>
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`} title="Italic (Cmd+I)">
          <FiItalic size={14}/>
        </button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`toolbar-btn ${editor.isActive('underline') ? 'active' : ''}`} title="Underline (Cmd+U)">
          <FiUnderline size={14}/>
        </button>
        
        <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 4px' }} />
        
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}>H1</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}>H2</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`toolbar-btn ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}>H3</button>
        
        <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 4px' }} />
        
        <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`toolbar-btn ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}><FiAlignLeft size={14}/></button>
        <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`toolbar-btn ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}><FiAlignCenter size={14}/></button>
        <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`toolbar-btn ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}><FiAlignRight size={14}/></button>

        <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 4px' }} />
        
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}><FiList size={14}/></button>
        
        <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 4px' }} />
        
        <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className="toolbar-btn" title="Insert Table"><TbTablePlus size={16}/></button>
        {editor.isActive('table') && (
          <>
            <button onClick={() => editor.chain().focus().addColumnAfter().run()} className="toolbar-btn" title="Add Column"><TbColumnInsertRight size={16}/></button>
            <button onClick={() => editor.chain().focus().addRowAfter().run()} className="toolbar-btn" title="Add Row"><TbRowInsertBottom size={16}/></button>
            <button onClick={() => editor.chain().focus().deleteTable().run()} className="toolbar-btn" style={{color: '#f87171'}} title="Delete Table"><TbTableOff size={16}/></button>
          </>
        )}
      </div>
    </div>
  );
};

// Legacy markdown converter for backwards compatibility
function markdownToHtml(text) {
  if (!text) return '';
  if (/<(h[1-6]|p|ul|ol|blockquote|table)\b/i.test(text)) return text; // Already HTML
  const lines = text.split('\n');
  const result = [];
  let inParagraph = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) { if (inParagraph) { result.push('</p>'); inParagraph = false; } continue; }
    if (/^#{1,6}\s/.test(trimmed)) {
      if (inParagraph) { result.push('</p>'); inParagraph = false; }
      const level = trimmed.match(/^(#{1,6})/)[1].length;
      result.push(`<h${level}>${trimmed.replace(/^#{1,6}\s+/, '')}</h${level}>`);
      continue;
    }
    if (!inParagraph) { result.push('<p>'); inParagraph = true; } else { result.push('<br/>'); }
    let formatted = trimmed;
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
    result.push(formatted);
  }
  if (inParagraph) result.push('</p>');
  return result.join('\n');
}

const PAGE_DELIMITER = '<!--PAGE_BREAK-->';

const Editor = React.forwardRef(({ content, onChange, wordCount, documentTitle, onTitleChange, references, pendingEdit, onAcceptEdit, onRejectEdit }, ref) => {
  const [tooltip, setTooltip] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [tabNames, setTabNames] = useState(['Page 1']);
  const [editingTabIdx, setEditingTabIdx] = useState(null);
  const [editingTabName, setEditingTabName] = useState('');

  // Parse pages from content
  const pages = useMemo(() => {
    if (!content) return [''];
    const parts = content.split(PAGE_DELIMITER);
    return parts.length > 0 ? parts : [''];
  }, [content]);

  // Initialize tab names from page count
  useEffect(() => {
    if (pages.length > tabNames.length) {
      setTabNames(prev => {
        const newNames = [...prev];
        for (let i = prev.length; i < pages.length; i++) {
          newNames.push(`Page ${i + 1}`);
        }
        return newNames;
      });
    }
  }, [pages.length]);

  const currentPageContent = pages[activeTab] || '';

  const initialHtml = useMemo(() => markdownToHtml(currentPageContent || ''), []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: initialHtml,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Update the current page in the pages array
      const newPages = [...pages];
      newPages[activeTab] = html;
      onChange(newPages.join(PAGE_DELIMITER));
    }
  });

  // Switch tab — update editor content
  useEffect(() => {
    if (editor && pages[activeTab] !== undefined) {
      const pageHtml = markdownToHtml(pages[activeTab] || '');
      const currentHtml = editor.getHTML();
      if (currentHtml !== pageHtml) {
        editor.commands.setContent(pageHtml || '<p></p>');
      }
    }
  }, [activeTab]);

  // Sync external content changes (only if editor is empty, prevents cursor jumping)
  useEffect(() => {
    if (editor && content && editor.isEmpty) {
      const html = markdownToHtml(pages[activeTab] || '');
      if (editor.getHTML() !== html) {
        editor.commands.setContent(html);
      }
    }
  }, [content, editor]);

  const addPage = () => {
    const newPages = [...pages, '<p></p>'];
    const newNames = [...tabNames, `Page ${newPages.length}`];
    setTabNames(newNames);
    onChange(newPages.join(PAGE_DELIMITER));
    setActiveTab(newPages.length - 1);
  };

  const removePage = (idx) => {
    if (pages.length <= 1) return;
    const newPages = pages.filter((_, i) => i !== idx);
    const newNames = tabNames.filter((_, i) => i !== idx);
    setTabNames(newNames);
    const newActive = idx >= newPages.length ? newPages.length - 1 : idx;
    setActiveTab(newActive);
    onChange(newPages.join(PAGE_DELIMITER));
  };

  const startRenameTab = (idx) => {
    setEditingTabIdx(idx);
    setEditingTabName(tabNames[idx]);
  };

  const finishRenameTab = () => {
    if (editingTabIdx !== null && editingTabName.trim()) {
      const newNames = [...tabNames];
      newNames[editingTabIdx] = editingTabName.trim();
      setTabNames(newNames);
    }
    setEditingTabIdx(null);
  };

  // Handle Attribution Tooltip Selection
  const handleMouseUp = useCallback(() => {
    if (pendingEdit) return;
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

  // Compute diff for AI edits
  const computeInlineDiff = useCallback(() => {
    if (!pendingEdit) return null;
    const stripHtml = (html) => {
      const tmp = document.createElement('DIV');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    };
    const origLines = stripHtml(content || '').split('\n');
    const newLines = stripHtml(pendingEdit.newContent || '').split('\n');
    const diffBlocks = [];
    let i = 0, j = 0;
    while (i < origLines.length || j < newLines.length) {
      if (i < origLines.length && j < newLines.length) {
        if (origLines[i].trim() === newLines[j].trim()) {
          diffBlocks.push({ type: 'same', text: newLines[j] });
          i++; j++;
        } else {
          let foundInNew = -1;
          for (let k = j + 1; k < Math.min(j + 5, newLines.length); k++) {
            if (origLines[i].trim() === newLines[k].trim()) { foundInNew = k; break; }
          }
          if (foundInNew >= 0) {
            for (let k = j; k < foundInNew; k++) diffBlocks.push({ type: 'added', text: newLines[k] });
            diffBlocks.push({ type: 'same', text: newLines[foundInNew] });
            j = foundInNew + 1; i++;
          } else {
            let foundInOrig = -1;
            for (let k = i + 1; k < Math.min(i + 5, origLines.length); k++) {
              if (j < newLines.length && origLines[k].trim() === newLines[j].trim()) { foundInOrig = k; break; }
            }
            if (foundInOrig >= 0) {
              for (let k = i; k < foundInOrig; k++) diffBlocks.push({ type: 'removed', text: origLines[k] });
              i = foundInOrig;
            } else {
              diffBlocks.push({ type: 'removed', text: origLines[i] });
              diffBlocks.push({ type: 'added', text: newLines[j] });
              i++; j++;
            }
          }
        }
      } else if (j < newLines.length) {
        diffBlocks.push({ type: 'added', text: newLines[j] }); j++;
      } else {
        diffBlocks.push({ type: 'removed', text: origLines[i] }); i++;
      }
    }
    return diffBlocks;
  }, [pendingEdit, content]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      
      {/* Pending Edit Bar */}
      {pendingEdit && (
        <div style={{
          padding: '12px 20px', background: 'rgba(59, 130, 246, 0.08)',
          borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0, zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: '#3b82f6', color: 'white', padding: '2px 8px',
              borderRadius: '999px', fontSize: '0.65rem', fontWeight: 700
            }}>AI EDIT</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {pendingEdit.description}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onRejectEdit} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)',
              background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem'
            }}>
              <FiX size={14} /> Discard
            </button>
            <button onClick={() => {
              if (editor) {
                const html = markdownToHtml(pendingEdit.newContent);
                editor.commands.setContent(html);
                onChange(html);
              }
              onAcceptEdit();
            }} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '6px', border: 'none',
              background: '#4ade80', color: '#064e3b', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600
            }}>
              <FiCheck size={14} /> Accept Changes
            </button>
          </div>
        </div>
      )}

      {/* Editor Header */}
      <div style={{ padding: '24px 40px 16px', flexShrink: 0, zIndex: 5 }}>
        <input
          value={documentTitle || ''}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Untitled Document"
          style={{
            fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)',
            background: 'transparent', border: 'none', outline: 'none', width: '100%',
            fontFamily: 'var(--font-sans)', letterSpacing: '-0.02em', marginBottom: '8px'
          }}
        />
        <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          <span>{wordCount} words</span>
          <span>·</span>
          <span>{Math.ceil(wordCount / 200)} min read</span>
          <span>·</span>
          <span>Page {activeTab + 1} of {pages.length}</span>
        </div>
      </div>

      {!pendingEdit && <MenuBar editor={editor} />}

      {/* Tab Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0', padding: '0 20px',
        background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)',
        flexShrink: 0, overflow: 'auto',
      }}>
        {tabNames.slice(0, pages.length).map((name, idx) => (
          <div
            key={idx}
            onClick={() => setActiveTab(idx)}
            onDoubleClick={() => startRenameTab(idx)}
            style={{
              padding: '8px 16px', fontSize: '0.72rem', fontWeight: activeTab === idx ? 600 : 400,
              color: activeTab === idx ? 'var(--text-primary)' : 'var(--text-muted)',
              background: activeTab === idx ? 'var(--bg-secondary)' : 'transparent',
              borderBottom: activeTab === idx ? '2px solid #7c3aed' : '2px solid transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'all 0.15s', whiteSpace: 'nowrap', position: 'relative',
              borderTop: activeTab === idx ? '2px solid #7c3aed' : '2px solid transparent',
              borderRadius: activeTab === idx ? '6px 6px 0 0' : '0',
            }}
          >
            {editingTabIdx === idx ? (
              <input
                autoFocus
                value={editingTabName}
                onChange={e => setEditingTabName(e.target.value)}
                onBlur={finishRenameTab}
                onKeyDown={e => { if (e.key === 'Enter') finishRenameTab(); }}
                style={{
                  background: 'transparent', border: 'none', outline: 'none',
                  color: 'var(--text-primary)', fontSize: '0.72rem', fontWeight: 600,
                  width: '80px', padding: 0,
                }}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span>{name}</span>
            )}
            {pages.length > 1 && activeTab === idx && (
              <button
                onClick={(e) => { e.stopPropagation(); removePage(idx); }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px',
                  color: 'var(--text-muted)', fontSize: '0.7rem', lineHeight: 1, display: 'flex',
                }}
                title="Remove page"
              >
                <FiX size={11} />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addPage}
          style={{
            padding: '6px 10px', background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: '0.82rem', display: 'flex', alignItems: 'center',
          }}
          title="Add new page"
        >
          +
        </button>
      </div>

      <div className="editor-wrapper" onMouseUp={handleMouseUp}>
        {pendingEdit ? (
          <div className="diff-view editor-page">
            {computeInlineDiff()?.map((block, idx) => {
              const baseStyle = {
                padding: '2px 4px', borderRadius: '3px', transition: 'all 0.2s',
                ...(block.type === 'added' ? { background: 'rgba(74, 222, 128, 0.1)', borderLeft: '3px solid #4ade80', paddingLeft: '12px', marginLeft: '-4px' } 
                  : block.type === 'removed' ? { background: 'rgba(248, 113, 113, 0.08)', borderLeft: '3px solid #f87171', paddingLeft: '12px', marginLeft: '-4px', textDecoration: 'line-through', opacity: 0.5 } : {})
              };
              if (!block.text.trim()) return null;
              return <p key={idx} style={baseStyle}>{block.text}</p>;
            })}
          </div>
        ) : (
          <div className="editor-page">
            <EditorContent editor={editor} />
          </div>
        )}
      </div>

      {/* Attribution Tooltip */}
      {tooltip && (
        <div className="attribution-tooltip" style={{
          position: 'fixed', left: `${Math.max(120, Math.min(tooltip.x, window.innerWidth - 180))}px`, top: `${tooltip.y}px`,
          transform: 'translate(-50%, -100%)', zIndex: 100, animation: 'scaleIn 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px',
            padding: '10px 14px', boxShadow: '0 8px 30px rgba(0,0,0,0.2)', minWidth: '200px', maxWidth: '300px'
          }}>
            {tooltip.hasCitation ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '999px', background: 'rgba(74,222,128,0.12)', color: '#22c55e', border: '1px solid rgba(74,222,128,0.2)', fontWeight: 600 }}>✓ Cited</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>This text contains a citation reference.</div>
              </div>
            ) : tooltip.matchedRef ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '999px', background: 'rgba(251,191,36,0.12)', color: '#f59e0b', border: '1px solid rgba(251,191,36,0.2)', fontWeight: 600 }}>⚠ Similar to Reference</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Matches: <strong>{tooltip.matchedRef.authors}</strong> ({tooltip.matchedRef.year})</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>Consider adding a citation for attribution.</div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '999px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.18)', fontWeight: 600 }}>✍ Your Writing</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>This is your original content. No matching references found.</div>
              </div>
            )}
            <div style={{ position: 'absolute', bottom: '-5px', left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: '10px', height: '10px', background: 'var(--bg-card)', borderRight: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }} />
          </div>
        </div>
      )}
    </div>
  );
});

Editor.displayName = 'Editor';
export default Editor;
