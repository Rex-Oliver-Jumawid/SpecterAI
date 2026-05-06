import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SpecterLogo from '../components/SpecterLogo';
import './LandingPage.css';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const features = [
    { icon: '📅', title: 'Smart Calendar', desc: 'Schedule tasks with date and time. Set auto-start so AI works at your deadline, even when you\'re away.', link: '/calendar' },
    { icon: '✦', title: 'AI Writer', desc: 'Chat with Specter in your notebook. Draft paragraphs, create outlines, get writing advice — all context-aware.', link: '/notebooks' },
    { icon: '📓', title: 'Notebook Manager', desc: 'Create and manage multiple notebooks. Switch between projects instantly. Word counts, refs, and tasks at a glance.', link: '/notebooks' },
    { icon: '🔍', title: 'Reference Finder', desc: 'Find and save academic references. Cite them in your work with one click and auto-generate your bibliography.', link: '/references' },
    { icon: '✓', title: 'Review & Accept', desc: 'Review AI-generated drafts in a dedicated panel. Accept, edit, or redo — every change stays under your control.', link: '/notebooks' },
    { icon: '⚡', title: 'Auto-Start Tasks', desc: 'Set tasks to auto-start or pre-fetch references. AI gathers everything before your deadline so you\'re always ready.', link: '/calendar' },
  ];

  const steps = [
    { num: '1', title: 'Create Your Notebook', desc: 'Start a new notebook and schedule writing tasks with deadlines. Toggle auto-start so AI works even when you\'re away.' },
    { num: '2', title: 'Specter Researches & Writes', desc: 'AI gathers references, builds outlines, and drafts content based on your instructions. Chat with Specter for real-time help.' },
    { num: '3', title: 'Review & Publish', desc: 'When you return, review everything Specter produced. Accept, edit, or redo. Your bibliography is built automatically.' },
  ];

  const faqs = [
    { q: 'What is Specter?', a: 'Specter is an AI-powered academic ghost writer that drafts, researches, and prepares your writing tasks so you never start from a blank page.' },
    { q: 'Is Specter free to use?', a: 'Yes! The core features—notebook editor, calendar, reference finder, AI chatbot, and auto-scheduling—are completely free during the beta period.' },
    { q: 'How does the AI drafting work?', a: 'You set a task with an outline, word target, and deadline. Toggle "Auto-start" and Specter generates a structured draft at your deadline, even if you\'re away. When you return, review and accept or redo.' },
    { q: 'Can I manage multiple notebooks?', a: 'Yes! The Notebooks page shows all your projects. Click any notebook to open it. Each notebook has its own references, tasks, and AI chat history.' },
    { q: 'What is citation attribution?', a: 'When you highlight text in the editor, Specter checks if it matches a saved reference, contains a citation, or is your original writing. It helps you never miss a citation.' },
    { q: 'Can I chat with the AI?', a: 'Yes! Click the Chat button in the editor sidebar. Specter can help you draft paragraphs, create outlines, find references, and improve your writing—all aware of your notebook content.' },
    { q: 'Is my work saved automatically?', a: 'Yes. Everything auto-saves within 800ms of your last edit. You can also press ⌘S anytime.' },
  ];

  return (
    <div className="landing-page">
      {/* ═══ NAV ═══ */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <SpecterLogo size={32} />
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#e8e4f0', letterSpacing: '-0.02em' }}>Specter</span>
          </div>
          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it Works</a>
            <a href="#faq">FAQ</a>
          </div>
          <Link to="/notebooks" className="landing-btn-primary" style={{ padding: '8px 20px', fontSize: '0.8rem' }}>
            Open App
          </Link>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="landing-hero">
        <div className="hero-orb" />
        <div className="hero-orb-2" />
        <div className="hero-content">
          <div className="hero-pill">✦ AI-powered academic writing assistant</div>
          <h1 className="hero-title">
            Workspace That Writes<br />
            <span className="hero-gradient">Everything for You</span>
          </h1>
          <p className="hero-subtitle">
            Specter keeps your tasks, references, and drafts in one place. Always
            researched, drafted, and ready — so nothing gets left undone.
          </p>
          <div className="hero-buttons">
            <Link to="/notebooks" className="landing-btn-primary">Get Started</Link>
            <a href="#features" className="landing-btn-ghost">Explore →</a>
          </div>
        </div>
        <div className="hero-mockup">
          <div className="mockup-window">
            <div className="mockup-topbar">
              <div className="mockup-dots"><span /><span /><span /></div>
              <span style={{ fontSize: '0.6rem', color: '#666' }}>specter — notebook</span>
            </div>
            <div className="mockup-body">
              <div className="mockup-sidebar">
                <div className="mockup-line w60" />
                <div className="mockup-line w40" />
                <div className="mockup-line w80" />
                <div className="mockup-line w50" />
              </div>
              <div className="mockup-editor">
                <div className="mockup-line w90" style={{ height: '8px', marginBottom: '12px' }} />
                <div className="mockup-line w100" />
                <div className="mockup-line w95" />
                <div className="mockup-line w80" />
                <div className="mockup-line w100" />
                <div className="mockup-line w70" />
              </div>
              <div className="mockup-panel">
                <div className="mockup-line w60" />
                <div className="mockup-card" />
                <div className="mockup-card" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="landing-section">
        <div className="section-inner">
          <div className="section-label">Our Features</div>
          <h2 className="section-title">Think Less About the Tool.<br />Focus on the Work</h2>
          <p className="section-desc">The all-in-one toolkit to keep your academic writing organized, efficient, and done.</p>
          <div className="features-grid">
            {features.map((f, i) => (
              <Link to={f.link} key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="landing-section" style={{ background: '#08070e' }}>
        <div className="section-inner">
          <div className="section-label">How it Works</div>
          <h2 className="section-title">Get Set Up in Minutes,<br />Start Writing Fast</h2>
          <div className="steps-grid">
            {steps.map((s, i) => (
              <div key={i} className="step-card">
                <div className="step-num">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                {i < steps.length - 1 && <div className="step-connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="landing-section">
        <div className="section-inner" style={{ maxWidth: '700px' }}>
          <div className="section-label">FAQ</div>
          <h2 className="section-title">Everything You Need to Know</h2>
          <div className="faq-list">
            {faqs.map((f, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{f.q}</span>
                  <span className="faq-toggle">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <div className="faq-a">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="landing-cta">
        <div className="cta-orb" />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, color: 'white', margin: '0 0 12px', fontFamily: 'var(--font-serif)' }}>
            Ready to Get<br />Things Done?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '28px' }}>
            Write smarter. All in one place.
          </p>
          <Link to="/notebooks" className="landing-btn-primary" style={{ padding: '14px 36px', fontSize: '0.95rem' }}>
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <SpecterLogo size={36} />
              <span style={{ fontWeight: 700, color: '#e8e4f0' }}>Specter</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#555', maxWidth: '250px', lineHeight: 1.6 }}>
              The workspace that writes everything for you. Built for students who'd rather not start from scratch.
            </p>
          </div>
          <div className="footer-links">
            <div><h4>Navigation</h4><Link to="/">Home</Link><Link to="/notebooks">Notebooks</Link><Link to="/app">Editor</Link><Link to="/calendar">Calendar</Link></div>
            <div><h4>Resources</h4><Link to="/references">References</Link><a href="#faq">FAQ</a><a href="#features">Features</a></div>
          </div>
        </div>
        <div className="footer-bottom">© 2026 Specter. All rights reserved.</div>
      </footer>
    </div>
  );
}
