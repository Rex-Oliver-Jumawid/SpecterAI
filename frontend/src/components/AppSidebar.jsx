import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FiEdit3, FiCalendar, FiSearch, FiSun, FiMoon, FiBookOpen, FiMessageSquare, FiSettings } from 'react-icons/fi';

export default function AppSidebar({ darkMode, onToggleTheme, onToggleChat, chatOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { to: '/notebooks', icon: <FiBookOpen size={18} />, label: 'Notebooks' },
    { to: '/app', icon: <FiEdit3 size={18} />, label: 'Editor' },
    { to: '/calendar', icon: <FiCalendar size={18} />, label: 'Calendar' },
    { to: '/references', icon: <FiSearch size={18} />, label: 'References' },
  ];

  return (
    <aside className="app-sidebar">
      {/* Logo — clickable to home */}
      <button className="sidebar-logo-btn" onClick={() => navigate('/')} title="Home">
        <div className="sidebar-logo-icon">
          <span>👻</span>
        </div>
        <span className="sidebar-logo-text">Specter</span>
      </button>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            title={item.label}
          >
            <div className="sidebar-link-icon">{item.icon}</div>
            <span className="sidebar-link-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="sidebar-bottom">
        {/* Chat — only in editor */}
        {location.pathname === '/app' && onToggleChat && (
          <button
            onClick={onToggleChat}
            className={`sidebar-link ${chatOpen ? 'active' : ''}`}
            title="AI Chat"
          >
            <div className="sidebar-link-icon"><FiMessageSquare size={18} /></div>
            <span className="sidebar-link-label">AI Chat</span>
          </button>
        )}
        <button onClick={onToggleTheme} className="sidebar-link" title={darkMode ? 'Light mode' : 'Dark mode'}>
          <div className="sidebar-link-icon">
            {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
          </div>
          <span className="sidebar-link-label">{darkMode ? 'Light' : 'Dark'}</span>
        </button>
      </div>
    </aside>
  );
}
