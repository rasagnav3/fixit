import React, { useState } from 'react';
import { MapPin, Navigation, Check, AlertCircle, Loader2, Info } from 'lucide-react';
import { locationService, CAMPUS_LOCATIONS } from '../services/locationService';

export function LocationPicker({
  selectedLocation,
  onLocationChange,
  coordinates,
  onCoordinatesChange
}) {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState(null); // { success: boolean, message: string }
  const [customLocation, setCustomLocation] = useState('');

  const handleUseMyLocation = async () => {
    setGpsLoading(true);
    setGpsStatus(null);
    try {
      const coords = await locationService.getCurrentLocation();
      onCoordinatesChange({
        latitude: coords.latitude,
        longitude: coords.longitude
      });
      setGpsStatus({
        success: true,
        message: `GPS fixed (accurate to ~${coords.accuracy}m)`
      });
    } catch (err) {
      setGpsStatus({
        success: false,
        message: err.message
      });
    } finally {
      setGpsLoading(false);
    }
  };

  const handleLandmarkChange = (e) => {
    const locName = e.target.value;
    onLocationChange(locName);

    // If user hasn't set manual GPS yet, provide landmark default coordinates
    if (!coordinates.latitude || !coordinates.longitude) {
      const defaultCoords = locationService.getDefaultCoordinates(locName);
      onCoordinatesChange(defaultCoords);
    }
  };

  const handleCustomChange = (e) => {
    const val = e.target.value;
    setCustomLocation(val);
    onLocationChange(val || 'Other');
  };

  return (
    <div className="card" style={{ marginBottom: '1.25rem', padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <MapPin size={20} style={{ color: 'var(--primary-600)' }} />
        <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--slate-800)' }}>
          Campus Location
        </h4>
      </div>

      {/* GPS Geo-locate Button */}
      <div style={{ marginBottom: '1rem' }}>
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={gpsLoading}
          className="btn btn-secondary btn-block"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          {gpsLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Detecting Current Location...</span>
            </>
          ) : (
            <>
              <Navigation size={16} style={{ color: 'var(--primary-600)' }} />
              <span>Use My Location (GPS)</span>
            </>
          )}
        </button>

        {gpsStatus && (
          <div style={{
            marginTop: '0.5rem',
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            backgroundColor: gpsStatus.success ? 'var(--success-50)' : 'var(--warning-50)',
            color: gpsStatus.success ? 'var(--success-700)' : 'var(--warning-700)',
            border: `1px solid ${gpsStatus.success ? 'var(--success-200, #a7f3d0)' : 'var(--warning-200, #fed7aa)'}`
          }}>
            {gpsStatus.success ? <Check size={14} /> : <AlertCircle size={14} />}
            <span>{gpsStatus.message}</span>
          </div>
        )}
      </div>

      {/* Indoor & Landmark Selector */}
      <div className="form-group" style={{ marginBottom: '0.75rem' }}>
        <label className="form-label" style={{ fontSize: '0.8125rem' }}>
          Select Campus Building / Zone
        </label>
        <select
          className="form-select"
          value={CAMPUS_LOCATIONS.some(l => l.name === selectedLocation) ? selectedLocation : 'Other'}
          onChange={handleLandmarkChange}
        >
          <option value="" disabled>-- Select Campus Landmark --</option>
          {CAMPUS_LOCATIONS.map(loc => (
            <option key={loc.name} value={loc.name}>
              {loc.name}
            </option>
          ))}
        </select>
        <div className="form-helper" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Info size={12} /> Useful for multi-floor indoor reporting where GPS may drift.
        </div>
      </div>

      {/* Custom specific input if 'Other' selected */}
      {selectedLocation === 'Other' && (
        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
          <label className="form-label" style={{ fontSize: '0.8125rem' }}>
            Specify Specific Location / Floor / Room
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Science Block B, 3rd Floor East Staircase"
            value={customLocation}
            onChange={handleCustomChange}
          />
        </div>
      )}

      {/* Location Confirmation Pill */}
      {selectedLocation && (
        <div style={{
          marginTop: '0.75rem',
          padding: '0.625rem 0.75rem',
          backgroundColor: 'var(--slate-50)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--slate-200)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8125rem'
        }}>
          <div>
            <span style={{ color: 'var(--slate-500)' }}>Confirmed: </span>
            <strong style={{ color: 'var(--slate-900)' }}>{selectedLocation}</strong>
          </div>
          {coordinates.latitude && (
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--primary-700)' }}>
              {Number(coordinates.latitude).toFixed(4)}, {Number(coordinates.longitude).toFixed(4)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default LocationPicker;
