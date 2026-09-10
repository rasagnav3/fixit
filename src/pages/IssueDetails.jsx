import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  ThumbsUp,
  User,
  ArrowLeft,
  Wrench,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Droplets
} from 'lucide-react';
import { issueService } from '../services/issueService';
import { voteService } from '../services/voteService';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import IssueTimeline from '../components/IssueTimeline';
import MapView from '../components/MapView';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import ConfigBanner from '../components/ConfigBanner';

export function IssueDetails({ currentUser, profile }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const [voting, setVoting] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    loadIssueDetails();
  }, [id]);

  useEffect(() => {
    if (currentUser && issue) {
      checkUserVote();
    }
  }, [currentUser, issue]);

  const loadIssueDetails = async () => {
    setLoading(true);
    try {
      const data = await issueService.getIssueById(id);
      setIssue(data);
      setVoteCount(data?.voteCount || 0);
    } catch (err) {
      console.error('Error fetching issue:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkUserVote = async () => {
    if (!currentUser || !id) return;
    const voted = await voteService.hasUserVoted(id, currentUser.id);
    setHasVoted(voted);
  };

  const handleVote = async () => {
    if (!currentUser) {
      alert('Please sign in to upvote campus issues.');
      return;
    }

    if (voting) return;
    setVoting(true);

    const prevVoted = hasVoted;
    const prevCount = voteCount;
    setHasVoted(!prevVoted);
    setVoteCount(prevVoted ? prevCount - 1 : prevCount + 1);

    try {
      const res = await voteService.toggleVote(issue.id, currentUser.id);
      setHasVoted(res.voted);
      setVoteCount(res.count);
    } catch (err) {
      setHasVoted(prevVoted);
      setVoteCount(prevCount);
      console.error('Vote failed:', err);
    } finally {
      setVoting(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <LoadingState fullScreen message="Loading issue details & timeline..." />;
  }

  if (!issue) {
    return (
      <EmptyState
        title="Issue Not Found"
        description="This ticket does not exist or may have been deleted from the database."
        actionLabel="Back to Campus Issues"
        actionLink="/issues"
      />
    );
  }

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto' }}>
      <ConfigBanner />

      {/* Top back navigation & Admin shortcut */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {isAdmin && (
          <Link
            to={`/admin/issues/${issue.id}`}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', backgroundColor: '#854d0e', borderColor: '#713f12' }}
          >
            <ShieldCheck size={16} /> Manage in Admin Hub
          </Link>
        )}
      </div>

      {/* Issue Header Card */}
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

            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)', lineHeight: 1.3 }}>
              {issue.title}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <StatusBadge status={issue.status} className="btn-lg" />
            <button
              type="button"
              onClick={handleVote}
              className={`vote-btn ${hasVoted ? 'voted' : ''}`}
              style={{ padding: '0.5rem 0.875rem' }}
            >
              <ThumbsUp size={16} />
              <span>{voteCount} Upvotes</span>
            </button>
          </div>
        </div>

        {/* Reporter Info & Timestamp */}
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
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <User size={15} style={{ color: 'var(--primary-600)' }} />
            <span>Reported by: <strong>{issue.reporter?.name || 'Campus Student'}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Calendar size={15} />
            <span>{formatDate(issue.created_at)}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <MapPin size={15} style={{ color: 'var(--danger-600)' }} />
            <span>{issue.location_name}</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.5rem' }}>
            Issue Description
          </h3>
          <p style={{ fontSize: '0.9375rem', color: 'var(--slate-700)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
            {issue.description}
          </p>
        </div>
      </div>

      {/* Grid: Photo & Map */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Photo Evidence */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.75rem' }}>
            Photo Evidence
          </h3>

          {issue.photo_url ? (
            <div
              onClick={() => setSelectedPhoto(issue.photo_url)}
              style={{
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                maxHeight: '260px',
                cursor: 'pointer',
                border: '1px solid var(--slate-200)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#000000'
              }}
            >
              <img
                src={issue.photo_url}
                alt="Reported problem"
                style={{ width: '100%', height: '260px', objectFit: 'contain' }}
              />
            </div>
          ) : (
            <div style={{
              height: '180px',
              backgroundColor: 'var(--slate-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--slate-300)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--slate-400)',
              fontSize: '0.8125rem'
            }}>
              <Droplets size={32} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
              <span>No photo was attached with this report.</span>
            </div>
          )}
        </div>

        {/* Location & Mini Map */}
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

      {/* Resolution Section (Only visible if Resolved or admin note exists) */}
      {(issue.status === 'Resolved' || issue.admin_note || issue.resolution_photo_url) && (
        <div className="card" style={{
          marginBottom: '1.5rem',
          padding: '1.5rem',
          border: '1px solid var(--success-200, #a7f3d0)',
          backgroundColor: 'var(--success-50)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <CheckCircle size={22} style={{ color: 'var(--success-600)' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--success-700)' }}>
              Campus Facility Resolution Information
            </h3>
          </div>

          {issue.resolved_at && (
            <div style={{ fontSize: '0.8125rem', color: 'var(--success-700)', marginBottom: '0.75rem' }}>
              <strong>Resolved on:</strong> {formatDate(issue.resolved_at)}
            </div>
          )}

          {issue.admin_note && (
            <div style={{
              backgroundColor: '#ffffff',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--success-200, #a7f3d0)',
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Maintenance Officer Note
              </div>
              <p style={{ fontSize: '0.9375rem', color: 'var(--slate-800)' }}>
                {issue.admin_note}
              </p>
            </div>
          )}

          {issue.resolution_photo_url && (
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--success-700)', marginBottom: '0.5rem' }}>
                Resolution Proof Photo:
              </div>
              <div
                onClick={() => setSelectedPhoto(issue.resolution_photo_url)}
                style={{
                  maxWidth: '300px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '2px solid #ffffff',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <img
                  src={issue.resolution_photo_url}
                  alt="Resolution Proof"
                  style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Visual Status History Timeline */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <IssueTimeline
          updates={issue.updates || []}
          createdAt={issue.created_at}
          reportedBy={issue.reporter}
        />
      </div>

      {/* Image Zoom Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <img
            src={selectedPhoto}
            alt="Enlarged evidence"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: 'var(--radius-md)'
            }}
          />
        </div>
      )}
    </div>
  );
}

export default IssueDetails;
