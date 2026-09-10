import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

export function PriorityBadge({ priority, className = '' }) {
  const normPriority = (priority || 'Medium').toLowerCase();

  switch (normPriority) {
    case 'urgent':
      return (
        <span className={`badge priority-urgent ${className}`}>
          <AlertTriangle size={12} />
          <span>Urgent</span>
        </span>
      );
    case 'high':
      return (
        <span className={`badge priority-high ${className}`}>
          <AlertCircle size={12} />
          <span>High</span>
        </span>
      );
    case 'low':
      return (
        <span className={`badge priority-low ${className}`}>
          <span>Low</span>
        </span>
      );
    case 'medium':
    default:
      return (
        <span className={`badge priority-medium ${className}`}>
          <Info size={12} />
          <span>Medium</span>
        </span>
      );
  }
}

export default PriorityBadge;
