import React, { useState, useMemo } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Calendar({ plans, onSelectDate, selectedDate }) {
  const [viewDate, setViewDate] = useState(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const days = [];

    // Previous month padding
    const prevMonthLast = new Date(year, month, 0).getDate();
    for (let i = startPad - 1; i >= 0; i--) {
      days.push({ day: prevMonthLast - i, month: month - 1, year, otherMonth: true });
    }

    // Current month
    for (let d = 1; d <= totalDays; d++) {
      days.push({ day: d, month, year, otherMonth: false });
    }

    // Next month padding
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({ day: d, month: month + 1, year, otherMonth: true });
    }

    return days;
  }, [year, month]);

  // Map plans to dates
  const plansByDate = useMemo(() => {
    const map = {};
    plans.forEach(plan => {
      if (plan.scheduled_date) {
        const d = new Date(plan.scheduled_date);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        if (!map[key]) map[key] = [];
        map[key].push(plan);
      }
    });
    return map;
  }, [plans]);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToday = () => setViewDate(new Date());

  const isToday = (d) => {
    const check = new Date(d.year, d.month, d.day);
    check.setHours(0, 0, 0, 0);
    return check.getTime() === today.getTime();
  };

  const isSelected = (d) => {
    if (!selectedDate) return false;
    return selectedDate.getFullYear() === (d.month < 0 ? d.year - 1 : d.month > 11 ? d.year + 1 : d.year)
      && selectedDate.getMonth() === ((d.month + 12) % 12)
      && selectedDate.getDate() === d.day;
  };

  const getDateKey = (d) => {
    const actualMonth = (d.month + 12) % 12;
    const actualYear = d.month < 0 ? d.year - 1 : d.month > 11 ? d.year + 1 : d.year;
    return `${actualYear}-${actualMonth}-${d.day}`;
  };

  const getTasksForDay = (d) => plansByDate[getDateKey(d)] || [];

  const handleDayClick = (d) => {
    if (d.otherMonth) return;
    const clicked = new Date(year, month, d.day);
    onSelectDate(clicked);
  };

  // Count tasks this month
  const monthTaskCount = plans.filter(p => {
    if (!p.scheduled_date) return false;
    const d = new Date(p.scheduled_date);
    return d.getMonth() === month && d.getFullYear() === year;
  }).length;

  const pendingCount = plans.filter(p => p.status === 'planned' || p.status === 'review').length;

  return (
    <div style={{ padding: '12px' }}>
      {/* Month navigation */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '10px'
      }}>
        <button onClick={prevMonth} style={{
          padding: '4px', borderRadius: '6px', background: 'none', border: 'none',
          cursor: 'pointer', color: 'var(--text-tertiary)', transition: 'all 0.15s'
        }}>
          <FiChevronLeft size={14} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <button onClick={goToday} style={{
            fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)',
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-sans)'
          }}>
            {monthNames[month]} {year}
          </button>
          {monthTaskCount > 0 && (
            <div style={{ fontSize: '0.6rem', marginTop: '2px', color: 'var(--text-muted)' }}>
              {monthTaskCount} task{monthTaskCount > 1 ? 's' : ''} this month
            </div>
          )}
        </div>
        <button onClick={nextMonth} style={{
          padding: '4px', borderRadius: '6px', background: 'none', border: 'none',
          cursor: 'pointer', color: 'var(--text-tertiary)', transition: 'all 0.15s'
        }}>
          <FiChevronRight size={14} />
        </button>
      </div>

      {/* Day headers */}
      <div className="cal-grid" style={{ marginBottom: '2px' }}>
        {dayNames.map(d => (
          <div key={d} className="cal-header">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="cal-grid">
        {calendarDays.map((d, i) => {
          const tasks = getTasksForDay(d);
          const hasTasks = tasks.length > 0;
          const hasReview = tasks.some(t => t.status === 'review');
          const hasDone = tasks.every(t => t.status === 'done') && hasTasks;

          let className = 'cal-day';
          if (d.otherMonth) className += ' other-month';
          if (isToday(d)) className += ' today';
          if (isSelected(d)) className += ' selected';
          if (hasTasks) className += ' has-task';
          if (hasReview) className += ' has-review';
          if (hasDone) className += ' has-done';

          return (
            <div key={i} className={className} onClick={() => handleDayClick(d)} title={hasTasks ? `${tasks.length} task(s)` : ''}>
              {d.day}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {pendingCount > 0 && (
        <div style={{
          marginTop: '10px', textAlign: 'center', fontSize: '0.65rem',
          padding: '6px 8px', borderRadius: '6px',
          background: 'var(--accent-bg)', color: 'var(--color-specter-500)'
        }}>
          📋 {pendingCount} pending task{pendingCount > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
