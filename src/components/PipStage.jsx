import React, { useState } from 'react';
import DialogueBubble from './DialogueBubble';
import './PipStage.css';

/**
 * PipStage Component
 * Renders the storybook scrapbook frame for Pip with:
 * - Interactive moon toggle (Nightlight mode)
 * - Playful interactive stars with particle bursts
 * - Interactive Pip portrait cycling through personality reactions
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
}) {
  // Local state for star burst particles
  const [starParticles, setStarParticles] = useState([]);
  const [activeStarId, setActiveStarId] = useState(null);

  const handleStarInteraction = (starId, e) => {
    e.stopPropagation();
    setActiveStarId(starId);

    // Call sound & parent handler
    if (onStarClick) {
      onStarClick(starId);
    }

    // Spawn 3 tiny playful sparkle particles
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

  return (
    <div className={`pip-stage-container ${isNightlight ? 'nightlight-active' : ''}`}>
      {/* Dream Atmosphere (Interactive Moon & Stars) */}
      <div className="dream-environment">
        {/* Interactive Smiling Crescent Moon */}
        <button
          type="button"
          className={`mini-moon-btn ${isNightlight ? 'is-glowing-night' : ''}`}
          onClick={onToggleMoon}
          aria-label={`Cozy nightlight is currently ${isNightlight ? 'ON' : 'OFF'}. Click to toggle nightlight.`}
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
              // Sleepy closed eye with peaceful expression
              <path
                d="M26 27C27.5 29 29.5 29 31 27"
                fill="none"
                stroke="#5C4033"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              // Waking little eye
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

        {/* Interactive Star 1 (Gold, Top Left) */}
        <div className="star-wrapper star-1-wrap">
          <button
            type="button"
            className={`paper-star star-1 ${activeStarId === 1 ? 'star-popping' : ''}`}
            onClick={(e) => handleStarInteraction(1, e)}
            aria-label="Tickle top-left golden star"
            title="Tickle star"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="#F5D88C" stroke="#5C4033" strokeWidth="1.5">
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
            </svg>
          </button>
          {/* Particles */}
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

        {/* Interactive Star 2 (Blush, Middle Right) */}
        <div className="star-wrapper star-2-wrap">
          <button
            type="button"
            className={`paper-star star-2 ${activeStarId === 2 ? 'star-popping' : ''}`}
            onClick={(e) => handleStarInteraction(2, e)}
            aria-label="Tickle right blush star"
            title="Tickle star"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#F5DCE5" stroke="#5C4033" strokeWidth="1.5">
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
            </svg>
          </button>
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

        {/* Interactive Star 3 (Gold/Lavender, Bottom Left) */}
        <div className="star-wrapper star-3-wrap">
          <button
            type="button"
            className={`paper-star star-3 ${activeStarId === 3 ? 'star-popping' : ''}`}
            onClick={(e) => handleStarInteraction(3, e)}
            aria-label="Tickle bottom golden star"
            title="Tickle star"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="#F5D88C" stroke="#5C4033" strokeWidth="1.5">
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
            </svg>
          </button>
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

      {/* Main Pip Polaroid Frame (Interactive Trigger for Pip Personality) */}
      <div
        className={`pip-frame ${isPanicking ? 'is-reacting' : ''} ${
          currentReaction?.animationClass || ''
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

        {/* Polaroid Inner Screen with Accessible Poke Button */}
        <button
          type="button"
          className="pip-photo-wrapper pip-poke-btn"
          onClick={onPokePip}
          aria-label="Poke Pip gently. Cycles through Pip's funny bedtime thoughts."
          title="Click or tap to check on Pip!"
        >
          <img
            src="/assets/pip/pip_avatar_cloud.png"
            alt="Pip, a friendly baby with a round skull face, wearing a starry nightcap with a pink bow, floating on a cozy dream cloud and waving warmly."
            className="pip-image"
            width="340"
            height="408"
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
                  <span className="badge-text">yawn!</span>
                </div>
              )}
              {currentReaction.overlay === 'stars' && (
                <div className="overlay-badge stars-badge">
                  <span className="badge-icon">✨</span>
                  <span className="badge-text">pull req</span>
                </div>
              )}
            </div>
          )}

          {/* Interactive touch hint overlay for first time visitors */}
          <span className="pip-poke-hint" aria-hidden="true">
            (poke Pip)
          </span>
        </button>

        {/* Handwritten Storybook Caption */}
        <div className="pip-frame-caption">
          <span className="caption-text">
            {isNightlight
              ? 'Fig. 1.1 — Pip (bathed in cozy bedside nightlight)'
              : 'Fig. 1.0 — Pip (attempting bedtime code deployment)'}
          </span>
          <span className="caption-sparkle" aria-hidden="true">
            {isNightlight ? '🌙' : '✨'}
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
