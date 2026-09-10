import React, { useEffect, useState } from 'react';
import { MapPin, Filter, Layers, Droplets } from 'lucide-react';
import { issueService } from '../services/issueService';
import MapView from '../components/MapView';
import LoadingState from '../components/LoadingState';
import ConfigBanner from '../components/ConfigBanner';

export function CampusMap() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    loadMapIssues();
  }, []);

  const loadMapIssues = async () => {
    setLoading(true);
    try {
      const data = await issueService.getIssues({ limit: 100 });
      setIssues(data);
    } catch (err) {
      console.error('Error fetching map issues:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues = issues.filter(issue => {
    if (statusFilter !== 'All' && issue.status !== statusFilter) return false;
    if (categoryFilter !== 'All' && issue.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div>
      <ConfigBanner />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            Interactive Campus Water & Infrastructure Map
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
            Live geospatial overview of active and resolved issues across campus landmarks.
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#ffffff', padding: '0.5rem 0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)', fontSize: '0.75rem', fontWeight: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></span>
            <span>Reported</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0284c7' }}></span>
            <span>In Progress</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
            <span>Resolved</span>
          </div>
        </div>
      </div>

      {/* Map Filter Controls */}
      <div className="card" style={{ padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} style={{ color: 'var(--slate-400)' }} />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-700)' }}>Status:</span>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.375rem 0.625rem', fontSize: '0.8125rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses ({issues.length})</option>
            <option value="Reported">Reported</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={16} style={{ color: 'var(--slate-400)' }} />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-700)' }}>Category:</span>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.375rem 0.625rem', fontSize: '0.8125rem' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Water">Water</option>
            <option value="Leakage">Leakage</option>
            <option value="Tap">Tap</option>
            <option value="Sanitation">Sanitation</option>
            <option value="Drainage">Drainage</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto', fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
          Showing <strong>{filteredIssues.length}</strong> pin{filteredIssues.length === 1 ? '' : 's'} on campus
        </div>
      </div>

      {/* Full Campus Map */}
      {loading ? (
        <LoadingState message="Loading campus map coordinates..." />
      ) : (
        <MapView
          issues={filteredIssues}
          height="calc(100vh - 240px)"
          zoom={16}
          interactive={true}
        />
      )}
    </div>
  );
}

export default CampusMap;
