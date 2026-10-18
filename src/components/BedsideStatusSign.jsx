import React from 'react';
import './BedsideStatusSign.css';

/**
 * BedsideStatusSign Component
 * Renders the storybook bedside status indicator sign.
 * Dynamically reflects Pip's reactions, nightlight mode, orchestra progress (1/3, 2/3, 3/3),
 * vocal lullaby performance, and finale.
 */
export default function BedsideStatusSign({
  isPanicking,
  currentReaction,
  isNightlight,
  orchestraState = 'idle',
  collectedCount = 0,
}) {
  const isOrchestraActive = orchestraState !== 'idle';

  const getStatusText = () => {
    if (orchestraState === 'celebrating' || orchestraState === 'reacting') {
      return 'BEDTIME ORCHESTRA: FINALE! (Pip is amazed) 🌟';
    }
    if (orchestraState === 'performing') {
      return 'BEDTIME ORCHESTRA: 3/3 (Vocal Lullaby Playing ♫)';
    }
    if (orchestraState === 'collecting') {
      if (collectedCount === 1) {
        return 'BEDTIME ORCHESTRA: 1/3 (One star for Pip!)';
      }
      return 'BEDTIME ORCHESTRA: 2/3 (Two stars in orbit!)';
    }
    if (orchestraState === 'returning') {
      return 'STARS RETURNING TO BEDTIME SLOTS ✨';
    }
    if (isPanicking) {
      return currentReaction?.status || 'PIP IS PANICKING (politely)';
    }
    if (isNightlight) {
      return 'BEDTIME STATUS: COZY NIGHTLIGHT (Pip is sleepy)';
    }
    return 'BEDTIME STATUS: WIDE AWAKE';
  };

  const getStatusIcon = () => {
    if (orchestraState === 'celebrating' || orchestraState === 'reacting') {
      return <span className="orchestra-note-icon" title="tiny star orchestra finale">🌟</span>;
    }
    if (orchestraState === 'performing') {
      return <span className="orchestra-note-icon" title="vocal lullaby playing">🎶</span>;
    }
    if (orchestraState === 'collecting' || orchestraState === 'returning') {
      return <span className="orchestra-note-icon" title="tiny star orchestra">✨</span>;
    }
    if (isPanicking) {
      return <span className="panic-sweat" title="polite panic">💦</span>;
    }
    if (isNightlight) {
      return <span className="nightlight-star" title="nightlight star">⭐</span>;
    }
    return (
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
        <path d="M12 3a6 6 0 0 0 9 9 9 0 1 1-9-9Z" fill="#F5D88C" stroke="#D4A843" />
      </svg>
    );
  };

  return (
    <div
      className={`bedside-sign ${isPanicking ? 'is-panicking' : ''} ${
        isNightlight && !isPanicking ? 'is-nightlight-mode' : ''
      } ${isOrchestraActive ? 'is-orchestra-mode' : ''}`}
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
            {getStatusText()}
          </span>
        </div>

        <div className="sign-icon" aria-hidden="true">
          {getStatusIcon()}
        </div>
      </div>
    </div>
  );
}
