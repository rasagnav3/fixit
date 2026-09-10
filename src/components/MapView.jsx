import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { ExternalLink, MapPin } from 'lucide-react';

// Generate custom DivIcon for status-based marker pins
const createCustomMarker = (status, category) => {
  const normStatus = (status || 'Reported').toLowerCase();
  
  let pinColor = '#f59e0b'; // Amber for Reported
  let pulseClass = '';

  if (normStatus === 'in progress') {
    pinColor = '#0284c7'; // Blue for In Progress
  } else if (normStatus === 'resolved') {
    pinColor = '#10b981'; // Emerald for Resolved
  } else {
    pulseClass = 'marker-pulse';
  }

  const svgHtml = `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      <div style="
        width: 28px;
        height: 28px;
        background-color: ${pinColor};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid #ffffff;
        box-shadow: 0 3px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background-color: #ffffff;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-campus-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

export function MapView({
  issues = [],
  center = [12.9716, 77.5946],
  zoom = 16,
  height = '400px',
  singleMarker = null,
  interactive = true
}) {
  const markersToRender = singleMarker ? [singleMarker] : issues;

  // Filter items with valid coordinates
  const validMarkers = markersToRender.filter(
    i => i.latitude && i.longitude && !isNaN(i.latitude) && !isNaN(i.longitude)
  );

  const mapCenter = singleMarker && singleMarker.latitude && singleMarker.longitude
    ? [singleMarker.latitude, singleMarker.longitude]
    : center;

  return (
    <div style={{ width: '100%', height, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--slate-200)' }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={interactive}
        dragging={interactive}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {validMarkers.map((issue) => {
          const markerIcon = createCustomMarker(issue.status, issue.category);

          return (
            <Marker
              key={issue.id}
              position={[parseFloat(issue.latitude), parseFloat(issue.longitude)]}
              icon={markerIcon}
            >
              <Popup>
                <div style={{ minWidth: '200px', maxWidth: '240px', padding: '0.25rem 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                      {issue.issue_code}
                    </span>
                    <PriorityBadge priority={issue.priority} />
                  </div>

                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: '0.25rem 0', color: 'var(--slate-900)', lineHeight: 1.3 }}>
                    {issue.title}
                  </h4>

                  {issue.photo_url && (
                    <img
                      src={issue.photo_url}
                      alt={issue.title}
                      style={{
                        width: '100%',
                        height: '90px',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-sm)',
                        margin: '0.375rem 0'
                      }}
                    />
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--slate-500)', marginBottom: '0.5rem' }}>
                    <MapPin size={12} />
                    <span>{issue.location_name}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.375rem', borderTop: '1px solid var(--slate-100)' }}>
                    <StatusBadge status={issue.status} />
                    <Link
                      to={`/issues/${issue.id}`}
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--primary-600)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      View <ExternalLink size={11} />
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default MapView;
