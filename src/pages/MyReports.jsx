import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, PlusCircle, Filter } from 'lucide-react';
import { issueService } from '../services/issueService';
import IssueCard from '../components/IssueCard';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import ConfigBanner from '../components/ConfigBanner';

export function MyReports({ currentUser }) {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadUserIssues();
    }
  }, [currentUser]);

  useEffect(() => {
    if (statusFilter === 'All') {
      setFilteredIssues(issues);
    } else {
      setFilteredIssues(issues.filter(i => i.status === statusFilter));
    }
  }, [statusFilter, issues]);

  const loadUserIssues = async () => {
    setLoading(true);
    try {
      const data = await issueService.getMyIssues(currentUser.id);
      setIssues(data);
      setFilteredIssues(data);
    } catch (err) {
      console.error('Error loading my reports:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ConfigBanner />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            My Campus Reports
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
            Track the status, timeline updates, and resolution proof of issues you reported.
          </p>
        </div>

        <Link to="/report" className="btn btn-primary btn-sm">
          <PlusCircle size={16} />
          <span>New Report</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid var(--slate-200)'
      }}>
        {['All', 'Reported', 'In Progress', 'Resolved'].map((tab) => {
          const isActive = statusFilter === tab;
          const count = tab === 'All' ? issues.length : issues.filter(i => i.status === tab).length;

          return (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'var(--primary-600)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--slate-600)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{tab}</span>
              <span style={{
                fontSize: '0.6875rem',
                backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : 'var(--slate-200)',
                color: isActive ? '#ffffff' : 'var(--slate-700)',
                padding: '0.125rem 0.375rem',
                borderRadius: 'var(--radius-full)'
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <LoadingState message="Loading your submitted reports..." />
      ) : filteredIssues.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={statusFilter === 'All' ? 'You have not reported any issues yet' : `No reports currently in '${statusFilter}' status`}
          description="Notice a leaking pipe or sanitation issue around campus? Report it to dispatch facilities maintenance."
          actionLabel="Report an Issue"
          actionLink="/report"
        />
      ) : (
        <div className="grid-cards">
          {filteredIssues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyReports;
