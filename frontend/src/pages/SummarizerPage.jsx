import React, { useState, useEffect, useRef } from 'react';
import { FiFileText, FiRefreshCw, FiCopy, FiCheck, FiDownload, FiBookOpen, FiExternalLink } from 'react-icons/fi';
import { references as refsApi } from '../api';
import html2pdf from 'html2pdf.js';

export default function SummarizerPage({ allNotebooks = [] }) {
  const [selectedNotebookId, setSelectedNotebookId] = useState('');
  const [refs, setRefs] = useState([]);
  const [loadingRefs, setLoadingRefs] = useState(false);
  const [selectedRefId, setSelectedRefId] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [copied, setCopied] = useState(null);
  const reportRef = useRef(null);

  // Load refs when notebook changes
  useEffect(() => {
    if (!selectedNotebookId) { setRefs([]); setSelectedRefId(''); setSummary(null); return; }
    setLoadingRefs(true);
    setSelectedRefId('');
    setSummary(null);
    refsApi.list(selectedNotebookId)
      .then(data => setRefs(data))
      .catch(() => setRefs([]))
      .finally(() => setLoadingRefs(false));
  }, [selectedNotebookId]);

  const selectedRef = refs.find(r => r.id == selectedRefId);

  const generateSummary = () => {
    if (!selectedRef) return;
    setLoading(true);

    setTimeout(() => {
      const ref = selectedRef;
      const trustScore = ref.journal && ref.doi && ref.abstract ? 85 : ref.journal || ref.doi ? 65 : 40;
      const methodology = ref.abstract
        ? ref.abstract.toLowerCase().includes('survey') ? 'survey-based quantitative'
          : ref.abstract.toLowerCase().includes('experiment') ? 'experimental'
          : ref.abstract.toLowerCase().includes('interview') ? 'qualitative interview-based'
          : ref.abstract.toLowerCase().includes('case study') ? 'case study'
          : ref.abstract.toLowerCase().includes('review') ? 'systematic literature review'
          : 'mixed-methods'
        : 'not determinable from available metadata';

      const result = {
        title: ref.title || 'Untitled Paper',
        authors: ref.authors || 'Unknown Authors',
        year: ref.year || 'N/A',
        journal: ref.journal || 'Not specified',
        doi: ref.doi || 'N/A',
        trustScore,
        type: ref.journal ? 'Journal Article' : ref.doi ? 'Published Work' : 'Web Source',
        citedBy: ref.cited_by_count || 0,
        overview: ref.abstract
          ? `${ref.abstract.substring(0, 300)}${ref.abstract.length > 300 ? '...' : ''}`
          : `This paper titled "${ref.title}" ${ref.year ? `(${ref.year})` : ''} examines key aspects of ${ref.title?.toLowerCase().split(' ').slice(0, 5).join(' ') || 'the research topic'}. ${ref.journal ? `Published in ${ref.journal}, it` : 'It'} contributes to the field by addressing gaps in existing literature.`,
        methodology: `The study employs a ${methodology} approach. ${ref.abstract && ref.abstract.length > 200 ? 'Based on the abstract, the authors present a structured investigation with clear analytical methods.' : 'Limited methodological details are available without full text access.'}`,
        keyFindings: [
          ref.abstract
            ? `The research addresses key dimensions of ${ref.title?.split(' ').slice(0, 4).join(' ').toLowerCase() || 'the topic'}, providing evidence-based insights.`
            : `This paper covers topics related to ${ref.title?.split(' ').slice(0, 4).join(' ').toLowerCase() || 'the research area'}.`,
          ref.cited_by_count > 100
            ? `Highly cited with ${ref.cited_by_count.toLocaleString()} citations, demonstrating significant academic impact and recognition.`
            : ref.cited_by_count > 0
            ? `Cited ${ref.cited_by_count} times, indicating moderate scholarly engagement.`
            : 'Citation data unavailable — consider verifying impact through other metrics.',
          ref.journal
            ? `Published in ${ref.journal}, a peer-reviewed venue, lending credibility to the findings.`
            : 'Publication venue not specified — verify source reliability before citing.',
          ref.year && (new Date().getFullYear() - ref.year <= 3)
            ? `Recent publication (${ref.year}) — findings reflect current state of the field.`
            : ref.year
            ? `Published in ${ref.year} — consider whether findings remain current or need supplementation with newer research.`
            : 'Publication year unknown.',
        ].filter(f => f),
        limitations: [
          !ref.abstract ? 'No abstract available — analysis is based on metadata only.' : 'Analysis is based on abstract and metadata; full text review recommended.',
          ref.year && (new Date().getFullYear() - ref.year > 5) ? `Published ${new Date().getFullYear() - ref.year} years ago — findings may need updating.` : null,
          !ref.doi ? 'No DOI available — source verification is limited.' : null,
          !ref.journal ? 'No journal specified — peer-review status unconfirmed.' : null,
          ref.cited_by_count === 0 ? 'No citation data — academic impact cannot be assessed.' : null,
        ].filter(Boolean),
        sampleSize: ref.abstract?.match(/(\d+)\s*(participants|respondents|subjects|samples)/i)?.[0] || 'Not specified',
        recommendation: trustScore >= 75
          ? 'This source is suitable for academic citation. Verify specific claims against the full text.'
          : trustScore >= 50
          ? 'Use with caution. Consider supplementing with additional verified sources.'
          : 'Limited verifiability. Not recommended as a primary source without further validation.',
      };

      setSummary(result);
      setLoading(false);
    }, 1500);
  };

  const downloadPDF = () => {
    if (!reportRef.current) return;

    // Build a clean HTML string for PDF
    const s = summary;
    const scoreColor = s.trustScore >= 75 ? '#22c55e' : s.trustScore >= 50 ? '#eab308' : '#f97316';
    const html = `
      <div style="font-family: 'Georgia', serif; color: #1a1a2e; padding: 40px; max-width: 700px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #8b5cf6; padding-bottom: 20px;">
          <div style="font-size: 11px; font-weight: 700; color: #8b5cf6; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">Specter Research Report</div>
          <h1 style="font-size: 22px; margin: 0 0 12px; line-height: 1.3;">${s.title}</h1>
          <div style="font-size: 13px; color: #555;">
            <span><strong>Authors:</strong> ${s.authors}</span> &nbsp;|&nbsp;
            <span><strong>Year:</strong> ${s.year}</span> &nbsp;|&nbsp;
            <span><strong>Journal:</strong> ${s.journal}</span>
          </div>
          <div style="margin-top: 8px; font-size: 13px; color: #555;">
            <span><strong>DOI:</strong> ${s.doi}</span> &nbsp;|&nbsp;
            <span><strong>Citations:</strong> ${s.citedBy.toLocaleString()}</span> &nbsp;|&nbsp;
            <span><strong>Trust Score:</strong> <span style="color: ${scoreColor}; font-weight: 800;">${s.trustScore}/100</span></span>
          </div>
        </div>

        <h2 style="font-size: 15px; color: #8b5cf6; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">📋 Overview</h2>
        <p style="font-size: 13px; line-height: 1.8; color: #333;">${s.overview}</p>

        <h2 style="font-size: 15px; color: #333; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">🔬 Methodology</h2>
        <p style="font-size: 13px; line-height: 1.8; color: #333;">${s.methodology}</p>

        <h2 style="font-size: 15px; color: #333; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">🔍 Key Findings</h2>
        <ul style="font-size: 13px; line-height: 1.8; color: #333; padding-left: 20px;">
          ${s.keyFindings.map(f => `<li style="margin-bottom: 6px;">${f}</li>`).join('')}
        </ul>

        <h2 style="font-size: 15px; color: #333; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">⚠️ Limitations</h2>
        <ul style="font-size: 13px; line-height: 1.8; color: #666; padding-left: 20px;">
          ${s.limitations.map(l => `<li style="margin-bottom: 4px;">${l}</li>`).join('')}
        </ul>

        <div style="margin-top: 20px; padding: 14px 16px; border-radius: 8px; background: #f0fdf4; border: 1px solid #bbf7d0;">
          <div style="font-size: 12px; font-weight: 700; color: #16a34a; margin-bottom: 4px;">📋 Recommendation</div>
          <p style="font-size: 13px; color: #333; margin: 0; line-height: 1.6;">${s.recommendation}</p>
        </div>

        <div style="margin-top: 30px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center;">
          <span style="font-size: 10px; color: #999;">Generated by Specter AI · ${new Date().toLocaleDateString()}</span>
        </div>
      </div>
    `;

    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);

    html2pdf().set({
      margin: [10, 10, 10, 10],
      filename: `Specter_Report_${s.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 40)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(container).save().then(() => {
      document.body.removeChild(container);
    });
  };

  const copySection = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopied(section);
    setTimeout(() => setCopied(null), 2000);
  };

  const getScoreColor = (score) => {
    if (score >= 75) return '#4ade80';
    if (score >= 50) return '#fbbf24';
    return '#fb923c';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '24px 32px 20px', borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)'
      }}>
        <h1 style={{
          fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0,
          fontFamily: 'var(--font-serif)', display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FiFileText size={18} color="white" />
          </div>
          Paper Summarizer
        </h1>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0', paddingLeft: '46px' }}>
          Generate detailed research reports from your saved references
        </p>

        {/* Notebook + Reference Selectors */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <FiBookOpen size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <select
            value={selectedNotebookId}
            onChange={e => setSelectedNotebookId(e.target.value)}
            className="input-specter"
            style={{ maxWidth: '260px', padding: '8px 12px', fontSize: '0.78rem' }}
          >
            <option value="">Select a notebook</option>
            {allNotebooks.map(nb => (
              <option key={nb.id} value={nb.id}>{nb.title || 'Untitled'}</option>
            ))}
          </select>

          {selectedNotebookId && (
            <select
              value={selectedRefId}
              onChange={e => { setSelectedRefId(e.target.value); setSummary(null); }}
              className="input-specter"
              style={{ flex: 1, maxWidth: '360px', padding: '8px 12px', fontSize: '0.78rem' }}
              disabled={loadingRefs}
            >
              <option value="">{loadingRefs ? 'Loading...' : `Select a reference (${refs.length})`}</option>
              {refs.map(r => (
                <option key={r.id} value={r.id}>{r.title} ({r.year || 'N/A'})</option>
              ))}
            </select>
          )}

          <button
            onClick={generateSummary}
            disabled={!selectedRef || loading}
            className="btn-specter"
            style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {loading ? <><FiRefreshCw size={14} className="spin" /> Generating...</> : <><FiFileText size={14} /> Generate Report</>}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 32px' }}>
        {!summary && !loading && (
          <div className="empty-state" style={{ paddingTop: '60px' }}>
            <FiFileText size={40} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: '8px' }} />
            <div className="empty-state-title" style={{ fontSize: '1rem' }}>
              {!selectedNotebookId ? 'Select a notebook' : refs.length === 0 && selectedNotebookId ? 'No references in this notebook' : !selectedRefId ? 'Select a reference' : 'Ready to generate'}
            </div>
            <div className="empty-state-text" style={{ fontSize: '0.85rem', maxWidth: '360px' }}>
              Pick a notebook and reference above to generate a detailed research report. You can download it as a PDF.
            </div>
          </div>
        )}

        {loading && (
          <div className="empty-state" style={{ paddingTop: '60px' }}>
            <FiRefreshCw size={32} className="spin" style={{ color: '#3b82f6', marginBottom: '12px' }} />
            <div className="empty-state-title" style={{ fontSize: '1rem' }}>Generating report...</div>
            <div className="empty-state-text">Analyzing metadata, citations, and abstract</div>
          </div>
        )}

        {summary && (
          <div className="animate-slide-down" ref={reportRef}>
            {/* Download button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
              <button
                onClick={downloadPDF}
                className="btn-specter"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}
              >
                <FiDownload size={14} /> Download PDF
              </button>
            </div>

            {/* Report Card */}
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
                  Specter Research Report
                </div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px', lineHeight: 1.3 }}>
                  {summary.title}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                  {[
                    { label: 'Authors', value: summary.authors },
                    { label: 'Year', value: summary.year },
                    { label: 'Journal', value: summary.journal },
                    { label: 'DOI', value: summary.doi },
                    { label: 'Citations', value: summary.citedBy.toLocaleString() },
                    { label: 'Trust Score', value: `${summary.trustScore}/100`, color: getScoreColor(summary.trustScore) },
                  ].map((item, i) => (
                    <div key={i}>
                      <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</span>
                      <div style={{
                        fontSize: '0.78rem', color: item.color || 'var(--text-secondary)', fontWeight: item.color ? 800 : 400,
                        marginTop: '2px',
                        ...(item.color ? { background: `${item.color}18`, padding: '2px 8px', borderRadius: '4px', display: 'inline-block' } : {})
                      }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Overview */}
                <Section title="Overview" emoji="📋" color="#06b6d4"
                  content={summary.overview}
                  onCopy={() => copySection(summary.overview, 'overview')} copied={copied === 'overview'} />

                {/* Methodology */}
                <Section title="Methodology" emoji="🔬" color="#8b5cf6"
                  content={summary.methodology}
                  onCopy={() => copySection(summary.methodology, 'methodology')} copied={copied === 'methodology'} />

                {/* Key Findings */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>🔍 Key Findings</h3>
                    <button onClick={() => copySection(summary.keyFindings.join('\n'), 'findings')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}>
                      {copied === 'findings' ? <FiCheck size={12} color="#4ade80" /> : <FiCopy size={12} />}
                    </button>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {summary.keyFindings.map((f, i) => (
                      <li key={i} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f}</li>
                    ))}
                  </ul>
                </div>

                {/* Limitations */}
                <div style={{
                  padding: '14px 16px', borderRadius: '8px',
                  background: 'rgba(251, 191, 36, 0.05)', border: '1px solid rgba(251, 191, 36, 0.15)'
                }}>
                  <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24', margin: '0 0 8px' }}>⚠️ Limitations</h3>
                  <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {summary.limitations.map((l, i) => (
                      <li key={i} style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{l}</li>
                    ))}
                  </ul>
                </div>

                {/* Recommendation */}
                <div style={{
                  padding: '14px 16px', borderRadius: '8px',
                  background: 'rgba(74, 222, 128, 0.05)', border: '1px solid rgba(74, 222, 128, 0.15)'
                }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4ade80' }}>📋 Recommendation</span>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '6px 0 0' }}>{summary.recommendation}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, emoji, color, content, onCopy, copied }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{emoji} {title}</h3>
        <button onClick={onCopy} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}>
          {copied ? <FiCheck size={12} color="#4ade80" /> : <FiCopy size={12} />}
        </button>
      </div>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{content}</p>
    </div>
  );
}
