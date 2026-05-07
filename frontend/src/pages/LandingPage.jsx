import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SpecterLogo from '../components/SpecterLogo';
import DottedSurface from '../components/DottedSurface';
import './LandingPage.css';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    setTimeout(() => setHeroVisible(true), 100);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: '📝', title: 'AI Paper Writer', desc: 'Tell Specter what to write. It reads your notebook, adds sections, improves phrasing, and applies edits you approve — hands-free.', link: '/notebooks' },
    { icon: '🔍', title: 'Reference Search', desc: 'Search millions of real academic papers. Save references, cite inline, and auto-generate your bibliography in seconds.', link: '/references' },
    { icon: '🤖', title: 'AI Detection', desc: 'Highlight text and instantly check if it reads as AI-generated. Get a confidence score and tips to make it yours.', link: '/notebooks' },
    { icon: '📚', title: 'Reference-Aware Chat', desc: 'Tell the AI to use specific references as context. Write evidence-based paragraphs with proper citations, automatically.', link: '/notebooks' },
    { icon: '📅', title: 'Smart Calendar', desc: 'Schedule writing tasks with deadlines. Toggle auto-start and Specter writes the draft for you — even while you sleep.', link: '/calendar' },
    { icon: '📓', title: 'Notebook Manager', desc: 'Create and manage multiple notebooks with rich editing. Each has its own references, tasks, and AI chat history.', link: '/notebooks' },
  ];

  const steps = [
    { num: '01', title: 'Create a Notebook', desc: 'Set up your project. Add a topic, search references, and tell Specter what you need.' },
    { num: '02', title: 'Let Specter Work', desc: 'Chat with the AI. It drafts paragraphs, cites your sources, and builds sections — all while you review.' },
    { num: '03', title: 'Submit with Confidence', desc: 'Check for AI patterns, polish your citations, and export a paper that\'s authentically yours.' },
  ];

  const faqs = [
    { q: 'What is Specter?', a: 'Specter is an AI-powered academic writing assistant that drafts, researches, and prepares your work — so you never start from a blank page.' },
    { q: 'Is Specter free to use?', a: 'Yes! All core features are free during beta — notebooks, AI chat, reference search, calendar, and auto-scheduling.' },
    { q: 'How does the AI writing work?', a: 'Open the chat panel in your notebook and tell Specter what to write. It reads your document, generates content, and shows you a preview before applying changes.' },
    { q: 'Can I use references as context?', a: 'Absolutely. Save references to your notebook, then say "Write about X using my references." Specter will cite your sources inline.' },
    { q: 'What is AI detection?', a: 'Highlight text in your editor and ask Specter to check it. You get a score, flagged phrases, and actionable tips to make the writing more authentic.' },
    { q: 'Is my work saved automatically?', a: 'Yes. Everything auto-saves within 800ms. You can also press ⌘S / Ctrl+S anytime.' },
  ];

  return (
    <div className="landing-page">
      {/* ═══ STICKY SHRINKING NAV ═══ */}
      <nav className={`landing-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className={`landing-nav-inner ${isScrolled ? 'compact' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <SpecterLogo size={isScrolled ? 26 : 32} />
            <span className="nav-brand">Specter</span>
          </div>
          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it Works</a>
            <a href="#faq">FAQ</a>
          </div>
          {isScrolled ? (
            <Link to="/notebooks" className="landing-btn-primary nav-btn-compact">
              Get Started
            </Link>
          ) : (
            <Link to="/notebooks" className="landing-btn-primary nav-btn">
              Open App
            </Link>
          )}
        </div>
      </nav>

      {/* ═══ HERO WITH DOTTED SURFACE ═══ */}
      <section className="landing-hero">
        <DottedSurface />
        <div className="hero-overlay" />
        <div className={`hero-content ${heroVisible ? 'visible' : ''}`}>
          <div className="hero-pill">
            <span className="hero-pill-dot" />
            AI-Powered Academic Writing
          </div>
          <h1 className="hero-title">
            Your Paper.<br />
            <span className="hero-gradient">Done Before the Deadline.</span>
          </h1>
          <p className="hero-subtitle">
            Specter researches, drafts, and cites for you — so you submit on time,
            every time. You set the direction. AI does the heavy lifting.
          </p>
          <div className="hero-buttons">
            <Link to="/notebooks" className="landing-btn-primary landing-btn-lg">
              <span>Start Writing</span>
              <span className="btn-arrow">→</span>
            </Link>
            <a href="#features" className="landing-btn-ghost landing-btn-lg">
              See How it Works
            </a>
          </div>
        </div>

        {/* Mockup Window */}
        <div className="hero-mockup">
          <div className="mockup-window">
            <div className="mockup-topbar">
              <div className="mockup-dots"><span /><span /><span /></div>
              <span style={{ fontSize: '0.6rem', color: '#4a5a78' }}>specter — notebook</span>
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

        {/* Stats */}
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="stat-num">∞</span>
            <span className="stat-label">AI Drafts</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="stat-num">200M+</span>
            <span className="stat-label">Academic Papers</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="stat-num">Free</span>
            <span className="stat-label">During Beta</span>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="landing-section">
        <div className="section-inner">
          <div className="section-label">Features</div>
          <h2 className="section-title">You Set the Deadline.<br />Specter Does the Rest.</h2>
          <p className="section-desc">Research, draft, cite, and polish — without staring at a blank page for hours.</p>
          <div className="features-grid">
            {features.map((f, i) => (
              <Link to={f.link} key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <span className="feature-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="landing-section" style={{ background: '#06080e' }}>
        <div className="section-inner">
          <div className="section-label">How it Works</div>
          <h2 className="section-title">Three Steps.<br />Zero All-Nighters.</h2>
          <div className="steps-grid">
            {steps.map((s, i) => (
              <div key={i} className="step-card">
                <div className="step-num">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="landing-section">
        <div className="section-inner" style={{ maxWidth: '700px' }}>
          <div className="section-label">FAQ</div>
          <h2 className="section-title">Common Questions</h2>
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
            Stop Procrastinating.<br />Start Submitting.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '28px' }}>
            Let Specter handle the work. You take the credit.
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
              <span style={{ fontWeight: 700, color: '#e0e6f0' }}>Specter</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#3a4a68', maxWidth: '250px', lineHeight: 1.6 }}>
              The AI that writes your papers while you sleep. Research, draft, cite — all in one workspace.
            </p>
          </div>
          <div className="footer-links">
            <div><h4>Navigation</h4><Link to="/">Home</Link><Link to="/notebooks">Notebooks</Link><Link to="/calendar">Calendar</Link><Link to="/references">References</Link></div>
            <div><h4>Resources</h4><a href="#features">Features</a><a href="#how-it-works">How it Works</a><a href="#faq">FAQ</a></div>
          </div>
        </div>
        <div className="footer-bottom">© 2026 Specter. All rights reserved.</div>
      </footer>
    </div>
  );
}
