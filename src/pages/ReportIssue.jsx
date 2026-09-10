import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Droplets, Wrench, ShieldAlert, CheckCircle2, AlertCircle, Loader2, ArrowRight, PlusCircle, Sparkles } from 'lucide-react';
import PhotoUploader from '../components/PhotoUploader';
import LocationPicker from '../components/LocationPicker';
import { issueService } from '../services/issueService';
import { uploadService } from '../services/uploadService';
import ConfigBanner from '../components/ConfigBanner';

const CATEGORIES = [
  { id: 'Tap', label: 'Broken Tap / Faucet', icon: Droplets, desc: 'Dripping or damaged taps' },
  { id: 'Leakage', label: 'Pipe Leakage', icon: Droplets, desc: 'Burst or dripping pipes' },
  { id: 'Water', label: 'Water Supply / Quality', icon: Droplets, desc: 'Contaminated water or dry supply' },
  { id: 'Drainage', label: 'Drainage Overflow', icon: Wrench, desc: 'Clogged drains & sewer blockages' },
  { id: 'Sanitation', label: 'Sanitation / Washroom', icon: Wrench, desc: 'Toilet flushes, hygiene & sinks' },
  { id: 'Other', label: 'Other Infrastructure', icon: ShieldAlert, desc: 'General campus civic issues' }
];

const PRIORITIES = [
  { id: 'Low', label: 'Low', desc: 'Minor drip or aesthetic defect' },
  { id: 'Medium', label: 'Medium', desc: 'Standard maintenance required' },
  { id: 'High', label: 'High', desc: 'Significant water waste or hindrance' },
  { id: 'Urgent', label: 'Urgent', desc: 'Flooding, structural risk, hazard' }
];

export function ReportIssue({ currentUser }) {
  const navigate = useNavigate();

  // Form State
  const [category, setCategory] = useState('Tap');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [locationName, setLocationName] = useState('Main Block');
  const [coordinates, setCoordinates] = useState({ latitude: 12.9716, longitude: 77.5946 });

  // Photo State
  const [photoFile, setPhotoFile] = useState(null);

  // Status & Submission State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submittedIssue, setSubmittedIssue] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // Prevent double submission
    setError(null);

    // Client-side Validations
    if (!title.trim() || title.trim().length < 5) {
      setError('Please provide a title with at least 5 characters.');
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setError('Please provide a detailed description (at least 10 characters).');
      return;
    }
    if (!locationName) {
      setError('Please select or specify the campus location.');
      return;
    }
    if (!currentUser) {
      setError('You must be signed in to submit a report.');
      return;
    }

    setSubmitting(true);

    try {
      let photoUrl = null;

      // 1. Upload photo if selected
      if (photoFile) {
        try {
          photoUrl = await uploadService.uploadPhoto(photoFile, 'issue-images', currentUser.id);
        } catch (uploadErr) {
          console.warn('Photo upload failed, continuing with report:', uploadErr);
          // Don't block report submission if storage fails, but alert
        }
      }

      // 2. Insert issue record
      const issue = await issueService.createIssue({
        title,
        description,
        category,
        priority,
        photo_url: photoUrl,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        location_name: locationName,
        reported_by: currentUser.id
      });

      setSubmittedIssue(issue);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to submit report. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setCategory('Tap');
    setPriority('Medium');
    setLocationName('Main Block');
    setPhotoFile(null);
    setSubmittedIssue(null);
    setError(null);
  };

  // If issue is submitted, display success screen
  if (submittedIssue) {
    return (
      <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--success-50)',
            color: 'var(--success-600)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
            Report Submitted Successfully!
          </h2>

          <p style={{ fontSize: '0.9375rem', color: 'var(--slate-600)', marginBottom: '1.5rem' }}>
            Thank you for being proactive in conserving campus water and sanitation resources.
          </p>

          <div style={{
            backgroundColor: 'var(--slate-50)',
            border: '1px solid var(--slate-200)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                Issue ID
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-700)', marginTop: '0.25rem' }}>
                {submittedIssue.issue_code}
              </div>
            </div>

            <div style={{ height: '36px', width: '1px', backgroundColor: 'var(--slate-200)' }} />

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                Initial Status
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--warning-600)', marginTop: '0.25rem' }}>
                Reported
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to={`/issues/${submittedIssue.id}`} className="btn btn-primary btn-lg">
              <span>View Report Details</span>
              <ArrowRight size={18} />
            </Link>

            <button type="button" onClick={handleReset} className="btn btn-secondary btn-lg">
              <PlusCircle size={18} />
              <span>Report Another Issue</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '760px', margin: '1rem auto' }}>
      <ConfigBanner />

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
          Report Campus Water & Sanitation Issue
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
          Fill in the details below to dispatch facility maintenance and conserve campus resources.
        </p>
      </div>

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.875rem 1rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--danger-50)',
          color: 'var(--danger-700)',
          fontSize: '0.875rem',
          marginBottom: '1.5rem',
          border: '1px solid var(--danger-200, #fecaca)'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Section 1: Category Picker */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{ fontSize: '0.9375rem', marginBottom: '0.75rem' }}>
            1. Select Issue Category <span style={{ color: 'var(--danger-600)' }}>*</span>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;

              return (
                <div
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  style={{
                    padding: '0.875rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${isSelected ? 'var(--primary-600)' : 'var(--slate-200)'}`,
                    backgroundColor: isSelected ? 'var(--primary-50)' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.625rem'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isSelected ? 'var(--primary-600)' : 'var(--slate-100)',
                    color: isSelected ? '#ffffff' : 'var(--slate-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: isSelected ? 'var(--primary-800)' : 'var(--slate-900)' }}>
                      {cat.label}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--slate-500)', marginTop: '0.125rem' }}>
                      {cat.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Title & Description */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">
              2. Title / Summary <span style={{ color: 'var(--danger-600)' }}>*</span>
            </label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Continuously leaking faucet in 2nd floor women's washroom"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="form-helper">Keep it descriptive and concise.</div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              3. Detailed Description <span style={{ color: 'var(--danger-600)' }}>*</span>
            </label>
            <textarea
              required
              rows={4}
              className="form-textarea"
              placeholder="Describe the problem, rate of water leakage, potential hazards (e.g. slippery floor), or any specific details that will help maintenance locate and fix it..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Section 3: Priority Selector */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{ fontSize: '0.9375rem', marginBottom: '0.75rem' }}>
            4. Severity & Priority Level <span style={{ color: 'var(--danger-600)' }}>*</span>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem' }}>
            {PRIORITIES.map((p) => {
              const isSelected = priority === p.id;
              let borderCol = 'var(--slate-200)';
              let bgCol = '#ffffff';

              if (isSelected) {
                if (p.id === 'Urgent') {
                  borderCol = 'var(--danger-600)';
                  bgCol = 'var(--danger-50)';
                } else if (p.id === 'High') {
                  borderCol = 'var(--warning-600)';
                  bgCol = 'var(--warning-50)';
                } else {
                  borderCol = 'var(--primary-600)';
                  bgCol = 'var(--primary-50)';
                }
              }

              return (
                <div
                  key={p.id}
                  onClick={() => setPriority(p.id)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${borderCol}`,
                    backgroundColor: bgCol,
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                    {p.label}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                    {p.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Photo Uploader */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <PhotoUploader
            label="5. Photo Evidence (Optional but recommended)"
            onImageSelected={(file) => setPhotoFile(file)}
            onImageCleared={() => setPhotoFile(null)}
          />
        </div>

        {/* Section 5: Campus Location */}
        <LocationPicker
          selectedLocation={locationName}
          onLocationChange={setLocationName}
          coordinates={coordinates}
          onCoordinatesChange={setCoordinates}
        />

        {/* Submission Button with loading protection */}
        <div style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-block btn-lg"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Submitting report...</span>
              </>
            ) : (
              <>
                <PlusCircle size={20} />
                <span>Submit Campus Report</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReportIssue;
