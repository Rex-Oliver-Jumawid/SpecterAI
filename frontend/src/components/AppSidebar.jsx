import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiCalendar, FiSearch, FiSun, FiMoon, FiBookOpen, FiLayers, FiBarChart2, FiShield, FiGrid, FiFileText, FiZap, FiMessageCircle } from 'react-icons/fi';
import SpecterLogo from './SpecterLogo';

export default function AppSidebar({ darkMode, onToggleTheme }) {
  const navigate = useNavigate();

  const navItems = [
    { to: '/notebooks', icon: <FiBookOpen size={17} />, label: 'Notebooks' },
    { to: '/dashboard', icon: <FiBarChart2 size={17} />, label: 'Dashboard' },
    { to: '/calendar', icon: <FiCalendar size={17} />, label: 'Calendar' },
    { to: '/references', icon: <FiSearch size={17} />, label: 'References' },
    { to: '/comparison', icon: <FiLayers size={17} />, label: 'Comparison' },
    { to: '/ai-detection', icon: <FiShield size={17} />, label: 'AI Detection' },
    { to: '/synthesis', icon: <FiZap size={17} />, label: 'Synthesis' },
    { to: '/summarizer', icon: <FiFileText size={17} />, label: 'Summarizer' },
    { to: '/templates', icon: <FiGrid size={17} />, label: 'Templates' },
    { to: '/ask', icon: <FiMessageCircle size={17} />, label: 'Ask AI' },
  ];

  return (
    <aside className="app-sidebar">
      <button className="sidebar-logo-btn" onClick={() => navigate('/')} title="Home">
        <SpecterLogo size={34} />
        <span className="sidebar-logo-text">Specter</span>
      </button>

      <div className="sidebar-divider" />

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span className="sidebar-link-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button onClick={onToggleTheme} className="sidebar-link">
          <span className="sidebar-link-icon">
            {darkMode ? <FiSun size={17} /> : <FiMoon size={17} />}
          </span>
          <span className="sidebar-link-label">{darkMode ? 'Light' : 'Dark'}</span>
        </button>
      </div>
    </aside>
  );
}
