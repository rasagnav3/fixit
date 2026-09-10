import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Map, Plus, ClipboardList, ShieldAlert, List } from 'lucide-react';

export function BottomNav({ currentUser, profile }) {
  const isAdmin = profile?.role === 'admin';

  return (
    <nav className="bottom-nav">
      <NavLink
        to="/"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <Home size={20} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/map"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <Map size={20} />
        <span>Map</span>
      </NavLink>

      {/* Prominent Center CTA for Reporting */}
      <NavLink
        to="/report"
        className="bottom-nav-item bottom-nav-cta"
      >
        <Plus size={24} />
      </NavLink>

      {currentUser ? (
        <NavLink
          to="/my-reports"
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <ClipboardList size={20} />
          <span>My Reports</span>
        </NavLink>
      ) : (
        <NavLink
          to="/issues"
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <List size={20} />
          <span>Issues</span>
        </NavLink>
      )}

      {isAdmin ? (
        <NavLink
          to="/admin"
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <ShieldAlert size={20} />
          <span>Admin</span>
        </NavLink>
      ) : (
        <NavLink
          to="/issues"
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <List size={20} />
          <span>All Issues</span>
        </NavLink>
      )}
    </nav>
  );
}

export default BottomNav;
