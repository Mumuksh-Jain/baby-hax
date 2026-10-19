import React from 'react';
import './CreditsFooter.css';

/**
 * CreditsFooter Component (Pass 03 Directive - Credits & Attribution)
 *
 * Provides clear, professional, warm storybook credits for:
 * - haX.baby Hackathon Track 1 (Pip the Skull Baby)
 * - Official Pip character assets
 * - Web Audio API synthesized music box sound engine
 * - React + Vite frontend stack
 */
export default function CreditsFooter() {
  return (
    <footer className="pip-credits-footer" role="contentinfo" aria-label="Credits and Attribution">
      <div className="credits-inner">
        {/* Storybook Flourish */}
        <div className="credits-flourish" aria-hidden="true">
          <span className="flourish-star">✦</span>
          <span className="flourish-line" />
          <span className="flourish-icon">🌙</span>
          <span className="flourish-line" />
          <span className="flourish-star">✦</span>
        </div>

        <div className="credits-grid">
          {/* Col 1: Submission Details */}
          <div className="credits-col">
            <h3 className="credits-heading">haX.baby Track 1</h3>
            <p className="credits-text">
              <strong>Pip's Website Won't Go to Bed!</strong>
              <br />
              Baby's First Website Competition
              <br />
              <span className="credits-tag">Junior Dream Engineer Edition</span>
            </p>
          </div>

          {/* Col 2: Character & Asset Attribution */}
          <div className="credits-col">
            <h3 className="credits-heading">Official Assets</h3>
            <p className="credits-text">
              Official Pip character artworks, lantern, and music box courtesy of{' '}
              <a
                href="https://hax.baby/baby-problem"
                target="_blank"
                rel="noopener noreferrer"
                className="credits-link"
              >
                haX.baby
              </a>.
              <br />
              Character created for the haX.baby challenge.
            </p>
          </div>

          {/* Col 3: Audio & Tech Architecture */}
          <div className="credits-col">
            <h3 className="credits-heading">Audio & Engineering</h3>
            <p className="credits-text">
              Synthesized via pure <strong>Web Audio API</strong> (zero external audio libs).
              <br />
              Crafted with React, Vite, Three.js, and paper-craft SVG illustration.
            </p>
          </div>
        </div>

        <div className="credits-bottom-bar">
          <span>Goodnight to all dreamers, everywhere. Pip is finally asleep. ★</span>
        </div>
      </div>
    </footer>
  );
}
