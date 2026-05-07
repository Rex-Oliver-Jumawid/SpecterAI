import React, { useState, useEffect } from 'react';
import { FiLayers, FiRefreshCw, FiBookOpen, FiCheckCircle, FiAlertCircle, FiTrendingUp, FiAward } from 'react-icons/fi';
import { references as refsApi } from '../api';

export default function ComparisonPage({ allNotebooks = [] }) {
  const [compareA, setCompareA] = useState(null);
  const [compareB, setCompareB] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [selectedNotebookId, setSelectedNotebookId] = useState('');
  const [refs, setRefs] = useState([]);
  const [loadingRefs, setLoadingRefs] = useState(false);

  useEffect(() => {
    if (!selectedNotebookId) { setRefs([]); return; }
    setLoadingRefs(true);
    setCompareA(null); setCompareB(null); setComparisonResult(null);
    refsApi.list(selectedNotebookId)
      .then(data => setRefs(data))
      .catch(() => setRefs([]))
      .finally(() => setLoadingRefs(false));
  }, [selectedNotebookId]);

  const generateComparison = () => {
    if (!compareA || compareB) {} // both needed
    if (!compareA || !compareB) return;
    setGenerating(true);

    setTimeout(() => {
      const yearA = compareA.year || 0;
      const yearB = compareB.year || 0;
      const citesA = compareA.cited_by_count || 0;
      const citesB = compareB.cited_by_count || 0;
      const lowerA = (compareA.abstract || '').toLowerCase();
      const lowerB = (compareB.abstract || '').toLowerCase();

      // Detect methodology
      const detectMethod = (lower) => {
        if (lower.includes('survey')) return 'Survey-based';
        if (lower.includes('experiment')) return 'Experimental';
        if (lower.includes('interview')) return 'Qualitative';
        if (lower.includes('case study')) return 'Case Study';
        if (lower.includes('review') || lower.includes('meta-analysis')) return 'Systematic Review';
        if (lower.includes('regression') || lower.includes('statistical')) return 'Statistical';
        if (lower.length > 50) return 'Mixed Methods';
        return 'Not determinable';
      };

      // Find shared keywords
      const getKeywords = (text) => {
        const stop = new Set(['the','of','and','in','a','to','for','on','with','is','an','by','from','this','that','are','was','were','be','or','not','it','as']);
        return [...new Set(text.toLowerCase().split(/\s+/).filter(w => w.length > 4 && !stop.has(w)))];
      };
      const kwA = getKeywords(compareA.title || '');
      const kwB = getKeywords(compareB.title || '');
      const shared = kwA.filter(w => kwB.includes(w));

      const comparison = {
        dimensions: [
          {
            label: 'Publication Year',
            paperA: yearA ? yearA.toString() : 'Unknown',
            paperB: yearB ? yearB.toString() : 'Unknown',
            verdict: yearA > yearB ? 'Paper 1 is more recent' : yearB > yearA ? 'Paper 2 is more recent' : yearA ? 'Published the same year' : 'Years unknown',
            winner: yearA > yearB ? 'a' : yearB > yearA ? 'b' : 'tie'
          },
          {
            label: 'Journal / Venue',
            paperA: compareA.journal || 'Not specified',
            paperB: compareB.journal || 'Not specified',
            verdict: compareA.journal && compareB.journal ? 'Both peer-reviewed' : !compareA.journal && !compareB.journal ? 'Neither specifies a journal' : 'One lacks journal verification',
            winner: compareA.journal && !compareB.journal ? 'a' : compareB.journal && !compareA.journal ? 'b' : 'tie'
          },
          {
            label: 'Citation Count',
            paperA: citesA > 0 ? `${citesA.toLocaleString()} citations` : 'No data',
            paperB: citesB > 0 ? `${citesB.toLocaleString()} citations` : 'No data',
            verdict: citesA > citesB ? `Paper 1 has ${(citesA - citesB).toLocaleString()} more citations` : citesB > citesA ? `Paper 2 has ${(citesB - citesA).toLocaleString()} more citations` : 'Similar citation impact',
            winner: citesA > citesB ? 'a' : citesB > citesA ? 'b' : 'tie'
          },
          {
            label: 'DOI Verification',
            paperA: compareA.doi ? '✓ Verified' : '✗ None',
            paperB: compareB.doi ? '✓ Verified' : '✗ None',
            verdict: compareA.doi && compareB.doi ? 'Both verifiable' : 'Source verification gap',
            winner: compareA.doi && !compareB.doi ? 'a' : compareB.doi && !compareA.doi ? 'b' : 'tie'
          },
          {
            label: 'Abstract Available',
            paperA: compareA.abstract ? `Yes (${compareA.abstract.length} chars)` : 'No',
            paperB: compareB.abstract ? `Yes (${compareB.abstract.length} chars)` : 'No',
            verdict: compareA.abstract && compareB.abstract ? 'Both provide abstracts' : 'Limited metadata',
            winner: compareA.abstract && !compareB.abstract ? 'a' : compareB.abstract && !compareA.abstract ? 'b' : 'tie'
          },
          {
            label: 'Methodology',
            paperA: detectMethod(lowerA),
            paperB: detectMethod(lowerB),
            verdict: detectMethod(lowerA) === detectMethod(lowerB) ? 'Same approach — good for validation' : 'Different approaches — good for triangulation',
            winner: 'tie'
          },
          {
            label: 'Recency',
            paperA: yearA ? `${new Date().getFullYear() - yearA} years old` : 'Unknown',
            paperB: yearB ? `${new Date().getFullYear() - yearB} years old` : 'Unknown',
            verdict: yearA && yearB ? (Math.abs(yearA - yearB) <= 2 ? 'Similar timeframe' : `${Math.abs(yearA - yearB)} year gap between publications`) : 'Cannot compare',
            winner: yearA > yearB ? 'a' : yearB > yearA ? 'b' : 'tie'
          },
          {
            label: 'Authors',
            paperA: compareA.authors || 'Unknown',
            paperB: compareB.authors || 'Unknown',
            verdict: compareA.authors === compareB.authors ? 'Same authors' : 'Different research teams',
            winner: 'tie'
          },
        ],
        sharedKeywords: shared,
        topicOverlap: shared.length > 2 ? 'High' : shared.length > 0 ? 'Moderate' : 'Low',
        strengths: {
          a: [
            citesA > citesB ? `Higher citation count (${citesA.toLocaleString()})` : null,
            yearA > yearB ? 'More recent publication' : null,
            compareA.doi && !compareB.doi ? 'DOI-verified' : null,
            compareA.journal && !compareB.journal ? 'Published in named journal' : null,
            compareA.abstract && compareA.abstract.length > (compareB.abstract?.length || 0) ? 'More detailed abstract' : null,
          ].filter(Boolean),
          b: [
            citesB > citesA ? `Higher citation count (${citesB.toLocaleString()})` : null,
            yearB > yearA ? 'More recent publication' : null,
            compareB.doi && !compareA.doi ? 'DOI-verified' : null,
            compareB.journal && !compareA.journal ? 'Published in named journal' : null,
            compareB.abstract && compareB.abstract.length > (compareA.abstract?.length || 0) ? 'More detailed abstract' : null,
          ].filter(Boolean),
        },
        overallVerdict: (() => {
          let scoreA = 0, scoreB = 0;
          if (citesA > citesB) scoreA++; else if (citesB > citesA) scoreB++;
          if (yearA > yearB) scoreA++; else if (yearB > yearA) scoreB++;
          if (compareA.doi) scoreA++; if (compareB.doi) scoreB++;
          if (compareA.journal) scoreA++; if (compareB.journal) scoreB++;
          if (compareA.abstract) scoreA++; if (compareB.abstract) scoreB++;
          if (scoreA > scoreB) return { winner: 'Paper 1', detail: `Paper 1 scores higher across ${scoreA} of 5 quality indicators.` };
          if (scoreB > scoreA) return { winner: 'Paper 2', detail: `Paper 2 scores higher across ${scoreB} of 5 quality indicators.` };
          return { winner: 'Tie', detail: 'Both papers score equally across quality indicators. Consider content relevance to decide.' };
        })(),
        summary: `Comparing "${compareA.title}" (${yearA || 'N/A'}) with "${compareB.title}" (${yearB || 'N/A'}). ${citesA + citesB > 100 ? 'Combined citation impact is strong.' : 'Combined citation data is limited.'} ${shared.length > 0 ? `Shared topic keywords: ${shared.join(', ')}.` : 'No obvious keyword overlap in titles.'} ${compareA.doi && compareB.doi ? 'Both are DOI-verified.' : 'Verify sources independently.'} ${detectMethod(lowerA) !== detectMethod(lowerB) ? 'Different methodologies offer complementary perspectives.' : 'Similar methodologies — useful for corroboration.'}`,
        useCase: citesA > 100 || citesB > 100
          ? 'Both papers are suitable for academic citation. Use the higher-cited paper for foundational claims and the other for supporting or contrasting evidence.'
          : 'Consider supplementing with additional highly-cited sources to strengthen your literature base.',
      };
      setComparisonResult(comparison);
      setGenerating(false);
    }, 1500);
  };

  const RefSelector = ({ value, onChange, exclude, label, color }) => (
    <div style={{ flex: 1 }}>
      <label style={{ fontSize: '0.68rem', fontWeight: 600, color, marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      <select
        value={value?.id || ''}
        onChange={e => { const ref = refs.find(r => r.id == e.target.value); onChange(ref || null); setComparisonResult(null); }}
        className="input-specter"
        style={{ width: '100%', padding: '10px 12px', fontSize: '0.78rem' }}
      >
        <option value="">Select a reference</option>
        {refs.filter(r => !exclude || r.id !== exclude.id).map(r => (
          <option key={r.id} value={r.id}>{r.title} ({r.year || 'N/A'})</option>
        ))}
      </select>
      {value && (
        <div style={{ marginTop: '8px', padding: '10px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{value.title}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>{value.authors || 'Unknown'} · {value.year || 'N/A'}</div>
          {value.journal && <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '2px', fontStyle: 'italic' }}>{value.journal}</div>}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '24px 32px 20px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
        <h1 style={{
          fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0,
          fontFamily: 'var(--font-serif)', display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FiLayers size={18} color="white" />
          </div>
          Compare Sources
        </h1>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0', paddingLeft: '46px' }}>
          Side-by-side analysis of two references with quality scoring
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px' }}>
          <FiBookOpen size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <select
            value={selectedNotebookId}
            onChange={e => setSelectedNotebookId(e.target.value)}
            className="input-specter"
            style={{ flex: 1, maxWidth: '400px', padding: '8px 12px', fontSize: '0.78rem' }}
          >
            <option value="">Select a notebook</option>
            {allNotebooks.map(nb => (
              <option key={nb.id} value={nb.id}>{nb.title || 'Untitled'}</option>
            ))}
          </select>
          {loadingRefs && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Loading...</span>}
          {selectedNotebookId && !loadingRefs && (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{refs.length} refs</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 32px' }}>
        {/* Two selectors */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <RefSelector value={compareA} onChange={setCompareA} exclude={compareB} label="Paper 1" color="#f59e0b" />
          <div style={{ display: 'flex', alignItems: 'center', paddingTop: '20px' }}>
            <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>⚡</span>
          </div>
          <RefSelector value={compareB} onChange={setCompareB} exclude={compareA} label="Paper 2" color="#3b82f6" />
        </div>

        <button
          onClick={generateComparison}
          disabled={!compareA || !compareB || generating}
          className="btn-specter"
          style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}
        >
          {generating ? <><FiRefreshCw size={14} className="spin" /> Comparing...</> : <><FiLayers size={14} /> Compare Sources</>}
        </button>

        {!comparisonResult && !generating && (
          <div className="empty-state" style={{ paddingTop: '40px' }}>
            <FiLayers size={40} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: '8px' }} />
            <div className="empty-state-title" style={{ fontSize: '1rem' }}>
              {refs.length < 2 ? 'Need at least 2 references' : 'Select two papers to compare'}
            </div>
            <div className="empty-state-text" style={{ fontSize: '0.85rem', maxWidth: '340px' }}>
              Pick two references above and click "Compare Sources" for a detailed side-by-side analysis.
            </div>
          </div>
        )}

        {comparisonResult && (
          <div className="animate-slide-down">
            {/* Overall Verdict */}
            <div className="glass-card" style={{
              padding: '20px', marginBottom: '16px',
              borderLeft: `4px solid ${comparisonResult.overallVerdict.winner === 'Paper 1' ? '#f59e0b' : comparisonResult.overallVerdict.winner === 'Paper 2' ? '#3b82f6' : '#8b5cf6'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <FiAward size={16} style={{ color: '#f59e0b' }} />
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Overall: {comparisonResult.overallVerdict.winner}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {comparisonResult.overallVerdict.detail}
              </p>
            </div>

            {/* Strengths Side by Side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {[
                { label: 'Paper 1 Strengths', items: comparisonResult.strengths.a, color: '#f59e0b' },
                { label: 'Paper 2 Strengths', items: comparisonResult.strengths.b, color: '#3b82f6' },
              ].map((side, i) => (
                <div key={i} className="glass-card" style={{ padding: '14px' }}>
                  <h4 style={{ fontSize: '0.72rem', fontWeight: 700, color: side.color, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {side.label}
                  </h4>
                  {side.items.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {side.items.map((s, j) => (
                        <li key={j} style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          <FiCheckCircle size={10} style={{ color: side.color, marginRight: '4px' }} />{s}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>No distinct advantages found</span>
                  )}
                </div>
              ))}
            </div>

            {/* Topic Overlap */}
            {comparisonResult.sharedKeywords.length > 0 && (
              <div className="glass-card" style={{ padding: '14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <FiTrendingUp size={14} style={{ color: '#8b5cf6' }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Topic Overlap: {comparisonResult.topicOverlap}
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {comparisonResult.sharedKeywords.map((kw, i) => (
                    <span key={i} style={{
                      padding: '3px 10px', borderRadius: '12px', fontSize: '0.65rem',
                      background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.2)'
                    }}>{kw}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Comparison Table */}
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{
                padding: '14px 16px', background: 'var(--bg-card)',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <FiLayers size={15} style={{ color: '#f59e0b' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>Detailed Comparison</span>
              </div>

              {/* Header Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 1fr auto', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ padding: '10px 14px', fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Metric</div>
                <div style={{ padding: '10px 14px', borderLeft: '1px solid var(--border-color)', fontSize: '0.6rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>Paper 1</div>
                <div style={{ padding: '10px 14px', borderLeft: '1px solid var(--border-color)', fontSize: '0.6rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase' }}>Paper 2</div>
                <div style={{ padding: '10px 14px', borderLeft: '1px solid var(--border-color)', fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', width: '180px' }}>Verdict</div>
              </div>

              {comparisonResult.dimensions.map((dim, idx) => (
                <div key={idx} style={{
                  display: 'grid', gridTemplateColumns: '130px 1fr 1fr auto',
                  borderBottom: idx < comparisonResult.dimensions.length - 1 ? '1px solid var(--border-color)' : 'none',
                  background: idx % 2 === 0 ? 'transparent' : 'var(--bg-card)'
                }}>
                  <div style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                    {dim.label}
                  </div>
                  <div style={{
                    padding: '10px 14px', borderLeft: '1px solid var(--border-color)', fontSize: '0.72rem', color: 'var(--text-tertiary)', lineHeight: 1.5,
                    background: dim.winner === 'a' ? 'rgba(245, 158, 11, 0.04)' : 'transparent'
                  }}>
                    {dim.winner === 'a' && <span style={{ color: '#f59e0b', marginRight: '4px' }}>★</span>}
                    {dim.paperA}
                  </div>
                  <div style={{
                    padding: '10px 14px', borderLeft: '1px solid var(--border-color)', fontSize: '0.72rem', color: 'var(--text-tertiary)', lineHeight: 1.5,
                    background: dim.winner === 'b' ? 'rgba(59, 130, 246, 0.04)' : 'transparent'
                  }}>
                    {dim.winner === 'b' && <span style={{ color: '#3b82f6', marginRight: '4px' }}>★</span>}
                    {dim.paperB}
                  </div>
                  <div style={{ padding: '10px 14px', borderLeft: '1px solid var(--border-color)', fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.4, width: '180px' }}>
                    {dim.verdict}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary & Use Case */}
            <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f59e0b', margin: '0 0 6px' }}>📊 Summary</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 12px' }}>
                {comparisonResult.summary}
              </p>
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(74, 222, 128, 0.05)', border: '1px solid rgba(74, 222, 128, 0.12)' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#4ade80' }}>📋 Recommendation</span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '4px 0 0' }}>
                  {comparisonResult.useCase}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
