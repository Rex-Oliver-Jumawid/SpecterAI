import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Play, Trash2, Clock, Zap, BookOpen, Calendar } from 'lucide-react';

export default function CalendarPage({ plans, onCreatePlanForNotebook, onDeletePlan, onTriggerAi, allNotebooks = [] }) {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [outline, setOutline] = useState('');
  const [outputType, setOutputType] = useState('draft');
  const [wordTarget, setWordTarget] = useState(500);
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [selectedNotebookId, setSelectedNotebookId] = useState('');

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

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
    const y2 = d.month < 0 ? year - 1 : d.month > 11 ? year + 1 : year;
    return `${y2}-${m}-${d.day}`;
  };

  const isToday = (d) => {
    if (d.other) return false;
    const c = new Date(year, month, d.day); c.setHours(0, 0, 0, 0);
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
    const yy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(selectedDate.getDate()).padStart(2, '0');
    onCreatePlanForNotebook(selectedNotebookId, {
      title: title.trim(), outline: outline.trim(),
      output_type: outputType, word_target: wordTarget,
      scheduled_date: `${yy}-${mm}-${dd}T${scheduledTime}`,
      scheduled_time: scheduledTime, auto_start: true,
    });
    setTitle(''); setOutline(''); setShowForm(false);
  };

  const getStatusConfig = (s) => ({
    planned: { color: '#a78bfa', bg: 'rgba(124,58,237,0.15)', label: 'Planned' },
    preparing: { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)', label: 'Preparing' },
    ready: { color: '#4ade80', bg: 'rgba(34,197,94,0.15)', label: 'Ready' },
    review: { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)', label: 'Review' },
    done: { color: '#4ade80', bg: 'rgba(34,197,94,0.1)', label: 'Done' },
  }[s] || { color: '#a78bfa', bg: 'rgba(124,58,237,0.15)', label: 'Planned' });

  const totalPlanned = plans.filter(p => p.status === 'planned').length;
  const totalReview = plans.filter(p => p.status === 'review').length;
  const totalDone = plans.filter(p => p.status === 'done').length;

  const inp = {
    width: '100%', padding: '9px 12px', borderRadius: '8px',
    border: '1px solid var(--border-color)', background: 'var(--bg-primary)',
    color: 'var(--text-primary)', fontSize: '0.78rem', outline: 'none',
    fontFamily: 'var(--font-sans)',
  };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {/* ─── LEFT: Calendar ─── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', padding: '28px 32px' }}>
        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h1 style={{
              fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0,
              fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Calendar size={16} color="white" />
              </div>
              {monthNames[month]} {year}
            </h1>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', paddingLeft: '44px' }}>
              <span style={badge('#a78bfa', 'rgba(124,58,237,0.1)')}>{totalPlanned} planned</span>
              <span style={badge('#fbbf24', 'rgba(251,191,36,0.08)')}>{totalReview} review</span>
              <span style={badge('#4ade80', 'rgba(34,197,94,0.08)')}>{totalDone} done</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button onClick={() => setViewDate(new Date(year, month - 1, 1))} style={navBtn}><ChevronLeft size={16} /></button>
            <button onClick={() => setViewDate(new Date())} style={{ ...navBtn, padding: '6px 14px', fontSize: '0.72rem', fontWeight: 600 }}>Today</button>
            <button onClick={() => setViewDate(new Date(year, month + 1, 1))} style={navBtn}><ChevronRight size={16} /></button>
          </div>
        </div>

        {/* Day-of-week headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
          {dayNames.map(d => (
            <div key={d} style={{
              padding: '6px 0', textAlign: 'center', fontSize: '0.62rem',
              fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em',
            }}>{d}</div>
          ))}
        </div>

        {/* Day Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', flex: 1 }}>
          {calendarDays.map((d, i) => {
            const tasks = plansByDate[getKey(d)] || [];
            const sel = isSelected(d);
            const td = isToday(d);
            const hovered = hoveredDay === `${d.month}-${d.day}`;
            const hasReview = tasks.some(t => t.status === 'review');
            const hasTasks = tasks.length > 0;

            return (
              <motion.div
                key={i}
                onClick={() => handleSelect(d)}
                onMouseEnter={() => !d.other && setHoveredDay(`${d.month}-${d.day}`)}
                onMouseLeave={() => setHoveredDay(null)}
                whileHover={!d.other ? { scale: 1.06 } : {}}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                style={{
                  position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  minHeight: '56px', borderRadius: '12px', cursor: d.other ? 'default' : 'pointer',
                  background: sel ? 'linear-gradient(135deg, #7c3aed, #6366f1)'
                    : td ? 'rgba(124,58,237,0.18)'
                    : d.other ? 'transparent' : 'var(--bg-card)',
                  opacity: d.other ? 0.2 : 1,
                  border: sel ? 'none' : td ? '1px solid rgba(124,58,237,0.3)' : '1px solid var(--border-color)',
                  boxShadow: sel ? '0 4px 16px rgba(124,58,237,0.35)' : 'none',
                }}
              >
                {!d.other && (
                  <span style={{
                    fontSize: '0.82rem', fontWeight: td || sel ? 700 : 400,
                    color: sel ? 'white' : td ? '#a78bfa' : 'var(--text-secondary)',
                  }}>
                    {d.day}
                  </span>
                )}

                {hasTasks && (
                  <div style={{
                    position: 'absolute', bottom: '3px', right: '3px',
                    width: '16px', height: '16px', borderRadius: '999px',
                    background: hasReview ? '#fbbf24' : '#7c3aed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.5rem', fontWeight: 700,
                    color: hasReview ? '#000' : 'white',
                  }}>
                    {tasks.length}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ─── RIGHT: Sidebar ─── */}
      <div style={{
        width: '340px', flexShrink: 0, borderLeft: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {selectedDate ? (
          <>
            {/* Day Header */}
            <div style={{
              padding: '20px', borderBottom: '1px solid var(--border-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              <button onClick={() => setShowForm(!showForm)} style={{
                display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 12px',
                borderRadius: '8px', background: '#7c3aed', color: 'white', border: 'none',
                cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
              }}>
                <Plus size={13} /> Add
              </button>
            </div>

            {/* Create Form */}
            {showForm && (
              <div style={{ padding: '14px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <select value={selectedNotebookId} onChange={e => setSelectedNotebookId(e.target.value)} style={inp}>
                    <option value="">— Select notebook —</option>
                    {allNotebooks.map(nb => <option key={nb.id} value={nb.id}>{nb.title || 'Untitled'}</option>)}
                  </select>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title..." style={inp} />
                  <textarea value={outline} onChange={e => setOutline(e.target.value)} placeholder="What should Specter write?"
                    rows={2} style={{ ...inp, resize: 'vertical' }} />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <select value={outputType} onChange={e => setOutputType(e.target.value)} style={{ ...inp, flex: 1 }}>
                      <option value="draft">📝 Draft</option>
                      <option value="outline">📋 Outline</option>
                      <option value="bullet_points">📌 Bullets</option>
                    </select>
                    <input type="number" value={wordTarget} onChange={e => setWordTarget(parseInt(e.target.value) || 500)}
                      style={{ ...inp, width: '70px' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} style={inp} />
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 10px',
                    borderRadius: '8px', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.1)',
                  }}>
                    <Zap size={11} style={{ color: '#a78bfa' }} />
                    <span style={{ fontSize: '0.65rem', color: '#a78bfa', fontWeight: 500 }}>AI auto-starts 5 min after deadline</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={handleCreate} disabled={!title.trim() || !selectedNotebookId}
                      style={{
                        flex: 1, padding: '9px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                        background: (!title.trim() || !selectedNotebookId) ? 'var(--bg-hover)' : '#7c3aed',
                        color: (!title.trim() || !selectedNotebookId) ? 'var(--text-muted)' : 'white',
                        fontWeight: 600, fontSize: '0.75rem', fontFamily: 'var(--font-sans)',
                      }}>
                      ⚡ Schedule Task
                    </button>
                    <button onClick={() => setShowForm(false)} style={{
                      padding: '9px 14px', borderRadius: '8px', border: '1px solid var(--border-color)',
                      background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
                      fontSize: '0.75rem', fontFamily: 'var(--font-sans)',
                    }}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {/* Task List */}
            <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
              {selectedDayTasks.length === 0 ? (
                <div style={{ textAlign: 'center', paddingTop: '40px' }}>
                  <Calendar size={28} style={{ color: 'var(--text-muted)', opacity: 0.3, margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>No tasks on this day</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.6, marginTop: '4px' }}>Click "+ Add" to schedule one.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedDayTasks.map((task, idx) => {
                    const st = getStatusConfig(task.status);
                    const overdue = task.scheduled_date && new Date(task.scheduled_date) < new Date() && task.status === 'planned';
                    const taskNotebook = allNotebooks.find(nb => nb.id === task.notebook_id);
                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15, delay: idx * 0.03 }}
                        style={{
                          padding: '12px', borderRadius: '10px',
                          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{task.title}</div>
                            {taskNotebook && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.62rem', color: '#7c3aed', marginTop: '2px' }}>
                                <BookOpen size={9} /> {taskNotebook.title}
                              </div>
                            )}
                            {task.outline && (
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>{task.outline}</div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.58rem', padding: '2px 7px', borderRadius: '999px', background: st.bg, color: st.color, fontWeight: 600 }}>{st.label}</span>
                              <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>{task.word_target}w</span>
                              <span style={{ fontSize: '0.52rem', padding: '1px 5px', borderRadius: '4px', background: 'rgba(124,58,237,0.08)', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <Zap size={7} /> Auto
                              </span>
                              {overdue && <span style={{ fontSize: '0.52rem', padding: '1px 5px', borderRadius: '4px', background: 'rgba(248,113,113,0.08)', color: '#f87171' }}>Overdue</span>}
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            {(task.status === 'planned' || overdue) && (
                              <button onClick={() => onTriggerAi(task.id)} title="Run AI"
                                style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(124,58,237,0.1)', border: 'none', cursor: 'pointer', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.6rem', fontWeight: 600 }}>
                                <Play size={9} /> Run
                              </button>
                            )}
                            <button onClick={() => onDeletePlan(task.id)} title="Delete"
                              style={{ padding: '3px', borderRadius: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '32px' }}>
            <Calendar size={36} style={{ color: 'var(--text-muted)', opacity: 0.2, marginBottom: '12px' }} />
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>Select a day</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', opacity: 0.5, marginTop: '4px', textAlign: 'center' }}>Click on a date to view or create tasks.</div>
          </div>
        )}
      </div>
    </div>
  );
}

const navBtn = {
  background: 'none', border: '1px solid var(--border-color)', borderRadius: '8px',
  padding: '6px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex',
  alignItems: 'center', justifyContent: 'center',
};

const badge = (color, bg) => ({
  fontSize: '0.62rem', color, background: bg,
  padding: '2px 8px', borderRadius: '999px', fontWeight: 600,
});
