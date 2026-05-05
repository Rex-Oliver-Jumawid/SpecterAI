import React, { useState } from 'react';
import { FiPlus, FiTrash2, FiClock, FiPlay, FiZap, FiSearch, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import Calendar from './Calendar';

export default function PlanningPanel({
  plans,
  onCreatePlan,
  onDeletePlan,
  onTriggerAi,
  onSelectPlan,
  selectedPlanId,
  notebookId
}) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [outline, setOutline] = useState('');
  const [outputType, setOutputType] = useState('draft');
  const [wordTarget, setWordTarget] = useState(500);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [autoStart, setAutoStart] = useState(false);
  const [preFetchRefs, setPreFetchRefs] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [selectedCalDate, setSelectedCalDate] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleCreate = () => {
    if (!title.trim()) return;

    let dateStr = scheduledDate || null;
    if (dateStr && scheduledTime) {
      dateStr = `${scheduledDate}T${scheduledTime}`;
    }

    onCreatePlan({
      title: title.trim(),
      outline: outline.trim(),
      output_type: preFetchRefs ? 'references_only' : outputType,
      word_target: wordTarget,
      scheduled_date: dateStr,
      scheduled_time: scheduledTime,
      auto_start: autoStart,
      pre_fetch_refs: preFetchRefs,
      instructions: instructions.trim()
    });
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setOutline('');
    setOutputType('draft');
    setWordTarget(500);
    setScheduledDate('');
    setScheduledTime('09:00');
    setAutoStart(false);
    setPreFetchRefs(false);
    setInstructions('');
    setShowForm(false);
    setShowAdvanced(false);
  };

  const getStatusConfig = (status) => {
    const configs = {
      planned: { class: 'status-planned', icon: '📋', label: 'Planned' },
      preparing: { class: 'status-preparing', icon: '🔄', label: 'Preparing' },
      ready: { class: 'status-ready', icon: '✅', label: 'Ready' },
      review: { class: 'status-review', icon: '👻', label: 'Review' },
      done: { class: 'status-done', icon: '✓', label: 'Done' },
    };
    return configs[status] || configs.planned;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No date';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = d - now;
    if (diff < 0 && diff > -86400000) return 'Overdue';
    if (diff < 0) return 'Past';
    if (diff < 60 * 60 * 1000) return `${Math.max(1, Math.floor(diff / 60000))}m left`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)}h left`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (plan) => {
    if (!plan.scheduled_date) return false;
    return new Date(plan.scheduled_date) < new Date() && plan.status !== 'done' && plan.status !== 'review';
  };

  // Filter plans for selected calendar date
  const filteredPlans = selectedCalDate
    ? plans.filter(p => {
        if (!p.scheduled_date) return false;
        const d = new Date(p.scheduled_date);
        return d.toDateString() === selectedCalDate.toDateString();
      })
    : plans;

  const handleCalDateSelect = (date) => {
    if (selectedCalDate && date.toDateString() === selectedCalDate.toDateString()) {
      setSelectedCalDate(null); // Deselect
    } else {
      setSelectedCalDate(date);
      // Pre-fill the date for new tasks
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      setScheduledDate(`${y}-${m}-${day}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        padding: '10px 12px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="section-icon" style={{ background: 'var(--accent-bg)', color: 'var(--color-specter-500)' }}>
            📅
          </div>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>Planning</span>
          {plans.length > 0 && (
            <span style={{
              fontSize: '0.6rem', padding: '1px 6px', borderRadius: '999px', fontWeight: 600,
              background: 'var(--accent-bg)', color: 'var(--color-specter-500)'
            }}>{plans.length}</span>
          )}
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-specter btn-xs" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <FiPlus size={11} /> Task
        </button>
      </div>

      {/* Calendar */}
      <div style={{ borderBottom: '1px solid var(--border-color)' }}>
        <Calendar
          plans={plans}
          selectedDate={selectedCalDate}
          onSelectDate={handleCalDateSelect}
        />
      </div>

      {/* Filter indicator */}
      {selectedCalDate && (
        <div style={{
          padding: '6px 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--accent-bg)',
          borderBottom: '1px solid var(--border-color)',
          fontSize: '0.68rem'
        }}>
          <span style={{ color: 'var(--color-specter-500)' }}>
            📌 {selectedCalDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {' '}· {filteredPlans.length} task{filteredPlans.length !== 1 ? 's' : ''}
          </span>
          <button onClick={() => setSelectedCalDate(null)} style={{
            fontSize: '0.68rem', fontWeight: 500, color: 'var(--text-muted)',
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)'
          }}>
            Show all
          </button>
        </div>
      )}

      {/* New Plan Form */}
      {showForm && (
        <div style={{
          padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px',
          background: 'var(--bg-tertiary)',
          borderBottom: '1px solid var(--border-color)',
          animation: 'slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title..." className="input-specter" id="plan-title-input"
            style={{ fontSize: '0.75rem', padding: '6px 10px' }} />
          <textarea value={outline} onChange={(e) => setOutline(e.target.value)}
            placeholder="Describe what Specter should do..."
            className="input-specter" id="plan-outline-input" rows={2}
            style={{ fontSize: '0.72rem', padding: '6px 10px', resize: 'vertical', minHeight: '44px' }} />

          {/* Output type & word target */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <select value={outputType} onChange={(e) => setOutputType(e.target.value)}
              className="input-specter" style={{ flex: 1, fontSize: '0.72rem', padding: '5px 8px' }}
              disabled={preFetchRefs}>
              <option value="draft">📝 Draft</option>
              <option value="outline">📋 Outline</option>
              <option value="bullet_points">📌 Bullet Points</option>
            </select>
            <input type="number" value={wordTarget} onChange={(e) => setWordTarget(parseInt(e.target.value) || 500)}
              className="input-specter" style={{ width: '70px', fontSize: '0.72rem', padding: '5px 8px' }} placeholder="Words" />
          </div>

          {/* Date & Time */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)}
              className="input-specter" style={{ flex: 1, fontSize: '0.72rem', padding: '5px 8px' }} />
            <input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)}
              className="input-specter" style={{ width: '100px', fontSize: '0.72rem', padding: '5px 8px' }} />
          </div>

          {/* Advanced toggle */}
          <button onClick={() => setShowAdvanced(!showAdvanced)} style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '0.68rem', color: 'var(--color-specter-500)',
            fontFamily: 'var(--font-sans)', fontWeight: 600,
            padding: '2px 0'
          }}>
            {showAdvanced ? <FiChevronDown size={10} /> : <FiChevronRight size={10} />}
            Advanced Options
          </button>

          {showAdvanced && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', animation: 'slideDown 0.2s ease' }}>
              {/* Instructions */}
              <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)}
                placeholder="Detailed instructions for AI (e.g., 'Focus on methodology, use APA 7th edition, include 5+ citations...')"
                className="input-specter" rows={3}
                style={{ fontSize: '0.72rem', padding: '6px 10px', resize: 'vertical', minHeight: '50px' }} />

              {/* AI Options */}
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px'
              }}>
                {/* Auto-start */}
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                  fontSize: '0.72rem', color: 'var(--text-secondary)'
                }}>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '4px',
                    border: `2px solid ${autoStart ? 'var(--color-specter-500)' : 'var(--border-color)'}`,
                    background: autoStart ? 'var(--color-specter-500)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s', flexShrink: 0
                  }} onClick={() => setAutoStart(!autoStart)}>
                    {autoStart && <span style={{ color: 'white', fontSize: '0.6rem', fontWeight: 700 }}>✓</span>}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FiZap size={10} style={{ color: 'var(--color-specter-500)' }} />
                      Auto-start AI
                    </div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                      AI starts working immediately at scheduled time
                    </div>
                  </div>
                </label>

                {/* Pre-fetch references */}
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                  fontSize: '0.72rem', color: 'var(--text-secondary)'
                }}>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '4px',
                    border: `2px solid ${preFetchRefs ? 'var(--color-ghost-500)' : 'var(--border-color)'}`,
                    background: preFetchRefs ? 'var(--color-ghost-500)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s', flexShrink: 0
                  }} onClick={() => setPreFetchRefs(!preFetchRefs)}>
                    {preFetchRefs && <span style={{ color: 'white', fontSize: '0.6rem', fontWeight: 700 }}>✓</span>}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FiSearch size={10} style={{ color: 'var(--color-ghost-500)' }} />
                      Pre-fetch references
                    </div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                      AI gathers references first so they're ready when you write
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleCreate} className="btn-specter btn-sm" style={{ flex: 1 }} disabled={!title.trim()}>
              {autoStart ? '⚡ Create & Auto-start' : 'Create Task'}
            </button>
            <button onClick={resetForm} className="btn-ghost-outline btn-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Plan List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {filteredPlans.length === 0 ? (
          <div className="empty-state" style={{ padding: '16px 0' }}>
            <div className="empty-state-icon">📅</div>
            <div className="empty-state-title">
              {selectedCalDate ? 'No tasks on this day' : 'No tasks yet'}
            </div>
            <div className="empty-state-text">
              {selectedCalDate
                ? 'Click "+ Task" to schedule one here.'
                : 'Create a task and Specter will prepare everything before your deadline.'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filteredPlans.map((plan) => {
              const status = getStatusConfig(plan.status);
              const overdue = isOverdue(plan);
              const isSelected = selectedPlanId === plan.id;

              return (
                <div key={plan.id}
                  className={`plan-card group ${isSelected ? 'active' : ''} ${plan.status === 'review' ? 'review' : ''}`}
                  onClick={() => onSelectPlan(plan.id)}
                  style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                    <span style={{ fontSize: '0.78rem', marginTop: '2px' }}>{status.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }} className="line-clamp-1">{plan.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                        <span className={`badge ${status.class}`} style={{ fontSize: '0.6rem' }}>{status.label}</span>
                        {plan.scheduled_date && (
                          <span style={{
                            fontSize: '0.62rem', display: 'flex', alignItems: 'center', gap: '2px',
                            color: overdue ? 'var(--color-danger-400)' : 'var(--text-muted)'
                          }}>
                            <FiClock size={9} /> {formatDate(plan.scheduled_date)}
                          </span>
                        )}
                        {plan.auto_start === 1 && (
                          <span style={{
                            fontSize: '0.58rem', padding: '1px 5px', borderRadius: '4px',
                            background: 'oklch(0.55 0.22 275 / 0.08)', color: 'var(--color-specter-500)',
                            display: 'flex', alignItems: 'center', gap: '2px'
                          }}>
                            <FiZap size={7} /> Auto
                          </span>
                        )}
                        {plan.pre_fetch_refs === 1 && (
                          <span style={{
                            fontSize: '0.58rem', padding: '1px 5px', borderRadius: '4px',
                            background: 'oklch(0.62 0.14 195 / 0.08)', color: 'var(--color-ghost-500)',
                            display: 'flex', alignItems: 'center', gap: '2px'
                          }}>
                            <FiSearch size={7} /> Refs
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {(plan.status === 'planned' || overdue) && (
                        <button onClick={(e) => { e.stopPropagation(); onTriggerAi(plan.id); }}
                          style={{
                            padding: '4px', borderRadius: '4px', background: 'none', border: 'none',
                            cursor: 'pointer', color: 'var(--color-specter-500)',
                            opacity: 0, transition: 'opacity 0.15s'
                          }}
                          className="group-hover-visible"
                          title="Let Specter work on this">
                          <FiPlay size={11} />
                        </button>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); onDeletePlan(plan.id); }}
                        style={{
                          padding: '4px', borderRadius: '4px', background: 'none', border: 'none',
                          cursor: 'pointer', color: 'var(--text-muted)',
                          opacity: 0, transition: 'opacity 0.15s'
                        }}
                        className="group-hover-visible"
                        title="Delete task">
                        <FiTrash2 size={11} />
                      </button>
                    </div>
                  </div>
                  {overdue && (
                    <div style={{
                      marginTop: '6px', fontSize: '0.65rem', padding: '4px 8px', borderRadius: '4px',
                      background: 'oklch(0.62 0.21 20 / 0.06)', color: 'var(--color-danger-400)'
                    }}>
                      ⏰ Overdue — Click ▶ to let Specter handle it
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Specter footer */}
      <div style={{
        padding: '10px 12px', borderTop: '1px solid var(--border-color)',
        background: 'var(--bg-tertiary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem' }} className="animate-haunt">👻</span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            {plans.filter(p => p.status === 'review').length > 0
              ? `${plans.filter(p => p.status === 'review').length} task(s) ready for review`
              : plans.length > 0 ? 'Specter is watching your deadlines...' : 'Waiting for tasks...'}
          </span>
        </div>
      </div>
    </div>
  );
}
