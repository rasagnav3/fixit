import React from 'react';
import { Search, Filter, X, ArrowDownUp } from 'lucide-react';

const CATEGORIES = ['All', 'Water', 'Leakage', 'Tap', 'Sanitation', 'Drainage', 'Other'];
const STATUSES = ['All', 'Reported', 'In Progress', 'Resolved'];
const PRIORITIES = ['All', 'Urgent', 'High', 'Medium', 'Low'];

export function FilterBar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  sortBy,
  onSortChange,
  onReset
}) {
  const hasActiveFilters = search || (category && category !== 'All') || (status && status !== 'All') || (priority && priority !== 'All') || (sortBy && sortBy !== 'newest');

  return (
    <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
      {/* Search and Sort row */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        alignItems: 'center',
        marginBottom: '0.75rem'
      }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--slate-400)'
          }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.25rem' }}
            placeholder="Search by title, code, location or description..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              style={{
                position: 'absolute',
                right: '0.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--slate-400)',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Sort selector */}
        {onSortChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '0 0 auto' }}>
            <ArrowDownUp size={16} style={{ color: 'var(--slate-500)' }} />
            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.5rem 0.75rem' }}
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Highest Priority</option>
              <option value="votes">Most Upvoted</option>
            </select>
          </div>
        )}

        {hasActiveFilters && onReset && (
          <button
            onClick={onReset}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Filter Chips & Dropdowns */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        alignItems: 'center',
        paddingTop: '0.5rem',
        borderTop: '1px solid var(--slate-100)'
      }}>
        {/* Category */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)' }}>Category:</span>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.375rem 0.625rem', fontSize: '0.8125rem' }}
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)' }}>Status:</span>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.375rem 0.625rem', fontSize: '0.8125rem' }}
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Priority */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)' }}>Priority:</span>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.375rem 0.625rem', fontSize: '0.8125rem' }}
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value)}
          >
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

export default FilterBar;
