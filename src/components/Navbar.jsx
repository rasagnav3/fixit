import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Droplets, PlusCircle, LogIn, LogOut, ShieldCheck, Map, ListFilter, Home, UserCheck } from 'lucide-react';
import NotificationBell from './NotificationBell';

export function Navbar({ currentUser, profile, onLogout }) {
  const navigate = useNavigate();
  const isAdmin = profile?.role === 'admin';

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/" className="nav-brand">
          <img src="/logo.svg" alt="FixIt Campus Logo" className="nav-brand-logo" />
          <span>FixIt Campus</span>
          <span className="nav-brand-tag">SDG 6</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Home
          </NavLink>
          <NavLink to="/issues" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            All Issues
          </NavLink>
          <NavLink to="/map" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Campus Map
          </NavLink>
          {currentUser && (
            <NavLink to="/my-reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              My Reports
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ color: '#b45309', fontWeight: 700 }}>
              Admin Hub
            </NavLink>
          )}
        </nav>

        {/* Actions & Profile */}
        <div className="nav-actions">
          {currentUser ? (
            <>
              {/* Report Issue CTA */}
              <Link to="/report" className="btn btn-primary btn-sm" style={{ display: 'none' }}>
                <PlusCircle size={15} />
                <span>Report Issue</span>
              </Link>
              <Link to="/report" className="btn btn-primary btn-sm" style={{ display: 'inline-flex' }}>
                <PlusCircle size={15} />
                <span>Report</span>
              </Link>

              {/* Notification Bell */}
              <NotificationBell currentUser={currentUser} />

              {/* User Avatar & Role Tag */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.25rem' }}>
                <div style={{
                  display: 'none',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  lineHeight: 1.2
                }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                    {profile?.name || currentUser.email?.split('@')[0]}
                  </span>
                  <span className={`role-chip ${isAdmin ? 'role-chip-admin' : 'role-chip-student'}`}>
                    {profile?.role || 'student'}
                  </span>
                </div>

                <span className={`role-chip ${isAdmin ? 'role-chip-admin' : 'role-chip-student'}`}>
                  {profile?.role || 'student'}
                </span>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={onLogout}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.375rem 0.5rem' }}
                  title="Log out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              <LogIn size={15} />
              <span>Log In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
