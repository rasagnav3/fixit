import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ThumbsUp, Calendar, Droplets, Wrench, ShieldAlert, ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { voteService } from '../services/voteService';

export function IssueCard({
  issue,
  currentUser = null,
  hasVotedInitial = false,
  onVoteChange = null
}) {
  const [voted, setVoted] = useState(hasVotedInitial);
  const [votesCount, setVotesCount] = useState(issue.voteCount || 0);
  const [voting, setVoting] = useState(false);

  const handleVote = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      alert('Please log in to upvote campus issues.');
      return;
    }

    if (voting) return;
    setVoting(true);

    // Optimistic UI update
    const previousVoted = voted;
    const previousCount = votesCount;
    setVoted(!previousVoted);
    setVotesCount(previousVoted ? previousCount - 1 : previousCount + 1);

    try {
      const res = await voteService.toggleVote(issue.id, currentUser.id);
      setVoted(res.voted);
      setVotesCount(res.count);
      if (onVoteChange) onVoteChange(issue.id, res.voted, res.count);
    } catch (err) {
      // Revert on error
      setVoted(previousVoted);
      setVotesCount(previousCount);
      console.error('Vote failed:', err);
    } finally {
      setVoting(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Category Icon helper
  const getCategoryIcon = (cat) => {
    switch ((cat || '').toLowerCase()) {
      case 'leakage':
      case 'water':
      case 'tap':
        return <Droplets size={14} style={{ color: 'var(--primary-600)' }} />;
      case 'sanitation':
      case 'drainage':
        return <Wrench size={14} style={{ color: '#0d9488' }} />;
      default:
        return <ShieldAlert size={14} style={{ color: 'var(--slate-500)' }} />;
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Thumbnail or Category Placeholder */}
      <div style={{
        position: 'relative',
        height: '160px',
        backgroundColor: 'var(--slate-100)',
        borderRadius: 'calc(var(--radius-lg) - 4px) calc(var(--radius-lg) - 4px) 0 0',
        margin: '-1.25rem -1.25rem 1rem -1.25rem',
        overflow: 'hidden'
      }}>
        {issue.photo_url ? (
          <img
            src={issue.photo_url}
            alt={issue.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%)',
            color: 'var(--primary-700)'
          }}>
            <Droplets size={36} style={{ opacity: 0.5, marginBottom: '0.25rem' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.8 }}>FixIt Campus - {issue.category}</span>
          </div>
        )}

        {/* Issue ID Chip */}
        <div style={{
          position: 'absolute',
          top: '0.75rem',
          left: '0.75rem',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(4px)',
          color: '#ffffff',
          fontSize: '0.6875rem',
          fontWeight: 800,
          padding: '0.25rem 0.5rem',
          borderRadius: 'var(--radius-sm)',
          letterSpacing: '0.05em'
        }}>
          {issue.issue_code}
        </div>

        {/* Priority Badge */}
        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
          <PriorityBadge priority={issue.priority} />
        </div>
      </div>

      {/* Card Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Category & Status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-600)' }}>
            {getCategoryIcon(issue.category)}
            <span>{issue.category}</span>
          </div>
          <StatusBadge status={issue.status} />
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: 'var(--slate-900)',
          marginBottom: '0.5rem',
          lineHeight: 1.35,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          <Link to={`/issues/${issue.id}`} style={{ color: 'inherit' }}>
            {issue.title}
          </Link>
        </h3>

        {/* Location & Date */}
        <div style={{ marginTop: 'auto', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--slate-500)' }}>
            <MapPin size={13} style={{ color: 'var(--primary-600)', flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {issue.location_name}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--slate-400)' }}>
            <Calendar size={13} style={{ flexShrink: 0 }} />
            <span>Reported {formatDate(issue.created_at)}</span>
          </div>
        </div>

        {/* Card Footer: Upvotes & Details Link */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.875rem',
          marginTop: '0.875rem',
          borderTop: '1px solid var(--slate-100)'
        }}>
          <button
            type="button"
            onClick={handleVote}
            className={`vote-btn ${voted ? 'voted' : ''}`}
            title="Upvote this issue to increase campus urgency"
          >
            <ThumbsUp size={14} />
            <span>{votesCount}</span>
          </button>

          <Link
            to={`/issues/${issue.id}`}
            className="btn btn-outline btn-sm"
            style={{ padding: '0.3rem 0.625rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <span>Details</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default IssueCard;
