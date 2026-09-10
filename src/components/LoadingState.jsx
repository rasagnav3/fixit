import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingState({ message = 'Loading campus reports...', fullScreen = false }) {
  if (fullScreen) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '1rem',
        color: 'var(--slate-600)'
      }}>
        <Loader2 size={36} className="animate-spin" style={{ color: 'var(--primary-600)' }} />
        <p style={{ fontWeight: 500 }}>{message}</p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1rem',
      gap: '0.75rem',
      color: 'var(--slate-600)'
    }}>
      <Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary-600)' }} />
      <span style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{message}</span>
    </div>
  );
}

export default LoadingState;
