import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Play, Trash2, Clock, Zap, BookOpen, Calendar, Columns3, LayoutGrid } from 'lucide-react';

export default function CalendarPage({ plans, onCreatePlanForNotebook, onDeletePlan, onTriggerAi, allNotebooks = [] }) {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [moreView, setMoreView] = useState(false);
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
  const monthShort = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
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
    const y = d.month < 0 ? year - 1 : d.month > 11 ? year + 1 : year;
    return `${y}-${m}-${d.day}`;
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
      if (!moreView) setMoreView(true);
    }
  };

  const selectedDayTasks = selectedDate
    ? (plansByDate[`${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`] || [])
    : [];

  const allTasksForMonth = useMemo(() => {
    return plans.filter(p => {
      if (!p.scheduled_date) return false;
      const d = new Date(p.scheduled_date);
      return d.getMonth() === month && d.getFullYear() === year;
    }).sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));
  }, [plans, month, year]);

  const handleCreate = () => {
    if (!title.trim() || !selectedDate || !selectedNotebookId) return;
    const y2 = selectedDate.getFullYear();
    const m2 = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d2 = String(selectedDate.getDate()).padStart(2, '0');
    onCreatePlanForNotebook(selectedNotebookId, {
      title: title.trim(), outline: outline.trim(),
      output_type: outputType, word_target: wordTarget,
      scheduled_date: `${y2}-${m2}-${d2}T${scheduledTime}`,
      scheduled_time: scheduledTime, auto_start: true,
    });
    setTitle(''); setOutline('');
    setShowForm(false);
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

  /* shared input style */
  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '10px',
    border: '1px solid #27272a', background: '#18181b', color: '#e4e4e7',
    fontSize: '0.78rem', outline: 'none', fontFamily: 'var(--font-sans)',
  };

  return (
    <div style={{ display: 'flex', height: '100%', background: 'var(--bg-primary)', overflow: 'hidden' }}>
      {/* Main scrollable area */}
      <div style={{
        flex: 1, display: 'flex', overflowY: 'auto', padding: '32px 32px',
        gap: '40px', alignItems: 'flex-start', justifyContent: 'center',
        flexWrap: 'wrap',
      }}>

        {/* ─── LEFT: Calendar ─── */}
        <motion.div layout style={{ width: '100%', maxWidth: '480px', flexShrink: 0 }}>
          {/* Month Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '0.06em', color: '#d4d4d8', margin: 0, fontFamily: 'var(--font-sans)' }}>
              {monthShort[month]} <span style={{ opacity: 0.35 }}>{year}</span>
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button onClick={() => setViewDate(new Date(year, month - 1, 1))} style={navBtnStyle}><ChevronLeft size={15} /></button>
              <button onClick={() => setViewDate(new Date())} style={{ ...navBtnStyle, padding: '5px 14px', fontSize: '0.7rem', fontWeight: 600 }}>Today</button>
              <button onClick={() => setViewDate(new Date(year, month + 1, 1))} style={navBtnStyle}><ChevronRight size={15} /></button>

              {/* View Toggle */}
              <div
                onClick={() => setMoreView(!moreView)}
                style={{
                  position: 'relative', display: 'flex', alignItems: 'center', gap: '10px',
                  borderRadius: '8px', border: '1px solid #27272a', padding: '4px 6px',
                  cursor: 'pointer', marginLeft: '6px', background: '#18181b',
                }}
              >
                <Columns3 size={16} style={{ zIndex: 2, color: !moreView ? '#0a0a0a' : '#52525b' }} />
                <LayoutGrid size={16} style={{ zIndex: 2, color: moreView ? '#0a0a0a' : '#52525b' }} />
                <div style={{
                  position: 'absolute', left: '3px', top: '50%', height: '75%', width: '24px',
                  borderRadius: '5px', background: '#a78bfa',
                  transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
                  transform: moreView ? 'translateY(-50%) translateX(30px)' : 'translateY(-50%) translateX(0px)',
                }} />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <span style={statBadge('#a78bfa', 'rgba(124,58,237,0.1)')}>{totalPlanned} planned</span>
            <span style={statBadge('#fbbf24', 'rgba(251,191,36,0.08)')}>{totalReview} review</span>
            <span style={statBadge('#4ade80', 'rgba(34,197,94,0.08)')}>{totalDone} done</span>
          </div>

          {/* Day-of-week headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', marginBottom: '5px' }}>
            {dayNames.map(d => (
              <div key={d} style={{
                padding: '5px 0', textAlign: 'center', fontSize: '0.6rem',
                fontWeight: 700, color: '#a1a1aa', background: '#1e1e1e',
                borderRadius: '8px', letterSpacing: '0.04em',
              }}>{d}</div>
            ))}
          </div>

          {/* Day Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
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
                  whileHover={!d.other ? { scale: 1.08 } : {}}
                  style={{
                    position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    height: '3.6rem', borderRadius: '14px', cursor: d.other ? 'default' : 'pointer',
                    background: sel ? 'linear-gradient(135deg, #7c3aed, #6366f1)'
                      : td ? 'rgba(124,58,237,0.25)'
                      : d.other ? 'transparent' : '#18181b',
                    opacity: d.other ? 0.25 : 1,
                    transition: 'background 0.2s, box-shadow 0.2s',
                    boxShadow: sel ? '0 4px 20px rgba(124,58,237,0.35)' : 'none',
                  }}
                >
                  {!d.other && (
                    <span style={{
                      fontSize: '0.82rem', fontWeight: td || sel ? 700 : 400,
                      color: sel ? 'white' : td ? '#c4b5fd' : '#a1a1aa',
                    }}>
                      {String(d.day).padStart(2, '0')}
                    </span>
                  )}

                  {hasTasks && (
                    <div style={{
                      position: 'absolute', bottom: '3px', right: '3px',
                      width: '18px', height: '18px', borderRadius: '999px',
                      background: hasReview ? '#fbbf24' : '#7c3aed',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.55rem', fontWeight: 700,
                      color: hasReview ? '#0a0a0a' : 'white',
                    }}>
                      {tasks.length}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ─── RIGHT: Task Details ─── */}
        <AnimatePresence>
          {moreView && (
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{ width: '100%', maxWidth: '420px', flexShrink: 0 }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '0.04em', color: '#d4d4d8', margin: 0, fontFamily: 'var(--font-sans)' }}>
                    {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long' }) : 'Tasks'}
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: '#52525b', margin: '4px 0 0', fontWeight: 500 }}>
                    {selectedDate
                      ? selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                      : `${allTasksForMonth.length} tasks this month`}
                  </p>
                </div>
                {selectedDate && (
                  <button onClick={() => setShowForm(!showForm)} style={{
                    display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px',
                    borderRadius: '10px', background: '#7c3aed', color: 'white', border: 'none',
                    cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
                  }}>
                    <Plus size={14} /> Add Task
                  </button>
                )}
              </div>

              {/* ─ Create Form ─ */}
              <AnimatePresence>
                {showForm && selectedDate && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    style={{ background: '#111111', borderRadius: '14px', border: '1px solid #27272a', padding: '16px', marginBottom: '16px', overflow: 'hidden' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <select value={selectedNotebookId} onChange={e => setSelectedNotebookId(e.target.value)} style={inputStyle}>
                        <option value="">— Select notebook —</option>
                        {allNotebooks.map(nb => <option key={nb.id} value={nb.id}>{nb.title || 'Untitled'}</option>)}
                      </select>
                      <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title..." style={inputStyle} />
                      <textarea value={outline} onChange={e => setOutline(e.target.value)} placeholder="What should Specter write?"
                        rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select value={outputType} onChange={e => setOutputType(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
                          <option value="draft">📝 Draft</option>
                          <option value="outline">📋 Outline</option>
                          <option value="bullet_points">📌 Bullets</option>
                        </select>
                        <input type="number" value={wordTarget} onChange={e => setWordTarget(parseInt(e.target.value) || 500)}
                          style={{ ...inputStyle, width: '80px' }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={14} style={{ color: '#52525b', flexShrink: 0 }} />
                        <input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} style={{ ...inputStyle }} />
                      </div>

                      {/* Auto-start info */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
                        borderRadius: '10px', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.12)',
                      }}>
                        <Zap size={13} style={{ color: '#a78bfa', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.68rem', color: '#a78bfa', fontWeight: 500 }}>AI auto-starts 5 min after deadline</span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                        <button onClick={handleCreate} disabled={!title.trim() || !selectedNotebookId}
                          style={{
                            flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                            background: (!title.trim() || !selectedNotebookId) ? '#27272a' : '#7c3aed',
                            color: (!title.trim() || !selectedNotebookId) ? '#52525b' : 'white',
                            fontWeight: 600, fontSize: '0.78rem', fontFamily: 'var(--font-sans)',
                          }}>
                          ⚡ Schedule Task
                        </button>
                        <button onClick={() => setShowForm(false)}
                          style={{
                            padding: '10px 16px', borderRadius: '10px', border: '1px solid #27272a',
                            background: 'transparent', color: '#71717a', cursor: 'pointer',
                            fontSize: '0.78rem', fontFamily: 'var(--font-sans)',
                          }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─ Task List ─ */}
              <div style={{
                display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 260px)',
                overflowY: 'auto', borderRadius: '14px', border: '1px solid #27272a',
                background: '#111111',
              }}>
                {(selectedDate ? selectedDayTasks : allTasksForMonth).length === 0 ? (
                  <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <Calendar size={32} style={{ color: '#27272a', margin: '0 auto 12px' }} />
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#52525b' }}>
                      {selectedDate ? 'No tasks on this day' : 'No tasks this month'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#3f3f46', marginTop: '4px' }}>
                      {selectedDate ? 'Click "+ Add Task" to schedule one.' : 'Select a day to create tasks.'}
                    </div>
                  </div>
                ) : (
                  (selectedDate ? selectedDayTasks : allTasksForMonth).map((task, idx) => {
                    const st = getStatusConfig(task.status);
                    const overdue = task.scheduled_date && new Date(task.scheduled_date) < new Date() && task.status === 'planned';
                    const taskNotebook = allNotebooks.find(nb => nb.id === task.notebook_id);
                    const taskDate = new Date(task.scheduled_date);

                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.03 }}
                        style={{
                          padding: '14px 16px',
                          borderBottom: '1px solid #1e1e1e',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.68rem', color: '#52525b' }}>
                            {taskDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: '#52525b' }}>
                            {task.scheduled_time || taskDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#e4e4e7', margin: '0 0 3px' }}>{task.title}</h3>
                        {taskNotebook && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', color: '#7c3aed', marginBottom: '4px' }}>
                            <BookOpen size={10} /> {taskNotebook.title}
                          </div>
                        )}
                        {task.outline && (
                          <p style={{ fontSize: '0.7rem', color: '#3f3f46', margin: '0 0 8px', lineHeight: 1.5 }}>{task.outline}</p>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.6rem', padding: '2px 8px', borderRadius: '999px', background: st.bg, color: st.color, fontWeight: 600 }}>{st.label}</span>
                          <span style={{ fontSize: '0.58rem', color: '#3f3f46' }}>{task.word_target} words</span>
                          <span style={{ fontSize: '0.55rem', padding: '2px 6px', borderRadius: '6px', background: 'rgba(124,58,237,0.08)', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <Zap size={7} /> Auto
                          </span>
                          {overdue && <span style={{ fontSize: '0.55rem', padding: '2px 6px', borderRadius: '6px', background: 'rgba(248,113,113,0.08)', color: '#f87171' }}>Overdue</span>}
                          <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
                            {(task.status === 'planned' || overdue) && (
                              <button onClick={() => onTriggerAi(task.id)} title="Run AI"
                                style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(124,58,237,0.12)', border: 'none', cursor: 'pointer', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.62rem', fontWeight: 600 }}>
                                <Play size={9} /> Run
                              </button>
                            )}
                            <button onClick={() => onDeletePlan(task.id)} title="Delete"
                              style={{ padding: '3px', borderRadius: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#3f3f46' }}>
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Shared Style Helpers ── */
const navBtnStyle = {
  background: 'none', border: '1px solid #27272a', borderRadius: '8px',
  padding: '5px', cursor: 'pointer', color: '#a1a1aa', display: 'flex',
  alignItems: 'center', justifyContent: 'center',
};

const statBadge = (color, bg) => ({
  fontSize: '0.65rem', color, background: bg,
  padding: '3px 10px', borderRadius: '999px', fontWeight: 600,
});
