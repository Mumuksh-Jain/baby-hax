import React, { useState } from 'react';
import { playStarTwinkleSound } from '../utils/soundEngine';
import './LivingDreamspace.css';

/**
 * LivingDreamspace Component (Pass 03 Directive - The World Around the Frame)
 *
 * Surrounds the retro desktop window with atmospheric paper clouds,
 * clickable floating star chimes, and 3 Constellation Stars tied to earned stamps!
 * Container has pointer-events: none, interactive elements have pointer-events: auto.
 */
export default function LivingDreamspace({ stamps = {}, soundEnabled = false }) {
  const [sparkles, setSparkles] = useState([]);

  // Check if stamp earned (supports array or object)
  const hasOrchestra = Array.isArray(stamps) ? stamps.includes('orchestra') : !!stamps.orchestra;
  const hasMoonlight = Array.isArray(stamps) ? stamps.includes('moonlight') : !!stamps.moonlight;
  const hasExpress = Array.isArray(stamps) ? stamps.includes('express') : !!stamps.express;

  const handleStarClick = (e, name) => {
    if (soundEnabled) {
      playStarTwinkleSound();
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const newSparkle = {
      id: Date.now() + Math.random(),
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      name,
    };
    setSparkles((prev) => [...prev.slice(-6), newSparkle]);
    setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => s.id !== newSparkle.id));
    }, 900);
  };

  return (
    <div className="living-dreamspace-root" aria-hidden="false">
      {/* Production Art Cut-Paper Clouds Frame (Decorative, zero pointer events) */}
      <div className="dreamspace-paper-clouds-frame" aria-hidden="true">
        <img
          src="/assets/optimized/production-art/sprites/dreamspace_paper_clouds.webp"
          alt=""
          className="dreamspace-paper-clouds-img"
        />
      </div>

      {/* Ambient Drifting Clouds (Decorative, zero pointer events) */}
      <div className="dreamspace-cloud cloud-top-left" aria-hidden="true" />
      <div className="dreamspace-cloud cloud-top-right" aria-hidden="true" />
      <div className="dreamspace-cloud cloud-bottom-left" aria-hidden="true" />
      <div className="dreamspace-cloud cloud-bottom-right" aria-hidden="true" />

      {/* Constellation SVG Lines linking earned stamps */}
      <svg className="dreamspace-constellation-svg" aria-hidden="true">
        {hasOrchestra && hasMoonlight && (
          <line
            x1="5%"
            y1="22%"
            x2="95%"
            y2="18%"
            className="constellation-beam beam-orchestra-moon"
          />
        )}
        {hasMoonlight && hasExpress && (
          <line
            x1="95%"
            y1="18%"
            x2="92%"
            y2="78%"
            className="constellation-beam beam-moon-express"
          />
        )}
        {hasExpress && hasOrchestra && (
          <line
            x1="92%"
            y1="78%"
            x2="5%"
            y2="22%"
            className="constellation-beam beam-express-orchestra"
          />
        )}
      </svg>

      <div className="dreamspace-target-layer" role="group" aria-label="Dream passport constellation chimes">
      {/* Constellation Star 1: Star Conductor */}
      <button
        type="button"
        className={`dreamspace-star-btn constellation-star star-pos-left ${
          hasOrchestra ? 'is-illuminated orchestra-gold' : 'is-dim'
        }`}
        onClick={(e) => handleStarClick(e, 'Star Conductor')}
        title={hasOrchestra ? 'Constellation Star: Star Conductor (Active)' : 'Constellation Star: Star Conductor (Earn stamp in Star Orchestra)'}
        aria-label="Star Conductor Constellation Star"
      >
        <span className="star-glyph">✦</span>
        <span className="star-label">Star Conductor</span>
      </button>

      {/* Constellation Star 2: Moonlight Engineer */}
      <button
        type="button"
        className={`dreamspace-star-btn constellation-star star-pos-top-right ${
          hasMoonlight ? 'is-illuminated moonlight-cyan' : 'is-dim'
        }`}
        onClick={(e) => handleStarClick(e, 'Moonlight Engineer')}
        title={hasMoonlight ? 'Constellation Star: Moonlight Engineer (Active)' : 'Constellation Star: Moonlight Engineer (Earn stamp in Moonlight Lab)'}
        aria-label="Moonlight Engineer Constellation Star"
      >
        <span className="star-glyph">✦</span>
        <span className="star-label">Moonlight Engineer</span>
      </button>

      {/* Constellation Star 3: Midnight Postal Conductor */}
      <button
        type="button"
        className={`dreamspace-star-btn constellation-star star-pos-bottom-right ${
          hasExpress ? 'is-illuminated express-coral' : 'is-dim'
        }`}
        onClick={(e) => handleStarClick(e, 'Postal Conductor')}
        title={hasExpress ? 'Constellation Star: Midnight Postal Conductor (Active)' : 'Constellation Star: Postal Conductor (Earn stamp on Dream Express)'}
        aria-label="Postal Conductor Constellation Star"
      >
        <span className="star-glyph">✦</span>
        <span className="star-label">Postal Conductor</span>
      </button>

      {/* Ambient Clickable Star Chimes */}
      <button
        type="button"
        className="dreamspace-star-btn ambient-chime chime-1"
        onClick={(e) => handleStarClick(e, 'Chime')}
        title="Twinkle Star Chime"
        aria-label="Twinkle Star Chime"
      >
        <span className="star-glyph">★</span>
      </button>

      <button
        type="button"
        className="dreamspace-star-btn ambient-chime chime-2"
        onClick={(e) => handleStarClick(e, 'Chime')}
        title="Twinkle Star Chime"
        aria-label="Twinkle Star Chime"
      >
        <span className="star-glyph">★</span>
      </button>

      <button
        type="button"
        className="dreamspace-star-btn ambient-chime chime-3"
        onClick={(e) => handleStarClick(e, 'Chime')}
        title="Twinkle Star Chime"
        aria-label="Twinkle Star Chime"
      >
        <span className="star-glyph">★</span>
      </button>

      </div>
      {/* Click Sparkle Bursts */}
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="dreamspace-sparkle-burst"
          style={{ left: s.x, top: s.y }}
          aria-hidden="true"
        >
          <span className="sparkle-particle p1">✧</span>
          <span className="sparkle-particle p2">✦</span>
          <span className="sparkle-particle p3">✨</span>
          <span className="sparkle-tag">{s.name} ♪</span>
        </div>
      ))}
    </div>
  );
}
