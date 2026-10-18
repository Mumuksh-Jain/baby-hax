import React from 'react';
import './BedsideStatusSign.css';

/**
 * BedsideStatusSign Component
 * Renders the storybook bedside status indicator sign.
 * Changes to 'PIP IS PANICKING (politely)' when activated.
 */
export default function BedsideStatusSign({ isPanicking }) {
  return (
    <div
      className={`bedside-sign ${isPanicking ? 'is-panicking' : 'is-wide-awake'}`}
      role="status"
      aria-live="polite"
    >
      <div className="bedside-sign-hangers" aria-hidden="true">
        <span className="hanger-cord left"></span>
        <span className="hanger-pin left"></span>
        <span className="hanger-cord right"></span>
        <span className="hanger-pin right"></span>
      </div>

      <div className="bedside-sign-body">
        <div className="sign-glow-dot" aria-hidden="true">
          <span className="glow-ring"></span>
          <span className="glow-core"></span>
        </div>

        <div className="sign-content">
          <span className="sign-micro-label">NURSERY MONITOR · CHANNEL 01</span>
          <span className="sign-status-text">
            {isPanicking ? 'PIP IS PANICKING (politely)' : 'BEDTIME STATUS: WIDE AWAKE'}
          </span>
        </div>

        <div className="sign-icon" aria-hidden="true">
          {isPanicking ? (
            <span className="panic-sweat" title="polite panic">💦</span>
          ) : (
            <svg
              className="moon-icon"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="#F5D88C" stroke="#D4A843" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
