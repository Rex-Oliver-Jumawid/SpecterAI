import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SpecterLogo from '../components/SpecterLogo';
import SmokeBackground from '../components/SmokeBackground';
import './LandingPage.css';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    // Trigger hero animation
    setTimeout(() => setHeroVisible(true), 100);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: '📝', title: 'AI Paper Writer', desc: 'Chat with Specter to write entire papers. It reads your document, adds sections, improves writing, and applies edits you approve.', link: '/notebooks' },
    { icon: '🔍', title: 'Reference Search', desc: 'Search millions of real academic papers via OpenAlex. Save references, cite inline, and auto-generate your bibliography.', link: '/references' },
    { icon: '🤖', title: 'AI Detection', desc: 'Highlight any text and instantly check if it reads as AI-generated. Keep your writing authentic with confidence scores.', link: '/notebooks' },
    { icon: '📚', title: 'Reference-Aware Chat', desc: 'Tell the AI to use specific references as context. Write evidence-based paragraphs with proper citations automatically.', link: '/notebooks' },
    { icon: '📅', title: 'Smart Calendar', desc: 'Schedule writing tasks with deadlines. Set auto-start and Specter drafts for you at the deadline, even when you\'re away.', link: '/calendar' },
    { icon: '📓', title: 'Notebook Manager', desc: 'Create and manage multiple notebooks with rich text editing. Each has its own references, tasks, and AI chat history.', link: '/notebooks' },
  ];

  const steps = [
    { num: '01', title: 'Create Your Notebook', desc: 'Start a new notebook. Search and save academic references to build your source library.' },
    { num: '02', title: 'Chat with Specter', desc: 'Ask the AI to write using your references as context. Review, accept, or refine every edit.' },
    { num: '03', title: 'Polish & Export', desc: 'Check for AI-generated text, ensure proper citations, and finalize your paper.' },
  ];

  const faqs = [
    { q: 'What is Specter?', a: 'Specter is an AI-powered academic writing assistant. It helps you research, draft, cite, and polish academic papers — all in one workspace.' },
    { q: 'Is Specter free to use?', a: 'Yes! All core features are free during beta — notebooks, AI chat, reference search, calendar, and auto-scheduling.' },
    { q: 'How does the AI writing work?', a: 'Open the chat panel in your notebook. Ask Specter to write, improve, or continue your paper. It reads your document live and suggests edits you can accept or undo.' },
    { q: 'Can I use references as context?', a: 'Yes! Save references to your notebook, then tell the AI "Write about X using my references." Specter will incorporate your sources with proper citations.' },
    { q: 'What is AI detection?', a: 'Highlight any text in your editor and click "Check AI." Specter analyzes the writing patterns and gives a confidence score for whether it appears AI-generated.' },
    { q: 'Is my work saved automatically?', a: 'Yes. Everything auto-saves within 800ms of your last edit. You can also press ⌘S / Ctrl+S anytime.' },
  ];

  return (
    <div className="landing-page">
      {/* ═══ NAV ═══ */}
      <nav className={`landing-nav ${isScrolled ? 'scrolled' : ''}`}>
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

      {/* ═══ HERO WITH SMOKE ═══ */}
      <section className="landing-hero">
        <SmokeBackground color="#2563eb" />
        <div className="hero-overlay" />
        <div className={`hero-content ${heroVisible ? 'visible' : ''}`}>
          <div className="hero-pill">
            <span className="hero-pill-dot" />
            AI-Powered Academic Writing
          </div>
          <h1 className="hero-title">
            Your Research.<br />
            <span className="hero-gradient">Written by AI.</span><br />
            <span className="hero-gradient-2">Perfected by You.</span>
          </h1>
          <p className="hero-subtitle">
            Specter writes papers using your references as context. Search real academic sources,
            chat with AI, detect AI-generated text, and produce polished work — all in one place.
          </p>
          <div className="hero-buttons">
            <Link to="/notebooks" className="landing-btn-primary landing-btn-lg">
              <span>Start Writing</span>
              <span className="btn-arrow">→</span>
            </Link>
            <a href="#features" className="landing-btn-ghost landing-btn-lg">
              See Features
            </a>
          </div>
        </div>

        {/* Mockup Window */}
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
          <h2 className="section-title">Everything You Need<br />to Write Better Papers</h2>
          <p className="section-desc">From research to final draft — Specter handles the heavy lifting so you can focus on your ideas.</p>
          <div className="features-grid">
            {features.map((f, i) => (
              <Link to={f.link} key={i} className="feature-card" style={{ animationDelay: `${i * 0.1}s` }}>
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
      <section id="how-it-works" className="landing-section" style={{ background: '#08070e' }}>
        <div className="section-inner">
          <div className="section-label">How it Works</div>
          <h2 className="section-title">Three Steps to<br />Better Academic Writing</h2>
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
            Ready to Write<br />Smarter?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '28px' }}>
            Research, write, and cite — all powered by AI.
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
              The AI-powered academic writing assistant. Research, draft, cite, and polish — all in one workspace.
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
