import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiTrash2, FiX, FiCheck, FiRotateCcw, FiEdit3, FiFileText } from 'react-icons/fi';

export default function ChatPanel({
  notebookId, chatHistory, onSendMessage, onClearChat,
  isOpen, onClose,
  // IDE-style props: content editing
  currentContent, onApplyEdit
}) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [pendingEdit, setPendingEdit] = useState(null); // { originalContent, newContent, description }
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, pendingEdit]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    const msg = message.trim();
    setMessage('');
    setSending(true);
    try {
      const result = await onSendMessage(msg);
      // Check if AI response contains an edit block
      if (result?.aiMessage?.content) {
        const editMatch = result.aiMessage.content.match(/```edit\n([\s\S]*?)```/);
        if (editMatch) {
          const editContent = editMatch[1].trim();
          const description = result.aiMessage.content.replace(/```edit\n[\s\S]*?```/, '').trim();
          setPendingEdit({
            originalContent: currentContent,
            newContent: editContent,
            description: description || 'AI suggested changes to your document.'
          });
        }
      }
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  const handleAcceptEdit = () => {
    if (pendingEdit && onApplyEdit) {
      onApplyEdit(pendingEdit.newContent);
    }
    setPendingEdit(null);
  };

  const handleRejectEdit = () => {
    setPendingEdit(null);
  };

  const quickPrompts = [
    { icon: '✍️', label: 'Improve my writing', msg: 'Read my current document and improve the writing style, grammar, and clarity. Return the improved version.' },
    { icon: '📝', label: 'Continue writing', msg: 'Read my current document and continue writing where I left off, maintaining the same tone and style.' },
    { icon: '📊', label: 'Summarize document', msg: 'Summarize my current document.' },
    { icon: '📋', label: 'Create outline', msg: 'Read my current document and suggest a structured outline for the rest of the paper.' },
    { icon: '🔧', label: 'Fix grammar', msg: 'Fix all grammar and spelling errors in my document. Return the corrected version.' },
    { icon: '📖', label: 'Add introduction', msg: 'Write a strong introduction paragraph for my paper based on the current content.' },
  ];

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
      position: 'fixed', right: 0, top: 0, bottom: 0,
      width: '420px', maxWidth: '100vw',
      background: 'var(--bg-secondary)',
      borderLeft: '1px solid var(--border-color)',
      display: 'flex', flexDirection: 'column',
      zIndex: 40,
      boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
      animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--border-color)',
        background: 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary))',
        flexShrink: 0
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {chatHistory.length > 0 && (
              <button onClick={onClearChat} title="Clear chat" style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '6px', borderRadius: '6px', color: 'var(--text-muted)'
              }}>
                <FiTrash2 size={15} />
              </button>
            )}
            <button onClick={onClose} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '6px', borderRadius: '6px', color: 'var(--text-muted)'
            }}>
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* Context indicator */}
        <div style={{
          marginTop: '10px', padding: '6px 10px', borderRadius: '6px',
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '0.68rem', color: 'var(--text-muted)'
        }}>
          <FiFileText size={12} style={{ color: '#3b82f6' }} />
          <span>Document context: <strong style={{ color: 'var(--text-secondary)' }}>{contentWordCount} words</strong></span>
          <span style={{ marginLeft: 'auto', color: '#3b82f6', fontWeight: 600 }}>Live</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        {chatHistory.length === 0 && !pendingEdit ? (
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
                <button key={i} onClick={() => { setMessage(qp.msg); setTimeout(() => inputRef.current?.focus(), 50); }}
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

            {/* Pending Edit Preview */}
            {pendingEdit && (
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid #2563eb',
                borderRadius: '12px',
                overflow: 'hidden',
                animation: 'fadeIn 0.3s ease-out'
              }}>
                <div style={{
                  padding: '10px 14px',
                  background: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(6,182,212,0.05))',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  <FiEdit3 size={14} style={{ color: '#3b82f6' }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Suggested Edit
                  </span>
                </div>

                {pendingEdit.description && (
                  <div style={{ padding: '10px 14px', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5, borderBottom: '1px solid var(--border-color)' }}>
                    {pendingEdit.description}
                  </div>
                )}

                <div style={{
                  maxHeight: '250px', overflow: 'auto', padding: '12px 14px',
                  fontSize: '0.75rem', lineHeight: 1.7, color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-serif)', whiteSpace: 'pre-wrap',
                  background: 'var(--bg-tertiary)'
                }}>
                  {pendingEdit.newContent.substring(0, 1000)}
                  {pendingEdit.newContent.length > 1000 && (
                    <span style={{ color: 'var(--text-muted)' }}>... ({pendingEdit.newContent.split(/\s+/).length} words total)</span>
                  )}
                </div>

                <div style={{ padding: '10px 14px', display: 'flex', gap: '8px' }}>
                  <button onClick={handleAcceptEdit} className="btn-specter btn-sm" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <FiCheck size={13} /> Keep Changes
                  </button>
                  <button onClick={handleRejectEdit} className="btn-ghost-outline btn-sm" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <FiRotateCcw size={13} /> Undo
                  </button>
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
            placeholder="Ask Specter to edit your doc..."
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
          Enter to send · Shift+Enter for new line · AI reads your document live
        </div>
      </div>
    </div>
  );
}
