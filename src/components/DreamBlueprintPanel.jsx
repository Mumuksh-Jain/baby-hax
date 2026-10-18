import React, { useEffect, useRef } from 'react';
import './DreamBlueprintPanel.css';

/**
 * DreamBlueprintPanel Component
 * Displays the in-world schematic artifact for 'dream_blueprints.txt'.
 */
export default function DreamBlueprintPanel({ onClose }) {
  const closeBtnRef = useRef(null);

  useEffect(() => {
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
      className="dream-blueprint-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="blueprint-panel-title"
    >
      <div className="blueprint-panel-inner">
        <header className="blueprint-header">
          <div className="blueprint-title-group">
            <span className="blueprint-stamp">★ ARCHIVE DRAFT #042</span>
            <h2 id="blueprint-panel-title" className="blueprint-title">
              dream_blueprints.txt
            </h2>
          </div>
          <button
            type="button"
            ref={closeBtnRef}
            className="blueprint-close-btn"
            onClick={onClose}
            aria-label="Close blueprints and return to bedroom"
            title="Return to bedroom (Esc)"
          >
            ← Back to Bedroom
          </button>
        </header>

        <div className="blueprint-canvas">
          {/* Yellow sticky note from Supervisor */}
          <div className="supervisor-sticky-note" aria-label="Supervisor note">
            <div className="sticky-pin" aria-hidden="true">📌</div>
            <p className="sticky-from">FROM: Supervisor Barnaby (Gentle Ghost)</p>
            <p className="sticky-body">
              “Pip, clouds do not compile on Windows 98. Please stick to lullabies and make sure the moon doesn’t fall off the nightstand.”
            </p>
            <span className="sticky-sig">— B. ♡</span>
          </div>

          <div className="blueprint-schematic">
            <div className="blueprint-item">
              <div className="blueprint-svg-wrap">
                <svg viewBox="0 0 100 60" width="90" height="54" className="blueprint-svg">
                  {/* Fluffy cloud with arrow */}
                  <path
                    d="M20 40 C10 40 5 30 15 22 C12 12 25 5 38 12 C45 4 60 4 68 12 C78 8 88 18 84 28 C92 34 85 45 75 42 Z"
                    fill="none"
                    stroke="#8BE9FD"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                  <line x1="50" y1="42" x2="50" y2="55" stroke="#F5D88C" strokeWidth="1.5" />
                  <polygon points="46,50 50,56 54,50" fill="#F5D88C" />
                </svg>
              </div>
              <div className="blueprint-info">
                <h4>Component A: Giant Cloud Trap</h4>
                <p>Equipped with 300% extra fluff. Designed to catch falling websites before they crash.</p>
                <span className="spec-tag">SPEC: Hypoallergenic dream cotton</span>
              </div>
            </div>

            <div className="blueprint-item">
              <div className="blueprint-svg-wrap">
                <svg viewBox="0 0 100 60" width="90" height="54" className="blueprint-svg">
                  {/* Music box key & notes */}
                  <circle cx="50" cy="30" r="14" fill="none" stroke="#F5DCE5" strokeWidth="2" />
                  <line x1="50" y1="16" x2="50" y2="44" stroke="#F5DCE5" strokeWidth="2" />
                  <line x1="36" y1="30" x2="64" y2="30" stroke="#F5DCE5" strokeWidth="2" />
                  <circle cx="28" cy="22" r="3" fill="#F5D88C" />
                  <circle cx="72" cy="22" r="3" fill="#F5D88C" />
                </svg>
              </div>
              <div className="blueprint-info">
                <h4>Component B: Sleepy Frequency Oscillator</h4>
                <p>Emits ultra-gentle yawns at 432 Hz. Tested on 3 nursery ghosts with 100% nap rate.</p>
                <span className="spec-tag">STATUS: Awaiting winding key</span>
              </div>
            </div>

            <div className="blueprint-item">
              <div className="blueprint-svg-wrap">
                <svg viewBox="0 0 100 60" width="90" height="54" className="blueprint-svg">
                  {/* Stitched blanket square */}
                  <rect x="18" y="10" width="64" height="40" rx="6" fill="none" stroke="#50FA7B" strokeWidth="2" strokeDasharray="3 3" />
                  <line x1="32" y1="10" x2="32" y2="50" stroke="#50FA7B" strokeWidth="1" strokeDasharray="2 2" />
                  <line x1="68" y1="10" x2="68" y2="50" stroke="#50FA7B" strokeWidth="1" strokeDasharray="2 2" />
                  <text x="38" y="34" fill="#F5D88C" fontSize="12" fontFamily="monospace">ZZZ</text>
                </svg>
              </div>
              <div className="blueprint-info">
                <h4>Component C: Auto-Tucking Blanket Loop</h4>
                <p>Recursive wrap algorithm: <code>while (!isAsleep) &#123; tuck(); kissGoodnight(); &#125;</code></p>
                <span className="spec-tag">STATUS: Safe from infinite wakefulness</span>
              </div>
            </div>
          </div>
        </div>

        <footer className="blueprint-footer">
          <p>Press <strong>Escape</strong> or click Back to return to Pip’s bedroom.</p>
          <span className="blueprint-author">Drawn with silver crayon by Pip (Age: 0.8)</span>
        </footer>
      </div>
    </div>
  );
}
