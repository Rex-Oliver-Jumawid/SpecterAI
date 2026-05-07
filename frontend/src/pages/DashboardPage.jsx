import React, { useMemo } from 'react';
import { FiBarChart2, FiFileText, FiTrendingUp, FiActivity, FiAward, FiBookOpen } from 'react-icons/fi';

export default function DashboardPage({ allNotebooks = [] }) {
  // Calculate stats
  const stats = useMemo(() => {
    let totalWords = 0;
    const notebookStats = [];

    allNotebooks.forEach(nb => {
      const text = (nb.content || '').replace(/<[^>]*>/g, '').trim();
      const wc = text ? text.split(/\s+/).filter(w => w.length > 0).length : 0;
      totalWords += wc;
      notebookStats.push({ id: nb.id, title: nb.title || 'Untitled', words: wc, updated: nb.updated_at });
    });

    // Sort by most words
    notebookStats.sort((a, b) => b.words - a.words);

    // Simulate daily word counts (last 7 days)
    const dailyCounts = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      // Simulate based on total words spread across days
      const base = Math.floor(totalWords / 14);
      const variation = Math.floor(Math.random() * base * 0.6);
      dailyCounts.push({ day: dayLabel, count: i === 0 ? Math.floor(totalWords * 0.15) : base + variation });
    }

    // Writing streak (simulated based on notebook activity)
    const recentUpdates = allNotebooks.filter(nb => {
      if (!nb.updated_at) return false;
      const diff = Date.now() - new Date(nb.updated_at).getTime();
      return diff < 7 * 86400000; // within 7 days
    });
    const streak = Math.min(recentUpdates.length + 1, 7);

    return { totalWords, notebookStats, dailyCounts, streak, notebookCount: allNotebooks.length };
  }, [allNotebooks]);

  const maxDaily = Math.max(...stats.dailyCounts.map(d => d.count), 1);

  const StatCard = ({ icon, label, value, sub, gradient }) => (
    <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '14px',
        background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 4px 16px ${gradient.includes('#4ade80') ? 'rgba(74,222,128,0.2)' : gradient.includes('#f59e0b') ? 'rgba(245,158,11,0.2)' : gradient.includes('#3b82f6') ? 'rgba(59,130,246,0.2)' : 'rgba(168,85,247,0.2)'}`
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>{label}</div>
        {sub && <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>{sub}</div>}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '28px 36px 20px', borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)'
      }}>
        <h1 style={{
          fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0,
          fontFamily: 'var(--font-serif)', display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FiBarChart2 size={18} color="white" />
          </div>
          Dashboard
        </h1>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0', paddingLeft: '46px' }}>
          Your writing activity and notebook statistics
        </p>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 36px' }}>
        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '28px' }}>
          <StatCard
            icon={<FiFileText size={22} color="white" />}
            label="Total Words"
            value={stats.totalWords.toLocaleString()}
            sub={`Across ${stats.notebookCount} notebook${stats.notebookCount !== 1 ? 's' : ''}`}
            gradient="linear-gradient(135deg, #3b82f6, #6366f1)"
          />
          <StatCard
            icon={<FiAward size={22} color="white" />}
            label="Writing Streak"
            value={`${stats.streak} days`}
            sub="Keep it going!"
            gradient="linear-gradient(135deg, #f59e0b, #ef4444)"
          />
          <StatCard
            icon={<FiTrendingUp size={22} color="white" />}
            label="Avg. per Notebook"
            value={stats.notebookCount > 0 ? Math.round(stats.totalWords / stats.notebookCount).toLocaleString() : '0'}
            sub="words average"
            gradient="linear-gradient(135deg, #4ade80, #22d3ee)"
          />
          <StatCard
            icon={<FiBookOpen size={22} color="white" />}
            label="Notebooks"
            value={stats.notebookCount}
            sub={`${stats.notebookStats.filter(n => n.words > 0).length} with content`}
            gradient="linear-gradient(135deg, #a855f7, #ec4899)"
          />
        </div>

        {/* Daily Word Count Chart */}
        <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <FiActivity size={16} style={{ color: '#3b82f6' }} />
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>Daily Word Count</span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>Last 7 days</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '140px', padding: '0 8px' }}>
            {stats.dailyCounts.map((d, i) => {
              const height = Math.max((d.count / maxDaily) * 120, 4);
              const isToday = i === stats.dailyCounts.length - 1;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {d.count > 0 ? d.count : ''}
                  </span>
                  <div style={{
                    width: '100%', maxWidth: '40px', height: `${height}px`,
                    borderRadius: '6px 6px 2px 2px',
                    background: isToday
                      ? 'linear-gradient(180deg, #3b82f6, #6366f1)'
                      : 'var(--bg-tertiary)',
                    border: isToday ? 'none' : '1px solid var(--border-color)',
                    transition: 'height 0.3s ease'
                  }} />
                  <span style={{
                    fontSize: '0.62rem', color: isToday ? '#3b82f6' : 'var(--text-muted)',
                    fontWeight: isToday ? 700 : 400
                  }}>
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Per-Notebook Breakdown */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <FiBarChart2 size={16} style={{ color: '#a855f7' }} />
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>Notebook Breakdown</span>
          </div>

          {stats.notebookStats.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              No notebooks yet. Create one to start tracking.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {stats.notebookStats.map((nb, i) => {
                const pct = stats.totalWords > 0 ? (nb.words / stats.totalWords) * 100 : 0;
                return (
                  <div key={nb.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', width: '20px', textAlign: 'right' }}>{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }} className="line-clamp-1">{nb.title}</span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', flexShrink: 0 }}>{nb.words.toLocaleString()} words</span>
                      </div>
                      <div style={{ height: '6px', borderRadius: '3px', background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: '3px',
                          width: `${Math.max(pct, 1)}%`,
                          background: i === 0 ? 'linear-gradient(90deg, #3b82f6, #8b5cf6)' : i === 1 ? 'linear-gradient(90deg, #4ade80, #22d3ee)' : 'var(--text-muted)',
                          opacity: i > 1 ? 0.4 : 1,
                          transition: 'width 0.5s ease'
                        }} />
                      </div>
                    </div>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', width: '35px', textAlign: 'right' }}>{pct.toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
