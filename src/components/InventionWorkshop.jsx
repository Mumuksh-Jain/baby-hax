import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  playLanternSwitchSound,
  playDeliveryDispatchSound,
  playDeliveryArrivedSound,
  playStarSound,
} from '../utils/soundEngine';
import './InventionWorkshop.css';

/**
 * Pip's Little Invention Workshop (Pass 02)
 * Demonstrates Pip's role as Junior Dream Engineer across 3 distinct interactive stations:
 * 001. The Star Orchestra (Dream Sound Engineering)
 * 002. The Moonlight Lab (Nightlight Engineering)
 * 003. The Dream Express (Dream Delivery Engineering)
 */
export default function InventionWorkshop({
  theaterUnlocked = false,
  onPlayStars,
  onHighlightBedroomStars,
  soundEnabled = false,
}) {
  // --- Station 001: The Star Orchestra State ---
  const [starPlayStatus, setStarPlayStatus] = useState('');

  // --- Station 002: The Moonlight Lab State ---
  // Moods: 'warm' | 'sleepy' | 'starlight'
  const [lanternMood, setLanternMood] = useState('warm');

  // --- Station 003: The Dream Express State ---
  // Destinations: 'cloud-cottage' | 'ghost-house' | 'moonbeam-tower'
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [isDelivering, setIsDelivering] = useState(false);
  const [deliveryProgress, setDeliveryProgress] = useState(0); // 0 to 1
  const [deliveredLocation, setDeliveredLocation] = useState(null);
  const [deliveryMessage, setDeliveryMessage] = useState(null);

  // Timers and animation frame refs
  const deliveryAnimRef = useRef(null);
  const deliveryTimeoutRef = useRef(null);
  const statusTimerRef = useRef(null);
  const pathRefs = useRef({});

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      if (deliveryAnimRef.current) cancelAnimationFrame(deliveryAnimRef.current);
      if (deliveryTimeoutRef.current) clearTimeout(deliveryTimeoutRef.current);
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, []);

  // -------------------------------------------------------------
  // STATION 001 HANDLERS
  // -------------------------------------------------------------
  const handlePlayStars = () => {
    if (theaterUnlocked) {
      if (soundEnabled) playStarSound(0);
      if (onPlayStars) onPlayStars();
    } else {
      if (soundEnabled) playStarSound(1);
      setStarPlayStatus('Stars are still sleeping in the bedroom! Guiding you to collect them... ★');
      if (onHighlightBedroomStars) onHighlightBedroomStars();

      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
      statusTimerRef.current = setTimeout(() => {
        setStarPlayStatus('');
      }, 5000);
    }
  };

  // -------------------------------------------------------------
  // STATION 002 HANDLERS: MOONLIGHT LAB
  // -------------------------------------------------------------
  const handleMoodSelect = (mood) => {
    setLanternMood(mood);
    if (soundEnabled) {
      playLanternSwitchSound(mood);
    }
  };

  const getMoodPipQuote = () => {
    switch (lanternMood) {
      case 'sleepy':
        return '“Nighty-night ghosts! Zero scary shadows allowed.”';
      case 'starlight':
        return '“Tiniest crystalline sparkles for reading under the covers!”';
      case 'warm':
      default:
        return '“Mmm, like toasted marshmallows for sleepy eyes!”';
    }
  };

  // -------------------------------------------------------------
  // STATION 003 HANDLERS: DREAM EXPRESS
  // -------------------------------------------------------------
  const DESTINATIONS = {
    'cloud-cottage': {
      id: 'cloud-cottage',
      name: 'Cloud Cottage',
      icon: '☁️',
      color: '#6AAFE6',
      subtext: 'Fluffy cumulus roof nestled in the night sky',
      deliveryNote: 'Dream delivered! Soft vanilla cloud dreams tucked in safely. No nightmares included.',
      coords: { x: 155, y: 55 },
    },
    'ghost-house': {
      id: 'ghost-house',
      name: 'Sleepy Ghost House',
      icon: '👻',
      color: '#B85075',
      subtext: 'Peaked roof with friendly waving attic ghost',
      deliveryNote: 'Dream delivered! Cozy blanket dreams arrived. Friendly ghost gave 5 stars!',
      coords: { x: 285, y: 155 },
    },
    'moonbeam-tower': {
      id: 'moonbeam-tower',
      name: 'Moonbeam Tower',
      icon: '🏰',
      color: '#D4A843',
      subtext: 'High observatory bathed in silvery moonbeams',
      deliveryNote: 'Dream delivered! Astronomy stargazing dreams landed safely on the spire!',
      coords: { x: 375, y: 60 },
    },
  };

  const handleSelectDestination = (destId) => {
    if (isDelivering) return; // Prevent double dispatch while in flight

    const dest = DESTINATIONS[destId];
    if (!dest) return;

    setSelectedDestination(destId);
    setDeliveredLocation(null);
    setDeliveryMessage(null);
    setIsDelivering(true);
    setDeliveryProgress(0);

    if (soundEnabled) {
      playDeliveryDispatchSound();
    }

    // Check for reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Instant delivery for accessibility
      setIsDelivering(false);
      setDeliveryProgress(1);
      setDeliveredLocation(destId);
      setDeliveryMessage(dest.deliveryNote);
      if (soundEnabled) playDeliveryArrivedSound();
      return;
    }

    // Smooth delivery flight along SVG path (~1600ms)
    const startTime = performance.now();
    const duration = 1600;

    const animateFlight = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Ease in-out cubic
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      setDeliveryProgress(eased);

      if (t < 1) {
        deliveryAnimRef.current = requestAnimationFrame(animateFlight);
      } else {
        setIsDelivering(false);
        setDeliveredLocation(destId);
        setDeliveryMessage(dest.deliveryNote);
        if (soundEnabled) {
          playDeliveryArrivedSound();
        }
      }
    };

    deliveryAnimRef.current = requestAnimationFrame(animateFlight);
  };

  // Compute envelope coords along SVG path based on progress
  const getEnvelopePos = () => {
    if (!selectedDestination) return { x: 60, y: 190, angle: 0 };
    const pathElem = pathRefs.current[selectedDestination];
    if (!pathElem) return { x: 60, y: 190, angle: 0 };

    try {
      const totalLen = pathElem.getTotalLength();
      const currentLen = totalLen * Math.min(1, Math.max(0, deliveryProgress));
      const pt = pathElem.getPointAtLength(currentLen);

      // Tangent angle for envelope rotation
      const nextLen = Math.min(totalLen, currentLen + 2);
      const nextPt = pathElem.getPointAtLength(nextLen);
      const angle = (Math.atan2(nextPt.y - pt.y, nextPt.x - pt.x) * 180) / Math.PI;

      return { x: pt.x, y: pt.y, angle };
    } catch {
      return { x: 60, y: 190, angle: 0 };
    }
  };

  const envelopePos = getEnvelopePos();

  return (
    <section
      id="invention-workshop"
      className="invention-workshop"
      aria-labelledby="workshop-title"
    >
      {/* Decorative Washi Tape & Paper Edge */}
      <div className="workshop-paper-accent" aria-hidden="true">
        <span className="washi-tape-strip tape-left"></span>
        <span className="washi-tape-strip tape-right"></span>
      </div>

      {/* Workshop Header & Archival Identity */}
      <header className="workshop-header">
        <div className="workshop-archive-badge">
          <span className="badge-pin" aria-hidden="true">📌</span>
          <span className="badge-text">PIP'S INVENTION ARCHIVE · 003 EXPERIMENTS</span>
        </div>

        <h2 id="workshop-title" className="workshop-heading">
          Things I made when I was supposed to be sleeping...
        </h2>

        <p className="workshop-subheading">
          Official inventions from the Midnight Nursery's tiniest Dream Engineer.
        </p>

        {/* Pip's Desk Sticky Note */}
        <div className="workshop-desk-note">
          <span className="note-tape" aria-hidden="true"></span>
          <p className="note-text">
            “Dream engineering rule #1: If it squeaks, glows, or delivers sleepy letters,
            it is definitely not bedtime yet.”
          </p>
          <span className="note-author">— Pip, Chief Tinkerer</span>
        </div>
      </header>

      {/* Three Distinct Exhibit Stations Grid */}
      <div className="workshop-exhibits-grid">
        {/* ========================================================= */}
        {/* STATION 001: THE STAR ORCHESTRA                           */}
        {/* ========================================================= */}
        <article
          className="exhibit-station station-star-orchestra"
          aria-labelledby="exp-001-title"
        >
          {/* Top Archival Tag & Category */}
          <div className="station-meta-bar">
            <span className="station-number-chip">EXP-001</span>
            <span className="station-category">Dream Sound Engineering</span>
          </div>

          <h3 id="exp-001-title" className="station-title">
            The Star Orchestra
          </h3>

          <p className="station-desc">
            “I taught three little stars to sing. Now they won’t stop rehearsing after bedtime.”
          </p>

          {/* Interactive Music-Box Stage Preview */}
          <div className="exhibit-preview-frame musicbox-preview-frame">
            <div className="musicbox-stage">
              {/* Rotating Brass Winding Key */}
              <div className="musicbox-key-wrap" aria-hidden="true">
                <svg viewBox="0 0 40 40" width="34" height="34" className="musicbox-wind-key">
                  <circle cx="20" cy="20" r="6" fill="#F5D88C" stroke="#5C4033" strokeWidth="2" />
                  <rect x="18" y="24" width="4" height="12" rx="2" fill="#D4A843" stroke="#5C4033" strokeWidth="1.5" />
                  <ellipse cx="20" cy="11" rx="14" ry="7" fill="none" stroke="#5C4033" strokeWidth="2.5" />
                </svg>
                <span className="key-wind-hint">winds up</span>
              </div>

              {/* Music-Box Visual Artwork */}
              <div className="musicbox-artwork-wrap">
                <img
                  src="/assets/pip/pip_lullaby_box.png"
                  alt="Pip's handcrafted Star Orchestra music box with golden brass gears"
                  className="musicbox-image"
                  loading="lazy"
                />
                {/* Floating Musical Clefs and Star Notes */}
                <div className="music-notes-particles" aria-hidden="true">
                  <span className="float-note note-1">♫</span>
                  <span className="float-note note-2">♩</span>
                  <span className="float-note note-3">★</span>
                  <span className="float-note note-4">♫</span>
                </div>
              </div>

              {/* Audio Tuning Track Indicator */}
              <div className="musicbox-track-badge">
                <span className="musicbox-playing-waves" aria-hidden="true">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
                <span>Track: Twinkle Lullaby ♫</span>
              </div>
            </div>

            {/* Live Status Hint */}
            {starPlayStatus && (
              <div className="station-status-banner" role="status" aria-live="polite">
                {starPlayStatus}
              </div>
            )}
          </div>

          {/* Real Working Action Area */}
          <div className="station-actions-row">
            <button
              type="button"
              className="station-action-btn star-play-btn"
              onClick={handlePlayStars}
              aria-label="Play with my stars. Opens the Star Theater if unlocked, or guides you to collect them."
            >
              <span className="btn-icon" aria-hidden="true">★</span>
              <span>Play with my stars ★</span>
            </button>

            <span className="station-state-pill">
              {theaterUnlocked ? '✓ Concert Ready (Replay)' : '★ 3 Stars in Bedroom'}
            </span>
          </div>

          {/* Pip's Handwritten Note & Stamp */}
          <footer className="station-footer">
            <div className="station-sticky-note">
              <span className="sticky-pin" aria-hidden="true">✦</span>
              <p>“Note: Star #2 still rushes the tempo, but we love him anyway. — Pip”</p>
            </div>
            <div className="station-stamp stamp-pass">
              <span>PASSED BEDTIME NOISE TEST (BARELY)</span>
            </div>
          </footer>
        </article>

        {/* ========================================================= */}
        {/* STATION 002: THE MOONLIGHT LAB                            */}
        {/* ========================================================= */}
        <article
          className="exhibit-station station-moonlight-lab"
          aria-labelledby="exp-002-title"
        >
          {/* Top Archival Tag & Category */}
          <div className="station-meta-bar">
            <span className="station-number-chip">EXP-002</span>
            <span className="station-category">Nightlight Engineering</span>
          </div>

          <h3 id="exp-002-title" className="station-title">
            The Moonlight Lab
          </h3>

          <p className="station-desc">
            “Some little ghosts are scared of the dark. So I borrowed a tiny piece of the moon.”
          </p>

          {/* Interactive Miniature Environment around Lantern */}
          <div
            className={`exhibit-preview-frame lantern-preview-frame mood-${lanternMood}`}
            data-mood={lanternMood}
          >
            {/* Dynamic Lighting Glow Aura */}
            <div className="lantern-ambient-halo" aria-hidden="true"></div>

            {/* Drifting Sleep Dust Accents */}
            <div className="lantern-dust-container" aria-hidden="true">
              <span className="sleep-sparkle sp-1">✧</span>
              <span className="sleep-sparkle sp-2">✦</span>
              <span className="sleep-sparkle sp-3">⋆</span>
              <span className="sleep-sparkle sp-4">✧</span>
            </div>

            {/* Lantern Display Pedestal */}
            <div className="lantern-display-stage">
              <div className="lantern-pedestal-glow" aria-hidden="true"></div>
              <img
                src="/assets/pip/pip_dream_lantern.png"
                alt="Pip's glowing dream lantern powered by a borrowed crescent moonbeam"
                className="lantern-image"
                loading="lazy"
              />
            </div>

            {/* Pip's Live Reaction Speech Bubble */}
            <div className="lantern-pip-speech" aria-live="polite">
              <div className="speech-avatar" aria-hidden="true">💀</div>
              <div className="speech-bubble-body">
                <span className="speech-tag">Pip observes:</span>
                <p className="speech-text">{getMoodPipQuote()}</p>
              </div>
            </div>
          </div>

          {/* Three Lighting Moods Selector Controls */}
          <div className="mood-selector-container">
            <div
              className="mood-button-group"
              role="radiogroup"
              aria-label="Select Lantern Lighting Mood"
            >
              <button
                type="button"
                role="radio"
                aria-checked={lanternMood === 'warm'}
                className={`mood-toggle-btn ${lanternMood === 'warm' ? 'is-active' : ''}`}
                onClick={() => handleMoodSelect('warm')}
                title="Warm & Cozy amber lighting"
              >
                <span className="mood-icon" aria-hidden="true">🕯️</span>
                <span className="mood-label">Warm &amp; Cozy</span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={lanternMood === 'sleepy'}
                className={`mood-toggle-btn ${lanternMood === 'sleepy' ? 'is-active' : ''}`}
                onClick={() => handleMoodSelect('sleepy')}
                title="Sleepy Moon cool lavender-blue lighting"
              >
                <span className="mood-icon" aria-hidden="true">🌙</span>
                <span className="mood-label">Sleepy Moon</span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={lanternMood === 'starlight'}
                className={`mood-toggle-btn ${lanternMood === 'starlight' ? 'is-active' : ''}`}
                onClick={() => handleMoodSelect('starlight')}
                title="Little Starlight crystalline shimmer"
              >
                <span className="mood-icon" aria-hidden="true">✨</span>
                <span className="mood-label">Little Starlight</span>
              </button>
            </div>
          </div>

          {/* Pip's Handwritten Note & Stamp */}
          <footer className="station-footer">
            <div className="station-sticky-note note-ghost">
              <span className="sticky-pin" aria-hidden="true">👻</span>
              <p>“Approved by: 4 out of 5 nursery ghosts. (The 5th was asleep).”</p>
            </div>
            <div className="station-stamp stamp-ghost-safe">
              <span>100% GHOST-SAFE</span>
            </div>
          </footer>
        </article>

        {/* ========================================================= */}
        {/* STATION 003: THE DREAM EXPRESS                            */}
        {/* ========================================================= */}
        <article
          className="exhibit-station station-dream-express"
          aria-labelledby="exp-003-title"
        >
          {/* Top Archival Tag & Category */}
          <div className="station-meta-bar">
            <span className="station-number-chip">EXP-003</span>
            <span className="station-category">Dream Delivery Engineering</span>
          </div>

          <h3 id="exp-003-title" className="station-title">
            The Dream Express
          </h3>

          <p className="station-desc">
            “I deliver dreams to tiny houses before anyone notices I borrowed the moon.”
          </p>

          {/* Illustrated Paper-Craft Nursery Delivery Map */}
          <div className="exhibit-preview-frame map-preview-frame">
            <div className="nursery-map-container">
              {/* Compass Rose Accent */}
              <div className="map-compass" aria-hidden="true">
                <span className="compass-star">✦</span>
                <span className="compass-lbl">NURSERY SKYWAY</span>
              </div>

              {/* Responsive SVG Route System */}
              <svg
                viewBox="0 0 500 240"
                className="delivery-routes-svg"
                aria-hidden="true"
              >
                <defs>
                  {/* Glowing Filter for Paths */}
                  <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#F5D88C" floodOpacity="0.6" />
                  </filter>
                  <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8CA8F5" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#4A75D0" stopOpacity="0.6" />
                  </linearGradient>
                </defs>

                {/* Base Route 1: Depot -> Cloud Cottage */}
                <path
                  ref={(el) => (pathRefs.current['cloud-cottage'] = el)}
                  d="M 60 190 C 85 110, 110 70, 155 55"
                  fill="none"
                  className={`flight-route-track ${
                    selectedDestination === 'cloud-cottage' ? 'route-active' : ''
                  }`}
                />

                {/* Base Route 2: Depot -> Sleepy Ghost House */}
                <path
                  ref={(el) => (pathRefs.current['ghost-house'] = el)}
                  d="M 60 190 C 130 220, 210 185, 285 155"
                  fill="none"
                  className={`flight-route-track ${
                    selectedDestination === 'ghost-house' ? 'route-active' : ''
                  }`}
                />

                {/* Base Route 3: Depot -> Moonbeam Tower */}
                <path
                  ref={(el) => (pathRefs.current['moonbeam-tower'] = el)}
                  d="M 60 190 C 150 110, 250 55, 375 60"
                  fill="none"
                  className={`flight-route-track ${
                    selectedDestination === 'moonbeam-tower' ? 'route-active' : ''
                  }`}
                />

                {/* Dispatch Origin: Pip's Midnight Depot */}
                <g className="map-depot-node" transform="translate(60, 190)">
                  <circle cx="0" cy="0" r="14" fill="#A34063" stroke="#5C4033" strokeWidth="2" />
                  <circle cx="0" cy="0" r="8" fill="#FFF8F1" />
                  <text x="0" y="3" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#A34063">
                    ⌂
                  </text>
                  <text x="0" y="24" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#5C4033">
                    DEPOT
                  </text>
                </g>
              </svg>

              {/* Destination Landmarks (Clickable on Map) */}
              {Object.values(DESTINATIONS).map((dest) => {
                const isSelected = selectedDestination === dest.id;
                const isDelivered = deliveredLocation === dest.id;

                return (
                  <button
                    key={dest.id}
                    type="button"
                    className={`map-landmark-pin pin-${dest.id} ${
                      isSelected ? 'is-selected' : ''
                    } ${isDelivered ? 'is-delivered' : ''}`}
                    style={{ left: `${(dest.coords.x / 500) * 100}%`, top: `${(dest.coords.y / 240) * 100}%` }}
                    onClick={() => handleSelectDestination(dest.id)}
                    aria-label={`Send dream to ${dest.name}`}
                  >
                    <span className="landmark-badge">
                      <span className="landmark-icon" aria-hidden="true">{dest.icon}</span>
                      <span className="landmark-name">{dest.name}</span>
                    </span>
                    {isDelivered && (
                      <span className="arrival-sparkle-burst" aria-hidden="true">
                        <span>✦</span>
                        <span>✧</span>
                        <span>★</span>
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Animated Traveling Dream Envelope */}
              {(isDelivering || selectedDestination) && (
                <div
                  className={`traveling-envelope ${isDelivering ? 'in-flight' : 'landed'}`}
                  style={{
                    left: `${(envelopePos.x / 500) * 100}%`,
                    top: `${(envelopePos.y / 240) * 100}%`,
                    transform: `translate(-50%, -50%) rotate(${envelopePos.angle}deg)`,
                  }}
                  aria-hidden="true"
                >
                  <div className="envelope-body">
                    <span className="envelope-icon">✉️</span>
                    <span className="envelope-wing left-wing">໒</span>
                    <span className="envelope-wing right-wing">७</span>
                  </div>
                  {isDelivering && <span className="flight-stardust-trail"></span>}
                </div>
              )}
            </div>

            {/* Delivery Confirmation Toast */}
            {deliveryMessage && (
              <div className="delivery-confirmation-card" role="status" aria-live="polite">
                <span className="confirm-check" aria-hidden="true">✓</span>
                <div className="confirm-body">
                  <strong>{deliveryMessage}</strong>
                  <span className="confirm-sub">Select another house to deliver more dreams!</span>
                </div>
              </div>
            )}
          </div>

          {/* Destination Selector Buttons */}
          <div className="delivery-controls-row">
            <span className="delivery-label" id="dest-label">Choose Delivery Route:</span>
            <div
              className="destination-buttons"
              role="group"
              aria-labelledby="dest-label"
            >
              {Object.values(DESTINATIONS).map((dest) => (
                <button
                  key={dest.id}
                  type="button"
                  className={`dest-action-btn ${
                    selectedDestination === dest.id ? 'is-selected' : ''
                  }`}
                  onClick={() => handleSelectDestination(dest.id)}
                  disabled={isDelivering}
                  aria-pressed={selectedDestination === dest.id}
                >
                  <span className="dest-btn-icon" aria-hidden="true">{dest.icon}</span>
                  <span>{dest.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pip's Handwritten Note & Stamp */}
          <footer className="station-footer">
            <div className="station-sticky-note note-express">
              <span className="sticky-pin" aria-hidden="true">✉</span>
              <p>“Guaranteed on-time delivery: 5 minutes before morning alarm clock. — Pip”</p>
            </div>
            <div className="station-stamp stamp-airmail">
              <span>MIDNIGHT POST · SPECIAL AIR MAIL · 003</span>
            </div>
          </footer>
        </article>
      </div>
    </section>
  );
}
