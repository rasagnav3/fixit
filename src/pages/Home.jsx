import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Droplets, PlusCircle, AlertTriangle, ArrowRight, ClipboardList, ShieldAlert, CheckCircle, Clock, Wrench } from 'lucide-react';
import { issueService } from '../services/issueService';
import StatCard from '../components/StatCard';
import IssueCard from '../components/IssueCard';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import ConfigBanner from '../components/ConfigBanner';

export function Home({ currentUser }) {
  const [stats, setStats] = useState({ total: 0, reported: 0, inProgress: 0, resolved: 0, urgent: 0 });
  const [recentIssues, setRecentIssues] = useState([]);
  const [urgentIssues, setUrgentIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    setLoading(true);
    try {
      const [statsData, issuesData] = await Promise.all([
        issueService.getCampusStats(),
        issueService.getIssues({ limit: 6, sortBy: 'newest' })
      ]);

      setStats(statsData);
      setRecentIssues(issuesData);
      setUrgentIssues(issuesData.filter(i => i.priority === 'Urgent' && i.status !== 'Resolved'));
    } catch (err) {
      console.warn('Error loading home data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ConfigBanner />

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #0c4a6e 100%)',
        color: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        padding: '2.5rem 1.5rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle water wave background accents */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-5%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '720px', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(4px)',
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            fontWeight: 700,
            marginBottom: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            <Droplets size={14} /> UN SDG 6: Clean Water & Sanitation
          </div>

          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#ffffff', lineHeight: 1.2, marginBottom: '0.75rem' }}>
            Empowering Campus Civic Action for Clean Water
          </h1>

          <p style={{ fontSize: '1rem', color: '#e0f2fe', lineHeight: 1.5, marginBottom: '1.75rem' }}>
            Spot a leaking tap, broken pipeline, water cooler defect, or drainage hazard? Report it in seconds with photo evidence and geolocation. Help save thousands of liters of clean water every week.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <Link
              to="/report"
              className="btn btn-lg"
              style={{
                backgroundColor: '#ffffff',
                color: 'var(--primary-700)',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              <PlusCircle size={20} />
              <span>Report an Issue</span>
            </Link>

            {currentUser && (
              <Link
                to="/my-reports"
                className="btn btn-lg"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                <ClipboardList size={20} />
                <span>My Reports</span>
              </Link>
            )}

            <Link
              to="/map"
              className="btn btn-lg"
              style={{
                backgroundColor: 'transparent',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <span>View Map</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Statistics */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            Campus Infrastructure Overview
          </h2>
          <span style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>Live Metrics</span>
        </div>

        <div className="grid-stats grid-stats-5">
          <StatCard
            title="Total Issues"
            value={stats.total}
            icon={Droplets}
            color="primary"
          />
          <StatCard
            title="Reported"
            value={stats.reported}
            icon={Clock}
            color="warning"
            subtitle="Pending triage"
          />
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon={Wrench}
            color="primary"
            subtitle="Under maintenance"
          />
          <StatCard
            title="Resolved"
            value={stats.resolved}
            icon={CheckCircle}
            color="success"
            subtitle="Repaired & verified"
          />
          <StatCard
            title="Urgent Priority"
            value={stats.urgent}
            icon={AlertTriangle}
            color="danger"
            subtitle="Active critical leaks"
          />
        </div>
      </section>

      {/* Urgent Issues Alert Banner (if any active urgent issues exist) */}
      {urgentIssues.length > 0 && (
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{
            backgroundColor: 'var(--danger-50)',
            border: '1px solid var(--danger-200, #fecaca)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <AlertTriangle size={20} style={{ color: 'var(--danger-600)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--danger-700)' }}>
                Urgent Attention Required ({urgentIssues.length} active)
              </h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--danger-600)', marginBottom: '1rem' }}>
              Critical water leaks and sanitation hazards flagged by campus community.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
              {urgentIssues.slice(0, 3).map(issue => (
                <Link
                  key={issue.id}
                  to={`/issues/${issue.id}`}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--danger-200, #fecaca)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textDecoration: 'none'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--danger-600)' }}>
                      {issue.issue_code} • {issue.location_name}
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--slate-800)', marginTop: '0.125rem' }}>
                      {issue.title}
                    </div>
                  </div>
                  <ArrowRight size={16} style={{ color: 'var(--danger-600)', flexShrink: 0 }} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Campus Issues */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              Recent Campus Reports
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
              Latest water and sanitation issues reported by students & staff
            </p>
          </div>

          <Link to="/issues" className="btn btn-secondary btn-sm">
            <span>View All</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <LoadingState message="Fetching recent campus reports..." />
        ) : recentIssues.length === 0 ? (
          <EmptyState
            title="No campus issues reported yet"
            description="The campus water systems are running smoothly! Be the first to report if you spot an issue."
            actionLabel="Report an Issue"
            actionLink="/report"
          />
        ) : (
          <div className="grid-cards">
            {recentIssues.map(issue => (
              <IssueCard
                key={issue.id}
                issue={issue}
                currentUser={currentUser}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
