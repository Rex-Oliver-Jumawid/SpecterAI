import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Editor from './components/Editor';
import ReferencePanel from './components/ReferencePanel';
import PlanningPanel from './components/PlanningPanel';
import ReviewModal from './components/ReviewModal';
import AppSidebar from './components/AppSidebar';
import ChatPanel from './components/ChatPanel';
import LandingPage from './pages/LandingPage';
import CalendarPage from './pages/CalendarPage';
import ReferencesPage from './pages/ReferencesPage';
import NotebooksPage from './pages/NotebooksPage';
import { notebooks, references as refsApi, plans as plansApi, chat as chatApi } from './api';
import './App.css';

// ═══ Resize Handle ═══
function ResizeHandle({ onResize }) {
  const [dragging, setDragging] = useState(false);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    const startX = e.clientX;

    const handleMouseMove = (e) => {
      onResize(e.clientX - startX);
    };

    const handleMouseUp = () => {
      setDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return <div className={`resize-handle ${dragging ? 'active' : ''}`} onMouseDown={handleMouseDown} />;
}

// ═══ Notebook Page (3-column with collapsible + resizable panels) ═══
function NotebookPage({ notebook, content, setContent, title, setTitle, wordCount, saveStatus,
  refs, planList, selectedPlanId, setSelectedPlanId, reviewPlan,
  handleAddReference, handleDeleteReference, insertCitation,
  handleCreatePlan, handleDeletePlan, handleTriggerAi,
  handleConfirmAi, handleRejectAi, setReviewPlan }) {

  const editorRef = useRef(null);
  const [leftWidth, setLeftWidth] = useState(300);
  const [rightWidth, setRightWidth] = useState(280);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const leftRef = useRef(300);
  const rightRef = useRef(280);

  const handleLeftResize = useCallback((delta) => {
    setLeftWidth(Math.max(220, Math.min(450, leftRef.current + delta)));
  }, []);

  const handleRightResize = useCallback((delta) => {
    setRightWidth(Math.max(220, Math.min(450, rightRef.current - delta)));
  }, []);

  useEffect(() => { leftRef.current = leftWidth; }, [leftWidth]);
  useEffect(() => { rightRef.current = rightWidth; }, [rightWidth]);

  useEffect(() => {
    const handler = () => {
      leftRef.current = leftWidth;
      rightRef.current = rightWidth;
    };
    window.addEventListener('mouseup', handler);
    return () => window.removeEventListener('mouseup', handler);
  }, [leftWidth, rightWidth]);

  const bibliography = (() => {
    const matches = [...content.matchAll(/\[cite:([^\]]+)\]/g)];
    const citedIds = [...new Set(matches.map(m => m[1]))];
    return refs.filter(r => citedIds.includes(r.id)).sort((a, b) => (a.authors || '').localeCompare(b.authors || ''));
  })();

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* Left: Planning — collapsible */}
      {!leftCollapsed ? (
        <>
          <aside style={{
            width: `${leftWidth}px`, flexShrink: 0, display: 'flex', flexDirection: 'column',
            overflow: 'hidden', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)'
          }}>
            <PlanningPanel plans={planList} onCreatePlan={handleCreatePlan} onDeletePlan={handleDeletePlan}
              onTriggerAi={handleTriggerAi} onSelectPlan={setSelectedPlanId}
              selectedPlanId={selectedPlanId} notebookId={notebook?.id}
              onCollapse={() => setLeftCollapsed(true)} />
          </aside>
          <ResizeHandle onResize={handleLeftResize} />
        </>
      ) : (
        <button onClick={() => setLeftCollapsed(false)} className="panel-expand-btn left" title="Expand Planning">
          <span>📋</span>
        </button>
      )}

      {/* Center: Editor */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <header className="editor-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="gradient-text" style={{ fontSize: '0.88rem', fontWeight: 800, margin: 0 }}>
              {title || 'Untitled'}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
            <span>{wordCount} words</span>
            <span>·</span>
            <span>{Math.max(1, Math.ceil(wordCount / 200))} min read</span>
            <span>·</span>
            <span style={{
              color: saveStatus === 'saved' ? 'var(--color-phantom-500)' : saveStatus === 'saving' ? 'var(--color-ember-500)' : 'var(--text-muted)'
            }}>
              {saveStatus === 'saving' ? '● Saving' : saveStatus === 'saved' ? '● Saved' : '○ Auto-save'}
            </span>
          </div>
        </header>
        <Editor ref={editorRef} content={content} onChange={setContent}
          wordCount={wordCount} documentTitle={title} onTitleChange={setTitle}
          references={refs} />
      </main>

      {/* Right: References — collapsible */}
      {!rightCollapsed ? (
        <>
          <ResizeHandle onResize={handleRightResize} />
          <aside style={{
            width: `${rightWidth}px`, flexShrink: 0, display: 'flex', flexDirection: 'column',
            overflow: 'hidden', background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-color)'
          }}>
            <ReferencePanel references={refs} onAddReference={handleAddReference}
              onDeleteReference={handleDeleteReference} onInsertCitation={insertCitation}
              onCollapse={() => setRightCollapsed(true)} />
            {bibliography.length > 0 && (
              <div style={{ padding: '12px', overflow: 'auto', borderTop: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', maxHeight: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>📖 Bibliography</span>
                  <span className="badge badge-verified" style={{ fontSize: '0.55rem' }}>APA</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {bibliography.map((ref, i) => (
                    <div key={i} style={{
                      fontSize: '0.68rem', lineHeight: 1.5, padding: '6px 10px', borderRadius: '6px',
                      background: 'var(--bg-card)', borderLeft: '2px solid var(--color-specter-500)', color: 'var(--text-tertiary)'
                    }}>
                      <strong style={{ color: 'var(--text-secondary)' }}>{ref.authors}</strong>{' '}
                      ({ref.year}). {ref.title}. <em>{ref.journal}</em>.
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </>
      ) : (
        <button onClick={() => setRightCollapsed(false)} className="panel-expand-btn right" title="Expand References">
          <span>🔍</span>
        </button>
      )}

      {reviewPlan && (
        <ReviewModal plan={reviewPlan} onConfirm={handleConfirmAi} onReject={handleRejectAi} onClose={() => setReviewPlan(null)} />
      )}
    </div>
  );
}

// ═══ App Shell (shared state + routing) ═══
function AppShell() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('specter_theme') !== 'light');
  const [notebook, setNotebook] = useState(null);
  const [allNotebooks, setAllNotebooks] = useState([]);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Untitled Notebook');
  const [wordCount, setWordCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [refs, setRefs] = useState([]);
  const [planList, setPlanList] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [reviewPlan, setReviewPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const saveTimerRef = useRef(null);
  const initRef = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Theme — default to dark
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('specter_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Init
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    initNotebook();
  }, []);

  const initNotebook = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(window.location.search);
      const urlId = params.get('notebookId');
      const existing = await notebooks.list();
      setAllNotebooks(existing);
      let nb;
      if (urlId) nb = existing.find(n => n.id === urlId);
      if (!nb && existing.length > 0) nb = existing[0];
      if (!nb) nb = await notebooks.create({ title: 'My Notebook' });

      await loadNotebook(nb);
    } catch (e) { console.error('Init error:', e); }
    finally { setLoading(false); }
  };

  const loadNotebook = async (nb) => {
    setNotebook(nb);
    setContent(nb.content || '');
    setTitle(nb.title || 'Untitled Notebook');

    const [refData, planData] = await Promise.all([refsApi.list(nb.id), plansApi.list(nb.id)]);
    setRefs(refData);
    setPlanList(planData);

    const needsReview = planData.find(p => p.status === 'review');
    if (needsReview) setReviewPlan(needsReview);

    try {
      const history = await chatApi.history(nb.id);
      setChatHistory(history);
    } catch (e) { setChatHistory([]); }
  };

  const switchNotebook = async (nbId) => {
    try {
      setLoading(true);
      const nb = await notebooks.get(nbId);
      await loadNotebook(nb);
      const all = await notebooks.list();
      setAllNotebooks(all);
    } catch (e) { console.error('Switch error:', e); }
    finally { setLoading(false); }
  };

  // Word count
  useEffect(() => {
    const text = content.replace(/<[^>]*>/g, '').trim();
    setWordCount(text.split(/\s+/).filter(w => w.length > 0).length);
  }, [content]);

  // Auto-save
  useEffect(() => {
    if (!notebook) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaveStatus('saving');
    saveTimerRef.current = setTimeout(async () => {
      try {
        await notebooks.update(notebook.id, { title, content });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (e) { setSaveStatus('error'); }
    }, 800);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [content, title, notebook]);

  // Keyboard
  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (notebook) { notebooks.update(notebook.id, { title, content }); setSaveStatus('saved'); setTimeout(() => setSaveStatus('idle'), 2000); }
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [content, title, notebook]);

  // Deadline check — auto trigger if auto_start is enabled
  useEffect(() => {
    const iv = setInterval(() => {
      planList.forEach(p => {
        if (p.scheduled_date && new Date(p.scheduled_date) < new Date() && p.status === 'planned') {
          if (p.auto_start === 1) {
            handleTriggerAi(p.id);
          }
        }
      });
    }, 30000);
    return () => clearInterval(iv);
  }, [planList]);

  // Handlers
  const handleAddReference = async (url, data) => {
    if (!notebook) return;
    try {
      const payload = data || { url };
      const r = await refsApi.add(notebook.id, payload);
      setRefs(prev => [r, ...prev]);
    } catch (e) { console.error(e); }
  };
  const handleDeleteReference = async (id) => {
    try { await refsApi.delete(id); setRefs(prev => prev.filter(r => r.id !== id)); } catch (e) { console.error(e); }
  };
  const insertCitation = (refId) => setContent(prev => prev + ' [cite:' + refId + ']');
  const handleCreatePlan = async (data) => {
    if (!notebook) return;
    try { const p = await plansApi.create(notebook.id, data); setPlanList(prev => [...prev, p]); } catch (e) { console.error(e); }
  };
  const handleDeletePlan = async (id) => {
    try { await plansApi.delete(id); setPlanList(prev => prev.filter(p => p.id !== id)); if (selectedPlanId === id) setSelectedPlanId(null); } catch (e) { console.error(e); }
  };
  const handleTriggerAi = async (id) => {
    try { const u = await plansApi.trigger(id); setPlanList(prev => prev.map(p => p.id === id ? u : p)); setReviewPlan(u); } catch (e) { console.error(e); }
  };
  const handleConfirmAi = async (id) => {
    try {
      const u = await plansApi.confirm(id, true);
      setPlanList(prev => prev.map(p => p.id === id ? u : p));
      setReviewPlan(null);
      const nb = await notebooks.get(notebook.id);
      setNotebook(nb); setContent(nb.content || '');
    } catch (e) { console.error(e); }
  };
  const handleRejectAi = async (id) => {
    try { const u = await plansApi.confirm(id, false); setPlanList(prev => prev.map(p => p.id === id ? u : p)); setReviewPlan(null); } catch (e) { console.error(e); }
  };

  // Chat handlers
  const handleSendMessage = async (message) => {
    if (!notebook) return;
    try {
      const result = await chatApi.send(notebook.id, message);
      setChatHistory(prev => [...prev, result.userMessage, result.aiMessage]);
    } catch (e) { console.error(e); }
  };
  const handleClearChat = async () => {
    if (!notebook) return;
    try {
      await chatApi.clear(notebook.id);
      setChatHistory([]);
    } catch (e) { console.error(e); }
  };

  // Notebook management
  const handleCreateNotebook = async (titleStr) => {
    try {
      const nb = await notebooks.create({ title: titleStr });
      setAllNotebooks(prev => [nb, ...prev]);
      await loadNotebook(nb);
      navigate(`/app?notebookId=${nb.id}`);
    } catch (e) { console.error(e); }
  };
  const handleDeleteNotebook = async (id) => {
    try {
      await notebooks.delete(id);
      const remaining = allNotebooks.filter(n => n.id !== id);
      setAllNotebooks(remaining);
      if (notebook?.id === id && remaining.length > 0) {
        await loadNotebook(remaining[0]);
      }
    } catch (e) { console.error(e); }
  };

  // Hide sidebar on landing page
  const isLanding = location.pathname === '/';

  if (isLanding) {
    return <LandingPage />;
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh' }}>
        <AppSidebar darkMode={darkMode} onToggleTheme={() => setDarkMode(!darkMode)} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }} className="animate-fade-in">
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }} className="animate-haunt">👻</div>
            <div className="gradient-text" style={{ fontSize: '1.2rem', fontWeight: 800 }}>Specter</div>
            <div style={{ fontSize: '0.78rem', marginTop: '8px', color: 'var(--text-muted)' }}>Loading your workspace...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      <AppSidebar darkMode={darkMode} onToggleTheme={() => setDarkMode(!darkMode)}
        onToggleChat={() => setChatOpen(!chatOpen)} chatOpen={chatOpen} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Routes>
          <Route path="/notebooks" element={
            <NotebooksPage allNotebooks={allNotebooks}
              onCreateNotebook={handleCreateNotebook}
              onDeleteNotebook={handleDeleteNotebook}
              onSelectNotebook={(id) => switchNotebook(id)}
              currentNotebookId={notebook?.id} />
          } />
          <Route path="/app" element={
            <NotebookPage notebook={notebook} content={content} setContent={setContent}
              title={title} setTitle={setTitle} wordCount={wordCount} saveStatus={saveStatus}
              refs={refs} planList={planList} selectedPlanId={selectedPlanId}
              setSelectedPlanId={setSelectedPlanId} reviewPlan={reviewPlan}
              handleAddReference={handleAddReference} handleDeleteReference={handleDeleteReference}
              insertCitation={insertCitation} handleCreatePlan={handleCreatePlan}
              handleDeletePlan={handleDeletePlan} handleTriggerAi={handleTriggerAi}
              handleConfirmAi={handleConfirmAi} handleRejectAi={handleRejectAi} setReviewPlan={setReviewPlan} />
          } />
          <Route path="/calendar" element={
            <CalendarPage plans={planList} onCreatePlan={handleCreatePlan}
              onDeletePlan={handleDeletePlan} onTriggerAi={handleTriggerAi} />
          } />
          <Route path="/references" element={
            <ReferencesPage references={refs} onAddReference={handleAddReference}
              onDeleteReference={handleDeleteReference} notebookId={notebook?.id} />
          } />
          <Route path="*" element={
            <NotebooksPage allNotebooks={allNotebooks}
              onCreateNotebook={handleCreateNotebook}
              onDeleteNotebook={handleDeleteNotebook}
              onSelectNotebook={(id) => switchNotebook(id)}
              currentNotebookId={notebook?.id} />
          } />
        </Routes>
      </div>

      {/* Chat Panel — slides in from right */}
      <ChatPanel
        notebookId={notebook?.id}
        chatHistory={chatHistory}
        onSendMessage={handleSendMessage}
        onClearChat={handleClearChat}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />

      {/* Global review modal for calendar/references triggered AI */}
      {reviewPlan && location.pathname !== '/app' && (
        <ReviewModal plan={reviewPlan} onConfirm={handleConfirmAi} onReject={handleRejectAi} onClose={() => setReviewPlan(null)} />
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
