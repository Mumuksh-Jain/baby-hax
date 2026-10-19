import React, { useEffect, useRef } from 'react';
import './DreamBlueprintPanel.css';

/**
 * DreamBlueprintPanel Component
 * Displays the in-world schematic artifact for 'dream_blueprints.txt'.
 * Theme: Whimsical Bedtime Drafting Sheet & Decision Dream Blueprint
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
        {/* Drafting Tape Corners */}
        <div className="blueprint-tape-corner tape-tl" aria-hidden="true"></div>
        <div className="blueprint-tape-corner tape-tr" aria-hidden="true"></div>

        <header className="blueprint-header">
          <div className="blueprint-title-group">
            <span className="blueprint-stamp">★ ARCHIVE DRAFT #042</span>
            <div className="blueprint-titles">
              <h2 id="blueprint-panel-title" className="blueprint-title">
                dream_blueprints.txt
              </h2>
              <span className="blueprint-subtitle">
                Decision Blueprint &amp; Living Inventions Schematic
              </span>
            </div>
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
            {/* Component A: Giant Cloud Trap */}
            <div className="blueprint-item">
              <div className="blueprint-svg-wrap">
                <svg viewBox="0 0 100 60" width="90" height="54" className="blueprint-svg" aria-hidden="true">
                  {/* Fluffy cloud with arrow */}
                  <path
                    d="M20 40 C10 40 5 30 15 22 C12 12 25 5 38 12 C45 4 60 4 68 12 C78 8 88 18 84 28 C92 34 85 45 75 42 Z"
                    fill="none"
                    stroke="#A34063"
                    strokeWidth="2.2"
                    strokeDasharray="4 2"
                  />
                  <line x1="50" y1="42" x2="50" y2="55" stroke="#D4A843" strokeWidth="2" />
                  <polygon points="46,50 50,56 54,50" fill="#D4A843" />
                </svg>
              </div>
              <div className="blueprint-info">
                <h4>Component A: Giant Cloud Trap</h4>
                <p>Equipped with 300% extra fluff. Designed to catch falling websites before they crash.</p>
                <span className="spec-tag">SPEC: Hypoallergenic dream cotton</span>
              </div>
            </div>

            {/* Component B: Sleepy Frequency Oscillator */}
            <div className="blueprint-item">
              <div className="blueprint-svg-wrap">
                <svg viewBox="0 0 100 60" width="90" height="54" className="blueprint-svg" aria-hidden="true">
                  {/* Music box key & notes */}
                  <circle cx="50" cy="30" r="14" fill="none" stroke="#A34063" strokeWidth="2" />
                  <line x1="50" y1="16" x2="50" y2="44" stroke="#A34063" strokeWidth="2" />
                  <line x1="36" y1="30" x2="64" y2="30" stroke="#A34063" strokeWidth="2" />
                  <circle cx="28" cy="22" r="3" fill="#D4A843" />
                  <circle cx="72" cy="22" r="3" fill="#D4A843" />
                  <path d="M42 22 Q50 14 58 22" fill="none" stroke="#D4A843" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="blueprint-info">
                <h4>Component B: Sleepy Frequency Oscillator</h4>
                <p>Emits ultra-gentle yawns at 432 Hz. Tested on 3 nursery ghosts with 100% nap rate.</p>
                <span className="spec-tag">STATUS: Awaiting winding key</span>
              </div>
            </div>

            {/* Component C: Auto-Tucking Blanket Loop */}
            <div className="blueprint-item">
              <div className="blueprint-svg-wrap">
                <svg viewBox="0 0 100 60" width="90" height="54" className="blueprint-svg" aria-hidden="true">
                  {/* Stitched blanket square */}
                  <rect x="18" y="10" width="64" height="40" rx="6" fill="none" stroke="#A34063" strokeWidth="2" strokeDasharray="3 3" />
                  <line x1="32" y1="10" x2="32" y2="50" stroke="#A34063" strokeWidth="1" strokeDasharray="2 2" />
                  <line x1="68" y1="10" x2="68" y2="50" stroke="#A34063" strokeWidth="1" strokeDasharray="2 2" />
                  <text x="38" y="34" fill="#D4A843" fontSize="12" fontFamily="monospace" fontWeight="bold">ZZZ</text>
                </svg>
              </div>
              <div className="blueprint-info">
                <h4>Component C: Auto-Tucking Blanket Loop</h4>
                <p>Recursive wrap algorithm: <code>while (!isAsleep) &#123; tuck(); kissGoodnight(); &#125;</code></p>
                <span className="spec-tag">STATUS: Safe from infinite wakefulness</span>
              </div>
            </div>

            {/* Component D: The Living Dream Express (Locomotive No. 003) */}
            <div className="blueprint-item">
              <div className="blueprint-svg-wrap">
                <svg viewBox="0 0 100 60" width="90" height="54" className="blueprint-svg" aria-hidden="true">
                  {/* Locomotive Body */}
                  <rect x="16" y="24" width="48" height="20" rx="3" fill="none" stroke="#A34063" strokeWidth="2" />
                  {/* Cab */}
                  <rect x="52" y="16" width="24" height="28" rx="2" fill="none" stroke="#5C4033" strokeWidth="2" />
                  <rect x="58" y="20" width="12" height="10" rx="1" fill="#FFF4D1" stroke="#D4A843" strokeWidth="1" />
                  {/* Chimney & Piston */}
                  <rect x="22" y="14" width="8" height="10" fill="none" stroke="#5C4033" strokeWidth="1.5" />
                  {/* Steam Puffs */}
                  <circle cx="26" cy="8" r="3" fill="none" stroke="#CCAFA0" strokeDasharray="2 1" />
                  <circle cx="21" cy="4" r="2.5" fill="none" stroke="#CCAFA0" strokeDasharray="2 1" />
                  {/* Wheels */}
                  <circle cx="26" cy="46" r="6" fill="none" stroke="#D4A843" strokeWidth="2" />
                  <circle cx="44" cy="46" r="6" fill="none" stroke="#D4A843" strokeWidth="2" />
                  <circle cx="64" cy="46" r="6" fill="none" stroke="#D4A843" strokeWidth="2" />
                  <line x1="26" y1="46" x2="64" y2="46" stroke="#5C4033" strokeWidth="1.5" />
                  {/* Star Headlight */}
                  <polygon points="12,30 16,33 16,27" fill="#F5D88C" />
                </svg>
              </div>
              <div className="blueprint-info">
                <h4>Component D: The Living Dream Express (No. 003)</h4>
                <p>Articulated starlight sky-rail express. Fueled by midnight lullabies with rhythmic chuk-chuk-chuk delivery to Cloud Cottage, Ghost House &amp; Moonbeam Tower.</p>
                <span className="spec-tag">PROPULSION: Dual steam pistons · 100% cozy chuk</span>
              </div>
            </div>
          </div>
        </div>

        <footer className="blueprint-footer">
          <p>Press <strong>Escape</strong> or click Back to return to Pip’s bedroom.</p>
          <span className="blueprint-author">Drawn with silver crayon &amp; warm milk by Pip (Age: 0.8) · Certified Cozy</span>
        </footer>
      </div>
    </div>
  );
}
