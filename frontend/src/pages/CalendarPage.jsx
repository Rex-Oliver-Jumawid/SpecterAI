import React, { useState, useMemo } from 'react';
import { FiChevronLeft, FiChevronRight, FiPlus, FiPlay, FiTrash2, FiClock, FiZap, FiSearch, FiChevronDown, FiChevronRight as FiRight, FiBookOpen, FiCalendar } from 'react-icons/fi';

export default function CalendarPage({ plans, onCreatePlanForNotebook, onDeletePlan, onTriggerAi, allNotebooks = [] }) {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [outline, setOutline] = useState('');
  const [outputType, setOutputType] = useState('draft');
  const [wordTarget, setWordTarget] = useState(500);
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [autoStart, setAutoStart] = useState(false);
  const [preFetchRefs, setPreFetchRefs] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedNotebookId, setSelectedNotebookId] = useState('');

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const days = [];
    const prevLast = new Date(year, month, 0).getDate();
    for (let i = startPad - 1; i >= 0; i--) days.push({ day: prevLast - i, month: month - 1, other: true });
    for (let d = 1; d <= totalDays; d++) days.push({ day: d, month, other: false });
    const rem = 42 - days.length;
    for (let d = 1; d <= rem; d++) days.push({ day: d, month: month + 1, other: true });
    return days;
  }, [year, month]);

  const plansByDate = useMemo(() => {
    const map = {};
    plans.forEach(p => {
      if (p.scheduled_date) {
        const d = new Date(p.scheduled_date);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        if (!map[key]) map[key] = [];
        map[key].push(p);
      }
    });
    return map;
  }, [plans]);

  const getKey = (d) => {
    const m = ((d.month % 12) + 12) % 12;
    const y = d.month < 0 ? year - 1 : d.month > 11 ? year + 1 : year;
    return `${y}-${m}-${d.day}`;
  };

  const isToday = (d) => {
    if (d.other) return false;
    const c = new Date(year, month, d.day); c.setHours(0,0,0,0);
    return c.getTime() === today.getTime();
  };

  const isSelected = (d) => {
    if (!selectedDate || d.other) return false;
    return selectedDate.getDate() === d.day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
  };

  const handleSelect = (d) => {
    if (d.other) return;
    const date = new Date(year, month, d.day);
    if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
    }
  };

  const selectedDayTasks = selectedDate
    ? (plansByDate[`${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`] || [])
    : [];

  const handleCreate = () => {
    if (!title.trim() || !selectedDate || !selectedNotebookId) return;
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    onCreatePlanForNotebook(selectedNotebookId, {
      title: title.trim(),
      outline: outline.trim(),
      output_type: preFetchRefs ? 'references_only' : outputType,
      word_target: wordTarget,
      scheduled_date: `${y}-${m}-${d}T${scheduledTime}`,
      scheduled_time: scheduledTime,
      auto_start: autoStart,
      pre_fetch_refs: preFetchRefs,
      instructions: instructions.trim()
    });
    setTitle(''); setOutline(''); setInstructions('');
    setAutoStart(false); setPreFetchRefs(false);
    setShowForm(false); setShowAdvanced(false);
  };

  const getStatusConfig = (s) => ({
    planned: { cls: 'status-planned', icon: '📋', label: 'Planned' },
    preparing: { cls: 'status-preparing', icon: '🔄', label: 'Preparing' },
    ready: { cls: 'status-ready', icon: '✅', label: 'Ready' },
    review: { cls: 'status-review', icon: '✦', label: 'Review' },
    done: { cls: 'status-done', icon: '✓', label: 'Done' },
  }[s] || { cls: 'status-planned', icon: '📋', label: 'Planned' });

  const totalPlanned = plans.filter(p => p.status === 'planned').length;
  const totalReview = plans.filter(p => p.status === 'review').length;
  const totalDone = plans.filter(p => p.status === 'done').length;

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Calendar Grid */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <h1 style={{
              fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0,
              fontFamily: 'var(--font-serif)', display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <FiCalendar size={18} color="white" />
              </div>
              Calendar
            </h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0', paddingLeft: '46px' }}>
              {totalPlanned} planned · {totalReview} for review · {totalDone} done
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="btn-ghost-outline btn-sm"><FiChevronLeft /></button>
            <button onClick={() => setViewDate(new Date())} className="btn-ghost-outline btn-sm" style={{ minWidth: '140px' }}>
              {monthNames[month]} {year}
            </button>
            <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="btn-ghost-outline btn-sm"><FiChevronRight /></button>
          </div>
        </div>

        {/* Day headers */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)'
        }}>
          {dayNames.map(d => (
            <div key={d} style={{
              padding: '10px 4px', textAlign: 'center',
              fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.02em',
              color: 'var(--text-muted)', textTransform: 'uppercase'
            }}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{
          flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
          gridTemplateRows: 'repeat(6, minmax(70px, 1fr))', overflow: 'auto'
        }}>
          {calendarDays.map((d, i) => {
            const tasks = plansByDate[getKey(d)] || [];
            const sel = isSelected(d);
            const td = isToday(d);

            return (
              <div key={i} onClick={() => handleSelect(d)} style={{
                padding: '6px 8px',
                borderRight: '1px solid var(--border-color)',
                borderBottom: '1px solid var(--border-color)',
                cursor: d.other ? 'default' : 'pointer',
                background: sel ? 'var(--accent-bg)' : td ? 'rgba(124,58,237,0.03)' : 'transparent',
                opacity: d.other ? 0.3 : 1,
                transition: 'background 0.15s ease',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseEnter={(e) => { if (!d.other && !sel) e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { if (!d.other && !sel) e.currentTarget.style.background = td ? 'rgba(124,58,237,0.03)' : 'transparent'; }}
              >
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: td ? 800 : 500,
                  color: td ? '#7c3aed' : sel ? '#7c3aed' : 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  {td && <span style={{
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: '#7c3aed', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.72rem', fontWeight: 700
                  }}>{d.day}</span>}
                  {!td && d.day}
                </div>
                <div style={{ marginTop: '3px', display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, overflow: 'hidden' }}>
                  {tasks.slice(0, 3).map((t, j) => {
                    const st = getStatusConfig(t.status);
                    return (
                      <div key={j} style={{
                        fontSize: '0.6rem', padding: '1px 4px', borderRadius: '3px',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        background: t.status === 'review' ? 'rgba(251,191,36,0.12)' :
                                    t.status === 'done' ? 'rgba(34,197,94,0.1)' :
                                    'rgba(124,58,237,0.08)',
                        color: t.status === 'review' ? '#fbbf24' :
                               t.status === 'done' ? '#4ade80' :
                               '#7c3aed',
                        fontWeight: 600
                      }}>
                        {st.icon} {t.title}
                      </div>
                    );
                  })}
                  {tasks.length > 3 && (
                    <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>+{tasks.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Selected Day Details */}
      <div style={{
        width: '360px', borderLeft: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column',
        overflow: 'hidden', flexShrink: 0
      }}>
        {selectedDate ? (
          <>
            <div style={{
              padding: '20px', borderBottom: '1px solid var(--border-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              <button onClick={() => { setShowForm(!showForm); }} className="btn-specter btn-xs" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FiPlus size={12} /> Add Task
              </button>
            </div>

            {showForm && (
              <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }} className="animate-slide-down">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* NOTEBOOK SELECTOR — tasks are always within a notebook */}
                  <div>
                    <label style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FiBookOpen size={11} /> Notebook
                    </label>
                    <select
                      value={selectedNotebookId}
                      onChange={e => setSelectedNotebookId(e.target.value)}
                      className="input-specter"
                      style={{ width: '100%', fontSize: '0.78rem', padding: '8px 10px' }}
                    >
                      <option value="">— Select a notebook —</option>
                      {allNotebooks.map(nb => (
                        <option key={nb.id} value={nb.id}>{nb.title || 'Untitled'}</option>
                      ))}
                    </select>
                  </div>

                  <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="Task title..." className="input-specter" style={{ fontSize: '0.78rem' }} />
                  <textarea value={outline} onChange={e => setOutline(e.target.value)}
                    placeholder="What should Specter do?" className="input-specter"
                    rows={2} style={{ fontSize: '0.75rem', resize: 'vertical' }} />

                  {/* Type & Words */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select value={outputType} onChange={e => setOutputType(e.target.value)}
                      className="input-specter" style={{ flex: 1, fontSize: '0.75rem' }}
                      disabled={preFetchRefs}>
                      <option value="draft">📝 Draft</option>
                      <option value="outline">📋 Outline</option>
                      <option value="bullet_points">📌 Bullets</option>
                    </select>
                    <input type="number" value={wordTarget} onChange={e => setWordTarget(parseInt(e.target.value) || 500)}
                      className="input-specter" style={{ width: '72px', fontSize: '0.75rem' }} />
                  </div>

                  {/* Time picker */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiClock size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)}
                      className="input-specter" style={{ flex: 1, fontSize: '0.75rem' }} />
                  </div>

                  {/* Advanced */}
                  <button onClick={() => setShowAdvanced(!showAdvanced)} style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '0.68rem', color: '#7c3aed',
                    fontFamily: 'var(--font-sans)', fontWeight: 600, padding: '2px 0'
                  }}>
                    {showAdvanced ? <FiChevronDown size={10} /> : <FiRight size={10} />}
                    Advanced Options
                  </button>

                  {showAdvanced && (
                    <>
                      <textarea value={instructions} onChange={e => setInstructions(e.target.value)}
                        placeholder="Detailed AI instructions..."
                        className="input-specter" rows={3}
                        style={{ fontSize: '0.72rem', resize: 'vertical', minHeight: '50px' }} />

                      <div style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                        borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px'
                      }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          <input type="checkbox" checked={autoStart} onChange={e => setAutoStart(e.target.checked)}
                            style={{ accentColor: '#7c3aed' }} />
                          <div>
                            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <FiZap size={10} style={{ color: '#7c3aed' }} /> Auto-start at deadline
                            </div>
                            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>AI starts if you're unavailable</div>
                          </div>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          <input type="checkbox" checked={preFetchRefs} onChange={e => setPreFetchRefs(e.target.checked)}
                            style={{ accentColor: '#7c3aed' }} />
                          <div>
                            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <FiSearch size={10} style={{ color: '#7c3aed' }} /> Pre-fetch references
                            </div>
                            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Gather references before you start</div>
                          </div>
                        </label>
                      </div>
                    </>
                  )}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleCreate} className="btn-specter btn-sm" style={{ flex: 1 }}
                      disabled={!title.trim() || !selectedNotebookId}>
                      {!selectedNotebookId ? 'Select Notebook' : autoStart ? '⚡ Create & Auto-start' : 'Create Task'}
                    </button>
                    <button onClick={() => { setShowForm(false); setShowAdvanced(false); }} className="btn-ghost-outline btn-sm">Cancel</button>
                  </div>
                </div>
              </div>
            )}

            <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
              {selectedDayTasks.length === 0 ? (
                <div className="empty-state" style={{ paddingTop: '40px' }}>
                  <FiCalendar size={28} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                  <div className="empty-state-title">No tasks on this day</div>
                  <div className="empty-state-text">Click "+ Add Task" to schedule a task for a specific notebook.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedDayTasks.map(task => {
                    const st = getStatusConfig(task.status);
                    const overdue = task.scheduled_date && new Date(task.scheduled_date) < new Date() && task.status === 'planned';
                    const taskNotebook = allNotebooks.find(nb => nb.id === task.notebook_id);
                    return (
                      <div key={task.id} className="plan-card group" style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                          <span style={{ fontSize: '0.9rem' }}>{st.icon}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{task.title}</div>
                            {taskNotebook && (
                              <div style={{
                                fontSize: '0.62rem', color: '#7c3aed', marginTop: '2px',
                                display: 'flex', alignItems: 'center', gap: '3px'
                              }}>
                                <FiBookOpen size={9} /> {taskNotebook.title}
                              </div>
                            )}
                            {task.outline && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }} className="line-clamp-2">{task.outline}</div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                              <span className={`badge ${st.cls}`}>{st.label}</span>
                              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{task.word_target} words</span>
                              {task.auto_start === 1 && (
                                <span style={{
                                  fontSize: '0.58rem', padding: '1px 5px', borderRadius: '4px',
                                  background: 'rgba(124,58,237,0.08)', color: '#7c3aed',
                                  display: 'flex', alignItems: 'center', gap: '2px'
                                }}>
                                  <FiZap size={7} /> Auto
                                </span>
                              )}
                              {overdue && (
                                <span style={{
                                  fontSize: '0.58rem', padding: '1px 5px', borderRadius: '4px',
                                  background: 'rgba(248,113,113,0.1)', color: '#f87171'
                                }}>
                                  Overdue
                                </span>
                              )}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {(task.status === 'planned' || overdue) && (
                              <button onClick={() => onTriggerAi(task.id)} title="Let Specter work"
                                style={{ color: '#7c3aed', padding: '4px', borderRadius: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
                                <FiPlay size={14} />
                              </button>
                            )}
                            <button onClick={() => onDeletePlan(task.id)} title="Delete"
                              style={{ color: 'var(--text-muted)', padding: '4px', borderRadius: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="empty-state" style={{ height: '100%', justifyContent: 'center' }}>
            <FiCalendar size={36} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: '8px' }} />
            <div className="empty-state-title">Select a day</div>
            <div className="empty-state-text">Click on a date to view or create tasks for specific notebooks.</div>
          </div>
        )}
      </div>
    </div>
  );
}
