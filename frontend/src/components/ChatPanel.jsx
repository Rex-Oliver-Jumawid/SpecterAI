import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiTrash2, FiMessageSquare, FiX, FiChevronDown } from 'react-icons/fi';

export default function ChatPanel({ notebookId, chatHistory, onSendMessage, onClearChat, isOpen, onClose }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

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
      await onSendMessage(msg);
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  const quickPrompts = [
    { icon: '📝', label: 'Write a paragraph', msg: 'Write a paragraph for my paper' },
    { icon: '📋', label: 'Create outline', msg: 'Help me create an outline for my paper' },
    { icon: '📊', label: 'Summarize', msg: 'Summarize my current draft' },
    { icon: '✍️', label: 'Improve writing', msg: 'Help me improve my writing style' },
  ];

  const formatContent = (text) => {
    // Basic markdown-like formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', right: 0, top: 0, bottom: 0,
      width: '400px', maxWidth: '100vw',
      background: 'var(--bg-secondary)',
      borderLeft: '1px solid var(--border-color)',
      display: 'flex', flexDirection: 'column',
      zIndex: 40,
      boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
      animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary))',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--color-specter-500), var(--color-ghost-500))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 10px oklch(0.55 0.22 275 / 0.25)'
          }}>
            <span style={{ fontSize: '0.9rem' }}>👻</span>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Specter AI</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-phantom-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--color-phantom-500)', display: 'inline-block' }} />
              Online
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {chatHistory.length > 0 && (
            <button onClick={onClearChat} title="Clear chat" style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '6px', borderRadius: '6px', color: 'var(--text-muted)',
              transition: 'all 0.15s'
            }}>
              <FiTrash2 size={15} />
            </button>
          )}
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '6px', borderRadius: '6px', color: 'var(--text-muted)',
            transition: 'all 0.15s'
          }}>
            <FiX size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        {chatHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--color-specter-500), var(--color-ghost-500))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 4px 20px oklch(0.55 0.22 275 / 0.3)'
            }}>
              <span style={{ fontSize: '1.5rem' }}>👻</span>
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
              Hi! I'm Specter
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
              Your AI writing assistant. Ask me to help draft, outline, research, or improve your paper.
            </p>

            {/* Quick prompts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {quickPrompts.map((qp, i) => (
                <button key={i} onClick={() => { setMessage(qp.msg); setTimeout(() => inputRef.current?.focus(), 50); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 14px', borderRadius: '8px',
                    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                    transition: 'all 0.15s', color: 'var(--text-secondary)',
                    fontSize: '0.78rem', fontFamily: 'var(--font-sans)'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
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
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user'
                    ? '14px 14px 4px 14px'
                    : '14px 14px 14px 4px',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, var(--color-specter-500), var(--color-specter-600))'
                    : 'var(--bg-card)',
                  color: msg.role === 'user' ? 'white' : 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  lineHeight: 1.6,
                  border: msg.role === 'user' ? 'none' : '1px solid var(--border-color)',
                  boxShadow: msg.role === 'user'
                    ? '0 2px 8px oklch(0.55 0.22 275 / 0.2)'
                    : 'var(--shadow-sm)',
                  animation: 'fadeIn 0.2s ease-out'
                }}
                dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                />
              </div>
            ))}
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
                        background: 'var(--color-specter-400)',
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
            placeholder="Ask Specter anything..."
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
                ? 'linear-gradient(135deg, var(--color-specter-500), var(--color-specter-600))'
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
          Press Enter to send · Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}
