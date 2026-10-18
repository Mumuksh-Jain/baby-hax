import React from 'react';
import DialogueBubble from './DialogueBubble';
import './PipStage.css';

/**
 * PipStage Component
 * Renders the storybook scrapbook frame for Pip with:
 * - Visually matched cream-toned composition
 * - Washi tape strips & stitched borders
 * - Soft pillows, smiling moon, and paper stars
 * - Animated dialogue bubble and reaction state
 */
export default function PipStage({ isPanicking, showDialogue, onDismissDialogue }) {
  return (
    <div className="pip-stage-container">
      {/* Decorative Moon & Dream Atmosphere */}
      <div className="dream-environment" aria-hidden="true">
        {/* Smiling Crescent Little Moon */}
        <div className="mini-moon-badge" title="Bedtime moonbeam">
          <svg viewBox="0 0 60 60" width="52" height="52" className="moon-svg">
            <defs>
              <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFF4D1" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#F5D88C" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="30" cy="30" r="28" fill="url(#moonGlow)" />
            {/* Crescent moon shape */}
            <path
              d="M36 12C26.059 12 18 20.059 18 30C18 39.941 26.059 48 36 48C30.2 46.5 25.8 41 25.8 30C25.8 19 30.2 13.5 36 12Z"
              fill="#F5D88C"
              stroke="#5C4033"
              strokeWidth="2"
            />
            {/* Little smiling sleepy eye and cheek blush */}
            <path
              d="M27 28C27 30 29 31 31 31"
              fill="none"
              stroke="#5C4033"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <circle cx="31" cy="34" r="2" fill="#F5DCE5" />
          </svg>
        </div>

        {/* Paper Stars */}
        <div className="paper-star star-1">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="#F5D88C" stroke="#5C4033" strokeWidth="1.5">
            <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
          </svg>
        </div>
        <div className="paper-star star-2">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="#F5DCE5" stroke="#5C4033" strokeWidth="1.5">
            <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
          </svg>
        </div>
        <div className="paper-star star-3">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="#F5D88C" stroke="#5C4033" strokeWidth="1.5">
            <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
          </svg>
        </div>
      </div>

      {/* Main Pip Polaroid Frame */}
      <div className={`pip-frame ${isPanicking ? 'is-reacting' : ''}`}>
        {/* Dialogue Bubble */}
        <DialogueBubble isVisible={showDialogue} onClose={onDismissDialogue} />

        {/* Washi Tape strips */}
        <div className="washi-tape tape-top-left" aria-hidden="true"></div>
        <div className="washi-tape tape-top-right" aria-hidden="true"></div>

        {/* Stitched Corner Accents */}
        <div className="stitched-corner corner-tl" aria-hidden="true"></div>
        <div className="stitched-corner corner-tr" aria-hidden="true"></div>
        <div className="stitched-corner corner-bl" aria-hidden="true"></div>
        <div className="stitched-corner corner-br" aria-hidden="true"></div>

        {/* Polaroid Inner Screen for Official Pip Artwork */}
        <div className="pip-photo-wrapper">
          <img
            src="/assets/pip/pip_avatar_cloud.png"
            alt="Pip, a friendly baby with a round skull face, wearing a starry nightcap with a pink bow, floating on a cozy dream cloud and waving warmly."
            className="pip-image"
            width="340"
            height="408"
          />

          {/* Polite Panic Sparkles / Waterdrop */}
          {isPanicking && (
            <div className="panic-overlay" aria-hidden="true">
              <span className="panic-droplet">💦</span>
              <span className="panic-fluster-lines">! !</span>
            </div>
          )}
        </div>

        {/* Handwritten Storybook Caption */}
        <div className="pip-frame-caption">
          <span className="caption-text">
            Fig. 1.0 — Pip (attempting bedtime code deployment)
          </span>
          <span className="caption-sparkle" aria-hidden="true">✨</span>
        </div>
      </div>

      {/* Soft Bedside Pillows Base */}
      <div className="pillow-ground" aria-hidden="true">
        <div className="soft-pillow pillow-left">
          <span className="pillow-stitch"></span>
        </div>
        <div className="soft-pillow pillow-center">
          <span className="pillow-stitch"></span>
        </div>
        <div className="soft-pillow pillow-right">
          <span className="pillow-stitch"></span>
        </div>
      </div>
    </div>
  );
}
