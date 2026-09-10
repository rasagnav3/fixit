import React from 'react';

export function StatCard({
  title,
  value,
  icon: Icon,
  color = 'primary',
  subtitle = null,
  onClick = null
}) {
  const colorMap = {
    primary: { bg: 'var(--primary-50)', text: 'var(--primary-700)', border: 'var(--primary-200)' },
    warning: { bg: 'var(--warning-50)', text: 'var(--warning-700)', border: 'var(--warning-200, #fed7aa)' },
    success: { bg: 'var(--success-50)', text: 'var(--success-700)', border: 'var(--success-200, #a7f3d0)' },
    danger: { bg: 'var(--danger-50)', text: 'var(--danger-700)', border: 'var(--danger-200, #fecaca)' },
    slate: { bg: 'var(--slate-100)', text: 'var(--slate-700)', border: 'var(--slate-200)' }
  };

  const theme = colorMap[color] || colorMap.primary;

  return (
    <div
      onClick={onClick}
      className="card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        cursor: onClick ? 'pointer' : 'default',
        padding: '1.25rem 1rem'
      }}
    >
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: theme.bg,
        color: theme.text,
        border: `1px solid ${theme.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {Icon && <Icon size={24} />}
      </div>
      <div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.1, color: 'var(--slate-900)' }}>
          {value !== undefined && value !== null ? value : '-'}
        </div>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-500)', marginTop: '0.125rem' }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.6875rem', color: 'var(--slate-400)', marginTop: '0.25rem' }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;
