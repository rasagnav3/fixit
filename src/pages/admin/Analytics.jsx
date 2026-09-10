import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, ArrowLeft, Droplets, CheckCircle, Clock, AlertTriangle, TrendingUp, Percent } from 'lucide-react';
import { issueService } from '../../services/issueService';
import StatCard from '../../components/StatCard';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import ConfigBanner from '../../components/ConfigBanner';

export function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const analytics = await issueService.getAnalyticsData();
      setData(analytics);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ConfigBanner />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link to="/admin" style={{ color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem' }}>
              <ArrowLeft size={14} /> Hub
            </Link>
            <span style={{ color: 'var(--slate-300)' }}>/</span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              Campus Facilities & Water Analytics
            </h1>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
            Performance metrics, resolution turnaround, and issue classification for SDG 6 initiatives.
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          className="btn btn-secondary btn-sm"
        >
          Refresh Data
        </button>
      </div>

      {loading ? (
        <LoadingState message="Calculating campus analytics from database..." />
      ) : !data || data.total === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No reports available yet."
          description="There is currently no issue data in the database to generate statistics. When students report issues, analytics will appear automatically."
          actionLabel="Report First Issue"
          actionLink="/report"
        />
      ) : (
        <>
          {/* Key KPI Metrics */}
          <div className="grid-stats" style={{ marginBottom: '2rem' }}>
            <StatCard
              title="Total Issues"
              value={data.total}
              icon={Droplets}
              color="primary"
              subtitle="All campus tickets"
            />
            <StatCard
              title="Resolution Rate"
              value={`${data.resolutionRate}%`}
              icon={Percent}
              color="success"
              subtitle={`${data.resolvedCount} of ${data.total} resolved`}
            />
            <StatCard
              title="Urgent Reports"
              value={data.urgentCount}
              icon={AlertTriangle}
              color="danger"
              subtitle="Critical leaks or hazards"
            />
            <StatCard
              title="Avg Resolution Time"
              value={data.avgResolutionHours > 0 ? `${data.avgResolutionHours}h` : 'N/A'}
              icon={Clock}
              color="warning"
              subtitle="Hours from report to fix"
            />
          </div>

          {/* Breakdown Charts (CSS/SVG Progress Bars) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {/* Reports by Category */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.25rem' }}>
                Reports by Category
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginBottom: '1.5rem' }}>
                Breakdown across water, leakage, tap, drainage, and sanitation
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {data.byCategory.map((item) => {
                  const pct = Math.round((item.count / data.total) * 100);
                  return (
                    <div key={item.category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                        <span style={{ color: 'var(--slate-800)' }}>{item.category}</span>
                        <span style={{ color: 'var(--slate-500)' }}>{item.count} ({pct}%)</span>
                      </div>
                      <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--slate-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${pct}%`,
                          backgroundColor: 'var(--primary-600)',
                          borderRadius: 'var(--radius-full)',
                          transition: 'width 0.5s ease'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reports by Lifecycle Status */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.25rem' }}>
                Lifecycle Status Pipeline
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginBottom: '1.5rem' }}>
                Distribution across Reported, In Progress, and Resolved
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {data.byStatus.map((item) => {
                  const pct = Math.round((item.count / data.total) * 100);
                  let barColor = 'var(--warning-500)';
                  if (item.status === 'In Progress') barColor = 'var(--primary-600)';
                  if (item.status === 'Resolved') barColor = 'var(--success-600)';

                  return (
                    <div key={item.status}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                        <span style={{ color: 'var(--slate-800)' }}>{item.status}</span>
                        <span style={{ color: 'var(--slate-500)' }}>{item.count} ({pct}%)</span>
                      </div>
                      <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--slate-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${pct}%`,
                          backgroundColor: barColor,
                          borderRadius: 'var(--radius-full)',
                          transition: 'width 0.5s ease'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Water Conservation Note */}
              <div style={{
                marginTop: '2rem',
                padding: '1rem',
                backgroundColor: 'var(--primary-50)',
                border: '1px solid var(--primary-200)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                color: 'var(--primary-900)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}>
                <Droplets size={18} style={{ color: 'var(--primary-600)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>SDG 6 Impact:</strong> Resolving {data.resolvedCount} campus leaks saves an estimated <strong>{(data.resolvedCount * 450).toLocaleString()} liters</strong> of clean treated water per month.
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Analytics;
