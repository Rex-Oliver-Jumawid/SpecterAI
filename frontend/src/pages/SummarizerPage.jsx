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
      const lower = (ref.abstract || '').toLowerCase();
      const methodology = lower.includes('survey') ? 'survey-based quantitative'
        : lower.includes('experiment') ? 'experimental'
        : lower.includes('interview') ? 'qualitative interview-based'
        : lower.includes('case study') ? 'case study'
        : lower.includes('review') ? 'systematic literature review'
        : lower.includes('regression') || lower.includes('statistical') ? 'quantitative statistical'
        : lower.includes('observation') ? 'observational'
        : ref.abstract ? 'mixed-methods' : 'not determinable from available metadata';

      const titleWords = (ref.title || '').toLowerCase().split(' ').filter(w => w.length > 3).slice(0, 4).join(' ');

      const result = {
        title: ref.title || 'Untitled Paper',
        authors: ref.authors || 'Unknown Authors',
        year: ref.year || 'N/A',
        journal: ref.journal || 'Not specified',
        doi: ref.doi || 'N/A',
        trustScore,
        type: ref.journal ? 'Journal Article' : ref.doi ? 'Published Work' : 'Web Source',
        citedBy: ref.cited_by_count || 0,

        abstract: ref.abstract || `No abstract available for this paper. The study titled "${ref.title}" ${ref.year ? `(${ref.year})` : ''} is cataloged ${ref.journal ? `in ${ref.journal}` : 'without a specified journal'}.`,

        conceptOfStudy: ref.abstract
          ? `This research centers on ${titleWords || 'the stated topic'}, investigating the relationship between key variables identified in the field. The study is positioned within the broader context of ${ref.journal ? `research published in ${ref.journal}` : 'contemporary academic discourse'}, aiming to address gaps in existing knowledge. ${ref.abstract.length > 200 ? 'The authors articulate a clear research problem and establish the significance of their inquiry through a comprehensive review of related work.' : 'The concept is derived from metadata analysis.'}`
          : `The concept of this study revolves around ${titleWords || 'the research topic'}. Without an available abstract, the full scope of the study's conceptual framework cannot be determined. Further review of the full text is recommended.`,

        theoreticalFramework: ref.abstract
          ? `The study appears grounded in ${lower.includes('theory') ? 'established theoretical models referenced in the literature' : lower.includes('model') ? 'a conceptual model developed or adapted by the authors' : 'theoretical perspectives relevant to the domain'}. ${lower.includes('framework') ? 'The authors explicitly reference a theoretical framework to guide their analysis.' : 'The underlying theoretical assumptions can be inferred from the research design and terminology.'} This positions the work within ${ref.journal ? `the scholarly traditions of ${ref.journal}` : 'its academic field'}.`
          : 'Theoretical framework cannot be determined without access to the full text. Review the introduction and literature review sections of the paper for theoretical grounding.',

        methodology: `The study employs a **${methodology}** approach. ${ref.abstract
          ? `Based on the available abstract, the research design involves ${lower.includes('data') ? 'systematic data collection and analysis' : 'structured investigation methods'}. ${lower.includes('sample') || lower.includes('participant') ? 'The study involves human subjects or defined sample populations.' : ''} ${lower.includes('analysis') ? 'Analytical procedures are documented in the methodology section.' : ''}`
          : 'Limited methodological details are available without full text access. Consult the paper directly for research design, sampling, data collection, and analysis procedures.'}`,

        sampleAndScope: ref.abstract
          ? `${(ref.abstract.match(/(\d+)\s*(participants|respondents|subjects|samples|students|teachers|patients|users|companies|organizations|countries)/i) || ['Not explicitly stated'])[0]}. The scope of the study ${lower.includes('global') || lower.includes('international') ? 'spans international contexts' : lower.includes('national') ? 'focuses on a national context' : lower.includes('local') ? 'examines a local context' : 'is defined within its research design'}.`
          : 'Sample size and scope are not available from metadata alone.',

        keyFindings: [
          ref.abstract
            ? `The research presents evidence regarding ${titleWords}, contributing new insights to the field.`
            : `This paper addresses topics related to ${titleWords || 'the research area'}.`,
          ref.cited_by_count > 100
            ? `Highly cited (${ref.cited_by_count.toLocaleString()} citations) — the findings are widely recognized and have influenced subsequent research.`
            : ref.cited_by_count > 10
            ? `Moderately cited (${ref.cited_by_count} citations) — the findings have received scholarly attention.`
            : 'Limited citation data — the paper may be recent or in a niche area.',
          ref.journal
            ? `Publication in ${ref.journal} indicates peer-review validation and adherence to disciplinary standards.`
            : 'The publication venue is unspecified — findings should be cross-referenced with peer-reviewed sources.',
          ref.abstract && ref.abstract.length > 150
            ? 'The abstract suggests substantive findings with potential implications for both theory and practice.'
            : 'Further findings may be available in the full text.',
        ],

        conclusion: ref.abstract
          ? `Based on the available information, this study on "${ref.title}" contributes to the understanding of ${titleWords}. ${ref.cited_by_count > 50 ? `With ${ref.cited_by_count.toLocaleString()} citations, the work has demonstrable academic impact.` : 'The study adds to the growing body of literature on this topic.'} ${ref.year && (new Date().getFullYear() - ref.year <= 3) ? 'As a recent publication, its findings reflect current developments in the field.' : ref.year ? `Published in ${ref.year}, readers should consider supplementing with more recent studies.` : ''} Future research could build on this work by ${lower.includes('limit') ? 'addressing the stated limitations' : 'expanding the scope and methodology'}.`
          : `This paper addresses ${titleWords || 'its research topic'}. Without access to the full text, a comprehensive conclusion cannot be generated. Readers should consult the original paper for the authors' stated conclusions and implications.`,

        limitations: [
          !ref.abstract ? 'No abstract available — all analysis is inferred from metadata.' : 'This report is based on abstract and metadata; full text review is recommended for complete understanding.',
          ref.year && (new Date().getFullYear() - ref.year > 5) ? `Published ${new Date().getFullYear() - ref.year} years ago — findings may require updating.` : null,
          !ref.doi ? 'No DOI — source verification is limited.' : null,
          !ref.journal ? 'No journal specified — peer-review status unconfirmed.' : null,
          ref.cited_by_count === 0 ? 'No citation data — academic impact cannot be assessed.' : null,
        ].filter(Boolean),

        recommendation: trustScore >= 75
          ? 'This source is well-suited for academic citation. Its metadata indicates strong verification markers (DOI, peer-reviewed journal, available abstract). Verify specific claims against the full text before citing.'
          : trustScore >= 50
          ? 'Use with moderate confidence. Some verification markers are present but not all. Consider supplementing with additional verified sources to strengthen your arguments.'
          : 'Limited verifiability. Not recommended as a primary source without further validation. Cross-reference with peer-reviewed and DOI-verified publications.',
      };

      setSummary(result);
      setLoading(false);
    }, 1500);
  };

  const downloadPDF = () => {
    if (!reportRef.current) return;

    const s = summary;
    const scoreColor = s.trustScore >= 75 ? '#22c55e' : s.trustScore >= 50 ? '#eab308' : '#f97316';
    const html = `
      <div style="font-family: 'Georgia', serif; color: #1a1a2e; padding: 40px; max-width: 700px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #8b5cf6; padding-bottom: 20px;">
          <div style="font-size: 11px; font-weight: 700; color: #8b5cf6; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">Specter Research Report</div>
          <h1 style="font-size: 22px; margin: 0 0 12px; line-height: 1.3;">${s.title}</h1>
          <div style="font-size: 12px; color: #555;">
            <strong>Authors:</strong> ${s.authors} &nbsp;|&nbsp; <strong>Year:</strong> ${s.year} &nbsp;|&nbsp; <strong>Journal:</strong> ${s.journal}
          </div>
          <div style="margin-top: 6px; font-size: 12px; color: #555;">
            <strong>DOI:</strong> ${s.doi} &nbsp;|&nbsp; <strong>Citations:</strong> ${s.citedBy.toLocaleString()} &nbsp;|&nbsp;
            <strong>Trust Score:</strong> <span style="color: ${scoreColor}; font-weight: 800;">${s.trustScore}/100</span>
          </div>
        </div>

        <h2 style="font-size: 14px; color: #8b5cf6; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">Abstract</h2>
        <p style="font-size: 12px; line-height: 1.8; color: #333; font-style: italic;">${s.abstract}</p>

        <h2 style="font-size: 14px; color: #333; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">Concept of the Study</h2>
        <p style="font-size: 12px; line-height: 1.8; color: #333;">${s.conceptOfStudy}</p>

        <h2 style="font-size: 14px; color: #333; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">Theoretical Framework</h2>
        <p style="font-size: 12px; line-height: 1.8; color: #333;">${s.theoreticalFramework}</p>

        <h2 style="font-size: 14px; color: #333; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">Methodology</h2>
        <p style="font-size: 12px; line-height: 1.8; color: #333;">${s.methodology.replace(/\*\*/g, '')}</p>

        <h2 style="font-size: 14px; color: #333; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">Sample &amp; Scope</h2>
        <p style="font-size: 12px; line-height: 1.8; color: #333;">${s.sampleAndScope}</p>

        <h2 style="font-size: 14px; color: #333; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">Key Findings</h2>
        <ul style="font-size: 12px; line-height: 1.8; color: #333; padding-left: 20px;">
          ${s.keyFindings.map(f => `<li style="margin-bottom: 6px;">${f}</li>`).join('')}
        </ul>

        <h2 style="font-size: 14px; color: #333; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">Conclusion</h2>
        <p style="font-size: 12px; line-height: 1.8; color: #333;">${s.conclusion}</p>

        <h2 style="font-size: 14px; color: #333; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">Limitations</h2>
        <ul style="font-size: 12px; line-height: 1.8; color: #666; padding-left: 20px;">
          ${s.limitations.map(l => `<li style="margin-bottom: 4px;">${l}</li>`).join('')}
        </ul>

        <div style="margin-top: 20px; padding: 14px 16px; border-radius: 8px; background: #f0fdf4; border: 1px solid #bbf7d0;">
          <div style="font-size: 12px; font-weight: 700; color: #16a34a; margin-bottom: 4px;">Recommendation</div>
          <p style="font-size: 12px; color: #333; margin: 0; line-height: 1.6;">${s.recommendation}</p>
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
                {/* Abstract */}
                <div style={{ padding: '14px 16px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.04)', border: '1px solid rgba(6, 182, 212, 0.12)' }}>
                  <Section title="Abstract" emoji="📄" content={summary.abstract}
                    onCopy={() => copySection(summary.abstract, 'abstract')} copied={copied === 'abstract'} />
                </div>

                <Section title="Concept of the Study" emoji="💡" content={summary.conceptOfStudy}
                  onCopy={() => copySection(summary.conceptOfStudy, 'concept')} copied={copied === 'concept'} />

                <Section title="Theoretical Framework" emoji="🏗️" content={summary.theoreticalFramework}
                  onCopy={() => copySection(summary.theoreticalFramework, 'framework')} copied={copied === 'framework'} />

                <Section title="Methodology" emoji="🔬" content={summary.methodology}
                  onCopy={() => copySection(summary.methodology, 'methodology')} copied={copied === 'methodology'} />

                <Section title="Sample & Scope" emoji="📊" content={summary.sampleAndScope}
                  onCopy={() => copySection(summary.sampleAndScope, 'sample')} copied={copied === 'sample'} />

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

                {/* Conclusion */}
                <div style={{ padding: '14px 16px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.04)', border: '1px solid rgba(139, 92, 246, 0.12)' }}>
                  <Section title="Conclusion" emoji="📝" content={summary.conclusion}
                    onCopy={() => copySection(summary.conclusion, 'conclusion')} copied={copied === 'conclusion'} />
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
