import React from 'react';
import { Clock, Wrench, CheckCircle2, User, Calendar, ShieldCheck } from 'lucide-react';
import StatusBadge from './StatusBadge';

export function IssueTimeline({ updates = [], createdAt, reportedBy = null }) {
  // Format date helper
  const formatDate = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'resolved') {
      return <CheckCircle2 size={16} style={{ color: 'var(--success-600)' }} />;
    }
    if (s === 'in progress') {
      return <Wrench size={16} style={{ color: 'var(--primary-600)' }} />;
    }
    return <Clock size={16} style={{ color: 'var(--warning-600)' }} />;
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--slate-800)' }}>
        Resolution Timeline & History
      </h3>

      <div className="timeline">
        {/* Step 1: Initial Submission */}
        <div className="timeline-item">
          <div className="timeline-dot">
            <Clock size={14} style={{ color: 'var(--warning-600)' }} />
          </div>
          <div className="timeline-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <StatusBadge status="Reported" />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-700)' }}>
                  Issue Reported
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                {formatDate(createdAt)}
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--slate-600)' }}>
              Initial ticket created and queued for campus operations review.
            </p>
            {reportedBy && (
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <User size={12} /> Reported by {reportedBy.name || 'Campus Student'}
              </div>
            )}
          </div>
        </div>

        {/* Steps 2+: Audit updates */}
        {updates
          .filter(u => u.old_status !== null) // filter out the initial synthetic update if duplicate
          .map((update, index) => (
            <div key={update.id || index} className="timeline-item">
              <div className="timeline-dot">
                {getStatusIcon(update.new_status)}
              </div>
              <div className="timeline-content">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <StatusBadge status={update.new_status} />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-700)' }}>
                      Transitioned to {update.new_status}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={12} /> {formatDate(update.created_at)}
                  </span>
                </div>

                {update.note && (
                  <div style={{
                    backgroundColor: '#ffffff',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--slate-200)',
                    fontSize: '0.8125rem',
                    color: 'var(--slate-700)',
                    marginTop: '0.375rem'
                  }}>
                    <strong>Note:</strong> {update.note}
                  </div>
                )}

                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--slate-500)',
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <ShieldCheck size={12} style={{ color: 'var(--primary-600)' }} />
                  Action logged by: {update.updater?.name || 'Campus Facility Admin'}
                  {update.updater?.role === 'admin' && (
                    <span className="role-chip role-chip-admin" style={{ marginLeft: '0.25rem' }}>Admin</span>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default IssueTimeline;
