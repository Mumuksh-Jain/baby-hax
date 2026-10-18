import React, { useState, useRef, useEffect } from 'react';
import {
  playLanternSwitchSound,
  playDeliveryDispatchSound,
  playDeliveryArrivedSound,
  playStarSound,
} from '../utils/soundEngine';
import './InventionWorkshop.css';

/**
 * Pip's Little Invention Workshop (Pass 02B - Refined 2-Row Layout)
 * Row 1: The Star Orchestra (EXP-001) & The Moonlight Lab (EXP-002) side by side
 * Row 2: The Dream Express (EXP-003) full width panoramic nursery world
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
      coords: { x: 230, y: 75 },
      pinCoords: { x: 230, y: 22 },
    },
    'ghost-house': {
      id: 'ghost-house',
      name: 'Sleepy Ghost House',
      icon: '👻',
      color: '#B85075',
      subtext: 'Peaked roof with friendly waving attic ghost',
      deliveryNote: 'Dream delivered! Cozy blanket dreams arrived. Friendly ghost gave 5 stars!',
      coords: { x: 500, y: 175 },
      pinCoords: { x: 500, y: 132 },
    },
    'moonbeam-tower': {
      id: 'moonbeam-tower',
      name: 'Moonbeam Tower',
      icon: '🏰',
      color: '#D4A843',
      subtext: 'High observatory bathed in silvery moonbeams',
      deliveryNote: 'Dream delivered! Astronomy stargazing dreams landed safely on the spire!',
      coords: { x: 730, y: 80 },
      pinCoords: { x: 730, y: 18 },
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
    if (!selectedDestination) return { x: 80, y: 220, angle: 0 };
    const pathElem = pathRefs.current[selectedDestination];
    if (!pathElem) return { x: 80, y: 220, angle: 0 };

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
      return { x: 80, y: 220, angle: 0 };
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

      {/* Two-Row Exhibits Grid: Row 1 (001 + 002) side-by-side, Row 2 (003) full width */}
      <div className="workshop-exhibits-grid">
        {/* ========================================================= */}
        {/* STATION 001: THE STAR ORCHESTRA (Row 1 Left)              */}
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
                <svg viewBox="0 0 40 40" width="36" height="36" className="musicbox-wind-key">
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
        {/* STATION 002: THE MOONLIGHT LAB (Row 1 Right)              */}
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

          {/* Handcrafted Bedside Lighting Control Panel Tray */}
          <div className="moonlight-switchboard-panel">
            <div className="switchboard-header">
              <span className="switchboard-pin" aria-hidden="true">✦</span>
              <span className="switchboard-title">NIGHTLIGHT MOOD SELECTOR</span>
              <span className="switchboard-pin" aria-hidden="true">✦</span>
            </div>

            <div
              className="mood-switchboard-tray"
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
                <span className="mood-indicator-led led-warm" aria-hidden="true"></span>
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
                <span className="mood-indicator-led led-sleepy" aria-hidden="true"></span>
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
                <span className="mood-indicator-led led-starlight" aria-hidden="true"></span>
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
        {/* STATION 003: THE DREAM EXPRESS (Row 2 Full-Width Exhibit) */}
        {/* ========================================================= */}
        <article
          className="exhibit-station station-dream-express"
          aria-labelledby="exp-003-title"
        >
          {/* Top Archival Tag & Category */}
          <div className="station-meta-bar">
            <div className="express-tag-cluster">
              <span className="station-number-chip">EXP-003</span>
              <span className="express-panoramic-badge">FULL-SCALE PROTOTYPE</span>
            </div>
            <span className="station-category">Dream Delivery Engineering</span>
          </div>

          <h3 id="exp-003-title" className="station-title">
            The Dream Express
          </h3>

          <p className="station-desc">
            “I deliver dreams to tiny houses before anyone notices I borrowed the moon.”
          </p>

          {/* Illustrated Paper-Craft Nursery Panoramic Delivery Map */}
          <div className="exhibit-preview-frame map-preview-frame">
            <div className="nursery-map-container">
              {/* Compass Rose Accent */}
              <div className="map-compass" aria-hidden="true">
                <span className="compass-star">✦</span>
                <span className="compass-lbl">NURSERY SKYWAY · OFFICIAL FLIGHT CHART</span>
              </div>

              {/* Full Whimsical Nursery World SVG */}
              <svg
                viewBox="0 0 840 280"
                className="delivery-routes-svg"
                aria-hidden="true"
              >
                <defs>
                  {/* Glowing Filter for Paths */}
                  <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="1" stdDeviation="3" floodColor="#F5D88C" floodOpacity="0.7" />
                  </filter>
                  {/* Moonbeam Light Ray Gradient */}
                  <linearGradient id="moonbeamGrad" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
                    <stop offset="60%" stopColor="#DDE8FA" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#8CA8F5" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* --- NURSERY TOPOGRAPHY: Soft Rolling Storybook Hills & Cloud Banks --- */}
                <path
                  d="M 0 280 L 0 215 Q 180 160 380 200 Q 600 170 840 210 L 840 280 Z"
                  fill="#EAF0FB"
                  opacity="0.85"
                />
                <path
                  d="M 0 280 L 0 240 Q 240 195 490 230 Q 680 205 840 245 L 840 280 Z"
                  fill="#DFE9F7"
                />

                {/* Distant Twinkling Stars */}
                <g fill="#F5D88C" opacity="0.65">
                  <circle cx="120" cy="50" r="1.5" />
                  <circle cx="190" cy="30" r="2" />
                  <circle cx="340" cy="65" r="1.5" />
                  <circle cx="440" cy="40" r="2" />
                  <circle cx="620" cy="55" r="1.5" />
                  <circle cx="660" cy="25" r="2" />
                </g>

                {/* --- BASE FLIGHT ROUTES --- */}
                {/* Route 1: Depot (80, 220) -> Cloud Cottage (230, 75) */}
                <path
                  ref={(el) => (pathRefs.current['cloud-cottage'] = el)}
                  d="M 80 220 C 110 130, 160 85, 230 75"
                  fill="none"
                  className={`flight-route-track ${
                    selectedDestination === 'cloud-cottage' ? 'route-active' : ''
                  }`}
                />

                {/* Route 2: Depot (80, 220) -> Sleepy Ghost House (500, 175) */}
                <path
                  ref={(el) => (pathRefs.current['ghost-house'] = el)}
                  d="M 80 220 C 200 250, 360 215, 500 175"
                  fill="none"
                  className={`flight-route-track ${
                    selectedDestination === 'ghost-house' ? 'route-active' : ''
                  }`}
                />

                {/* Route 3: Depot (80, 220) -> Moonbeam Tower (730, 80) */}
                <path
                  ref={(el) => (pathRefs.current['moonbeam-tower'] = el)}
                  d="M 80 220 C 260 130, 500 65, 730 80"
                  fill="none"
                  className={`flight-route-track ${
                    selectedDestination === 'moonbeam-tower' ? 'route-active' : ''
                  }`}
                />

                {/* --- DESTINATION 1: CLOUD COTTAGE ILLUSTRATION --- */}
                <g className="map-illustration cloud-cottage-art" transform="translate(230, 75)">
                  {/* Fluffy Cumulus Cloud Island Base */}
                  <ellipse cx="-20" cy="24" rx="28" ry="14" fill="#FFFFFF" opacity="0.95" />
                  <ellipse cx="20" cy="24" rx="28" ry="14" fill="#FFFFFF" opacity="0.95" />
                  <ellipse cx="0" cy="26" rx="42" ry="15" fill="#EAF3FD" />
                  <ellipse cx="0" cy="18" rx="34" ry="12" fill="#FFFFFF" />
                  {/* Cottage House Body */}
                  <rect x="-18" y="-6" width="36" height="26" rx="2" fill="#FFF9F0" stroke="#5C4033" strokeWidth="1.8" />
                  {/* Gable Roof */}
                  <polygon points="-24,-4 0,-24 24,-4" fill="#E67A95" stroke="#5C4033" strokeWidth="1.8" />
                  {/* Chimney */}
                  <rect x="8" y="-22" width="7" height="12" fill="#A34063" stroke="#5C4033" strokeWidth="1.5" />
                  {/* Smoke Wisp */}
                  <path d="M 12 -23 Q 16 -32 10 -40 Q 18 -48 13 -56" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.8" className="cottage-smoke-anim" />
                  {/* Glowing Window */}
                  <rect x="-10" y="2" width="10" height="11" rx="1.5" fill="#FFD54F" stroke="#5C4033" strokeWidth="1.2" />
                  {/* Door */}
                  <rect x="4" y="6" width="9" height="14" rx="1" fill="#8C5835" stroke="#5C4033" strokeWidth="1.2" />
                </g>

                {/* --- DESTINATION 2: SLEEPY GHOST HOUSE ILLUSTRATION --- */}
                <g className="map-illustration ghost-house-art" transform="translate(500, 175)">
                  {/* Grassy knoll base */}
                  <ellipse cx="0" cy="30" rx="48" ry="14" fill="#C9DDB8" stroke="#8CA870" strokeWidth="1.5" />
                  {/* House Body */}
                  <rect x="-24" y="-8" width="48" height="36" rx="2" fill="#544B68" stroke="#372F48" strokeWidth="2" />
                  {/* High Peaked Steeple Roof */}
                  <polygon points="-30,-6 0,-34 30,-6" fill="#3D3550" stroke="#251E33" strokeWidth="2" />
                  {/* Chimney with Nightcap */}
                  <rect x="12" y="-30" width="8" height="16" fill="#3D3550" stroke="#251E33" strokeWidth="1.5" />
                  <path d="M 10 -30 Q 16 -40 26 -34" fill="#E67A95" stroke="#5C4033" strokeWidth="1.5" />
                  <circle cx="26" cy="-34" r="2.5" fill="#F5D88C" />
                  {/* Attic Arch Window with Friendly Ghost */}
                  <path d="M -10 -4 A 10 10 0 0 1 10 -4 L 10 10 L -10 10 Z" fill="#FFE082" stroke="#372F48" strokeWidth="1.5" />
                  {/* Friendly Ghost Peeking Out */}
                  <g transform="translate(0, 3)" className="ghost-peeking-anim">
                    <path d="M -6 6 C -6 -2, 6 -2, 6 6 C 4 5, 2 7, 0 5 C -2 7, -4 5, -6 6 Z" fill="#FFFFFF" stroke="#372F48" strokeWidth="1" />
                    <circle cx="-2" cy="1" r="0.8" fill="#372F48" />
                    <circle cx="2" cy="1" r="0.8" fill="#372F48" />
                    <circle cx="-3.5" cy="2.5" r="1.2" fill="#FF8BA7" opacity="0.8" />
                    <circle cx="3.5" cy="2.5" r="1.2" fill="#FF8BA7" opacity="0.8" />
                    <path d="M -1 3.5 Q 0 4.5 1 3.5" fill="none" stroke="#372F48" strokeWidth="0.8" />
                  </g>
                  {/* Ground Door and Porch Lantern */}
                  <rect x="-7" y="12" width="14" height="16" rx="1" fill="#7E6B56" stroke="#372F48" strokeWidth="1.2" />
                  <circle cx="16" cy="15" r="3.5" fill="#FFD54F" />
                </g>

                {/* --- DESTINATION 3: MOONBEAM TOWER ILLUSTRATION --- */}
                <g className="map-illustration moonbeam-tower-art" transform="translate(730, 80)">
                  {/* Silver Moonbeam Ray */}
                  <polygon points="-12,-90 12,-90 38,70 -38,70" fill="url(#moonbeamGrad)" opacity="0.65" />
                  {/* Floating Celestial Base Rock */}
                  <ellipse cx="0" cy="38" rx="42" ry="14" fill="#B4C0DC" stroke="#5C4033" strokeWidth="1.5" />
                  {/* Tower Stone Spire */}
                  <polygon points="-18,36 -12,-30 12,-30 18,36" fill="#EDE4D8" stroke="#5C4033" strokeWidth="2" />
                  <line x1="-15" y1="12" x2="15" y2="12" stroke="#C5B7A6" strokeWidth="1.5" />
                  <line x1="-13" y1="-10" x2="13" y2="-10" stroke="#C5B7A6" strokeWidth="1.5" />
                  {/* Observatory Balcony Ring */}
                  <rect x="-16" y="-34" width="32" height="6" rx="2" fill="#D4A843" stroke="#5C4033" strokeWidth="1.5" />
                  {/* Dome Spire */}
                  <path d="M -13 -34 A 13 13 0 0 1 13 -34 Z" fill="#6A8EC4" stroke="#5C4033" strokeWidth="1.8" />
                  <rect x="-3" y="-44" width="6" height="8" rx="1" fill="#FFD54F" />
                  {/* Crescent Moon Flag */}
                  <line x1="0" y1="-44" x2="0" y2="-62" stroke="#5C4033" strokeWidth="2" />
                  <path d="M 0 -62 C 6 -62 10 -58 10 -54 C 6 -55 3 -53 0 -50 Z" fill="#F5D88C" stroke="#5C4033" strokeWidth="1.2" />
                  {/* Glowing Windows */}
                  <rect x="-3" y="-4" width="6" height="10" rx="1.5" fill="#FFE082" stroke="#5C4033" strokeWidth="1" />
                  <rect x="-3" y="18" width="6" height="10" rx="1.5" fill="#FFE082" stroke="#5C4033" strokeWidth="1" />
                </g>

                {/* --- DISPATCH ORIGIN: PIP'S MIDNIGHT DEPOT --- */}
                <g className="map-illustration midnight-depot-art" transform="translate(80, 220)">
                  <ellipse cx="0" cy="22" rx="36" ry="12" fill="#E8DED2" stroke="#5C4033" strokeWidth="1.5" />
                  <rect x="-20" y="2" width="40" height="20" rx="2" fill="#C55272" stroke="#5C4033" strokeWidth="2" />
                  <polygon points="-26,2 0,-14 26,2" fill="#7A4B38" stroke="#5C4033" strokeWidth="2" />
                  <circle cx="0" cy="-4" r="5" fill="#FFF8F1" stroke="#5C4033" strokeWidth="1.2" />
                  <text x="0" y="-2" textAnchor="middle" fontSize="5" fontWeight="bold" fill="#A34063">12</text>
                  <line x1="-30" y1="24" x2="30" y2="24" stroke="#5C4033" strokeWidth="2" strokeDasharray="4 3" />
                  <rect x="-24" y="28" width="48" height="14" rx="3" fill="#FFFDF9" stroke="#5C4033" strokeWidth="1.2" />
                  <text x="0" y="38" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#A34063" letterSpacing="0.05em">
                    ★ DEPOT
                  </text>
                </g>
              </svg>

              {/* Destination Landmark Badges (Clickable on Map) */}
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
                    style={{
                      left: `${(dest.pinCoords.x / 840) * 100}%`,
                      top: `${(dest.pinCoords.y / 280) * 100}%`,
                    }}
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
                    left: `${(envelopePos.x / 840) * 100}%`,
                    top: `${(envelopePos.y / 280) * 100}%`,
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
          </div>

          {/* Delivery Controls & Receipt Panel */}
          <div className="express-dispatch-dashboard">
            {/* Left: Route Selector Buttons */}
            <div className="delivery-controls-row">
              <span className="delivery-label" id="dest-label">CHOOSE DELIVERY ROUTE:</span>
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

            {/* Right: Delivery Confirmation Airmail Receipt */}
            <div className="express-receipt-wrap">
              {deliveryMessage ? (
                <div className="delivery-confirmation-card is-active" role="status" aria-live="polite">
                  <div className="confirm-header">
                    <span className="confirm-check" aria-hidden="true">✓</span>
                    <span className="receipt-tag">DISPATCH RECEIPT #003</span>
                  </div>
                  <div className="confirm-body">
                    <strong>{deliveryMessage}</strong>
                    <span className="confirm-sub">Select another house to deliver more dreams!</span>
                  </div>
                </div>
              ) : (
                <div className="delivery-confirmation-card is-idle">
                  <span className="receipt-idle-icon" aria-hidden="true">📯</span>
                  <span className="receipt-idle-text">Select a destination above to launch the Dream Express!</span>
                </div>
              )}
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
