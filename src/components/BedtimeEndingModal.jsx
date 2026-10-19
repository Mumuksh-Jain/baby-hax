import React, { useEffect, useRef } from 'react';
import { playBedtimeTuckSound } from '../utils/soundEngine';
import './BedtimeEndingModal.css';

/**
 * BedtimeEndingModal Component (Pass 03 Directive - Narrative Payoff)
 *
 * Unlocks when all 3 stamps are collected.
 * The website softly tucks in for bedtime: dim cozy lighting, sleepy Pip under
 * a starlit patchwork blanket, soft ambient zzz's, and an explicit ZERO-LOCKOUT
 * button to "Wake the Website Again".
 */
export default function BedtimeEndingModal({
  isOpen = false,
  onWake,
  soundEnabled = false,
}) {
  const wakeButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (soundEnabled) {
        playBedtimeTuckSound();
      }
      // Focus the wake button for immediate accessibility
      setTimeout(() => {
        wakeButtonRef.current?.focus();
      }, 150);
    }
  }, [isOpen, soundEnabled]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onWake();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onWake]);

  if (!isOpen) return null;

  return (
    <div
      className="bedtime-ending-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bedtime-modal-title"
      aria-describedby="bedtime-modal-desc"
    >
      <div className="bedtime-ending-card">
        {/* Night Sky Glow Header */}
        <div className="bedtime-star-canopy" aria-hidden="true">
          <span className="canopy-star cs-1">✦</span>
          <span className="canopy-star cs-2">★</span>
          <span className="canopy-star cs-3">✦</span>
          <span className="canopy-star cs-4">★</span>
          <span className="canopy-moon">🌙</span>
        </div>

        {/* Cozy Sleeping Scene Illustration */}
        <div className="bedtime-illustration-scene">
          <div className="bedtime-bed-frame">
            {/* Pip Sleeping with nightcap & soft quilt */}
            <div className="bedtime-pip-sleeper">
              <img
                src="/assets/optimized/pip/pip_avatar_cloud.webp"
                alt="Pip sleeping soundly"
                className="bedtime-pip-avatar"
              />
              <div className="bedtime-quilt">
                <span className="quilt-patch patch-1">★</span>
                <span className="quilt-patch patch-2">☁️</span>
                <span className="quilt-patch patch-3">🌙</span>
              </div>
            </div>
            {/* Drifting Zzz's */}
            <div className="bedtime-zzz-container" aria-hidden="true">
              <span className="zzz z1">z</span>
              <span className="zzz z2">Z</span>
              <span className="zzz z3">Z</span>
            </div>
            {/* Bedside Table with Official Dream Lantern */}
            <div className="bedtime-nightstand" aria-hidden="true">
              <img
                src="/assets/optimized/pip/pip_dream_lantern.webp"
                alt=""
                className="bedtime-lantern-glow"
              />
            </div>
          </div>
        </div>

        {/* Story Text */}
        <div className="bedtime-content">
          <span className="bedtime-kicker">✦ SHIFT COMPLETED · DREAMS DELIVERED ✦</span>
          <h2 id="bedtime-modal-title" className="bedtime-title">
            Shhh... Pip is Sound Asleep!
          </h2>
          <p id="bedtime-modal-desc" className="bedtime-desc">
            With your help, the Star Orchestra played its sweetest melody, the Moonlight Lab cast a cozy glow, and the Dream Express reached every sleepy doorstep.
          </p>

          {/* Master Certificate of Dream Engineering */}
          <div className="bedtime-passport-stamp-seal">
            <div className="passport-seal-header">
              <span>★ OFFICIAL DREAM PASSPORT ★</span>
            </div>
            <div className="passport-seal-badges">
              <div className="seal-badge">
                <span className="seal-icon">🌟</span>
                <span className="seal-name">Star Conductor</span>
                <span className="seal-check">✓</span>
              </div>
              <div className="seal-badge">
                <span className="seal-icon">💡</span>
                <span className="seal-name">Moonlight Engineer</span>
                <span className="seal-check">✓</span>
              </div>
              <div className="seal-badge">
                <span className="seal-icon">🚂</span>
                <span className="seal-name">Postal Conductor</span>
                <span className="seal-check">✓</span>
              </div>
            </div>
          </div>

          {/* Zero Lockout Wake Action */}
          <div className="bedtime-actions">
            <button
              ref={wakeButtonRef}
              type="button"
              className="bedtime-wake-btn"
              onClick={onWake}
              aria-label="Wake the website again and return to nursery"
            >
              <span className="wake-btn-sun">☀️</span>
              <span className="wake-btn-text">Wake the Website Again</span>
            </button>
            <p className="bedtime-tip">Press Esc or click button to wake Pip anytime!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
