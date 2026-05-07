import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiTrash2, FiX, FiFileText, FiZap, FiMinus, FiMaximize2 } from 'react-icons/fi';

export default function ChatPanel({
  notebookId, chatHistory, onSendMessage, onClearChat,
  isOpen, onClose,
  currentContent, onEditProposed, hasPendingEdit
}) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [mode, setMode] = useState('write');
  const [isMinimized, setIsMinimized] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, hasPendingEdit, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  // Drag Handlers
  const handlePointerDown = (e) => {
    if (e.target.closest('.no-drag')) return;
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    setPos({
      x: e.clientX - dragStartPos.current.x,
      y: e.clientY - dragStartPos.current.y
    });
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);
  };

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    const msg = message.trim();
    setMessage('');
    setSending(true);
    try {
      const result = await onSendMessage(msg, mode);
      // Check if AI response contains an edit block — push directly to editor
      if (result?.aiMessage?.content) {
        const editMatch = result.aiMessage.content.match(/```edit\n([\s\S]*?)```/);
        if (editMatch && onEditProposed) {
          const editContent = editMatch[1].trim();
          const description = result.aiMessage.content.replace(/```edit\n[\s\S]*?```/, '').trim();
          onEditProposed({
            newContent: editContent,
            description: description || 'AI suggested changes to your document.'
          });
        }
      }
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  const writePrompts = [
    { icon: '📚', label: 'Write with refs', msg: 'Write a paragraph about my topic using my saved references as context. Include proper citations from the sources.' },
    { icon: '✍️', label: 'Improve writing', msg: 'Read my current document and improve the writing style, grammar, and clarity. Return the improved version.' },
    { icon: '📝', label: 'Continue writing', msg: 'Read my current document and continue writing where I left off, maintaining the same tone and style.' },
    { icon: '🤖', label: 'AI detection', msg: 'Analyze my current document and check which parts might appear AI-generated. Give me a confidence score and suggestions to make it more authentic.' },
    { icon: '📋', label: 'Create outline', msg: 'Read my current document and suggest a structured outline for the rest of the paper.' },
    { icon: '📖', label: 'Add introduction', msg: 'Write a strong introduction paragraph for my paper based on the current content and my saved references.' },
  ];

  const askPrompts = [
    { icon: '💡', label: 'Explain a concept', msg: 'What is machine learning and how does it work?' },
    { icon: '🔍', label: 'Compare topics', msg: 'What is the difference between qualitative and quantitative research?' },
    { icon: '📊', label: 'Research methods', msg: 'How to conduct a literature review?' },
    { icon: '🧠', label: 'About my paper', msg: 'What is my document about? Give me a summary.' },
    { icon: '📝', label: 'Citation help', msg: 'How to properly cite sources in APA format?' },
    { icon: '🎓', label: 'Study tips', msg: 'What are effective strategies for academic writing?' },
  ];

  const quickPrompts = mode === 'ask' ? askPrompts : writePrompts;

  const formatContent = (text) => {
    return text
      .replace(/```edit\n[\s\S]*?```/g, '') // Remove edit blocks from display
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background:var(--bg-tertiary);padding:1px 4px;border-radius:3px;font-size:0.75rem">$1</code>')
      .replace(/\n/g, '<br/>');
  };

  // Count content words for context display
  const contentWordCount = (currentContent || '').split(/\s+/).filter(w => w.length > 0).length;

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      right: '24px',
      bottom: '24px',
      width: '400px',
      maxWidth: 'calc(100vw - 48px)',
      height: isMinimized ? 'auto' : '650px',
      maxHeight: 'calc(100vh - 48px)',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: '16px',
      display: 'flex', flexDirection: 'column',
      zIndex: 50,
      boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
      transform: `translate(${pos.x}px, ${pos.y}px)`,
      transition: isDragging ? 'none' : 'height 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      overflow: 'hidden',
      animation: 'slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      {/* Header (Drag Handle) */}
      <div 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
        padding: '14px 20px',
        borderBottom: isMinimized ? 'none' : '1px solid var(--border-color)',
        background: 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary))',
        flexShrink: 0,
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(37,99,235,0.3)'
            }}>
              <span style={{ fontSize: '0.9rem' }}>✦</span>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Specter AI</div>
              <div style={{ fontSize: '0.62rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                Reading your document
              </div>
            </div>
          </div>
          <div className="no-drag" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {chatHistory.length > 0 && (
              <button onClick={onClearChat} title="Clear chat" style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '6px', borderRadius: '6px', color: 'var(--text-muted)'
              }}>
                <FiTrash2 size={15} />
              </button>
            )}
            <button onClick={() => setIsMinimized(!isMinimized)} title={isMinimized ? "Expand" : "Minimize"} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '6px', borderRadius: '6px', color: 'var(--text-muted)'
            }}>
              {isMinimized ? <FiMaximize2 size={15} /> : <FiMinus size={16} />}
            </button>
            <button onClick={onClose} title="Close" style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '6px', borderRadius: '6px', color: 'var(--text-muted)'
            }}>
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* Context indicator + Mode toggle */}
        {!isMinimized && (
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              padding: '6px 10px', borderRadius: '6px',
              background: 'var(--bg-card)', border: '1px solid var(--border-color)',
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '0.68rem', color: 'var(--text-muted)'
            }}>
              <FiFileText size={12} style={{ color: '#3b82f6' }} />
              <span>Document context: <strong style={{ color: 'var(--text-secondary)' }}>{contentWordCount} words</strong></span>
              <span style={{ marginLeft: 'auto', color: '#3b82f6', fontWeight: 600 }}>Live</span>
            </div>

            {/* Ask / Write Toggle */}
            <div style={{
              display: 'flex', borderRadius: '8px', overflow: 'hidden',
              border: '1px solid var(--border-color)', background: 'var(--bg-card)'
            }}>
              <button
                onClick={() => setMode('ask')}
                className="no-drag"
                style={{
                  flex: 1, padding: '7px 0', border: 'none', cursor: 'pointer',
                  fontSize: '0.72rem', fontWeight: 600, fontFamily: 'var(--font-sans)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                  background: mode === 'ask' ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'transparent',
                  color: mode === 'ask' ? 'white' : 'var(--text-muted)',
                  transition: 'all 0.2s',
                }}
              >
                💬 Ask
              </button>
              <button
                onClick={() => setMode('write')}
                className="no-drag"
                style={{
                  flex: 1, padding: '7px 0', border: 'none', cursor: 'pointer',
                  fontSize: '0.72rem', fontWeight: 600, fontFamily: 'var(--font-sans)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                  background: mode === 'write' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'transparent',
                  color: mode === 'write' ? 'white' : 'var(--text-muted)',
                  transition: 'all 0.2s',
                }}
              >
                ✏️ Write
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      {!isMinimized && (
        <>
          <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        {chatHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 20px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 4px 20px rgba(37,99,235,0.3)'
            }}>
              <span style={{ fontSize: '1.5rem' }}>✦</span>
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
              Specter is reading your doc
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
              I can read your document, edit content, add sections, fix grammar, and more. Changes are previewed before applying.
            </p>

            {/* Quick prompts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {quickPrompts.map((qp, i) => (
                <button key={i} onClick={() => { setMode('write'); setMessage(qp.msg); setTimeout(() => inputRef.current?.focus(), 50); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 10px', borderRadius: '8px',
                    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                    transition: 'all 0.15s', color: 'var(--text-secondary)',
                    fontSize: '0.72rem', fontFamily: 'var(--font-sans)'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
                >
                  <span>{qp.icon}</span>
                  <span>{qp.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {chatHistory.map((msg, i) => (
              <div key={msg.id || i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '88%',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user'
                    ? '14px 14px 4px 14px'
                    : '14px 14px 14px 4px',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                    : 'var(--bg-card)',
                  color: msg.role === 'user' ? 'white' : 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  lineHeight: 1.6,
                  border: msg.role === 'user' ? 'none' : '1px solid var(--border-color)',
                  boxShadow: msg.role === 'user'
                    ? '0 2px 8px rgba(37,99,235,0.25)'
                    : 'var(--shadow-sm)',
                  animation: 'fadeIn 0.2s ease-out'
                }}
                dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                />
              </div>
            ))}

            {/* Live-edit indicator — changes are in the Editor, not here */}
            {hasPendingEdit && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px',
                background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(6,182,212,0.05))',
                border: '1px solid rgba(37,99,235,0.2)',
                borderRadius: '12px',
                animation: 'fadeIn 0.3s ease-out'
              }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                  background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <FiZap size={14} style={{ color: 'white' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                    Changes are live in your document
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    Green = added &nbsp;·&nbsp; Red = removed &nbsp;·&nbsp; Use the bar above the editor to accept or discard
                  </div>
                </div>
              </div>
            )}

            {sending && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '12px 16px', borderRadius: '14px 14px 14px 4px',
                  background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: '#3b82f6',
                        animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Specter is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border-color)',
        background: 'var(--bg-tertiary)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Mode
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setMode('ask')}
              style={{
                padding: '4px 10px', borderRadius: '999px',
                border: mode === 'ask' ? '1px solid #2563eb' : '1px solid var(--border-color)',
                background: mode === 'ask' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'var(--bg-card)',
                color: mode === 'ask' ? 'white' : 'var(--text-muted)',
                fontSize: '0.62rem', fontWeight: 700, cursor: 'pointer'
              }}
            >
              Ask
            </button>
            <button
              type="button"
              onClick={() => setMode('write')}
              style={{
                padding: '4px 10px', borderRadius: '999px',
                border: mode === 'write' ? '1px solid #2563eb' : '1px solid var(--border-color)',
                background: mode === 'write' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'var(--bg-card)',
                color: mode === 'write' ? 'white' : 'var(--text-muted)',
                fontSize: '0.62rem', fontWeight: 700, cursor: 'pointer'
              }}
            >
              Write
            </button>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
            {mode === 'ask' ? 'Answers questions' : 'Edits your document'}
          </span>
        </div>
        <div style={{
          display: 'flex', gap: '8px', alignItems: 'flex-end',
          background: 'var(--bg-input)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '4px 4px 4px 14px',
          transition: 'border-color 0.2s'
        }}>
          <textarea
            ref={inputRef}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={mode === 'ask' ? 'Ask a question...' : 'Ask Specter to edit your doc...'}
            rows={1}
            style={{
              flex: 1, border: 'none', outline: 'none', resize: 'none',
              background: 'transparent', color: 'var(--text-primary)',
              fontSize: '0.82rem', fontFamily: 'var(--font-sans)',
              padding: '8px 0', maxHeight: '100px', lineHeight: 1.5
            }}
          />
          <button onClick={handleSend} disabled={!message.trim() || sending}
            style={{
              width: '34px', height: '34px', borderRadius: '8px',
              background: message.trim()
                ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                : 'var(--bg-tertiary)',
              border: 'none', cursor: message.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s', flexShrink: 0,
              color: message.trim() ? 'white' : 'var(--text-muted)'
            }}>
            <FiSend size={14} />
          </button>
        </div>
        <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '6px' }}>
          {mode === 'ask' ? '💬 Ask mode — answers questions' : '✏️ Write mode — edits your document'} · Enter to send
        </div>
      </div>
      </>
      )}
    </div>
  );
}
