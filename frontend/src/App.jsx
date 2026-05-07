import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, useParams } from 'react-router-dom';
import Editor from './components/Editor';
import ReferencePanel from './components/ReferencePanel';
import PlanningPanel from './components/PlanningPanel';
import ReviewModal from './components/ReviewModal';
import AppSidebar from './components/AppSidebar';
import ChatPanel from './components/ChatPanel';
import SpecterLogo from './components/SpecterLogo';
import LandingPage from './pages/LandingPage';
import CalendarPage from './pages/CalendarPage';
import ReferencesPage from './pages/ReferencesPage';
import NotebooksPage from './pages/NotebooksPage';
import ComparisonPage from './pages/ComparisonPage';
import DashboardPage from './pages/DashboardPage';
import AIDetectionPage from './pages/AIDetectionPage';
import TemplatesPage from './pages/TemplatesPage';
import { notebooks, references as refsApi, plans as plansApi, chat as chatApi, BASE as API_BASE } from './api';
import { FiFileText, FiCheckSquare, FiBookOpen, FiMessageSquare, FiX, FiAlertCircle, FiCheck, FiRotateCcw, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import './App.css';

// ═══ Global Error Boundary ═══
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('Specter crashed:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--bg-primary)', flexDirection:'column', gap:'16px', padding:'32px', textAlign:'center' }}>
          <div style={{ fontSize:'2.5rem' }}>👻</div>
          <h2 style={{ color:'var(--text-primary)', margin:0, fontFamily:'var(--font-serif)' }}>Something went wrong</h2>
          <p style={{ color:'var(--text-muted)', maxWidth:'400px', lineHeight:1.6, margin:0, fontSize:'0.85rem' }}>
            Specter hit an unexpected error. This usually means the backend is not reachable or the Supabase environment variables are misconfigured on Vercel.
          </p>
          <code style={{ fontSize:'0.7rem', color:'#f87171', background:'rgba(248,113,113,0.1)', padding:'8px 14px', borderRadius:'8px', maxWidth:'480px', wordBreak:'break-all' }}>
            {this.state.error?.message || 'Unknown error'}
          </code>
          <button onClick={() => window.location.replace('/notebooks')} style={{ padding:'10px 24px', borderRadius:'10px', background:'linear-gradient(135deg,#6366f1,#2563eb)', color:'white', border:'none', cursor:'pointer', fontWeight:600, fontSize:'0.85rem' }}>
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ═══ Resize Handle ═══
function ResizeHandle({ onResize }) {
  const [dragging, setDragging] = useState(false);
  const handleMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    const startX = e.clientX;
    const handleMouseMove = (e) => onResize(e.clientX - startX);
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

// ═══ Review Panel (inside notebook) ═══
function ReviewPanel({ plans, onConfirmAi, onRejectAi, onReviewInEditor, onClose }) {
  const [expandedDoneId, setExpandedDoneId] = useState(null);
  const reviewablePlans = plans.filter(p => p.status === 'review' || p.status === 'done');
  const pendingReview = reviewablePlans.filter(p => p.status === 'review');
  const completed = reviewablePlans.filter(p => p.status === 'done');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiCheckSquare size={15} style={{ color: '#3b82f6' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>Review</span>
          {pendingReview.length > 0 && (
            <span className="badge" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', borderColor: 'rgba(251,191,36,0.25)' }}>
              {pendingReview.length} pending
            </span>
          )}
        </div>
        <button onClick={onClose} className="panel-collapse-btn"><FiX size={14} /></button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        {pendingReview.length === 0 && completed.length === 0 ? (
          <div className="empty-state" style={{ paddingTop: '40px' }}>
            <FiCheckSquare size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
            <div className="empty-state-title">No reviews yet</div>
            <div className="empty-state-text">When AI completes a task, its output will appear here for your review.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Pending review items */}
            {pendingReview.map(plan => (
              <div key={plan.id} className="glass-card" style={{ padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <FiAlertCircle size={13} style={{ color: '#fbbf24' }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{plan.title}</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Type: {plan.output_type} · {plan.word_target || 500} words
                </div>
                {plan.ai_output && (
                  <div style={{
                    maxHeight: '150px', overflowY: 'auto', padding: '10px', marginTop: '8px',
                    borderRadius: '6px', background: 'var(--bg-input)', border: '1px solid var(--border-color)',
                    fontSize: '0.72rem', lineHeight: 1.6, color: 'var(--text-secondary)',
                    whiteSpace: 'pre-wrap', fontFamily: 'var(--font-serif)'
                  }}>
                    {plan.ai_output.substring(0, 500)}{plan.ai_output.length > 500 ? '...' : ''}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                  <button onClick={() => onReviewInEditor(plan)} className="btn-specter btn-sm" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <FiBookOpen size={12} /> Review in Editor
                  </button>
                  <button onClick={() => onRejectAi(plan.id)} className="btn-ghost-outline btn-sm" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <FiRotateCcw size={12} /> Redo
                  </button>
                </div>
              </div>
            ))}
            {/* Completed items — viewable */}
            {completed.length > 0 && (
              <>
                <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', padding: '8px 4px 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completed</div>
                {completed.map(plan => {
                  const isExpanded = expandedDoneId === plan.id;
                  return (
                    <div key={plan.id} className="glass-card" style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                        onClick={() => setExpandedDoneId(isExpanded ? null : plan.id)}>
                        <FiCheck size={13} style={{ color: '#4ade80' }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', flex: 1 }}>{plan.title}</span>
                        <span className="badge badge-verified" style={{ fontSize: '0.55rem' }}>Done</span>
                        {isExpanded ? <FiChevronDown size={12} style={{ color: 'var(--text-muted)' }} /> : <FiChevronRight size={12} style={{ color: 'var(--text-muted)' }} />}
                      </div>
                      {isExpanded && plan.ai_output && (
                        <div className="animate-slide-down" style={{
                          marginTop: '10px', padding: '10px', borderRadius: '6px',
                          background: 'var(--bg-input)', border: '1px solid var(--border-color)',
                          fontSize: '0.72rem', lineHeight: 1.6, color: 'var(--text-secondary)',
                          whiteSpace: 'pre-wrap', fontFamily: 'var(--font-serif)',
                          maxHeight: '300px', overflowY: 'auto'
                        }}>
                          {plan.ai_output}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══ Notebook Page (inside /notebooks/:id) ═══
function NotebookPage({ notebookId, appState }) {
  const {
    notebook, content, setContent, title, setTitle, wordCount, saveStatus,
    refs, planList, selectedPlanId, setSelectedPlanId,
    handleAddReference, handleDeleteReference, insertCitation,
    handleCreatePlan, handleDeletePlan, handleTriggerAi,
    handleConfirmAi, handleRejectAi,
    chatHistory, handleSendMessage, handleClearChat,
    loadNotebookById, notebookError
  } = appState;

  const editorRef = useRef(null);

  // Panel visibility state (toggleable like IDE)
  const [showPlanning, setShowPlanning] = useState(true);
  const [showRefs, setShowRefs] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [leftWidth, setLeftWidth] = useState(300);
  const [rightWidth, setRightWidth] = useState(280);
  const leftRef = useRef(300);
  const rightRef = useRef(280);

  // ═══ Live inline diff — lifted from ChatPanel ═══
  // When AI returns an edit, we show it directly in the Editor as a diff
  const [pendingEdit, setPendingEdit] = useState(null);

  const handleEditProposed = useCallback(({ newContent, description, planId }) => {
    setPendingEdit({
      originalContent: content,
      newContent,
      description: description || 'AI suggested changes to your document.',
      planId
    });
  }, [content]);

  const handleAcceptEdit = useCallback(() => {
    if (pendingEdit) {
      setContent(pendingEdit.newContent);
      if (pendingEdit.planId) {
        handleConfirmAi(pendingEdit.planId);
      }
    }
    setPendingEdit(null);
  }, [pendingEdit, setContent, handleConfirmAi]);

  const handleRejectEdit = useCallback(() => {
    setPendingEdit(null);
  }, []);

  // Load this notebook
  useEffect(() => {
    if (notebookId && (!notebook || notebook.id !== notebookId)) {
      loadNotebookById(notebookId);
    }
  }, [notebookId]);

  const handleLeftResize = useCallback((delta) => {
    setLeftWidth(Math.max(220, Math.min(450, leftRef.current + delta)));
  }, []);
  const handleRightResize = useCallback((delta) => {
    setRightWidth(Math.max(220, Math.min(450, rightRef.current - delta)));
  }, []);
  useEffect(() => { leftRef.current = leftWidth; }, [leftWidth]);
  useEffect(() => { rightRef.current = rightWidth; }, [rightWidth]);
  useEffect(() => {
    const handler = () => { leftRef.current = leftWidth; rightRef.current = rightWidth; };
    window.addEventListener('mouseup', handler);
    return () => window.removeEventListener('mouseup', handler);
  }, [leftWidth, rightWidth]);

  const pendingReviewCount = planList.filter(p => p.status === 'review').length;

  const bibliography = (() => {
    const matches = [...content.matchAll(/\[cite:([^\]]+)\]/g)];
    const citedIds = [...new Set(matches.map(m => m[1]))];
    return refs.filter(r => citedIds.includes(r.id)).sort((a, b) => (a.authors || '').localeCompare(b.authors || ''));
  })();

  // Determine right panel content
  const rightPanelContent = showReview ? 'review' : showRefs ? 'refs' : null;

  if (notebookError) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', padding: '32px', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem' }}>⚠️</div>
        <h3 style={{ color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-serif)' }}>Failed to load notebook</h3>
        <p style={{ color: 'var(--text-muted)', maxWidth: '360px', lineHeight: 1.6, margin: 0, fontSize: '0.8rem' }}>{notebookError}</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => loadNotebookById(notebookId)} className="btn-specter btn-sm">Retry</button>
          <button onClick={() => window.location.replace('/notebooks')} className="btn-ghost-outline btn-sm">Back to Notebooks</button>
        </div>
      </div>
    );
  }

  if (!notebook) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-fade-in" style={{ textAlign: 'center' }}>
          <SpecterLogo size={40} />
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '12px' }}>Loading notebook...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Toolbar — toggle panels */}
      <div className="notebook-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <h1 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{title || 'Untitled'}</h1>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{wordCount} words · {Math.max(1, Math.ceil(wordCount / 200))} min</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button onClick={() => setShowPlanning(!showPlanning)}
            className={`toolbar-btn ${showPlanning ? 'active' : ''}`} title="Tasks">
            <FiCheckSquare size={14} /> <span>Tasks</span>
          </button>
          <button onClick={() => { setShowRefs(!showRefs); if (!showRefs) setShowReview(false); }}
            className={`toolbar-btn ${showRefs && !showReview ? 'active' : ''}`} title="References">
            <FiBookOpen size={14} /> <span>Refs</span>
          </button>
          <button onClick={() => { setShowReview(!showReview); if (!showReview) setShowRefs(false); }}
            className={`toolbar-btn ${showReview ? 'active' : ''}`} title="Review"
            style={{ position: 'relative' }}>
            <FiAlertCircle size={14} /> <span>Review</span>
            {pendingReviewCount > 0 && (
              <span style={{
                position: 'absolute', top: '-2px', right: '-2px',
                width: '14px', height: '14px', borderRadius: '50%',
                background: 'oklch(0.72 0.18 55)', color: '#000',
                fontSize: '0.5rem', fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{pendingReviewCount}</span>
            )}
          </button>
          <button onClick={() => setShowChat(!showChat)}
            className={`toolbar-btn ${showChat ? 'active' : ''}`} title="AI Chat">
            <FiMessageSquare size={14} /> <span>Chat</span>
          </button>

          <div style={{ width: '1px', height: '20px', background: 'var(--border-color)', margin: '0 4px' }} />

          <span style={{
            fontSize: '0.68rem', fontWeight: 500,
            color: saveStatus === 'saved' ? 'oklch(0.70 0.16 155)' : saveStatus === 'saving' ? 'oklch(0.78 0.16 55)' : 'var(--text-muted)'
          }}>
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Auto-save'}
          </span>
        </div>
      </div>

      {/* Content area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: Planning panel */}
        {showPlanning && (
          <>
            <aside style={{
              width: `${leftWidth}px`, flexShrink: 0, display: 'flex', flexDirection: 'column',
              overflow: 'hidden', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)'
            }}>
              <PlanningPanel plans={planList} onCreatePlan={handleCreatePlan} onDeletePlan={handleDeletePlan}
                onTriggerAi={handleTriggerAi} onSelectPlan={setSelectedPlanId}
                selectedPlanId={selectedPlanId} notebookId={notebook?.id}
                onCollapse={() => setShowPlanning(false)} />
            </aside>
            <ResizeHandle onResize={handleLeftResize} />
          </>
        )}

        {/* Center: Editor */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
          <Editor ref={editorRef} content={content} onChange={setContent}
            wordCount={wordCount} documentTitle={title} onTitleChange={setTitle}
            references={refs}
            pendingEdit={pendingEdit}
            onAcceptEdit={handleAcceptEdit}
            onRejectEdit={handleRejectEdit}
          />
        </main>

        {/* Right: Refs or Review panel */}
        {rightPanelContent && (
          <>
            <ResizeHandle onResize={handleRightResize} />
            <aside style={{
              width: `${rightWidth}px`, flexShrink: 0, display: 'flex', flexDirection: 'column',
              overflow: 'hidden', background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-color)'
            }}>
              {rightPanelContent === 'refs' ? (
                <>
                  <ReferencePanel references={refs} onAddReference={handleAddReference}
                    onDeleteReference={handleDeleteReference} onInsertCitation={insertCitation}
                    onCollapse={() => setShowRefs(false)} />
                  {bibliography.length > 0 && (
                    <div style={{ padding: '12px', overflow: 'auto', borderTop: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', maxHeight: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Bibliography</span>
                        <span className="badge badge-verified" style={{ fontSize: '0.52rem' }}>APA</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {bibliography.map((ref, i) => (
                          <div key={i} style={{
                            fontSize: '0.65rem', lineHeight: 1.5, padding: '5px 8px', borderRadius: '5px',
                            background: 'var(--bg-card)', borderLeft: '2px solid var(--color-specter-500)', color: 'var(--text-tertiary)'
                          }}>
                            <strong style={{ color: 'var(--text-secondary)' }}>{ref.authors}</strong>{' '}
                            ({ref.year}). {ref.title}. <em>{ref.journal}</em>.
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <ReviewPanel plans={planList} onConfirmAi={handleConfirmAi} onRejectAi={handleRejectAi}
                  onReviewInEditor={(plan) => handleEditProposed({ newContent: plan.ai_output, description: 'Reviewing Task: ' + plan.title, planId: plan.id })}
                  onClose={() => setShowReview(false)} />
              )}
            </aside>
          </>
        )}
      </div>

      {/* Chat Panel overlay */}
      <ChatPanel
        notebookId={notebook?.id}
        chatHistory={chatHistory}
        onSendMessage={handleSendMessage}
        onClearChat={handleClearChat}
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        currentContent={content}
        onEditProposed={handleEditProposed}
        hasPendingEdit={!!pendingEdit}
      />
    </div>
  );
}

// ═══ Notebook Route Wrapper ═══
function NotebookRoute({ appState }) {
  const { id } = useParams();
  return <NotebookPage notebookId={id} appState={appState} />;
}

// ═══ App Shell ═══
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
  const [allPlans, setAllPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notebookError, setNotebookError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const saveTimerRef = useRef(null);
  const initRef = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle('light', !darkMode);
    localStorage.setItem('specter_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Load all plans across all notebooks
  const refreshAllPlans = async (nbs) => {
    const nbList = nbs || allNotebooks;
    if (!nbList.length) return;
    try {
      const results = await Promise.all(nbList.map(nb => plansApi.list(nb.id).catch(() => [])));
      const merged = results.flat().map((p, _, arr) => {
        // attach notebook_id from parent if missing
        return p;
      });
      setAllPlans(merged);
    } catch (e) { console.error('Load all plans:', e); }
  };

  // Init — load notebook list + all plans
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    (async () => {
      try {
        const existing = await notebooks.list();
        setAllNotebooks(existing);
        await refreshAllPlans(existing);
      } catch (e) { console.error('Init error:', e); }
      finally { setLoading(false); }
    })();
  }, []);

  // Refresh all plans periodically (every 30s) for calendar + auto-trigger
  useEffect(() => {
    if (!allNotebooks.length) return;
    const iv = setInterval(() => refreshAllPlans(), 60000);
    return () => clearInterval(iv);
  }, [allNotebooks]);

  const loadNotebookById = async (nbId) => {
    setNotebookError(null);
    try {
      const nb = await notebooks.get(nbId);
      setNotebook(nb);
      setContent(nb.content || '');
      setTitle(nb.title || 'Untitled Notebook');
      const [refData, planData] = await Promise.all([refsApi.list(nb.id), plansApi.list(nb.id)]);
      setRefs(refData);
      setPlanList(planData);
      try {
        const history = await chatApi.history(nb.id);
        setChatHistory(history);
      } catch (e) { setChatHistory([]); }
    } catch (e) {
      console.error('Load notebook error:', e);
      setNotebookError(e.message || 'Failed to load notebook. Check your backend connection and Supabase environment variables.');
    }
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

  // Keyboard save
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

  // Deadline auto-trigger (always on — 5 min grace period, checks ALL plans)
  useEffect(() => {
    const iv = setInterval(() => {
      const now = new Date();
      allPlans.forEach(p => {
        if (p.scheduled_date && p.status === 'planned') {
          const deadline = new Date(p.scheduled_date);
          const gracePeriod = 5 * 60 * 1000; // 5 minutes
          if (now.getTime() - deadline.getTime() >= gracePeriod) {
            handleTriggerAi(p.id);
          }
        }
      });
    }, 30000);
    return () => clearInterval(iv);
  }, [allPlans]);

  // Handlers
  const handleAddReference = async (url, data) => {
    if (!notebook) return;
    try { const r = await refsApi.add(notebook.id, data || { url }); setRefs(prev => [r, ...prev]); }
    catch (e) { console.error(e); }
  };
  const handleDeleteReference = async (id) => {
    try { await refsApi.delete(id); setRefs(prev => prev.filter(r => r.id !== id)); } catch (e) { console.error(e); }
  };
  const insertCitation = (refId) => setContent(prev => prev + ' [cite:' + refId + ']');
  const handleCreatePlan = async (data) => {
    if (!notebook) return;
    try {
      const p = await plansApi.create(notebook.id, data);
      setPlanList(prev => [...prev, p]);
      setAllPlans(prev => [...prev, p]);
    } catch (e) { console.error(e); }
  };
  const handleDeletePlan = async (id) => {
    try {
      await plansApi.delete(id);
      setPlanList(prev => prev.filter(p => p.id !== id));
      setAllPlans(prev => prev.filter(p => p.id !== id));
      if (selectedPlanId === id) setSelectedPlanId(null);
    } catch (e) { console.error(e); }
  };
  const handleTriggerAi = async (id) => {
    try {
      const u = await plansApi.trigger(id);
      setPlanList(prev => prev.map(p => p.id === id ? u : p));
      setAllPlans(prev => prev.map(p => p.id === id ? u : p));
    } catch (e) { console.error(e); }
  };
  const handleConfirmAi = async (id) => {
    try {
      const u = await plansApi.confirm(id, true);
      setPlanList(prev => prev.map(p => p.id === id ? u : p));
      setAllPlans(prev => prev.map(p => p.id === id ? u : p));
      if (notebook) {
        const nb = await notebooks.get(notebook.id);
        setNotebook(nb); setContent(nb.content || '');
      }
    } catch (e) { console.error(e); }
  };
  const handleRejectAi = async (id) => {
    try {
      const u = await plansApi.confirm(id, false);
      setPlanList(prev => prev.map(p => p.id === id ? u : p));
      setAllPlans(prev => prev.map(p => p.id === id ? u : p));
    } catch (e) { console.error(e); }
  };
  const handleSendMessage = async (message, mode) => {
    if (!notebook) return;
    try {
      const result = await chatApi.send(notebook.id, message, mode);
      setChatHistory(prev => [...prev, result.userMessage, result.aiMessage]);
      return result;
    }
    catch (e) { console.error(e); }
  };
  const handleClearChat = async () => {
    if (!notebook) return;
    try { await chatApi.clear(notebook.id); setChatHistory([]); } catch (e) { console.error(e); }
  };

  // Notebook management
  const handleCreateNotebook = async (titleStr) => {
    try {
      const nb = await notebooks.create({ title: titleStr });
      setAllNotebooks(prev => [nb, ...prev]);
      navigate(`/notebooks/${nb.id}`);
    } catch (e) { 
      console.error('Create notebook failed:', e);
      alert(`Failed to create notebook: ${e.message}. \n\nTarget URL: ${API_BASE}/notebooks\n\nIf the URL above is just "/api/notebooks", then Vercel is not picking up your VITE_API_URL variable.`);
    }
  };
  const handleDeleteNotebook = async (id) => {
    try {
      await notebooks.delete(id);
      const remaining = allNotebooks.filter(n => n.id !== id);
      setAllNotebooks(remaining);
      if (notebook?.id === id) setNotebook(null);
    } catch (e) { 
      console.error('Delete notebook failed:', e);
      alert(`Failed to delete notebook: ${e.message}`);
    }
  };
  const handleRenameNotebook = async (id, newTitle) => {
    try {
      await notebooks.update(id, { title: newTitle });
      setAllNotebooks(prev => prev.map(n => n.id === id ? { ...n, title: newTitle } : n));
      if (notebook?.id === id) {
        setNotebook(prev => ({ ...prev, title: newTitle }));
        setTitle(newTitle);
      }
    } catch (e) {
      console.error('Rename notebook failed:', e);
    }
  };

  // Create notebook from template
  const handleCreateFromTemplate = async (title, content) => {
    try {
      const nb = await notebooks.create(title);
      await notebooks.update(nb.id, { content });
      const full = { ...nb, content };
      setAllNotebooks(prev => [...prev, full]);
      return nb.id;
    } catch (e) {
      console.error('Template creation failed:', e);
      return null;
    }
  };

  // Save reference to a specific notebook (used by ReferencesPage Discover tab)
  const handleAddReferenceToNotebook = async (nbId, data) => {
    try {
      const r = await refsApi.add(nbId, data);
      // If saving to the currently loaded notebook, update state
      if (notebook && notebook.id === nbId) {
        setRefs(prev => [r, ...prev]);
      }
      return r;
    } catch (e) { console.error(e); }
  };

  // Create a plan in a specific notebook (used by CalendarPage)
  const handleCreatePlanForNotebook = async (nbId, data) => {
    try {
      const p = await plansApi.create(nbId, data);
      // If creating in the currently loaded notebook, update state
      if (notebook && notebook.id === nbId) {
        setPlanList(prev => [...prev, p]);
      }
      // Always update allPlans so calendar reflects it immediately
      setAllPlans(prev => [...prev, p]);
      return p;
    } catch (e) { console.error(e); }
  };

  const isLanding = location.pathname === '/';
  if (isLanding) return <LandingPage />;

  const appState = {
    notebook, content, setContent, title, setTitle, wordCount, saveStatus,
    refs, planList, selectedPlanId, setSelectedPlanId,
    handleAddReference, handleDeleteReference, insertCitation,
    handleCreatePlan, handleDeletePlan, handleTriggerAi,
    handleConfirmAi, handleRejectAi,
    chatHistory, handleSendMessage, handleClearChat,
    loadNotebookById, notebookError
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh' }}>
        <AppSidebar darkMode={darkMode} onToggleTheme={() => setDarkMode(!darkMode)} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }} className="animate-fade-in">
            <SpecterLogo size={40} />
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      <AppSidebar darkMode={darkMode} onToggleTheme={() => setDarkMode(!darkMode)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Routes>
          <Route path="/notebooks" element={
            <NotebooksPage allNotebooks={allNotebooks}
              onCreateNotebook={handleCreateNotebook}
              onDeleteNotebook={handleDeleteNotebook}
              onRenameNotebook={handleRenameNotebook}
              onSelectNotebook={(id) => navigate(`/notebooks/${id}`)}
              currentNotebookId={notebook?.id} />
          } />
          <Route path="/notebooks/:id" element={
            <NotebookRoute appState={appState} />
          } />
          {/* Legacy /app route → redirect to notebooks */}
          <Route path="/app" element={
            <NotebooksPage allNotebooks={allNotebooks}
              onCreateNotebook={handleCreateNotebook}
              onDeleteNotebook={handleDeleteNotebook}
              onRenameNotebook={handleRenameNotebook}
              onSelectNotebook={(id) => navigate(`/notebooks/${id}`)}
              currentNotebookId={notebook?.id} />
          } />
          <Route path="/calendar" element={
            <CalendarPage plans={allPlans} allNotebooks={allNotebooks}
              onCreatePlanForNotebook={handleCreatePlanForNotebook}
              onDeletePlan={(id) => { handleDeletePlan(id); setAllPlans(prev => prev.filter(p => p.id !== id)); }}
              onTriggerAi={handleTriggerAi}
              currentNotebook={notebook} onSwitchNotebook={loadNotebookById} />
          } />
          <Route path="/references" element={
            <ReferencesPage references={refs} onAddReference={handleAddReference}
              onAddReferenceToNotebook={handleAddReferenceToNotebook}
              onDeleteReference={handleDeleteReference} notebookId={notebook?.id}
              allNotebooks={allNotebooks} />
          } />
          <Route path="/comparison" element={
            <ComparisonPage allNotebooks={allNotebooks} />
          } />
          <Route path="/dashboard" element={
            <DashboardPage allNotebooks={allNotebooks} />
          } />
          <Route path="/ai-detection" element={
            <AIDetectionPage allNotebooks={allNotebooks} />
          } />
          <Route path="/templates" element={
            <TemplatesPage onCreateFromTemplate={handleCreateFromTemplate} />
          } />
          <Route path="*" element={
            <NotebooksPage allNotebooks={allNotebooks}
              onCreateNotebook={handleCreateNotebook}
              onDeleteNotebook={handleDeleteNotebook}
              onRenameNotebook={handleRenameNotebook}
              onSelectNotebook={(id) => navigate(`/notebooks/${id}`)}
              currentNotebookId={notebook?.id} />
          } />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
