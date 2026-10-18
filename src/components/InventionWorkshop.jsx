import React, { useState } from 'react';
import StampTray from '../experiences/shared/StampTray';
import PipSecretPostcard from './PipSecretPostcard';
import './InventionWorkshop.css';

/**
 * InventionWorkshop Component (Pass 03 Directive - Gallery of Doorways)
 *
 * Serves as the inviting doorway into Pip's three dedicated interactive products:
 * 1. The Star Orchestra (EXP-001)
 * 2. The Moonlight Lab (EXP-002)
 * 3. The Living Dream Express (EXP-003)
 *
 * Includes the embedded Dream Passport StampTray at the top,
 * vivid preview cards with direct launch buttons, and the archival postcard secret.
 */
export default function InventionWorkshop({
  stamps = {},
  onOpenExperience,
  onTuckBedtimeClick,
  soundEnabled = false,
}) {
  const [isEasterEggOpen, setIsEasterEggOpen] = useState(false);

  return (
    <section
      id="workshop"
      className="invention-workshop-doorway-gallery"
      aria-label="Pip's Little Invention Workshop Portfolio"
    >
      {/* Workshop Gallery Header */}
      <div className="workshop-gallery-header">
        <div className="workshop-pill-tag">
          <span className="pill-dot">✦</span>
          <span>JUNIOR DREAM ENGINEER PORTFOLIO</span>
        </div>
        <h2 className="workshop-gallery-title">Pip's Little Invention Workshop</h2>
        <p className="workshop-gallery-subtitle">
          Three bedside contraptions designed to help restless dreamers everywhere. Open any door to test, calibrate, and earn your official passport stamps!
        </p>
      </div>

      {/* Embedded Dream Passport Stamp Collection */}
      <StampTray stamps={stamps} onTuckBedtimeClick={onTuckBedtimeClick} />

      {/* Doorways Grid */}
      <div className="doorways-container">
        {/* Row 1: Star Orchestra & Moonlight Lab */}
        <div className="doorways-row-two-col">
          {/* Doorway 1: Star Orchestra */}
          <article className="doorway-card doorway-orchestra" aria-labelledby="doorway-1-title">
            <div className="doorway-badge-row">
              <span className="doorway-exp-tag">EXP-001 · CONDUCTOR PODIUM</span>
              {stamps.orchestra && (
                <span className="doorway-stamp-earned">★ STAMP EARNED</span>
              )}
            </div>

            <div className="doorway-preview-art orchestra-art">
              <div className="music-box-preview-wrap">
                <img
                  src="/assets/pip/pip_lullaby_box.png"
                  alt="Official Lullaby Music Box"
                  className="preview-music-box-img"
                />
                <div className="preview-stars-cluster" aria-hidden="true">
                  <span className="p-star s1">★</span>
                  <span className="p-star s2">★</span>
                  <span className="p-star s3">★</span>
                </div>
              </div>
            </div>

            <div className="doorway-content">
              <h3 id="doorway-1-title" className="doorway-title">The Star Orchestra</h3>
              <p className="doorway-role">Role: <strong>Star Conductor</strong> · Verb: <strong>CONDUCT</strong></p>
              <p className="doorway-desc">
                Step up to the conductor's podium and awaken the 3 slumbering harmonic stars. Strike each chime in rhythm to launch Pip's full paper-craft vocal Star Theater!
              </p>

              <button
                type="button"
                className="doorway-launch-btn btn-orchestra"
                onClick={() => onOpenExperience?.('orchestra')}
                aria-label="Enter the Star Orchestra experience"
              >
                <span>🎶 Enter the Star Orchestra ➔</span>
              </button>
            </div>
          </article>

          {/* Doorway 2: Moonlight Lab */}
          <article className="doorway-card doorway-moonlight" aria-labelledby="doorway-2-title">
            <div className="doorway-badge-row">
              <span className="doorway-exp-tag">EXP-002 · LIGHTING STUDIO</span>
              {stamps.moonlight && (
                <span className="doorway-stamp-earned">★ STAMP EARNED</span>
              )}
            </div>

            <div className="doorway-preview-art moonlight-art">
              <div className="lantern-preview-wrap">
                <img
                  src="/assets/pip/pip_dream_lantern.png"
                  alt="Official Dream Lantern"
                  className="preview-lantern-img"
                />
                <div className="preview-swatches" aria-hidden="true">
                  <span className="swatch sw-warm" title="Warm Amber" />
                  <span className="swatch sw-cyan" title="Dream Cyan" />
                  <span className="swatch sw-lavender" title="Gentle Lavender" />
                </div>
              </div>
            </div>

            <div className="doorway-content">
              <h3 id="doorway-2-title" className="doorway-title">The Moonlight Lab</h3>
              <p className="doorway-role">Role: <strong>Moonlight Engineer</strong> · Verb: <strong>ILLUMINATE</strong></p>
              <p className="doorway-desc">
                Enter Pip's bedtime switchboard room. Adjust brightness, switch color hues, project starlight ceilings, and help a jittery bedtime ghost drift peacefully off to sleep.
              </p>

              <button
                type="button"
                className="doorway-launch-btn btn-moonlight"
                onClick={() => onOpenExperience?.('moonlight')}
                aria-label="Open the Moonlight Lab experience"
              >
                <span>💡 Open the Moonlight Lab ➔</span>
              </button>
            </div>
          </article>
        </div>

        {/* Row 2: The Living Dream Express (Wide Doorway) */}
        <article className="doorway-card doorway-express-panoramic" aria-labelledby="doorway-3-title">
          <div className="doorway-badge-row">
            <span className="doorway-exp-tag">EXP-003 · MINIATURE RAILWAY WORLD</span>
            {stamps.express && (
              <span className="doorway-stamp-earned">★ STAMP EARNED</span>
            )}
          </div>

          <div className="express-doorway-layout">
            <div className="express-preview-mini-stage" aria-hidden="true">
              <svg viewBox="0 0 600 180" className="express-mini-svg">
                <rect width="600" height="180" rx="12" fill="#0B132B" />
                {/* Track lines */}
                <path d="M 40 140 Q 200 40 320 80 T 560 130" fill="none" stroke="#2A3B66" strokeWidth="3" strokeDasharray="6 4" />
                <path d="M 40 140 Q 200 40 320 80 T 560 130" fill="none" stroke="#F5D88C" strokeWidth="1.5" />
                
                {/* Station landmarks */}
                <g transform="translate(180, 50)">
                  <ellipse cx="20" cy="15" rx="30" ry="16" fill="#F0F4F8" opacity="0.85" />
                  <polygon points="10,14 20,4 30,14" fill="#E63946" />
                  <text x="20" y="38" textAnchor="middle" fill="#FAF0CA" fontSize="9" fontFamily="sans-serif">Cloud Cottage</text>
                </g>
                <g transform="translate(360, 65)">
                  <polygon points="20,10 32,32 8,32" fill="#1D3557" stroke="#70D6FF" strokeWidth="1" />
                  <text x="20" y="46" textAnchor="middle" fill="#FAF0CA" fontSize="9" fontFamily="sans-serif">Ghost House</text>
                </g>
                <g transform="translate(510, 80)">
                  <rect x="12" y="10" width="16" height="36" rx="4" fill="#2B2D42" stroke="#FFD166" strokeWidth="1" />
                  <circle cx="20" cy="8" r="8" fill="#FFEAA7" opacity="0.8" />
                  <text x="20" y="58" textAnchor="middle" fill="#FAF0CA" fontSize="9" fontFamily="sans-serif">Moonbeam Tower</text>
                </g>

                {/* Little Locomotive preview */}
                <g transform="translate(80, 110)">
                  <rect x="0" y="4" width="34" height="20" rx="4" fill="#E63946" />
                  <rect x="22" y="0" width="12" height="12" rx="2" fill="#1D3557" />
                  <circle cx="8" cy="24" r="5" fill="#FAF0CA" />
                  <circle cx="26" cy="24" r="5" fill="#FAF0CA" />
                  <text x="44" y="18" fill="#FFD166" fontSize="10" fontWeight="bold">No. 003</text>
                </g>
              </svg>
            </div>

            <div className="doorway-content express-content">
              <h3 id="doorway-3-title" className="doorway-title">The Living Dream Express</h3>
              <p className="doorway-role">Role: <strong>Midnight Postal Conductor</strong> · Verb: <strong>DELIVER</strong></p>
              <p className="doorway-desc">
                Inspect the skyway chart spanning Cloud Cottage, Sleepy Ghost House, and Moonbeam Tower. Pack cozy blankets, starlight letters, or lullaby parcels, and dispatch the train along animated starlight rails with live camera tracking!
              </p>

              <button
                type="button"
                className="doorway-launch-btn btn-express"
                onClick={() => onOpenExperience?.('express')}
                aria-label="Board the Living Dream Express experience"
              >
                <span>🚂 Board the Dream Express ➔</span>
              </button>
            </div>
          </div>
        </article>
      </div>

      {/* Secret Archival Postcard Easter Egg */}
      <div className="workshop-easter-egg-banner">
        <button
          type="button"
          className="archival-seal-trigger-btn"
          onClick={() => setIsEasterEggOpen(true)}
          aria-label="Open Pip's Archival Secret Postcard"
        >
          <span className="seal-star-icon">★</span>
          <span className="seal-text">Official Dream Office Seal · Click to Read Pip's Personal Letter</span>
          <span className="seal-star-icon">★</span>
        </button>
      </div>

      {/* Postcard Modal */}
      <PipSecretPostcard
        isOpen={isEasterEggOpen}
        onClose={() => setIsEasterEggOpen(false)}
      />
    </section>
  );
}
