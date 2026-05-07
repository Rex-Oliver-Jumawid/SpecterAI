import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiGrid, FiFileText, FiBookOpen, FiClipboard, FiFeather, FiArrowRight, FiCheck } from 'react-icons/fi';

const TEMPLATES = [
  {
    id: 'apa-research',
    title: 'APA Research Paper',
    icon: <FiFileText size={24} />,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    category: 'Research',
    description: 'Standard APA 7th edition research paper with all required sections.',
    sections: ['Abstract', 'Introduction', 'Literature Review', 'Methodology', 'Results', 'Discussion', 'Conclusion', 'References'],
    content: `<h1>Title of Your Research Paper</h1>
<h2>Abstract</h2>
<p>Provide a brief summary of your research paper, including the purpose, methodology, key findings, and conclusions. The abstract should be between 150–250 words and written as a single paragraph without indentation.</p>

<h2>Introduction</h2>
<p>Introduce your research topic and provide background context. State the research problem, explain its significance, and present your research questions or hypotheses. End the introduction with a brief overview of the paper's structure.</p>

<h2>Literature Review</h2>
<p>Synthesize existing research related to your topic. Organize the review thematically, chronologically, or methodologically. Identify gaps in the literature that your research aims to address.</p>

<h2>Methodology</h2>
<h3>Research Design</h3>
<p>Describe your research approach (qualitative, quantitative, or mixed methods).</p>
<h3>Participants</h3>
<p>Describe your sample population, sampling method, and sample size.</p>
<h3>Data Collection</h3>
<p>Explain the instruments, procedures, and timeline used for data collection.</p>
<h3>Data Analysis</h3>
<p>Describe the statistical or analytical methods used to analyze the data.</p>

<h2>Results</h2>
<p>Present your findings objectively without interpretation. Use tables and figures where appropriate. Report statistical results with effect sizes and confidence intervals.</p>

<h2>Discussion</h2>
<p>Interpret your findings in relation to your research questions and existing literature. Discuss the implications, limitations, and suggestions for future research.</p>

<h2>Conclusion</h2>
<p>Summarize the key findings and their implications. Restate the significance of your research and its contributions to the field.</p>

<h2>References</h2>
<p>List all sources cited in the paper following APA 7th edition formatting guidelines.</p>`
  },
  {
    id: 'literature-review',
    title: 'Literature Review',
    icon: <FiBookOpen size={24} />,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
    category: 'Review',
    description: 'Comprehensive literature review with thematic organization.',
    sections: ['Introduction', 'Search Strategy', 'Thematic Analysis', 'Critical Evaluation', 'Gaps & Future Directions', 'Conclusion'],
    content: `<h1>Literature Review: [Your Topic]</h1>
<h2>Introduction</h2>
<p>Define the scope and objectives of this literature review. Explain the significance of the topic and the criteria used for selecting sources. State the key themes or questions guiding this review.</p>

<h2>Search Strategy</h2>
<p>Describe the databases searched (e.g., PubMed, Scopus, Google Scholar), keywords used, inclusion/exclusion criteria, and the time frame of publications reviewed.</p>

<h2>Theme 1: [First Major Theme]</h2>
<p>Synthesize findings from multiple sources related to this theme. Compare and contrast different perspectives, methodologies, and findings. Identify areas of agreement and disagreement among researchers.</p>

<h2>Theme 2: [Second Major Theme]</h2>
<p>Continue the thematic analysis with the next major area of research. Draw connections between this theme and the previous one where applicable.</p>

<h2>Theme 3: [Third Major Theme]</h2>
<p>Explore additional dimensions of the topic. Highlight emerging trends and recent developments in this area of study.</p>

<h2>Critical Evaluation</h2>
<p>Assess the overall quality of the literature. Discuss methodological strengths and weaknesses across studies. Evaluate the reliability and validity of findings.</p>

<h2>Gaps and Future Directions</h2>
<p>Identify specific gaps in the current literature. Suggest areas where further research is needed. Propose potential research questions for future investigation.</p>

<h2>Conclusion</h2>
<p>Summarize the key findings from the literature review. Highlight the most significant contributions to the field and the most pressing areas for future research.</p>

<h2>References</h2>
<p>List all sources reviewed in proper citation format.</p>`
  },
  {
    id: 'lab-report',
    title: 'Lab Report',
    icon: <FiClipboard size={24} />,
    color: '#22d3ee',
    gradient: 'linear-gradient(135deg, #22d3ee, #06b6d4)',
    category: 'Science',
    description: 'Scientific lab report following standard experimental format.',
    sections: ['Title & Abstract', 'Introduction', 'Materials & Methods', 'Results', 'Discussion', 'Conclusion'],
    content: `<h1>Lab Report: [Experiment Title]</h1>
<p><strong>Course:</strong> [Course Name] | <strong>Date:</strong> [Date] | <strong>Instructor:</strong> [Name]</p>

<h2>Abstract</h2>
<p>Write a 100–200 word summary of the experiment, including the purpose, methods, key results, and conclusions.</p>

<h2>Introduction</h2>
<p>Provide background information on the scientific principles being tested. State the purpose of the experiment and present your hypothesis. Explain the theoretical basis and any relevant equations or models.</p>
<p><strong>Hypothesis:</strong> [State your testable prediction here]</p>

<h2>Materials and Methods</h2>
<h3>Materials</h3>
<ul>
<li>List all equipment and materials used</li>
<li>Include quantities and specifications where relevant</li>
<li>Note any safety precautions required</li>
</ul>
<h3>Procedure</h3>
<ol>
<li>Describe each step of the experimental procedure in sequential order.</li>
<li>Include enough detail for the experiment to be replicated.</li>
<li>Note any modifications made to the standard procedure.</li>
</ol>

<h2>Results</h2>
<p>Present your data clearly using tables, graphs, and figures. Include raw data and any calculated values. Report observations made during the experiment. Do not interpret the results in this section.</p>
<p><strong>Table 1:</strong> [Describe your data table here]</p>

<h2>Discussion</h2>
<p>Interpret your results in relation to your hypothesis. Explain whether the hypothesis was supported or rejected. Discuss sources of error and their potential impact on results. Compare your findings with expected or published values. Suggest improvements for future experiments.</p>

<h2>Conclusion</h2>
<p>Briefly summarize the key findings. State whether the hypothesis was confirmed or refuted. Note the significance of the results and any practical applications.</p>

<h2>References</h2>
<p>List all sources cited, including textbooks, lab manuals, and published papers.</p>`
  },
  {
    id: 'thesis-chapter',
    title: 'Thesis Chapter',
    icon: <FiFeather size={24} />,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    category: 'Thesis',
    description: 'Single thesis chapter with proper academic structure and depth.',
    sections: ['Chapter Overview', 'Background', 'Theoretical Framework', 'Core Argument', 'Evidence & Analysis', 'Chapter Summary'],
    content: `<h1>Chapter [N]: [Chapter Title]</h1>
<h2>Chapter Overview</h2>
<p>Begin with a brief overview of what this chapter covers. State the chapter's objectives, its relationship to the overall thesis, and the key arguments that will be developed. Provide a roadmap of the sections to follow.</p>

<h2>Background and Context</h2>
<p>Establish the necessary background for understanding the chapter's arguments. Draw on relevant literature and previous chapters to build a foundation. Define key terms and concepts that will be used throughout.</p>

<h2>Theoretical Framework</h2>
<p>Present the theoretical lens through which you analyze your topic. Explain why this framework is appropriate for your research. Discuss how the framework has been applied in similar studies and how your application differs or extends existing approaches.</p>

<h2>Core Argument</h2>
<p>Develop your central argument for this chapter. Build your case logically, moving from premises to conclusions. Address potential counterarguments and explain why your position is stronger.</p>

<h2>Evidence and Analysis</h2>
<h3>Primary Evidence</h3>
<p>Present your primary data or evidence. This may include interviews, surveys, experiments, archival documents, or other primary sources relevant to your field.</p>

<h3>Analysis</h3>
<p>Analyze the evidence in light of your theoretical framework. Draw connections between different pieces of evidence. Explain how the evidence supports your core argument.</p>

<h3>Synthesis</h3>
<p>Bring together the different strands of evidence and analysis. Show how they collectively support your argument. Discuss any tensions or contradictions and how they are resolved.</p>

<h2>Chapter Summary</h2>
<p>Summarize the key points and arguments made in this chapter. Explain how the chapter's findings contribute to the overall thesis argument. Provide a transition to the next chapter.</p>

<h2>References</h2>
<p>List all sources cited in this chapter.</p>`
  }
];

export default function TemplatesPage({ onCreateFromTemplate }) {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [creating, setCreating] = useState(false);

  const handleUseTemplate = async (template) => {
    setCreating(true);
    try {
      if (onCreateFromTemplate) {
        const newId = await onCreateFromTemplate(template.title, template.content);
        if (newId) navigate(`/notebooks/${newId}`);
      }
    } catch (e) {
      console.error('Failed to create from template:', e);
    }
    setCreating(false);
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
            background: 'linear-gradient(135deg, #4ade80, #22d3ee)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FiGrid size={18} color="white" />
          </div>
          Templates
        </h1>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0', paddingLeft: '46px' }}>
          Start writing faster with pre-built academic structures
        </p>
      </div>

      {/* Template Grid */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {TEMPLATES.map(t => (
            <div key={t.id} className="glass-card group" style={{
              padding: 0, overflow: 'hidden', cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onClick={() => setSelectedTemplate(selectedTemplate?.id === t.id ? null : t)}
            >
              {/* Card Header */}
              <div style={{
                padding: '20px', background: `${t.color}08`,
                borderBottom: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', gap: '14px'
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: t.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', boxShadow: `0 4px 12px ${t.color}33`
                }}>
                  {t.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{t.title}</h3>
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 600, color: t.color,
                    textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}>{t.category}</span>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '16px 20px' }}>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 12px' }}>
                  {t.description}
                </p>

                {/* Sections Preview */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '14px' }}>
                  {t.sections.map((sec, i) => (
                    <span key={i} style={{
                      fontSize: '0.6rem', padding: '3px 8px', borderRadius: '4px',
                      background: 'var(--bg-tertiary)', color: 'var(--text-muted)',
                      border: '1px solid var(--border-color)'
                    }}>{sec}</span>
                  ))}
                </div>

                {/* Expanded Preview */}
                {selectedTemplate?.id === t.id && (
                  <div className="animate-slide-down" style={{
                    padding: '14px', borderRadius: '8px', marginBottom: '12px',
                    background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                    maxHeight: '200px', overflow: 'auto'
                  }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                      Preview
                    </div>
                    <div
                      style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', lineHeight: 1.6 }}
                      dangerouslySetInnerHTML={{ __html: t.content.substring(0, 500) + '...' }}
                    />
                  </div>
                )}

                {/* Use Template Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleUseTemplate(t); }}
                  disabled={creating}
                  className="btn-specter"
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '6px', padding: '10px'
                  }}
                >
                  {creating ? 'Creating...' : <><FiArrowRight size={14} /> Use Template</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
