import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Droplets,
  Clock,
  Wrench,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  ListFilter,
  User,
  Calendar,
  MapPin
} from 'lucide-react';
import { issueService } from '../../services/issueService';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import LoadingState from '../../components/LoadingState';
import ConfigBanner from '../../components/ConfigBanner';

export function AdminDashboard({ currentUser, profile }) {
  const [stats, setStats] = useState({ total: 0, reported: 0, inProgress: 0, resolved: 0, urgent: 0 });
  const [recentIssues, setRecentIssues] = useState([]);
  const [urgentIssues, setUrgentIssues] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, issuesData, analyticsData] = await Promise.all([
        issueService.getCampusStats(),
        issueService.getIssues({ limit: 8, sortBy: 'newest' }),
        issueService.getAnalyticsData()
      ]);

      setStats(statsData);
      setRecentIssues(issuesData);
      setUrgentIssues(issuesData.filter(i => i.priority === 'Urgent' && i.status !== 'Resolved'));
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <ConfigBanner />

      {/* Admin Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--slate-200)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              Campus Facilities & Operations Hub
            </h1>
            <span className="role-chip role-chip-admin">Admin Portal</span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
            Manage campus civic reports, authorize status transitions, and audit resolution evidence.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/issues" className="btn btn-secondary btn-sm">
            <ListFilter size={16} />
            <span>Manage Reports</span>
          </Link>

          <Link to="/admin/analytics" className="btn btn-primary btn-sm">
            <BarChart3 size={16} />
            <span>View Analytics</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <section style={{ marginBottom: '2rem' }}>
        <div className="grid-stats grid-stats-5">
          <StatCard
            title="Total Reports"
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
            subtitle="Under active repair"
          />
          <StatCard
            title="Resolved"
            value={stats.resolved}
            icon={CheckCircle}
            color="success"
            subtitle="Turnaround verified"
          />
          <StatCard
            title="Urgent Critical"
            value={stats.urgent}
            icon={AlertTriangle}
            color="danger"
            subtitle="Active priority"
          />
        </div>
      </section>

      {/* Urgent Issues Action Queue */}
      {urgentIssues.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <div className="card" style={{ border: '1px solid var(--danger-200, #fecaca)', backgroundColor: '#fff5f5', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={20} style={{ color: 'var(--danger-600)' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--danger-700)' }}>
                  Urgent Action Queue ({urgentIssues.length})
                </h3>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--danger-600)' }}>
                Immediate Dispatch Recommended
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
              {urgentIssues.map((issue) => (
                <div
                  key={issue.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    border: '1px solid var(--danger-200, #fecaca)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--danger-700)' }}>
                        {issue.issue_code}
                      </span>
                      <StatusBadge status={issue.status} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--slate-900)', marginBottom: '0.25rem' }}>
                      {issue.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={12} /> {issue.location_name}
                    </div>
                  </div>

                  <Link
                    to={`/admin/issues/${issue.id}`}
                    className="btn btn-danger btn-sm"
                    style={{ marginTop: '0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                  >
                    <span>Triage & Update</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Operational Feed */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              Recent Campus Submissions
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
              Latest incoming student civic reports
            </p>
          </div>

          <Link to="/admin/issues" className="btn btn-secondary btn-sm">
            <span>View All Reports</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <LoadingState message="Loading facilities dashboard data..." />
        ) : recentIssues.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
            No reports available yet.
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'left' }}>
                <thead style={{ backgroundColor: 'var(--slate-50)', borderBottom: '1px solid var(--slate-200)' }}>
                  <tr>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>Code</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>Title</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>Category</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>Priority</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>Location</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>Reported</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--slate-600)', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentIssues.map((issue) => (
                    <tr key={issue.id} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                        {issue.issue_code}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--slate-900)', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {issue.title}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--slate-600)' }}>
                        {issue.category}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <PriorityBadge priority={issue.priority} />
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <StatusBadge status={issue.status} />
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--slate-600)' }}>
                        {issue.location_name}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--slate-400)', whiteSpace: 'nowrap' }}>
                        {formatDate(issue.created_at)}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <Link
                          to={`/admin/issues/${issue.id}`}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;
