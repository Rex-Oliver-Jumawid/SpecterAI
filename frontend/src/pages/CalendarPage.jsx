import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Play, Trash2, Clock, Zap, Search, BookOpen, Calendar, Columns3, LayoutGrid, X } from 'lucide-react';

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
  const [autoStart, setAutoStart] = useState(false);
  const [preFetchRefs, setPreFetchRefs] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedNotebookId, setSelectedNotebookId] = useState('');

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
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
      setMoreView(true);
    }
  };

  const selectedDayTasks = selectedDate
    ? (plansByDate[`${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`] || [])
    : [];

  // Collect all tasks for the "bookings" view
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
      output_type: preFetchRefs ? 'references_only' : outputType,
      word_target: wordTarget,
      scheduled_date: `${y2}-${m2}-${d2}T${scheduledTime}`,
      scheduled_time: scheduledTime, auto_start: autoStart,
      pre_fetch_refs: preFetchRefs, instructions: instructions.trim()
    });
    setTitle(''); setOutline(''); setInstructions('');
    setAutoStart(false); setPreFetchRefs(false);
    setShowForm(false); setShowAdvanced(false);
  };

  const getStatusConfig = (s) => ({
    planned: { color: '#a78bfa', bg: 'rgba(124,58,237,0.15)', label: 'Planned', icon: '📋' },
    preparing: { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)', label: 'Preparing', icon: '🔄' },
    ready: { color: '#4ade80', bg: 'rgba(34,197,94,0.15)', label: 'Ready', icon: '✅' },
    review: { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)', label: 'Review', icon: '✦' },
    done: { color: '#4ade80', bg: 'rgba(34,197,94,0.1)', label: 'Done', icon: '✓' },
  }[s] || { color: '#a78bfa', bg: 'rgba(124,58,237,0.15)', label: 'Planned', icon: '📋' });

  const totalPlanned = plans.filter(p => p.status === 'planned').length;
  const totalReview = plans.filter(p => p.status === 'review').length;
  const totalDone = plans.filter(p => p.status === 'done').length;

  return (
    <div style={{ display: 'flex', height: '100%', background: '#0a0a0a', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        <motion.div
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '40px 24px', overflowY: 'auto', gap: '32px' }}
          className="lg-flex-row"
        >
          {/* Calendar Section */}
          <motion.div layout style={{ width: '100%', maxWidth: '520px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <motion.h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '0.05em', color: '#d4d4d8', margin: 0, fontFamily: 'var(--font-sans)' }}>
                {monthShort[month]} <span style={{ opacity: 0.4 }}>{year}</span>
              </motion.h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={() => setViewDate(new Date(year, month - 1, 1))} style={{ background: 'none', border: '1px solid #323232', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#d4d4d8', display: 'flex' }}>
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setViewDate(new Date())} style={{ background: 'none', border: '1px solid #323232', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', color: '#d4d4d8', fontSize: '0.72rem', fontWeight: 600 }}>
                  Today
                </button>
                <button onClick={() => setViewDate(new Date(year, month + 1, 1))} style={{ background: 'none', border: '1px solid #323232', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#d4d4d8', display: 'flex' }}>
                  <ChevronRight size={16} />
                </button>

                {/* View Toggle */}
                <motion.button
                  onClick={() => setMoreView(!moreView)}
                  style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '8px', border: '1px solid #323232', padding: '4px 6px', cursor: 'pointer', background: 'none', color: '#323232', marginLeft: '8px' }}
                >
                  <Columns3 size={18} style={{ zIndex: 2, color: !moreView ? '#0a0a0a' : '#71717a' }} />
                  <LayoutGrid size={18} style={{ zIndex: 2, color: moreView ? '#0a0a0a' : '#71717a' }} />
                  <div style={{
                    position: 'absolute', left: 0, top: '50%', height: '80%', width: '28px', borderRadius: '6px', background: 'white',
                    transition: 'transform 0.3s ease',
                    transform: moreView ? 'translateY(-50%) translateX(34px)' : 'translateY(-50%) translateX(4px)'
                  }} />
                </motion.button>
              </div>
            </div>

            {/* Stats Bar */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.68rem', color: '#a78bfa', background: 'rgba(124,58,237,0.1)', padding: '3px 10px', borderRadius: '999px', fontWeight: 600 }}>{totalPlanned} planned</span>
              <span style={{ fontSize: '0.68rem', color: '#fbbf24', background: 'rgba(251,191,36,0.1)', padding: '3px 10px', borderRadius: '999px', fontWeight: 600 }}>{totalReview} review</span>
              <span style={{ fontSize: '0.68rem', color: '#4ade80', background: 'rgba(34,197,94,0.1)', padding: '3px 10px', borderRadius: '999px', fontWeight: 600 }}>{totalDone} done</span>
            </div>

            {/* Day Headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '6px' }}>
              {dayNames.map(d => (
                <div key={d} style={{ padding: '6px 0', textAlign: 'center', fontSize: '0.65rem', fontWeight: 700, color: 'white', background: '#323232', borderRadius: '10px' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
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
                    style={{
                      position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      height: '4rem', borderRadius: '16px', cursor: d.other ? 'default' : 'pointer',
                      background: sel ? 'linear-gradient(135deg, #7c3aed, #6366f1)' : td ? 'rgba(124,58,237,0.2)' : d.other ? 'rgba(63,63,70,0.15)' : '#1e1e1e',
                      opacity: d.other ? 0.3 : 1,
                      transition: 'all 0.2s ease',
                      transform: hovered && !d.other ? 'scale(1.05)' : 'scale(1)',
                      boxShadow: sel ? '0 4px 20px rgba(124,58,237,0.4)' : hovered && !d.other ? '0 4px 16px rgba(0,0,0,0.3)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      {!d.other && (
                        <span style={{
                          fontSize: '0.85rem', fontWeight: td || sel ? 700 : 400,
                          color: sel ? 'white' : td ? '#a78bfa' : '#d4d4d8'
                        }}>
                          {String(d.day).padStart(2, '0')}
                        </span>
                      )}
                    </div>

                    {/* Task count badge */}
                    {hasTasks && (
                      <motion.div
                        layoutId={`day-${d.month}-${d.day}-count`}
                        style={{
                          position: 'absolute', bottom: '4px', right: '4px',
                          width: hovered && !d.other ? '28px' : '20px',
                          height: hovered && !d.other ? '28px' : '20px',
                          borderRadius: '999px',
                          background: hasReview ? '#fbbf24' : '#7c3aed',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: hovered && !d.other ? '0.7rem' : '0.6rem',
                          fontWeight: 700, color: hasReview ? '#0a0a0a' : 'white',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {tasks.length}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right: Task Details / Bookings Panel */}
          {moreView && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              style={{ width: '100%', maxWidth: '520px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Section Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <motion.h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '0.05em', color: '#d4d4d8', margin: 0, fontFamily: 'var(--font-sans)' }}>
                      {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Tasks'}
                    </motion.h2>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(212,212,216,0.4)', margin: '4px 0 0', fontWeight: 500 }}>
                      {selectedDate ? `${selectedDayTasks.length} task(s) scheduled` : `${allTasksForMonth.length} tasks this month`}
                    </p>
                  </div>
                  {selectedDate && (
                    <button onClick={() => setShowForm(!showForm)} style={{
                      display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 14px', borderRadius: '10px',
                      background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: 'white', border: 'none',
                      cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600
                    }}>
                      <Plus size={14} /> Add Task
                    </button>
                  )}
                </div>

                {/* Create Form */}
                {showForm && selectedDate && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    style={{ background: '#1e1e1e', borderRadius: '16px', border: '1px solid #323232', padding: '16px', overflow: 'hidden' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <select value={selectedNotebookId} onChange={e => setSelectedNotebookId(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #323232', background: '#0a0a0a', color: '#d4d4d8', fontSize: '0.78rem' }}>
                        <option value="">— Select a notebook —</option>
                        {allNotebooks.map(nb => <option key={nb.id} value={nb.id}>{nb.title || 'Untitled'}</option>)}
                      </select>
                      <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title..."
                        style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #323232', background: '#0a0a0a', color: '#d4d4d8', fontSize: '0.78rem', outline: 'none' }} />
                      <textarea value={outline} onChange={e => setOutline(e.target.value)} placeholder="What should Specter do?"
                        rows={2} style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #323232', background: '#0a0a0a', color: '#d4d4d8', fontSize: '0.75rem', resize: 'vertical', outline: 'none' }} />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select value={outputType} onChange={e => setOutputType(e.target.value)}
                          style={{ flex: 1, padding: '8px', borderRadius: '10px', border: '1px solid #323232', background: '#0a0a0a', color: '#d4d4d8', fontSize: '0.75rem' }}>
                          <option value="draft">📝 Draft</option>
                          <option value="outline">📋 Outline</option>
                          <option value="bullet_points">📌 Bullets</option>
                        </select>
                        <input type="number" value={wordTarget} onChange={e => setWordTarget(parseInt(e.target.value) || 500)}
                          style={{ width: '72px', padding: '8px', borderRadius: '10px', border: '1px solid #323232', background: '#0a0a0a', color: '#d4d4d8', fontSize: '0.75rem' }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={14} style={{ color: '#71717a' }} />
                        <input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)}
                          style={{ flex: 1, padding: '8px', borderRadius: '10px', border: '1px solid #323232', background: '#0a0a0a', color: '#d4d4d8', fontSize: '0.75rem' }} />
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.72rem', color: '#a1a1aa' }}>
                        <input type="checkbox" checked={autoStart} onChange={e => setAutoStart(e.target.checked)} style={{ accentColor: '#7c3aed' }} />
                        <Zap size={12} style={{ color: '#7c3aed' }} /> Auto-start at deadline
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={handleCreate} disabled={!title.trim() || !selectedNotebookId}
                          style={{ flex: 1, padding: '10px', borderRadius: '10px', background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem', opacity: (!title.trim() || !selectedNotebookId) ? 0.5 : 1 }}>
                          {autoStart ? '⚡ Create & Auto-start' : 'Create Task'}
                        </button>
                        <button onClick={() => setShowForm(false)}
                          style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid #323232', background: 'transparent', color: '#a1a1aa', cursor: 'pointer', fontSize: '0.78rem' }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Task List */}
                <motion.div layout style={{
                  display: 'flex', flexDirection: 'column', maxHeight: '580px', overflowY: 'auto',
                  borderRadius: '16px', border: '2px solid #323232'
                }}>
                  <AnimatePresence>
                    {(selectedDate ? selectedDayTasks : allTasksForMonth).length === 0 ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ padding: '48px 24px', textAlign: 'center' }}>
                        <Calendar size={36} style={{ color: '#3f3f46', margin: '0 auto 12px' }} />
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#71717a' }}>
                          {selectedDate ? 'No tasks on this day' : 'No tasks this month'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#52525b', marginTop: '4px' }}>
                          {selectedDate ? 'Click "+ Add Task" to schedule one.' : 'Select a day to create tasks.'}
                        </div>
                      </motion.div>
                    ) : (
                      (selectedDate ? selectedDayTasks : allTasksForMonth).map((task, idx) => {
                        const st = getStatusConfig(task.status);
                        const overdue = task.scheduled_date && new Date(task.scheduled_date) < new Date() && task.status === 'planned';
                        const taskNotebook = allNotebooks.find(nb => nb.id === task.notebook_id);
                        const taskDate = new Date(task.scheduled_date);

                        return (
                          <motion.div
                            key={task.id}
                            layout
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, delay: idx * 0.03 }}
                            style={{ borderBottom: '1px solid #323232', padding: '14px 16px' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <span style={{ fontSize: '0.72rem', color: '#a1a1aa' }}>
                                {taskDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: '#a1a1aa' }}>
                                {task.scheduled_time || taskDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'white', margin: '0 0 4px' }}>{task.title}</h3>
                            {taskNotebook && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: '#a78bfa', marginBottom: '4px' }}>
                                <BookOpen size={10} /> {taskNotebook.title}
                              </div>
                            )}
                            {task.outline && (
                              <p style={{ fontSize: '0.72rem', color: '#52525b', margin: '0 0 8px', lineHeight: 1.5 }}>{task.outline}</p>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.62rem', padding: '2px 8px', borderRadius: '999px', background: st.bg, color: st.color, fontWeight: 600 }}>{st.label}</span>
                              <span style={{ fontSize: '0.6rem', color: '#71717a' }}>{task.word_target} words</span>
                              {(task.auto_start === 1 || task.auto_start === true) && (
                                <span style={{ fontSize: '0.58rem', padding: '2px 6px', borderRadius: '6px', background: 'rgba(124,58,237,0.1)', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                  <Zap size={8} /> Auto
                                </span>
                              )}
                              {overdue && <span style={{ fontSize: '0.58rem', padding: '2px 6px', borderRadius: '6px', background: 'rgba(248,113,113,0.1)', color: '#f87171' }}>Overdue</span>}
                              <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
                                {(task.status === 'planned' || overdue) && (
                                  <button onClick={() => onTriggerAi(task.id)} title="Run AI"
                                    style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(124,58,237,0.15)', border: 'none', cursor: 'pointer', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.65rem' }}>
                                    <Play size={10} /> Run
                                  </button>
                                )}
                                <button onClick={() => onDeletePlan(task.id)} title="Delete"
                                  style={{ padding: '4px', borderRadius: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#52525b' }}>
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
