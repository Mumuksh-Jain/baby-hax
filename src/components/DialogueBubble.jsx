import React from 'react';
import './DialogueBubble.css';

/**
 * DialogueBubble Component
 * Shows Pip's animated reaction bubble with customizable quote and whisper tag.
 */
export default function DialogueBubble({
  isVisible,
  quote = "“Shhh! I’m trying to put a WEBSITE to sleep!”",
  whisperTag = "★ Pip whispers loudly:",
  onClose,
}) {
  if (!isVisible) return null;

  // Render quote with emphasis on 'WEBSITE' or 'CSS grid' if present
  const renderFormattedQuote = (text) => {
    if (text.includes('WEBSITE')) {
      const parts = text.split('WEBSITE');
      return (
        <>
          {parts[0]}
          <em>WEBSITE</em>
          {parts[1]}
        </>
      );
    }
    return text;
  };

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
            {whisperTag}
          </span>
          <p className="dialogue-quote">
            {renderFormattedQuote(quote)}
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
