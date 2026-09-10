import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, ArrowUpDown, Filter, Search, X } from 'lucide-react';
import { issueService } from '../../services/issueService';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import FilterBar from '../../components/FilterBar';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import ConfigBanner from '../../components/ConfigBanner';

export function AdminIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadAdminIssues();
  }, [category, status, priority, sortBy]);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadAdminIssues();
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const loadAdminIssues = async () => {
    setLoading(true);
    try {
      const data = await issueService.getIssues({
        search,
        category,
        status,
        priority,
        sortBy,
        limit: 150
      });
      setIssues(data);
    } catch (err) {
      console.error('Error fetching admin issues:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setStatus('All');
    setPriority('All');
    setSortBy('newest');
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
              All Campus Issues Management
            </h1>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
            Filter, search, inspect reports, and initiate maintenance transitions.
          </p>
        </div>

        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-600)' }}>
          Total Listed: <strong>{issues.length}</strong>
        </div>
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        status={status}
        onStatusChange={setStatus}
        priority={priority}
        onPriorityChange={setPriority}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onReset={handleResetFilters}
      />

      {loading ? (
        <LoadingState message="Loading campus issues repository..." />
      ) : issues.length === 0 ? (
        <EmptyState
          title="No issues found"
          description="There are currently no reports matching your filters or search criteria."
          actionLabel="Reset Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'left' }}>
              <thead style={{ backgroundColor: 'var(--slate-50)', borderBottom: '1px solid var(--slate-200)' }}>
                <tr>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>ID</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>Title</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>Category</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>Priority</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>Location</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>Reporter</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--slate-600)' }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--slate-600)', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={issue.id} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                      {issue.issue_code}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--slate-900)', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <Link to={`/admin/issues/${issue.id}`} style={{ color: 'inherit' }}>
                        {issue.title}
                      </Link>
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
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--slate-500)' }}>
                      {issue.reporter?.name || 'Campus Student'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--slate-400)', whiteSpace: 'nowrap' }}>
                      {formatDate(issue.created_at)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <Link
                        to={`/admin/issues/${issue.id}`}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}
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
    </div>
  );
}

export default AdminIssues;
