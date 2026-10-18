import React from 'react';
import './DialogueBubble.css';

/**
 * DialogueBubble Component
 * Shows Pip's animated reaction bubble:
 * "Shhh! I'm trying to put a WEBSITE to sleep!"
 */
export default function DialogueBubble({ isVisible, onClose }) {
  if (!isVisible) return null;

  return (
    <div
      className="dialogue-bubble-wrapper"
      role="alert"
      aria-live="assertive"
    >
      <div className="dialogue-bubble">
        <div className="dialogue-tail" aria-hidden="true"></div>
        <div className="dialogue-content">
          <span className="dialogue-whisper-tag" aria-hidden="true">
            ★ Pip whispers loudly:
          </span>
          <p className="dialogue-quote">
            “Shhh! I’m trying to put a <em>WEBSITE</em> to sleep!”
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            className="dialogue-dismiss-btn"
            onClick={onClose}
            aria-label="Dismiss dialogue"
            title="Dismiss"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
