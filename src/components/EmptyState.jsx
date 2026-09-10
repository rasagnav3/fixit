import React from 'react';
import { DropletOff } from 'lucide-react';
import { Link } from 'react-router-dom';

export function EmptyState({
  icon: Icon = DropletOff,
  title = 'No issues found',
  description = 'There are currently no reports matching your filters or search criteria.',
  actionLabel = null,
  actionLink = null,
  onAction = null
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '3.5rem 1.5rem',
      backgroundColor: '#ffffff',
      borderRadius: 'var(--radius-lg)',
      border: '1px dashed var(--slate-300)',
      margin: '1.5rem 0'
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: 'var(--primary-50)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--primary-600)',
        marginBottom: '1rem'
      }}>
        <Icon size={28} />
      </div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--slate-800)' }}>
        {title}
      </h3>
      <p style={{ maxWidth: '420px', fontSize: '0.875rem', color: 'var(--slate-500)', marginBottom: (actionLabel ? '1.25rem' : '0') }}>
        {description}
      </p>
      {actionLabel && actionLink && (
        <Link to={actionLink} className="btn btn-primary btn-sm">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionLink && (
        <button onClick={onAction} className="btn btn-primary btn-sm">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
