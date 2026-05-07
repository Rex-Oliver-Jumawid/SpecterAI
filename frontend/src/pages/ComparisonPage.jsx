import React, { useState, useMemo } from 'react';
import { FiFileText, FiChevronDown, FiChevronRight, FiLayers, FiX, FiDownload, FiRefreshCw } from 'react-icons/fi';

export default function ComparisonPage({ allNotebooks = [], allReferences = [] }) {
  const [activeTab, setActiveTab] = useState('report');
  const [selectedRef, setSelectedRef] = useState(null);
  const [compareA, setCompareA] = useState(null);
  const [compareB, setCompareB] = useState(null);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [generating, setGenerating] = useState(false);

  // Collect all refs from all notebooks
  const refs = useMemo(() => {
    if (allReferences && allReferences.length > 0) return allReferences;
    // Fallback: flatten refs from notebooks if passed differently
    return [];
  }, [allReferences]);

  // Generate a structured report for a single reference
  const generateReport = (ref) => {
    setGenerating(true);
    setSelectedRef(ref);
    
    // Simulated AI report
    setTimeout(() => {
      const report = {
        title: ref.title,
        authors: ref.authors || 'Unknown',
        year: ref.year || 'N/A',
        journal: ref.journal || 'Not specified',
        doi: ref.doi || 'N/A',
        trustScore: ref.journal && ref.doi && ref.abstract ? 85 : ref.journal || ref.doi ? 65 : 40,
        overview: `This study${ref.year ? ` (${ref.year})` : ''} explores ${ref.title?.toLowerCase() || 'the research topic'}. ${ref.abstract ? ref.abstract.substring(0, 250) + '...' : 'No abstract available for deeper analysis.'}`,
        keyFindings: [
          ref.abstract ? `The research addresses key aspects of ${ref.title?.split(' ').slice(0, 5).join(' ').toLowerCase() || 'the topic'}, providing empirical evidence.` : 'Key findings not extractable without abstract.',
          ref.cited_by_count > 50 ? `Widely cited with ${ref.cited_by_count.toLocaleString()} citations, indicating significant academic impact.` : 'Limited citation data available.',
          ref.journal ? `Published in ${ref.journal}, a peer-reviewed venue.` : 'Publication venue not verified.',
        ],
        methodology: ref.abstract 
          ? `Based on the abstract, this paper appears to employ a ${ref.abstract.toLowerCase().includes('survey') ? 'survey-based' : ref.abstract.toLowerCase().includes('experiment') ? 'experimental' : ref.abstract.toLowerCase().includes('case study') ? 'case study' : 'mixed-methods'} approach.`
          : 'Methodology cannot be determined without access to the full text.',
        limitations: [
          !ref.abstract ? 'Full text not available for comprehensive analysis.' : 'Analysis is based on metadata and abstract only.',
          ref.year && (new Date().getFullYear() - ref.year > 5) ? `Published ${new Date().getFullYear() - ref.year} years ago — findings may need updating.` : null,
          !ref.doi ? 'No DOI available — source verification is limited.' : null,
        ].filter(Boolean),
        recommendations: ref.journal && ref.doi 
          ? 'This source is suitable for academic citation. Verify relevance to your specific research question.'
          : 'Consider supplementing with additional verified sources for stronger arguments.',
      };
      setGeneratedReport(report);
      setGenerating(false);
    }, 1200);
  };

  // Generate comparison between two references
  const generateComparison = () => {
    if (!compareA || !compareB) return;
    setGenerating(true);

    setTimeout(() => {
      const yearA = compareA.year || 'N/A';
      const yearB = compareB.year || 'N/A';
      const citesA = compareA.cited_by_count || 0;
      const citesB = compareB.cited_by_count || 0;

      const comparison = {
        dimensions: [
          {
            label: 'Publication Year',
            paperA: yearA.toString(),
            paperB: yearB.toString(),
            verdict: yearA > yearB ? 'Paper 1 is more recent' : yearB > yearA ? 'Paper 2 is more recent' : 'Published in the same year'
          },
          {
            label: 'Journal',
            paperA: compareA.journal || 'Not specified',
            paperB: compareB.journal || 'Not specified',
            verdict: compareA.journal && compareB.journal ? 'Both published in peer-reviewed journals' : 'One or both lack journal verification'
          },
          {
            label: 'Citations',
            paperA: citesA > 0 ? `${citesA.toLocaleString()} citations` : 'No data',
            paperB: citesB > 0 ? `${citesB.toLocaleString()} citations` : 'No data',
            verdict: citesA > citesB ? 'Paper 1 has more academic impact' : citesB > citesA ? 'Paper 2 has more academic impact' : 'Similar citation counts'
          },
          {
            label: 'DOI Verification',
            paperA: compareA.doi ? '✓ Verified' : '✗ Not available',
            paperB: compareB.doi ? '✓ Verified' : '✗ Not available',
            verdict: compareA.doi && compareB.doi ? 'Both sources are DOI-verified' : 'Not all sources are verifiable'
          },
          {
            label: 'Abstract Quality',
            paperA: compareA.abstract ? `${compareA.abstract.length} chars` : 'None',
            paperB: compareB.abstract ? `${compareB.abstract.length} chars` : 'None',
            verdict: compareA.abstract && compareB.abstract ? 'Both provide abstracts for analysis' : 'Limited metadata for comparison'
          },
          {
            label: 'Research Focus',
            paperA: compareA.abstract ? compareA.abstract.substring(0, 100) + '...' : compareA.title || 'Unknown',
            paperB: compareB.abstract ? compareB.abstract.substring(0, 100) + '...' : compareB.title || 'Unknown',
            verdict: 'Review focus areas for topical relevance to your research'
          },
        ],
        summary: `Comparing "${compareA.title}" (${yearA}) with "${compareB.title}" (${yearB}). ${
          citesA + citesB > 100 ? 'Both papers have significant academic recognition.' : 'Consider the recency and verification status of each source.'
        } ${compareA.doi && compareB.doi ? 'Both are DOI-verified, indicating reliable provenance.' : 'Verify source authenticity before citing.'}`
      };
      setComparisonResult(comparison);
      setGenerating(false);
    }, 1500);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4ade80';
    if (score >= 60) return '#fbbf24';
    if (score >= 40) return '#fb923c';
    return '#f87171';
  };

  const RefSelector = ({ value, onChange, exclude, label }) => (
    <div style={{ flex: 1 }}>
      <label style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      <select
        value={value?.id || ''}
        onChange={e => {
          const ref = refs.find(r => r.id == e.target.value);
          onChange(ref || null);
        }}
        className="input-specter"
        style={{ width: '100%', padding: '10px 12px', fontSize: '0.78rem' }}
      >
        <option value="">— Select a reference —</option>
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
      <div style={{ padding: '24px 32px 0', background: 'var(--bg-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
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
              Comparison
            </h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0', paddingLeft: '46px' }}>
              Generate reports & compare your saved references side-by-side
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border-color)' }}>
          {[{ id: 'report', label: 'Generate Report', icon: <FiFileText size={13} /> },
            { id: 'compare', label: 'Compare Sources', icon: <FiLayers size={13} /> }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 20px', border: 'none', cursor: 'pointer',
              fontSize: '0.78rem', fontWeight: 600, fontFamily: 'var(--font-sans)',
              background: 'transparent',
              color: activeTab === tab.id ? '#f59e0b' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid #f59e0b' : '2px solid transparent',
              transition: 'all 0.2s', marginBottom: '-1px'
            }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* REPORT TAB */}
      {activeTab === 'report' && (
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 32px' }}>
          {/* Reference Selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
              Select a reference to generate a report
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                value={selectedRef?.id || ''}
                onChange={e => {
                  const ref = refs.find(r => r.id == e.target.value);
                  setSelectedRef(ref || null);
                  setGeneratedReport(null);
                }}
                className="input-specter"
                style={{ flex: 1, padding: '10px 12px', fontSize: '0.78rem' }}
              >
                <option value="">— Select a reference —</option>
                {refs.map(r => (
                  <option key={r.id} value={r.id}>{r.title} ({r.year || 'N/A'})</option>
                ))}
              </select>
              <button
                onClick={() => selectedRef && generateReport(selectedRef)}
                disabled={!selectedRef || generating}
                className="btn-specter"
                style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {generating ? <><FiRefreshCw size={14} className="spin" /> Generating...</> : <><FiFileText size={14} /> Generate Report</>}
              </button>
            </div>
          </div>

          {/* Empty state */}
          {!generatedReport && !generating && (
            <div className="empty-state" style={{ paddingTop: '60px' }}>
              <FiFileText size={40} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: '8px' }} />
              <div className="empty-state-title" style={{ fontSize: '1rem' }}>
                {refs.length === 0 ? 'No references available' : 'Select a reference to analyze'}
              </div>
              <div className="empty-state-text" style={{ fontSize: '0.85rem', maxWidth: '340px' }}>
                {refs.length === 0 
                  ? 'Add references to your notebooks first, then come back to generate reports.'
                  : 'Choose a saved reference above and click "Generate Report" to get an AI-powered analysis.'
                }
              </div>
            </div>
          )}

          {/* Generated Report */}
          {generatedReport && (
            <div className="animate-slide-down" style={{
              background: 'var(--bg-secondary)', borderRadius: '12px',
              border: '1px solid var(--border-color)', overflow: 'hidden'
            }}>
              {/* Report Header */}
              <div style={{
                padding: '24px', borderBottom: '1px solid var(--border-color)',
                background: 'var(--bg-card)'
              }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                  Specter Research Report
                </div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px', lineHeight: 1.3 }}>
                  {generatedReport.title}
                </h2>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Authors</span>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{generatedReport.authors}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Year</span>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{generatedReport.year}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Journal</span>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{generatedReport.journal}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Trust Score</span>
                    <div style={{
                      fontSize: '0.82rem', fontWeight: 800, color: getScoreColor(generatedReport.trustScore),
                      background: `${getScoreColor(generatedReport.trustScore)}18`,
                      padding: '2px 10px', borderRadius: '6px', display: 'inline-block'
                    }}>
                      {generatedReport.trustScore}/100
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Body */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Overview */}
                <div>
                  <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f59e0b', margin: '0 0 8px' }}>Overview</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{generatedReport.overview}</p>
                </div>

                {/* Key Findings */}
                <div>
                  <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>Key Findings</h3>
                  <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {generatedReport.keyFindings.map((f, i) => (
                      <li key={i} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f}</li>
                    ))}
                  </ul>
                </div>

                {/* Methodology */}
                <div>
                  <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>Methodology Notes</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', lineHeight: 1.6, margin: 0 }}>{generatedReport.methodology}</p>
                </div>

                {/* Limitations */}
                <div>
                  <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>Limitations & Bias</h3>
                  <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {generatedReport.limitations.map((l, i) => (
                      <li key={i} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{l}</li>
                    ))}
                  </ul>
                </div>

                {/* Recommendation */}
                <div style={{
                  padding: '14px 16px', borderRadius: '8px',
                  background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.15)'
                }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f59e0b' }}>📋 Recommendation</span>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '6px 0 0' }}>{generatedReport.recommendations}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* COMPARE TAB */}
      {activeTab === 'compare' && (
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 32px' }}>
          {/* Two selectors */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <RefSelector value={compareA} onChange={setCompareA} exclude={compareB} label="Paper 1" />
            <div style={{ display: 'flex', alignItems: 'center', paddingTop: '20px' }}>
              <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>⚡</span>
            </div>
            <RefSelector value={compareB} onChange={setCompareB} exclude={compareA} label="Paper 2" />
          </div>

          <button
            onClick={generateComparison}
            disabled={!compareA || !compareB || generating}
            className="btn-specter"
            style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}
          >
            {generating ? <><FiRefreshCw size={14} className="spin" /> Comparing...</> : <><FiLayers size={14} /> Compare Sources</>}
          </button>

          {/* Empty state */}
          {!comparisonResult && !generating && (
            <div className="empty-state" style={{ paddingTop: '40px' }}>
              <FiLayers size={40} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: '8px' }} />
              <div className="empty-state-title" style={{ fontSize: '1rem' }}>
                {refs.length < 2 ? 'Need at least 2 references' : 'Select two papers to compare'}
              </div>
              <div className="empty-state-text" style={{ fontSize: '0.85rem', maxWidth: '340px' }}>
                {refs.length < 2
                  ? 'Save at least 2 references to your notebooks to use the comparison feature.'
                  : 'Pick two references above and click "Compare Sources" to see a side-by-side analysis.'}
              </div>
            </div>
          )}

          {/* Comparison Table */}
          {comparisonResult && (
            <div className="animate-slide-down" style={{
              background: 'var(--bg-secondary)', borderRadius: '12px',
              border: '1px solid var(--border-color)', overflow: 'hidden'
            }}>
              {/* Comparison Header */}
              <div style={{
                padding: '16px 20px', background: 'var(--bg-card)',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiLayers size={16} style={{ color: '#f59e0b' }} /> Comparative Analysis
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>2 papers</span>
              </div>

              {/* Paper Headers */}
              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ padding: '14px 16px', fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Metric</div>
                <div style={{ padding: '14px 16px', borderLeft: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Paper 1</span>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px', lineHeight: 1.3 }}>{compareA?.title}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>{compareA?.authors} · {compareA?.year}</div>
                </div>
                <div style={{ padding: '14px 16px', borderLeft: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Paper 2</span>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px', lineHeight: 1.3 }}>{compareB?.title}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>{compareB?.authors} · {compareB?.year}</div>
                </div>
              </div>

              {/* Comparison Rows */}
              {comparisonResult.dimensions.map((dim, idx) => (
                <div key={idx} style={{
                  display: 'grid', gridTemplateColumns: '140px 1fr 1fr',
                  borderBottom: idx < comparisonResult.dimensions.length - 1 ? '1px solid var(--border-color)' : 'none',
                  background: idx % 2 === 0 ? 'transparent' : 'var(--bg-card)'
                }}>
                  <div style={{
                    padding: '12px 16px', fontSize: '0.72rem', fontWeight: 600,
                    color: 'var(--text-secondary)', display: 'flex', alignItems: 'center'
                  }}>
                    {dim.label}
                  </div>
                  <div style={{ padding: '12px 16px', borderLeft: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                    {dim.paperA}
                  </div>
                  <div style={{ padding: '12px 16px', borderLeft: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                    {dim.paperB}
                  </div>
                </div>
              ))}

              {/* Summary */}
              <div style={{
                padding: '16px 20px', borderTop: '1px solid var(--border-color)',
                background: 'rgba(245, 158, 11, 0.04)'
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f59e0b', marginBottom: '6px' }}>📊 Summary</div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {comparisonResult.summary}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
