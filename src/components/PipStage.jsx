import React, { useState } from 'react';
import DialogueBubble from './DialogueBubble';
import './PipStage.css';

/**
 * PipStage Component
 * Renders the storybook scrapbook frame for Pip with:
 * - Interactive moon toggle (Nightlight mode)
 * - Pip's Tiny Star Orchestra:
 *   - Star 1: Solo entry & "One little star? For me?"
 *   - Star 2: Dual orbit & "Wait... are you starting a band?!"
 *   - Star 3: Full vocal lullaby performance & listening puppet motion
 *   - Finale: Delighted celebratory hop, studio dialogue & return flight
 * - Storybook puppet motion for Pip (PASS 01C.2)
 * - Harmonious cream composition & floating bedtime decorations
 */
export default function PipStage({
  isPanicking,
  showDialogue,
  currentReaction,
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
  // Local state for star burst particles
  const [starParticles, setStarParticles] = useState([]);
  const [activeStarId, setActiveStarId] = useState(null);

  const handleStarInteraction = (starId, e) => {
    e.stopPropagation();
    if (
      orchestraState === 'performing' ||
      orchestraState === 'celebrating' ||
      orchestraState === 'reacting' ||
      orchestraState === 'returning'
    ) {
      return;
    }
    if (collectedStars.includes(starId)) {
      return;
    }

    setActiveStarId(starId);

    // Call parent handler (adds to collectedStars and triggers notes/orchestra)
    if (onStarClick) {
      onStarClick(starId);
    }

    // Spawn 3 tiny playful sparkle particles at the star's origin
    const newParticles = [
      { id: `${starId}-${Date.now()}-1`, symbol: '✦', dx: -18, dy: -24, color: '#F5D88C' },
      { id: `${starId}-${Date.now()}-2`, symbol: '✧', dx: 22, dy: -16, color: '#F5DCE5' },
      { id: `${starId}-${Date.now()}-3`, symbol: '⋆', dx: 2, dy: -32, color: '#FFF4D1' },
    ];

    setStarParticles((prev) => [...prev, { starId, particles: newParticles }]);

    // Clean up quickly to avoid lingering DOM or continuous rendering
    setTimeout(() => {
      setStarParticles((prev) => prev.filter((p) => p.starId !== starId));
      setActiveStarId(null);
    }, 650);
  };

  const currentParticlesForStar = (starId) => {
    const found = starParticles.find((p) => p.starId === starId);
    return found ? found.particles : [];
  };

  const isPerforming = orchestraState === 'performing';
  const isCelebrating = orchestraState === 'celebrating' || orchestraState === 'reacting';
  const isReturning = orchestraState === 'returning';

  const handlePipClick = (e) => {
    if (isPerforming && onSkipLullaby) {
      e.stopPropagation();
      onSkipLullaby();
      return;
    }
    onPokePip(e);
  };

  return (
    <div
      onPointerMove={e => {if(orchestraState !== 'idle' || matchMedia('(prefers-reduced-motion: reduce)').matches)return;const r=e.currentTarget.getBoundingClientRect();e.currentTarget.style.setProperty('--pip-look-x', ((e.clientX-r.left)/r.width-.5)*12+'deg');e.currentTarget.style.setProperty('--pip-look-y', -((e.clientY-r.top)/r.height-.5)*8+'deg');}}
      onPointerLeave={e => {e.currentTarget.style.setProperty('--pip-look-x','0deg');e.currentTarget.style.setProperty('--pip-look-y','0deg');}}
      onPointerDown={e => {if(e.pointerType==='touch') e.currentTarget.style.setProperty('--pip-look-x','6deg');}}
      onPointerUp={e => {if(e.pointerType==='touch') e.currentTarget.style.setProperty('--pip-look-x','0deg');}}
      className={`pip-stage-container ${isNightlight ? 'nightlight-active' : ''} orchestra-${orchestraState}`}
    >
      {/* Dream Atmosphere (Interactive Moon & Home Stars) */}
      <div className="dream-environment">
        {/* Interactive Smiling Crescent Moon */}
        <button
          type="button"
          className={`mini-moon-btn ${isNightlight ? 'is-glowing-night' : ''}`}
          onClick={onToggleMoon}
          aria-label={`Tap to toggle cozy nightlight. Currently ${isNightlight ? 'ON' : 'OFF'}.`}
          aria-pressed={isNightlight}
          title={isNightlight ? 'Switch to warm nursery daytime' : 'Turn on cozy bedtime nightlight'}
        >
          <svg viewBox="0 0 60 60" width="56" height="56" className="moon-svg">
            <defs>
              <radialGradient id="moonGlowDefault" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFF4D1" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#F5D88C" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="moonGlowNight" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFF2A3" stopOpacity="0.95" />
                <stop offset="60%" stopColor="#FFA62B" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#E6AF2E" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Glowing Aura Ring */}
            <circle
              cx="30"
              cy="30"
              r="28"
              fill={isNightlight ? 'url(#moonGlowNight)' : 'url(#moonGlowDefault)'}
              className="moon-glow-circle"
            />

            {/* Crescent Moon Shape */}
            <path
              d="M36 12C26.059 12 18 20.059 18 30C18 39.941 26.059 48 36 48C30.2 46.5 25.8 41 25.8 30C25.8 19 30.2 13.5 36 12Z"
              fill={isNightlight ? '#FFD45A' : '#F5D88C'}
              stroke="#5C4033"
              strokeWidth="2"
            />

            {/* Little Sleepy Smile & Eye */}
            {isNightlight ? (
              <path
                d="M26 27C27.5 29 29.5 29 31 27"
                fill="none"
                stroke="#5C4033"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M27 28C27 30 29 31 31 31"
                fill="none"
                stroke="#5C4033"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            )}

            {/* Cheek Blush */}
            <circle cx="31" cy="34" r="2.2" fill={isNightlight ? '#FF8BA7' : '#F5DCE5'} />
          </svg>
          <span className="moon-touch-hint" aria-hidden="true">
            {isNightlight ? '🌙 ON' : '💡 tap'}
          </span>
        </button>

        {/* --- STAR 1 (Gold, Top Left) --- */}
        <div className="star-wrapper star-1-wrap">
          {collectedStars.includes(1) && !isReturning ? (
            /* Ghost slot preserves layout seamlessly */
            <div className="star-ghost-slot" title="Star #1 is playing in Pip's orchestra!">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#D4A843" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.45">
                <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
              </svg>
            </div>
          ) : (
            <button
              type="button"
              className={`paper-star pip-star-btn star-1 star-discovery ${activeStarId === 1 ? 'star-popping' : ''} ${isReturning ? 'star-landing' : ''}`}
              onClick={(e) => handleStarInteraction(1, e)}
              aria-label="Collect top-left golden star for Pip's Tiny Star Orchestra"
              title="Click to recruit Star #1 for Pip's orchestra!"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="#F5D88C" stroke="#5C4033" strokeWidth="1.5">
                <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
              </svg>
            </button>
          )}

          {/* Sparkles on click */}
          {currentParticlesForStar(1).map((p) => (
            <span
              key={p.id}
              className="star-sparkle-particle"
              style={{
                '--dx': `${p.dx}px`,
                '--dy': `${p.dy}px`,
                color: p.color,
              }}
              aria-hidden="true"
            >
              {p.symbol}
            </span>
          ))}
        </div>

        {/* --- STAR 2 (Blush, Middle Right) --- */}
        <div className="star-wrapper star-2-wrap">
          {collectedStars.includes(2) && !isReturning ? (
            <div className="star-ghost-slot" title="Star #2 is playing in Pip's orchestra!">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#A34063" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.45">
                <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
              </svg>
            </div>
          ) : (
            <button
              type="button"
              className={`paper-star pip-star-btn star-2 star-discovery ${activeStarId === 2 ? 'star-popping' : ''} ${isReturning ? 'star-landing' : ''}`}
              onClick={(e) => handleStarInteraction(2, e)}
              aria-label="Collect right blush star for Pip's Tiny Star Orchestra"
              title="Click to recruit Star #2 for Pip's orchestra!"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="#F5DCE5" stroke="#5C4033" strokeWidth="1.5">
                <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
              </svg>
            </button>
          )}

          {currentParticlesForStar(2).map((p) => (
            <span
              key={p.id}
              className="star-sparkle-particle"
              style={{
                '--dx': `${p.dx}px`,
                '--dy': `${p.dy}px`,
                color: p.color,
              }}
              aria-hidden="true"
            >
              {p.symbol}
            </span>
          ))}
        </div>

        {/* --- STAR 3 (Gold/Lavender, Bottom Left) --- */}
        <div className="star-wrapper star-3-wrap">
          {collectedStars.includes(3) && !isReturning ? (
            <div className="star-ghost-slot" title="Star #3 is playing in Pip's orchestra!">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#D4A843" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.45">
                <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
              </svg>
            </div>
          ) : (
            <button
              type="button"
              className={`paper-star pip-star-btn star-3 star-discovery ${activeStarId === 3 ? 'star-popping' : ''} ${isReturning ? 'star-landing' : ''}`}
              onClick={(e) => handleStarInteraction(3, e)}
              aria-label="Collect bottom golden star for Pip's Tiny Star Orchestra"
              title="Click to recruit Star #3 for Pip's orchestra!"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#F5D88C" stroke="#5C4033" strokeWidth="1.5">
                <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
              </svg>
            </button>
          )}

          {currentParticlesForStar(3).map((p) => (
            <span
              key={p.id}
              className="star-sparkle-particle"
              style={{
                '--dx': `${p.dx}px`,
                '--dy': `${p.dy}px`,
                color: p.color,
              }}
              aria-hidden="true"
            >
              {p.symbol}
            </span>
          ))}
        </div>
      </div>

      {/* Main Pip Polaroid Frame with storybook puppet-motion wrapper */}
      <div
        className={`pip-frame ${isPanicking ? 'is-reacting' : ''} ${
          isPerforming ? 'frame-performing' : currentReaction?.animationClass || ''
        }`}
      >
        {/* Animated Dialogue Bubble */}
        <DialogueBubble
          isVisible={showDialogue}
          quote={currentReaction?.quote}
          whisperTag={currentReaction?.whisperTag}
          onClose={onDismissDialogue}
        />

        {/* Washi Tape strips */}
        <div className="washi-tape tape-top-left" aria-hidden="true"></div>
        <div className="washi-tape tape-top-right" aria-hidden="true"></div>

        {/* Stitched Corner Accents */}
        <div className="stitched-corner corner-tl" aria-hidden="true"></div>
        <div className="stitched-corner corner-tr" aria-hidden="true"></div>
        <div className="stitched-corner corner-bl" aria-hidden="true"></div>
        <div className="stitched-corner corner-br" aria-hidden="true"></div>

        {/* --- ORCHESTRA 3D ELLIPTICAL ORBIT SYSTEM ANCHORED OVER PIP --- */}
        {collectedStars.length > 0 && (
          <div
            className={`pip-orbit-system ${isPerforming ? 'is-performing' : ''} ${
              isReturning ? 'is-returning' : ''
            }`}
            aria-hidden="true"
          >
            {/* Star 1 in Orbit (Orbits together when Star 2 is collected!) */}
            {collectedStars.includes(1) && (
              <div
                className={`orbiting-star-carrier carrier-star-1 ${
                  collectedStars.length >= 2 || isPerforming ? 'orbiting' : 'traveling-in'
                } ${activeSoundingStar === 1 ? 'is-sounding-chime' : ''} ${
                  isReturning ? 'traveling-out-1' : ''
                }`}
              >
                <div className="orbiting-star-visual star-gold">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="#F5D88C" stroke="#5C4033" strokeWidth="1.5">
                    <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                  </svg>
                  <span className="stardust-trail trail-gold"></span>
                </div>
              </div>
            )}

            {/* Star 2 in Orbit (Orbits together with Star 1!) */}
            {collectedStars.includes(2) && (
              <div
                className={`orbiting-star-carrier carrier-star-2 ${
                  collectedStars.length >= 2 || isPerforming ? 'orbiting' : 'traveling-in'
                } ${activeSoundingStar === 2 ? 'is-sounding-chime' : ''} ${
                  isReturning ? 'traveling-out-2' : ''
                }`}
              >
                <div className="orbiting-star-visual star-blush">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="#F5DCE5" stroke="#5C4033" strokeWidth="1.5">
                    <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                  </svg>
                  <span className="stardust-trail trail-blush"></span>
                </div>
              </div>
            )}

            {/* Star 3 in Orbit */}
            {collectedStars.includes(3) && (
              <div
                className={`orbiting-star-carrier carrier-star-3 ${
                  isPerforming ? 'orbiting' : 'traveling-in'
                } ${activeSoundingStar === 3 ? 'is-sounding-chime' : ''} ${
                  isReturning ? 'traveling-out-3' : ''
                }`}
              >
                <div className="orbiting-star-visual star-lavender">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="#F5D88C" stroke="#7A5B49" strokeWidth="1.5">
                    <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                  </svg>
                  <span className="stardust-trail trail-lavender"></span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Puppet Motion Actor Wrapper (PASS 01C.2) */}
        <div className={`pip-puppet-actor pip-motion-${pipMotionState}`}>
          {/* Polaroid Inner Screen with Accessible Poke Button */}
          <button
            type="button"
            className="pip-photo-wrapper pip-poke-btn"
            onClick={handlePipClick}
            aria-label={
              isPerforming
                ? 'Lullaby is playing. Click or tap to finish early.'
                : "Poke Pip gently. Cycles through Pip's funny bedtime thoughts."
            }
            title={isPerforming ? 'Click to tuck Pip in early' : 'Click or tap to check on Pip!'}
          >
            <img
              src="/assets/optimized/pip/pip_avatar_cloud.webp"
              width="896"
              height="1090"
              fetchPriority="high"
              alt="Pip, a friendly baby with a round skull face, wearing a starry nightcap with a pink bow, floating on a cozy dream cloud and waving warmly."
              className="pip-image"
            />

            {/* Dynamic Floating Decorations for Reactions */}
            {showDialogue && currentReaction && (
              <div className="reaction-overlay-layer" aria-hidden="true">
                {currentReaction.overlay === 'sweat' && (
                  <div className="overlay-badge sweat-badge">
                    <span className="badge-icon">💦</span>
                    <span className="badge-text">! !</span>
                  </div>
                )}
                {currentReaction.overlay === 'warning' && (
                  <div className="overlay-badge warning-badge">
                    <span className="badge-icon">⚠️</span>
                    <span className="badge-text">shhh~</span>
                  </div>
                )}
                {currentReaction.overlay === 'milk' && (
                  <div className="overlay-badge milk-badge">
                    <span className="badge-icon">🍼</span>
                    <span className="badge-text">oops!</span>
                  </div>
                )}
                {currentReaction.overlay === 'zzz' && (
                  <div className="overlay-badge zzz-badge">
                    <span className="badge-icon">💤</span>
                    <span className="badge-text">faaahhh~</span>
                  </div>
                )}
                {currentReaction.overlay === 'stars' && (
                  <div className="overlay-badge stars-badge">
                    <span className="badge-icon">✨</span>
                    <span className="badge-text">orchestra!</span>
                  </div>
                )}
              </div>
            )}

            {/* Floating musical notes during vocal lullaby performance */}
            {isPerforming && (
              <div className="pip-music-notes-layer" aria-hidden="true">
                <span className="music-note-float note-1">♪</span>
                <span className="music-note-float note-2">♫</span>
                <span className="music-note-float note-3">♩</span>
              </div>
            )}

            {/* Floating celebration stars during finale */}
            {isCelebrating && (
              <div className="pip-celebrate-sparkles" aria-hidden="true">
                <span className="celebrate-sparkle sp-1">🌟</span>
                <span className="celebrate-sparkle sp-2">✨</span>
                <span className="celebrate-sparkle sp-3">🎉</span>
              </div>
            )}

            {/* Interactive touch hint overlay */}
            <span className="pip-poke-hint" aria-hidden="true">
              {isPerforming
                ? '♫ Vocal Lullaby (tap to tuck in) ♫'
                : isCelebrating
                ? '★ Bedtime Studio! ★'
                : '(poke Pip)'}
            </span>
          </button>
        </div>

        {/* Handwritten Storybook Caption */}
        <div className="pip-frame-caption">
          <span className="caption-text">
            {isPerforming
              ? 'Fig. 1.2 — Pip’s Tiny Star Orchestra (singing Twinkle Twinkle)'
              : isCelebrating
              ? 'Fig. 1.3 — Pip’s Bedtime Studio (joyful finale)'
              : isNightlight
              ? 'Fig. 1.1 — Pip (bathed in cozy bedside nightlight)'
              : 'Fig. 1.0 — Pip (attempting bedtime code deployment)'}
          </span>
          <span className="caption-sparkle" aria-hidden="true">
            {isPerforming ? '🎶' : isCelebrating ? '🌟' : isNightlight ? '🌙' : '✨'}
          </span>
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
