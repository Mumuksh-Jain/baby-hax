import React from 'react';
import BedsideStatusSign from './BedsideStatusSign';
import PipStage from './PipStage';
import './HeroSection.css';

/**
 * HeroSection Component
 * Implements Pass 01C.1 & 01C.2:
 * - Vocal Lullaby for Pip's Tiny Star Orchestra
 * - Storybook Puppet Motion for Pip
 */
export default function HeroSection({
  isPanicking,
  showDialogue,
  currentReaction,
  onPsst,
  onPokePip,
  onDismissDialogue,
  isNightlight,
  onToggleMoon,
  onStarClick,
  collectedStars = [],
  orchestraState = 'idle',
  activeSoundingStar = null,
  pipMotionState = 'idle',
  onSkipLullaby,
}) {
  const isPerforming = orchestraState === 'performing';

  return (
    <section className="hero-section" aria-labelledby="hero-main-title">
      <div className="hero-grid">
        {/* Left Column: Typographic Storytelling & Controls */}
        <div className="hero-text-col">
          {/* Eyebrow badge */}
          <div className="eyebrow-container">
            <span className="eyebrow-pin" aria-hidden="true">★</span>
            <p className="eyebrow-text">
              MIDNIGHT NURSERY / OFFICIAL BABY WEBSITE NO. 001
            </p>
          </div>

          {/* Main Heading */}
          <h1 id="hero-main-title" className="hero-title">
            My website <span className="title-highlight">won’t go to bed.</span>
          </h1>

          {/* Supporting Text */}
          <p className="hero-support">
            Hello, I’m Pip. Junior Dream Engineer. I made my very first website... and it refuses to sleep.
          </p>

          {/* Bedside Status Sign */}
          <div className="hero-status-wrapper">
            <BedsideStatusSign
              isPanicking={isPanicking}
              currentReaction={currentReaction}
              isNightlight={isNightlight}
              orchestraState={orchestraState}
              collectedCount={collectedStars.length}
            />
          </div>

          {/* Primary Interaction Action Area */}
          <div className="hero-action-area">
            <button
              type="button"
              className={`psst-button ${isPanicking ? 'is-active' : ''}`}
              onClick={onPsst}
              aria-label="Psst, Pip? Click to whisper to Pip"
              disabled={isPerforming}
            >
              <span className="btn-sparkle" aria-hidden="true">✨</span>
              <span className="btn-text">Psst, Pip?</span>
              <span className="btn-tag" aria-hidden="true">(whisper)</span>
            </button>

            {/* PASS 02: Discoverable Link to Invention Workshop */}
            <a
              href="#invention-workshop"
              className="hero-inventions-link"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('invention-workshop')?.scrollIntoView({ behavior: 'smooth' });
              }}
              aria-label="Scroll down to Pip's Little Invention Workshop"
            >
              <span className="inventions-link-icon" aria-hidden="true">🧸</span>
              <span>See My Inventions</span>
              <span className="inventions-link-badge" aria-hidden="true">003</span>
              <span className="inventions-link-arrow" aria-hidden="true">↓</span>
            </a>

            <span className="action-hint" aria-hidden="true">
              {isPerforming
                ? '♫ Vocal Lullaby is singing!'
                : isPanicking
                ? '← Pip heard you!'
                : 'tap to check on Pip'}
            </span>
          </div>

          {/* Small Signature */}
          <footer className="hero-signature">
            <span className="sig-icon" aria-hidden="true">☾</span>
            <p className="sig-text">
              Made with 3 stars, 1 moonbeam &amp; absolutely no bedtime discipline.
            </p>
          </footer>
        </div>

        {/* Right Column: Handcrafted Illustrated Pip Stage */}
        <div className="hero-visual-col">
          <PipStage
            isPanicking={isPanicking}
            showDialogue={showDialogue}
            currentReaction={currentReaction}
            onPokePip={onPokePip}
            onDismissDialogue={onDismissDialogue}
            isNightlight={isNightlight}
            onToggleMoon={onToggleMoon}
            onStarClick={onStarClick}
            collectedStars={collectedStars}
            orchestraState={orchestraState}
            activeSoundingStar={activeSoundingStar}
            pipMotionState={pipMotionState}
            onSkipLullaby={onSkipLullaby}
          />
        </div>
      </div>
    </section>
  );
}
