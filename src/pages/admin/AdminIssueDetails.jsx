import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowLeft,
  Wrench,
  CheckCircle,
  AlertCircle,
  Clock,
  UploadCloud,
  FileText,
  User,
  MapPin,
  Calendar,
  Loader2,
  Check,
  Droplets
} from 'lucide-react';
import { issueService } from '../../services/issueService';
import { uploadService } from '../../services/uploadService';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import IssueTimeline from '../../components/IssueTimeline';
import PhotoUploader from '../../components/PhotoUploader';
import MapView from '../../components/MapView';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import ConfigBanner from '../../components/ConfigBanner';

export function AdminIssueDetails({ currentUser, profile }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);

  // Status Change Workflow State
  const [targetStatus, setTargetStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [resolutionPhotoFile, setResolutionPhotoFile] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success'|'error', text: string }

  useEffect(() => {
    loadIssue();
  }, [id]);

  const loadIssue = async () => {
    setLoading(true);
    try {
      const data = await issueService.getIssueById(id);
      setIssue(data);
      if (data) {
        // Prepopulate default next status
        if (data.status === 'Reported') setTargetStatus('In Progress');
        else if (data.status === 'In Progress') setTargetStatus('Resolved');
        else setTargetStatus('Resolved');

        if (data.admin_note) setAdminNote(data.admin_note);
      }
    } catch (err) {
      console.error('Error loading issue for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!targetStatus || updating) return;
    setStatusMessage(null);

    // Validation: if resolving, require a note explaining the fix
    if (targetStatus === 'Resolved' && (!adminNote || adminNote.trim().length < 5)) {
      setStatusMessage({
        type: 'error',
        text: 'Please provide a descriptive resolution note (at least 5 characters) explaining how the issue was fixed.'
      });
      return;
    }

    setUpdating(true);

    try {
      let resolutionPhotoUrl = issue.resolution_photo_url || null;

      // 1. Upload resolution proof photo if provided
      if (resolutionPhotoFile) {
        resolutionPhotoUrl = await uploadService.uploadPhoto(
          resolutionPhotoFile,
          'resolution-images',
          currentUser.id
        );
      }

      // 2. Perform transactional status update, timeline log, and reporter notification
      await issueService.updateIssueStatus({
        issueId: issue.id,
        newStatus: targetStatus,
        adminNote: adminNote.trim(),
        resolutionPhotoUrl,
        adminId: currentUser.id,
        currentIssue: issue
      });

      setStatusMessage({
        type: 'success',
        text: `Issue successfully updated to ${targetStatus}. Timeline and reporter notification recorded.`
      });

      // Clear uploaded file input
      setResolutionPhotoFile(null);

      // Reload fresh data from database
      await loadIssue();
    } catch (err) {
      console.error('Failed to update status:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to update issue status. Please verify permissions.'
      });
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <LoadingState fullScreen message="Loading admin issue triage workspace..." />;
  }

  if (!issue) {
    return (
      <EmptyState
        title="Issue Not Found"
        description="Could not locate this ticket in the database."
        actionLabel="Back to Admin Issues"
        actionLink="/admin/issues"
      />
    );
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <ConfigBanner />

      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <button
          type="button"
          onClick={() => navigate('/admin/issues')}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
        >
          <ArrowLeft size={16} /> All Reports
        </button>

        <Link
          to={`/issues/${issue.id}`}
          className="btn btn-outline btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
        >
          View Public Student Page
        </Link>
      </div>

      {/* Main Issue Header Card */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{
                backgroundColor: 'var(--slate-900)',
                color: '#ffffff',
                fontSize: '0.8125rem',
                fontWeight: 800,
                padding: '0.25rem 0.625rem',
                borderRadius: 'var(--radius-sm)',
                letterSpacing: '0.05em'
              }}>
                {issue.issue_code}
              </span>
              <span style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                backgroundColor: 'var(--primary-100)',
                color: 'var(--primary-800)',
                padding: '0.25rem 0.625rem',
                borderRadius: 'var(--radius-sm)'
              }}>
                {issue.category}
              </span>
              <PriorityBadge priority={issue.priority} />
            </div>

            <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--slate-900)', lineHeight: 1.3 }}>
              {issue.title}
            </h1>
          </div>

          <StatusBadge status={issue.status} className="btn-lg" />
        </div>

        {/* Reporter details */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
          padding: '0.75rem 0',
          borderTop: '1px solid var(--slate-100)',
          borderBottom: '1px solid var(--slate-100)',
          fontSize: '0.8125rem',
          color: 'var(--slate-500)',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <User size={15} style={{ color: 'var(--primary-600)' }} />
            <span>Reporter: <strong>{issue.reporter?.name || 'Campus Student'}</strong> ({issue.reporter?.email || 'N/A'})</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Calendar size={15} />
            <span>Created: {formatDate(issue.created_at)}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <MapPin size={15} style={{ color: 'var(--danger-600)' }} />
            <span>Location: <strong>{issue.location_name}</strong></span>
          </div>
        </div>

        <p style={{ fontSize: '0.9375rem', color: 'var(--slate-700)', lineHeight: 1.6 }}>
          {issue.description}
        </p>
      </div>

      {/* ADMIN STATUS TRANSITION WORKFLOW (Section 10 Requirement) */}
      <div className="card" style={{
        marginBottom: '1.5rem',
        padding: '1.5rem',
        border: '2px solid var(--primary-600)',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <ShieldCheck size={22} style={{ color: 'var(--primary-600)' }} />
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            Maintenance Workflow & Status Control
          </h2>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginBottom: '1.25rem' }}>
          Every status transition writes an audit log entry in <code>issue_updates</code> and notifies the student reporter.
        </p>

        {statusMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: statusMessage.type === 'success' ? 'var(--success-50)' : 'var(--danger-50)',
            color: statusMessage.type === 'success' ? 'var(--success-700)' : 'var(--danger-700)',
            border: `1px solid ${statusMessage.type === 'success' ? 'var(--success-200, #a7f3d0)' : 'var(--danger-200, #fecaca)'}`,
            fontSize: '0.8125rem',
            marginBottom: '1.25rem'
          }}>
            {statusMessage.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleStatusSubmit}>
          {/* Step 1: Choose New Status */}
          <div className="form-group">
            <label className="form-label">Transition Status To:</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setTargetStatus('Reported')}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${targetStatus === 'Reported' ? 'var(--warning-600)' : 'var(--slate-200)'}`,
                  backgroundColor: targetStatus === 'Reported' ? 'var(--warning-50)' : '#ffffff',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  color: 'var(--slate-800)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem'
                }}
              >
                <Clock size={16} style={{ color: 'var(--warning-600)' }} />
                <span>Reported</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetStatus('In Progress')}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${targetStatus === 'In Progress' ? 'var(--primary-600)' : 'var(--slate-200)'}`,
                  backgroundColor: targetStatus === 'In Progress' ? 'var(--primary-50)' : '#ffffff',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  color: 'var(--slate-800)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem'
                }}
              >
                <Wrench size={16} style={{ color: 'var(--primary-600)' }} />
                <span>In Progress</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetStatus('Resolved')}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${targetStatus === 'Resolved' ? 'var(--success-600)' : 'var(--slate-200)'}`,
                  backgroundColor: targetStatus === 'Resolved' ? 'var(--success-50)' : '#ffffff',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  color: 'var(--slate-800)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem'
                }}
              >
                <CheckCircle size={16} style={{ color: 'var(--success-600)' }} />
                <span>Resolved</span>
              </button>
            </div>
          </div>

          {/* Step 2: Admin Work Note */}
          <div className="form-group">
            <label className="form-label">
              Admin & Maintenance Note {targetStatus === 'Resolved' && <span style={{ color: 'var(--danger-600)' }}>*</span>}
            </label>
            <textarea
              rows={3}
              required={targetStatus === 'Resolved'}
              className="form-textarea"
              placeholder={
                targetStatus === 'In Progress'
                  ? 'e.g. Technician dispatched with replacement ball valve. Work started at 11:30 AM.'
                  : targetStatus === 'Resolved'
                  ? 'e.g. Replaced leaking PVC connector with 25mm brass joint, pressure tested, and verified clean flow.'
                  : 'Add internal maintenance note...'
              }
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
            />
            <div className="form-helper">
              {targetStatus === 'Resolved'
                ? 'Required: Explain the repair or fix for campus accountability.'
                : 'Will be visible to student on the status timeline.'}
            </div>
          </div>

          {/* Step 3: Resolution Proof Photo (if resolving) */}
          {targetStatus === 'Resolved' && (
            <div style={{
              backgroundColor: 'var(--slate-50)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--slate-300)',
              marginBottom: '1.25rem'
            }}>
              <PhotoUploader
                label="Upload Resolution Evidence Photo (Recommended)"
                helperText="Upload a photo of the completed repair (fixed pipe, dry floor, new tap)."
                onImageSelected={(file) => setResolutionPhotoFile(file)}
                onImageCleared={() => setResolutionPhotoFile(null)}
              />
            </div>
          )}

          {/* Submit Update Button */}
          <button
            type="submit"
            disabled={updating || (targetStatus === issue.status && adminNote === (issue.admin_note || '') && !resolutionPhotoFile)}
            className="btn btn-primary btn-block btn-lg"
          >
            {updating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Updating status & dispatching notification...</span>
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                <span>Commit Status: {issue.status} → {targetStatus}</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Grid: Photo & Map */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Photo Evidence */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.75rem' }}>
            Reported Photo Evidence
          </h3>

          {issue.photo_url ? (
            <div style={{
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              maxHeight: '260px',
              backgroundColor: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img
                src={issue.photo_url}
                alt="Evidence"
                style={{ width: '100%', height: '260px', objectFit: 'contain' }}
              />
            </div>
          ) : (
            <div style={{
              height: '160px',
              backgroundColor: 'var(--slate-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--slate-300)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--slate-400)',
              fontSize: '0.8125rem'
            }}>
              No photo attached by student.
            </div>
          )}
        </div>

        {/* Location & Map */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--slate-800)' }}>
              Campus Location
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
              {issue.location_name}
            </span>
          </div>

          <MapView
            singleMarker={issue}
            height="260px"
            zoom={17}
            interactive={false}
          />
        </div>
      </div>

      {/* Resolution Proof Photo Display if available */}
      {issue.resolution_photo_url && (
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem', backgroundColor: 'var(--success-50)', border: '1px solid var(--success-200, #a7f3d0)' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--success-700)', marginBottom: '0.75rem' }}>
            Existing Resolution Proof
          </h3>
          <img
            src={issue.resolution_photo_url}
            alt="Resolution Proof"
            style={{ maxWidth: '320px', height: '200px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
          />
        </div>
      )}

      {/* Audit History Timeline */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <IssueTimeline
          updates={issue.updates || []}
          createdAt={issue.created_at}
          reportedBy={issue.reporter}
        />
      </div>
    </div>
  );
}

export default AdminIssueDetails;
