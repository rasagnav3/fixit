import React from 'react';
import { Clock, Wrench, CheckCircle } from 'lucide-react';

export function StatusBadge({ status, className = '' }) {
  const normStatus = (status || 'Reported').toLowerCase();

  if (normStatus === 'in progress') {
    return (
      <span className={`badge badge-in-progress ${className}`}>
        <Wrench size={12} className="animate-spin-slow" />
        <span>In Progress</span>
      </span>
    );
  }

  if (normStatus === 'resolved') {
    return (
      <span className={`badge badge-resolved ${className}`}>
        <CheckCircle size={12} />
        <span>Resolved</span>
      </span>
    );
  }

  return (
    <span className={`badge badge-reported ${className}`}>
      <Clock size={12} />
      <span>Reported</span>
    </span>
  );
}

export default StatusBadge;
