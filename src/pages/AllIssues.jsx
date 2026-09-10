import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, ListFilter, Droplets } from 'lucide-react';
import { issueService } from '../services/issueService';
import IssueCard from '../components/IssueCard';
import FilterBar from '../components/FilterBar';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import ConfigBanner from '../components/ConfigBanner';

export function AllIssues({ currentUser }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadIssues();
  }, [category, status, priority, sortBy]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      loadIssues();
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const loadIssues = async () => {
    setLoading(true);
    try {
      const data = await issueService.getIssues({
        search,
        category,
        status,
        priority,
        sortBy
      });
      setIssues(data);
    } catch (err) {
      console.error('Error fetching all issues:', err);
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
            Campus Civic Issue Directory
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
            Explore public reports, track resolution progress, and upvote priority fixes.
          </p>
        </div>

        <Link to="/report" className="btn btn-primary btn-sm">
          <PlusCircle size={16} />
          <span>Report New</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
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
        <LoadingState message="Filtering campus reports..." />
      ) : issues.length === 0 ? (
        <EmptyState
          title="No issues found"
          description="There are currently no reports matching your filters or search terms."
          actionLabel="Clear Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="grid-cards">
          {issues.map(issue => (
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

export default AllIssues;
