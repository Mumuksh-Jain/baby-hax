import React, { useEffect, useRef } from 'react';
import './NurseryLogPanel.css';

/**
 * NurseryLogPanel Component
 * Displays the in-world log artifact for 'midnight_nursery.log'.
 */
export default function NurseryLogPanel({ onClose }) {
  const closeBtnRef = useRef(null);

  useEffect(() => {
    // Focus close button on mount
    closeBtnRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="nursery-log-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="log-panel-title"
    >
      <div className="log-panel-inner">
        <header className="log-panel-header">
          <div className="log-header-left">
            <span className="log-badge" aria-hidden="true">📋 SYSTEM LOG</span>
            <h2 id="log-panel-title" className="log-title">midnight_nursery.log</h2>
          </div>
          <button
            type="button"
            ref={closeBtnRef}
            className="log-close-btn"
            onClick={onClose}
            aria-label="Close log and return to bedroom"
            title="Return to bedroom (Esc)"
          >
            ← Back to Bedroom
          </button>
        </header>

        <div className="log-meta-strip">
          <span>FACILITY: Midnight Nursery Wing A</span>
          <span>OPERATOR: Pip (Junior Dream Eng.)</span>
          <span>SUPERVISOR: Barnaby (Gentle Ghost)</span>
        </div>

        <div className="log-console-body">
          <div className="log-entry">
            <span className="log-time">[23:45:02]</span>
            <span className="log-tag tag-info">INFO</span>
            <span className="log-msg">Pip initialized first bedtime website with 3 stars and 1 moonbeam.</span>
          </div>

          <div className="log-entry">
            <span className="log-time">[23:51:19]</span>
            <span className="log-tag tag-warn">WARN</span>
            <span className="log-msg">Website refused bedtime story. Opened 14 invisible background tabs about fireflies.</span>
          </div>

          <div className="log-entry">
            <span className="log-time">[00:14:40]</span>
            <span className="log-tag tag-action">ACTION</span>
            <span className="log-msg">Pip attempted binary lullaby: &lt;sleep&gt;01011001-AWN&lt;/sleep&gt;. Website giggled loudly.</span>
          </div>

          <div className="log-entry">
            <span className="log-time">[00:32:05]</span>
            <span className="log-tag tag-alert">NOTICE</span>
            <span className="log-msg">Supervisor Barnaby checked nursery cradle. Found crumbs from midnight cookies near the router.</span>
          </div>

          <div className="log-entry">
            <span className="log-time">[01:05:12]</span>
            <span className="log-tag tag-quote">NOTE</span>
            <span className="log-msg quote-text">Barnaby to Pip: “Websites are very stubborn babies. Have you tried winding the lullaby box?”</span>
          </div>

          <div className="log-entry current-entry">
            <span className="log-time">[01:40:00]</span>
            <span className="log-tag tag-live">LIVE</span>
            <span className="log-msg">Current Bedtime Status: WIDE AWAKE. Visitor detected exploring nursery.</span>
          </div>
        </div>

        <footer className="log-panel-footer">
          <p className="log-footer-hint">Press <strong>Escape</strong> or click Back to return to Pip’s bedroom.</p>
          <span className="log-stamp">STAMP: CERTIFIED COZY</span>
        </footer>
      </div>
    </div>
  );
}
