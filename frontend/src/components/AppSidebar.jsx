import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiCalendar, FiSearch, FiSun, FiMoon, FiBookOpen, FiLayers } from 'react-icons/fi';
import SpecterLogo from './SpecterLogo';

export default function AppSidebar({ darkMode, onToggleTheme }) {
  const navigate = useNavigate();

  const navItems = [
    { to: '/notebooks', icon: <FiBookOpen size={17} />, label: 'Notebooks' },
    { to: '/calendar', icon: <FiCalendar size={17} />, label: 'Calendar' },
    { to: '/references', icon: <FiSearch size={17} />, label: 'References' },
    { to: '/comparison', icon: <FiLayers size={17} />, label: 'Comparison' },
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
