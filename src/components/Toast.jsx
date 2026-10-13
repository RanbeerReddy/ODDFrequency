import React from 'react';

export default function Toast({ toasts = [] }) {
  if (!toasts.length) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map(toast => (
        <div key={toast.id} className="toast-item">
          <span style={{ color: 'var(--accent-lime)' }}>&bull;</span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
