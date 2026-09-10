import React from 'react';
import { AlertCircle, ExternalLink, Database, Terminal } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

export function ConfigBanner() {
  if (isSupabaseConfigured()) return null;

  return (
    <div style={{
      backgroundColor: '#fffbeb',
      border: '1px solid #fde68a',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem',
      marginBottom: '1.5rem',
      color: '#92400e'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <AlertCircle size={24} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
        <div style={{ flex: 1 }}>
          <h4 style={{ fontWeight: 700, fontSize: '1rem', color: '#b45309', marginBottom: '0.25rem' }}>
            Backend not configured
          </h4>
          <p style={{ fontSize: '0.875rem', color: '#78350f', marginBottom: '0.75rem' }}>
            Add your Supabase environment variables to connect the database.
          </p>

          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #fef3c7',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem',
            fontSize: '0.8125rem',
            fontFamily: 'monospace',
            color: '#1e293b'
          }}>
            <div>VITE_SUPABASE_URL=https://your-project-ref.supabase.co</div>
            <div>VITE_SUPABASE_ANON_KEY=eyJhbGciOi...</div>
          </div>

          <div style={{
            marginTop: '0.75rem',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Terminal size={14} /> 1. Create a free project on Supabase
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Database size={14} /> 2. Execute SQL in <code>supabase/schema.sql</code>
            </span>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                color: '#b45309',
                fontWeight: 700,
                textDecoration: 'underline'
              }}
            >
              Open Supabase Dashboard <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfigBanner;
