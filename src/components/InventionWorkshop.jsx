import React, { useState, useRef, useEffect } from 'react';
import {
  playLanternSwitchSound,
  playDeliveryDispatchSound,
  playDeliveryArrivedSound,
  playStarSound,
} from '../utils/soundEngine';
import './InventionWorkshop.css';

/**
 * Pip's Little Invention Workshop (Pass 02C - The Living Dream Express)
 * Row 1: The Star Orchestra (EXP-001) & The Moonlight Lab (EXP-002) side by side
 * Row 2: The Dream Express (EXP-003) full width panoramic nursery railway world
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
  // STATION 003 HANDLERS: THE LIVING DREAM EXPRESS
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
      routeDuration: 3800,
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
      routeDuration: 4400,
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
      routeDuration: 5000,
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

    // Scale duration with route distance (3.8s to 5.0s, satisfying 4-6s choreography)
    const duration = dest.routeDuration || 4500;
    const startTime = performance.now();

    const animateFlight = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Smooth cubic ease in-out
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      setDeliveryProgress(eased);

      if (t < 1) {
        deliveryAnimRef.current = requestAnimationFrame(animateFlight);
      } else {
        setIsDelivering(false);
        setDeliveryProgress(1);
        setDeliveredLocation(destId);
        setDeliveryMessage(dest.deliveryNote);
        if (soundEnabled) {
          playDeliveryArrivedSound();
        }
      }
    };

    deliveryAnimRef.current = requestAnimationFrame(animateFlight);
  };

  // -------------------------------------------------------------
  // TRAIN PATH SAMPLING (ARTICULATED LOCOMOTIVE + POSTAL CARRIAGE)
  // -------------------------------------------------------------
  const getTrainPositions = () => {
    // If no destination is selected yet, park the train at Midnight Depot platform
    if (!selectedDestination && !deliveredLocation) {
      return {
        loco: { x: 92, y: 220, angle: 0 },
        carriage: { x: 64, y: 220, angle: 0 },
      };
    }

    const currentDestId = selectedDestination || deliveredLocation;
    const pathElem = pathRefs.current[currentDestId];
    if (!pathElem) {
      return {
        loco: { x: 92, y: 220, angle: 0 },
        carriage: { x: 64, y: 220, angle: 0 },
      };
    }

    try {
      const totalLen = pathElem.getTotalLength();
      const progress = isDelivering ? deliveryProgress : (deliveredLocation ? 1 : 0);
      const locoLen = totalLen * Math.min(1, Math.max(0, progress));
      const ptLoco = pathElem.getPointAtLength(locoLen);

      // Tangent angle for locomotive (central differencing for jitter-free curve rotation)
      const nextLocoLen = Math.min(totalLen, locoLen + 2);
      const prevLocoLen = Math.max(0, locoLen - 2);
      const ptLocoNext = pathElem.getPointAtLength(nextLocoLen);
      const ptLocoPrev = pathElem.getPointAtLength(prevLocoLen);
      const locoAngle = (Math.atan2(ptLocoNext.y - ptLocoPrev.y, ptLocoNext.x - ptLocoPrev.x) * 180) / Math.PI;

      // Carriage: distance offset of 28 units along the curved SVG path
      const CARRIAGE_OFFSET = 28;
      let ptCar, carAngle;

      if (locoLen >= CARRIAGE_OFFSET) {
        const carLen = locoLen - CARRIAGE_OFFSET;
        ptCar = pathElem.getPointAtLength(carLen);
        const nextCarLen = Math.min(totalLen, carLen + 2);
        const prevCarLen = Math.max(0, carLen - 2);
        const ptCarNext = pathElem.getPointAtLength(nextCarLen);
        const ptCarPrev = pathElem.getPointAtLength(prevCarLen);
        carAngle = (Math.atan2(ptCarNext.y - ptCarPrev.y, ptCarNext.x - ptCarPrev.x) * 180) / Math.PI;
      } else {
        // Locomotive is departing depot: carriage projects smoothly along depot track
        const startTangent = pathElem.getPointAtLength(2);
        const pathStart = pathElem.getPointAtLength(0);
        const initialAngle = (Math.atan2(startTangent.y - pathStart.y, startTangent.x - pathStart.x) * 180) / Math.PI;

        const remainingOffset = CARRIAGE_OFFSET - locoLen;
        const rad = (initialAngle * Math.PI) / 180;
        ptCar = {
          x: pathStart.x - remainingOffset * Math.cos(rad),
          y: pathStart.y - remainingOffset * Math.sin(rad),
        };
        carAngle = initialAngle;
      }

      return {
        loco: { x: ptLoco.x, y: ptLoco.y, angle: locoAngle },
        carriage: { x: ptCar.x, y: ptCar.y, angle: carAngle },
      };
    } catch {
      return {
        loco: { x: 92, y: 220, angle: 0 },
        carriage: { x: 64, y: 220, angle: 0 },
      };
    }
  };

  const trainPos = getTrainPositions();

  // Lighthouse beacon searchlight state
  const getBeaconMode = () => {
    if (deliveredLocation === 'moonbeam-tower') return 'beacon-celebration-mode';
    if (selectedDestination === 'moonbeam-tower' && isDelivering && deliveryProgress > 0.5) {
      return 'beacon-tracking-mode';
    }
    return 'beacon-idle-sweep';
  };

  const beaconMode = getBeaconMode();

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

          {/* Action Row */}
          <div className="station-actions-row">
            <button
              type="button"
              className="station-action-btn star-play-btn"
              onClick={handlePlayStars}
              aria-label="Play with my stars or open Star Theater"
            >
              <span className="btn-icon" aria-hidden="true">★</span>
              <span>Play with my stars ★</span>
            </button>
            <span className="station-state-pill">
              {theaterUnlocked ? 'Unlocked · Ready' : '3 Stars in Bedroom'}
            </span>
          </div>

          {/* Pip's Sticky Note & Rubber Stamp */}
          <footer className="station-footer">
            <div className="station-sticky-note note-orchestra">
              <span className="sticky-pin" aria-hidden="true">📌</span>
              <p>“Star #2 plays slightly flat when tickled. Must oil the gear springs.”</p>
            </div>
            <div className="station-stamp stamp-pass">
              <span>TESTED: VERY SLEEPY</span>
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
            <span className="station-category">Nocturnal Illumination</span>
          </div>

          <h3 id="exp-002-title" className="station-title">
            The Moonlight Lab
          </h3>

          <p className="station-desc">
            “Dark rooms have monster rumors. So I made mood filters for sleepy midnight glow.”
          </p>

          {/* Bedside Lantern Switchboard Frame */}
          <div className={`exhibit-preview-frame lantern-preview-frame mood-${lanternMood}`}>
            <div className="lantern-chamber">
              {/* Cozy Illustrated Lantern Artwork */}
              <div className="lantern-artwork-wrap">
                <img
                  src="/assets/pip/pip_dream_lantern.png"
                  alt="Pip's handcrafted bedside nightlight lantern glowing softly"
                  className="lantern-image"
                  loading="lazy"
                />
                {/* Ambient Mood Halo */}
                <div className={`lantern-glow-halo halo-${lanternMood}`} aria-hidden="true"></div>
                {/* Floating Sleep Sparkles */}
                <div className="lantern-sparkles" aria-hidden="true">
                  <span className="sleep-sparkle sp-1">✦</span>
                  <span className="sleep-sparkle sp-2">✧</span>
                  <span className="sleep-sparkle sp-3">★</span>
                </div>
              </div>

              {/* Pip's Quote for Current Mood */}
              <div className="pip-speech-bubble" aria-live="polite">
                <span className="bubble-pip-avatar" aria-hidden="true">💀</span>
                <span className="speech-text">{getMoodPipQuote()}</span>
              </div>
            </div>

            {/* Bedside Brass Toggle Buttons */}
            <div className="mood-switchboard-tray" role="group" aria-label="Nightlight Mood Presets">
              <button
                type="button"
                className={`mood-toggle-btn ${lanternMood === 'warm' ? 'is-active' : ''}`}
                onClick={() => handleMoodSelect('warm')}
                aria-pressed={lanternMood === 'warm'}
              >
                <span className="mood-icon" aria-hidden="true">🕯️</span>
                <span>Warm & Cozy</span>
              </button>
              <button
                type="button"
                className={`mood-toggle-btn ${lanternMood === 'sleepy' ? 'is-active' : ''}`}
                onClick={() => handleMoodSelect('sleepy')}
                aria-pressed={lanternMood === 'sleepy'}
              >
                <span className="mood-icon" aria-hidden="true">🌙</span>
                <span>Sleepy Moon</span>
              </button>
              <button
                type="button"
                className={`mood-toggle-btn ${lanternMood === 'starlight' ? 'is-active' : ''}`}
                onClick={() => handleMoodSelect('starlight')}
                aria-pressed={lanternMood === 'starlight'}
              >
                <span className="mood-icon" aria-hidden="true">✨</span>
                <span>Little Starlight</span>
              </button>
            </div>
          </div>

          {/* Status Row */}
          <div className="station-actions-row">
            <span className="current-mode-label">
              Active Glow: <strong>{lanternMood.toUpperCase()} LUMENS</strong>
            </span>
            <span className="station-state-pill pill-calm">Monster Protection: 100%</span>
          </div>

          {/* Pip's Sticky Note & Rubber Stamp */}
          <footer className="station-footer">
            <div className="station-sticky-note note-lantern">
              <span className="sticky-pin" aria-hidden="true">📌</span>
              <p>“Tested on closet door. Closet monster politely went back to sleep.”</p>
            </div>
            <div className="station-stamp stamp-ghost-safe">
              <span>GHOST-APPROVED · 100% COZY</span>
            </div>
          </footer>
        </article>

        {/* ========================================================= */}
        {/* STATION 003: THE LIVING DREAM EXPRESS (Row 2 Full Width)  */}
        {/* ========================================================= */}
        <article
          className="exhibit-station station-dream-express full-width-station"
          aria-labelledby="exp-003-title"
        >
          {/* Top Archival Tag & Category */}
          <div className="station-meta-bar">
            <div className="meta-left-group">
              <span className="station-number-chip">EXP-003</span>
              <span className="station-category">Miniature Railway & Dream Transport</span>
            </div>
            <span className="station-archival-callout">
              No. 003 LOCOMOTIVE · ARTICULATED SKYWAY
            </span>
          </div>

          <h3 id="exp-003-title" className="station-title">
            The Living Dream Express
          </h3>

          <p className="station-desc">
            “Midnight postal service for sleepy houses. Locomotive No. 003 delivers cozy dreams
            along magical sky-rails before morning comes.”
          </p>

          {/* Full Panoramic Whimsical Nursery Railway Map */}
          <div className="exhibit-preview-frame map-preview-frame">
            <div className="nursery-map-container">
              {/* Compass Rose Accent */}
              <div className="map-compass" aria-hidden="true">
                <span className="compass-star">✦</span>
                <span className="compass-lbl">NURSERY SKYWAY · OFFICIAL RAILWAY CHART</span>
              </div>

              {/* Full Whimsical Nursery World SVG */}
              <svg
                viewBox="0 0 840 280"
                className="delivery-routes-svg"
                aria-hidden="true"
              >
                <defs>
                  {/* Glowing Filter for Golden Sky-Rails */}
                  <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="1" stdDeviation="3" floodColor="#F5D88C" floodOpacity="0.75" />
                  </filter>

                  {/* Headlamp Light Cone Gradient */}
                  <linearGradient id="headlampBeamGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                    <stop offset="0%" stopColor="#FFFDF9" stopOpacity="0.85" />
                    <stop offset="35%" stopColor="#FFF59D" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#FFF59D" stopOpacity="0" />
                  </linearGradient>

                  {/* Anime-Inspired Lighthouse Searchlight Gradient */}
                  <linearGradient id="lighthouseBeamGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
                    <stop offset="25%" stopColor="#E0ECFF" stopOpacity="0.6" />
                    <stop offset="65%" stopColor="#9AB8F5" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#8CA8F5" stopOpacity="0" />
                  </linearGradient>

                  {/* Lighthouse Core Bright Beam */}
                  <linearGradient id="lighthouseBeamCoreGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                    <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.75" />
                    <stop offset="70%" stopColor="#C9DCFD" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#C9DCFD" stopOpacity="0" />
                  </linearGradient>

                  {/* Radial Beacon Core Glow */}
                  <radialGradient id="beaconCoreGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                    <stop offset="50%" stopColor="#FFE082" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#D4A843" stopOpacity="0" />
                  </radialGradient>
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

                {/* --- MAGICAL SKY-RAIL ROUTES --- */}
                {/* Route 1: Depot (80, 220) -> Cloud Cottage (230, 75) */}
                <g className={`sky-rail-system ${selectedDestination === 'cloud-cottage' ? 'is-active' : ''}`}>
                  {/* Base quiet guide */}
                  <path
                    d="M 80 220 C 110 130, 160 85, 230 75"
                    fill="none"
                    stroke="#D4A843"
                    strokeWidth="1.5"
                    strokeDasharray="3 5"
                    opacity="0.25"
                  />
                  {/* Active illuminated sky-rail track */}
                  {selectedDestination === 'cloud-cottage' && (
                    <g className="sky-rail-golden-track">
                      <path
                        d="M 80 220 C 110 130, 160 85, 230 75"
                        fill="none"
                        stroke="#F5D88C"
                        strokeWidth="6"
                        opacity="0.35"
                        filter="url(#routeGlow)"
                      />
                      <path
                        d="M 80 220 C 110 130, 160 85, 230 75"
                        fill="none"
                        stroke="#C59B3F"
                        strokeWidth="6"
                        strokeDasharray="2 7"
                        opacity="0.75"
                      />
                      <path
                        d="M 80 220 C 110 130, 160 85, 230 75"
                        fill="none"
                        stroke="#FFFDF9"
                        strokeWidth="2.5"
                        opacity="0.9"
                      />
                      <path
                        d="M 80 220 C 110 130, 160 85, 230 75"
                        fill="none"
                        stroke="#8B264A"
                        strokeWidth="0.8"
                        opacity="0.4"
                      />
                      <path
                        d="M 80 220 C 110 130, 160 85, 230 75"
                        fill="none"
                        stroke="#FFF"
                        strokeWidth="2"
                        strokeDasharray="8 24"
                        className="sky-rail-sparkle-anim"
                      />
                    </g>
                  )}
                  {/* Invisible path reference for calculation */}
                  <path
                    ref={(el) => (pathRefs.current['cloud-cottage'] = el)}
                    d="M 80 220 C 110 130, 160 85, 230 75"
                    fill="none"
                    stroke="transparent"
                  />
                </g>

                {/* Route 2: Depot (80, 220) -> Sleepy Ghost House (500, 175) */}
                <g className={`sky-rail-system ${selectedDestination === 'ghost-house' ? 'is-active' : ''}`}>
                  <path
                    d="M 80 220 C 200 250, 360 215, 500 175"
                    fill="none"
                    stroke="#D4A843"
                    strokeWidth="1.5"
                    strokeDasharray="3 5"
                    opacity="0.25"
                  />
                  {selectedDestination === 'ghost-house' && (
                    <g className="sky-rail-golden-track">
                      <path
                        d="M 80 220 C 200 250, 360 215, 500 175"
                        fill="none"
                        stroke="#F5D88C"
                        strokeWidth="6"
                        opacity="0.35"
                        filter="url(#routeGlow)"
                      />
                      <path
                        d="M 80 220 C 200 250, 360 215, 500 175"
                        fill="none"
                        stroke="#C59B3F"
                        strokeWidth="6"
                        strokeDasharray="2 7"
                        opacity="0.75"
                      />
                      <path
                        d="M 80 220 C 200 250, 360 215, 500 175"
                        fill="none"
                        stroke="#FFFDF9"
                        strokeWidth="2.5"
                        opacity="0.9"
                      />
                      <path
                        d="M 80 220 C 200 250, 360 215, 500 175"
                        fill="none"
                        stroke="#8B264A"
                        strokeWidth="0.8"
                        opacity="0.4"
                      />
                      <path
                        d="M 80 220 C 200 250, 360 215, 500 175"
                        fill="none"
                        stroke="#FFF"
                        strokeWidth="2"
                        strokeDasharray="8 24"
                        className="sky-rail-sparkle-anim"
                      />
                    </g>
                  )}
                  <path
                    ref={(el) => (pathRefs.current['ghost-house'] = el)}
                    d="M 80 220 C 200 250, 360 215, 500 175"
                    fill="none"
                    stroke="transparent"
                  />
                </g>

                {/* Route 3: Depot (80, 220) -> Moonbeam Tower (730, 80) */}
                <g className={`sky-rail-system ${selectedDestination === 'moonbeam-tower' ? 'is-active' : ''}`}>
                  <path
                    d="M 80 220 C 260 130, 500 65, 730 80"
                    fill="none"
                    stroke="#D4A843"
                    strokeWidth="1.5"
                    strokeDasharray="3 5"
                    opacity="0.25"
                  />
                  {selectedDestination === 'moonbeam-tower' && (
                    <g className="sky-rail-golden-track">
                      <path
                        d="M 80 220 C 260 130, 500 65, 730 80"
                        fill="none"
                        stroke="#F5D88C"
                        strokeWidth="6"
                        opacity="0.35"
                        filter="url(#routeGlow)"
                      />
                      <path
                        d="M 80 220 C 260 130, 500 65, 730 80"
                        fill="none"
                        stroke="#C59B3F"
                        strokeWidth="6"
                        strokeDasharray="2 7"
                        opacity="0.75"
                      />
                      <path
                        d="M 80 220 C 260 130, 500 65, 730 80"
                        fill="none"
                        stroke="#FFFDF9"
                        strokeWidth="2.5"
                        opacity="0.9"
                      />
                      <path
                        d="M 80 220 C 260 130, 500 65, 730 80"
                        fill="none"
                        stroke="#8B264A"
                        strokeWidth="0.8"
                        opacity="0.4"
                      />
                      <path
                        d="M 80 220 C 260 130, 500 65, 730 80"
                        fill="none"
                        stroke="#FFF"
                        strokeWidth="2"
                        strokeDasharray="8 24"
                        className="sky-rail-sparkle-anim"
                      />
                    </g>
                  )}
                  <path
                    ref={(el) => (pathRefs.current['moonbeam-tower'] = el)}
                    d="M 80 220 C 260 130, 500 65, 730 80"
                    fill="none"
                    stroke="transparent"
                  />
                </g>

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
                  <path
                    d="M 12 -23 Q 16 -32 10 -40 Q 18 -48 13 -56"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.8"
                    className="cottage-smoke-anim"
                  />

                  {/* Swaying Star Flag on Roof */}
                  <g transform="translate(0, -24)" className={deliveredLocation === 'cloud-cottage' ? 'swaying-star-flag' : ''}>
                    <line x1="0" y1="0" x2="0" y2="-9" stroke="#5C4033" strokeWidth="1.2" />
                    <path d="M 0 -9 L 7 -6.5 L 0 -4 Z" fill="#F5D88C" stroke="#D4A843" strokeWidth="0.5" />
                  </g>

                  {/* Warm Cozy Window (Brightens upon arrival) */}
                  <rect
                    x="-10"
                    y="2"
                    width="10"
                    height="11"
                    rx="1.5"
                    fill={deliveredLocation === 'cloud-cottage' ? '#FFF59D' : '#FFD54F'}
                    stroke="#5C4033"
                    strokeWidth="1.2"
                    className={deliveredLocation === 'cloud-cottage' ? 'window-glow-bright' : ''}
                  />

                  {/* Door */}
                  <rect x="4" y="6" width="9" height="14" rx="1" fill="#8C5835" stroke="#5C4033" strokeWidth="1.2" />

                  {/* Delivered Dream Mail Parcel on Porch */}
                  {deliveredLocation === 'cloud-cottage' && (
                    <g className="delivered-parcel is-visible" transform="translate(8, 16)">
                      <rect x="-3" y="-2" width="6" height="4.5" rx="0.6" fill="#FFFDF9" stroke="#8B264A" strokeWidth="0.7" />
                      <path d="M -3 -2 L 0 0.5 L 3 -2" fill="none" stroke="#8B264A" strokeWidth="0.7" />
                    </g>
                  )}

                  {/* Celebratory Cloud Puffs upon Arrival */}
                  {deliveredLocation === 'cloud-cottage' && (
                    <g className="cloud-arrival-burst" fill="#FFF" opacity="0.85">
                      <circle cx="-32" cy="18" r="5" />
                      <circle cx="32" cy="18" r="5" />
                      <circle cx="-15" cy="-28" r="2.5" fill="#F5D88C" />
                      <circle cx="15" cy="-28" r="2.5" fill="#F5D88C" />
                    </g>
                  )}
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

                  {/* Attic Arch Window (Glows warm upon arrival) */}
                  <path
                    d="M -10 -4 A 10 10 0 0 1 10 -4 L 10 10 L -10 10 Z"
                    fill={deliveredLocation === 'ghost-house' ? '#FFF9C4' : '#FFE082'}
                    stroke="#372F48"
                    strokeWidth="1.5"
                    className={deliveredLocation === 'ghost-house' ? 'window-glow-bright' : ''}
                  />

                  {/* Friendly Attic Ghost (Peeking in idle, waving happily upon delivery) */}
                  <g
                    transform="translate(0, 3)"
                    className={`ghost-peeking-anim ${
                      deliveredLocation === 'ghost-house' ? 'ghost-celebrating' : ''
                    }`}
                  >
                    <path
                      d="M -6 6 C -6 -2, 6 -2, 6 6 C 4 5, 2 7, 0 5 C -2 7, -4 5, -6 6 Z"
                      fill="#FFFFFF"
                      stroke="#372F48"
                      strokeWidth="1"
                    />
                    <circle cx="-2" cy="1" r="0.8" fill="#372F48" />
                    <circle cx="2" cy="1" r="0.8" fill="#372F48" />
                    <circle cx="-3.5" cy="2.5" r="1.2" fill="#FF8BA7" opacity="0.8" />
                    <circle cx="3.5" cy="2.5" r="1.2" fill="#FF8BA7" opacity="0.8" />
                    <path d="M -1.5 3.5 Q 0 4.8 1.5 3.5" fill="none" stroke="#372F48" strokeWidth="0.8" />

                    {/* Waving little ghost arms upon delivery */}
                    {deliveredLocation === 'ghost-house' && (
                      <g className="ghost-waving-arms">
                        <path d="M 5 2 Q 8.5 -1 7 -3.5" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" className="ghost-wave-right" />
                        <path d="M -5 2 Q -8.5 -1 -7 -3.5" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" className="ghost-wave-left" />
                      </g>
                    )}
                  </g>

                  {/* Ground Door and Porch Lantern */}
                  <rect x="-7" y="12" width="14" height="16" rx="1" fill="#7E6B56" stroke="#372F48" strokeWidth="1.2" />
                  <circle cx="16" cy="15" r="3.5" fill="#FFD54F" />

                  {/* Delivered Dream Parcel at Door */}
                  {deliveredLocation === 'ghost-house' && (
                    <g className="delivered-parcel is-visible" transform="translate(0, 24)">
                      <rect x="-3" y="-2" width="6" height="4.5" rx="0.6" fill="#FFFDF9" stroke="#8B264A" strokeWidth="0.7" />
                      <path d="M -3 -2 L 0 0.5 L 3 -2" fill="none" stroke="#8B264A" strokeWidth="0.7" />
                    </g>
                  )}

                  {/* Soft Lavender Sparkles upon Arrival */}
                  {deliveredLocation === 'ghost-house' && (
                    <g className="ghost-arrival-sparkles" fill="#CE93D8">
                      <path d="M -24 -18 L -22 -15 L -24 -12 L -26 -15 Z" />
                      <path d="M 26 -22 L 28 -19 L 26 -16 L 24 -19 Z" />
                      <circle cx="-16" cy="-28" r="1.5" fill="#E1BEE7" />
                      <circle cx="18" cy="-34" r="1.8" fill="#FFF9C4" />
                    </g>
                  )}
                </g>

                {/* --- DESTINATION 3: MOONBEAM TOWER (ANIME LIGHTHOUSE) --- */}
                <g className="map-illustration moonbeam-tower-art" transform="translate(730, 80)">
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

                  {/* Glowing Spire Windows */}
                  <rect x="-3" y="-4" width="6" height="10" rx="1.5" fill="#FFE082" stroke="#5C4033" strokeWidth="1" />
                  <rect x="-3" y="18" width="6" height="10" rx="1.5" fill="#FFE082" stroke="#5C4033" strokeWidth="1" />

                  {/* ======================================================= */}
                  {/* ANIME-INSPIRED ROTATING LIGHTHOUSE SEARCHLIGHT BEACON   */}
                  {/* Focal point at summit (0, -40). pointer-events: none    */}
                  {/* ======================================================= */}
                  <g className="lighthouse-beacon-system" transform="translate(0, -40)" pointerEvents="none">
                    {/* Glowing Beacon Core Lantern */}
                    <circle cx="0" cy="0" r="4.5" fill="#FFFDF9" filter="url(#routeGlow)" />
                    <circle cx="0" cy="0" r="7.5" fill="url(#beaconCoreGlow)" />

                    {/* Rotating Searchlight Conical Beam */}
                    <g className={`lighthouse-beam-rotator ${beaconMode}`}>
                      {/* Broad Luminous Atmosphere Cone */}
                      <polygon points="0,-4 220,-50 220,50 0,4" fill="url(#lighthouseBeamGrad)" opacity="0.75" />
                      {/* Focused Center Beam */}
                      <polygon points="0,-2 220,-18 220,18 0,2" fill="url(#lighthouseBeamCoreGrad)" opacity="0.9" />
                      {/* Subtle Opposite Rear Glow */}
                      <polygon points="0,-2 -40,-12 -40,12 0,2" fill="url(#lighthouseBeamGrad)" opacity="0.25" />
                    </g>
                  </g>

                  {/* Delivered Dream Parcel at Observatory Base */}
                  {deliveredLocation === 'moonbeam-tower' && (
                    <g className="delivered-parcel is-visible" transform="translate(0, 32)">
                      <rect x="-3" y="-2" width="6" height="4.5" rx="0.6" fill="#FFFDF9" stroke="#8B264A" strokeWidth="0.7" />
                      <path d="M -3 -2 L 0 0.5 L 3 -2" fill="none" stroke="#8B264A" strokeWidth="0.7" />
                    </g>
                  )}

                  {/* Ceremonial Moonbeam Arrival Flare */}
                  {deliveredLocation === 'moonbeam-tower' && (
                    <g className="moonbeam-arrival-flare" pointerEvents="none">
                      <circle cx="0" cy="-40" r="22" fill="url(#beaconCoreGlow)" opacity="0.85" />
                      <circle cx="0" cy="-40" r="34" fill="#FFF" opacity="0.35" filter="url(#routeGlow)" />
                      <path d="M -16 -40 L 16 -40" stroke="#FFF" strokeWidth="2" opacity="0.9" />
                      <path d="M 0 -56 L 0 -24" stroke="#FFF" strokeWidth="2" opacity="0.9" />
                    </g>
                  )}
                </g>

                {/* --- DISPATCH ORIGIN: PIP'S MIDNIGHT DEPOT --- */}
                <g className="map-illustration midnight-depot-art" transform="translate(80, 220)">
                  {/* Depot Siding Platform Tracks */}
                  <line x1="-60" y1="8" x2="45" y2="8" stroke="#3D3550" strokeWidth="2.5" />
                  <line x1="-60" y1="8" x2="45" y2="8" stroke="#C59B3F" strokeWidth="5.5" strokeDasharray="2 7" opacity="0.8" />
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

                  {/* Depot Dispatch Signal Light */}
                  <circle
                    cx="15"
                    cy="8"
                    r="3.2"
                    fill={isDelivering ? '#4CAF50' : '#FFD54F'}
                    stroke="#5C4033"
                    strokeWidth="0.8"
                    className={isDelivering ? 'depot-signal-active' : ''}
                  />
                </g>

                {/* ======================================================= */}
                {/* THE MIDNIGHT DREAM EXPRESS — NO. 003                    */}
                {/* Handcrafted Miniature Locomotive & Postal Carriage      */}
                {/* ======================================================= */}
                <g className="dream-express-consist" pointerEvents="none">
                  {/* --- TRAILING POSTAL CARRIAGE (No. 003) --- */}
                  <g
                    className={`express-carriage ${isDelivering ? 'in-flight' : 'is-idle'}`}
                    transform={`translate(${trainPos.carriage.x}, ${trainPos.carriage.y}) rotate(${trainPos.carriage.angle})`}
                  >
                    {/* Carriage Ground Shadow */}
                    <ellipse cx="0" cy="11" rx="14" ry="3.5" fill="rgba(37, 30, 51, 0.22)" />

                    {/* Coupling Bar towards front engine */}
                    <line x1="10" y1="6" x2="16" y2="6" stroke="#2D253B" strokeWidth="1.8" />

                    {/* Chassis */}
                    <rect x="-12" y="3" width="24" height="4" rx="1.5" fill="#3D3550" stroke="#251E33" strokeWidth="0.8" />

                    {/* Body (Cream with Berry Trim) */}
                    <rect x="-12" y="-9" width="24" height="13" rx="2" fill="#FFFDF9" stroke="#5C4033" strokeWidth="1.2" />
                    {/* Berry lower skirt */}
                    <path d="M -12 0 L 12 0 L 12 4 L -12 4 Z" fill="#8B264A" />

                    {/* Arched Berry Roof */}
                    <path d="M -13 -9 Q 0 -12 13 -9 L 12 -7 L -12 -7 Z" fill="#8B264A" stroke="#5C1630" strokeWidth="0.8" />

                    {/* Mail Envelope Emblem */}
                    <g transform="translate(-3, -5)">
                      <rect x="0" y="0" width="7" height="5" rx="0.6" fill="#FFF8F1" stroke="#8B264A" strokeWidth="0.6" />
                      <path d="M 0 0 L 3.5 2.5 L 7 0" fill="none" stroke="#8B264A" strokeWidth="0.6" />
                    </g>

                    {/* Archival Label: 003 */}
                    <text x="6" y="-1.5" fontSize="3" fontWeight="bold" fill="#D4A843" fontFamily="monospace">003</text>

                    {/* Rotating Carriage Wheels */}
                    <g className="train-wheels-group">
                      <g transform="translate(-7, 7)" className="train-wheel">
                        <circle cx="0" cy="0" r="3.6" fill="#2D253B" stroke="#1D1726" strokeWidth="0.8" />
                        <circle cx="0" cy="0" r="1.5" fill="#D4A843" />
                        <line x1="-3.6" y1="0" x2="3.6" y2="0" stroke="#8C7A6B" strokeWidth="0.6" />
                        <line x1="0" y1="-3.6" x2="0" y2="3.6" stroke="#8C7A6B" strokeWidth="0.6" />
                      </g>
                      <g transform="translate(7, 7)" className="train-wheel">
                        <circle cx="0" cy="0" r="3.6" fill="#2D253B" stroke="#1D1726" strokeWidth="0.8" />
                        <circle cx="0" cy="0" r="1.5" fill="#D4A843" />
                        <line x1="-3.6" y1="0" x2="3.6" y2="0" stroke="#8C7A6B" strokeWidth="0.6" />
                        <line x1="0" y1="-3.6" x2="0" y2="3.6" stroke="#8C7A6B" strokeWidth="0.6" />
                      </g>
                    </g>
                  </g>

                  {/* --- LEADING STEAM LOCOMOTIVE (No. 003) --- */}
                  <g
                    className={`express-locomotive ${isDelivering ? 'in-flight' : 'is-idle'}`}
                    transform={`translate(${trainPos.loco.x}, ${trainPos.loco.y}) rotate(${trainPos.loco.angle})`}
                  >
                    {/* Ground Shadow */}
                    <ellipse cx="0" cy="12" rx="20" ry="4" fill="rgba(37, 30, 51, 0.28)" />

                    {/* Glowing Forward Headlamp Projection Beam */}
                    <polygon
                      points="17,-2 65,-18 65,14"
                      fill="url(#headlampBeamGrad)"
                      opacity="0.75"
                      className="loco-headlamp-beam"
                    />

                    {/* Chimney Dream Smoke Puffs */}
                    <g className="chimney-smoke-group" transform="translate(10, -15)">
                      <circle className="chimney-puff puff-1" cx="0" cy="0" r="2.8" fill="#FFFDF9" />
                      <circle className="chimney-puff puff-2" cx="0" cy="0" r="3.6" fill="#FFFDF9" />
                      <circle className="chimney-puff puff-3" cx="0" cy="0" r="4.4" fill="#FFFDF9" />
                      <circle className="chimney-puff idle-wisp" cx="0" cy="0" r="2" fill="#FFFDF9" opacity="0.6" />
                    </g>

                    {/* Underframe Chassis */}
                    <rect x="-16" y="4" width="34" height="4.5" rx="1.5" fill="#3D3550" stroke="#251E33" strokeWidth="0.8" />
                    {/* Cowcatcher / Front pilot */}
                    <polygon points="17,4 21,8.5 17,8.5" fill="#D4A843" stroke="#5C4033" strokeWidth="0.6" />

                    {/* Boiler Barrel (Signature Berry) */}
                    <rect x="-6" y="-8" width="17" height="12.5" rx="2" fill="#8B264A" stroke="#5C1630" strokeWidth="1" />
                    {/* Brass Boiler Straps */}
                    <line x1="-1" y1="-8" x2="-1" y2="4.5" stroke="#F5D88C" strokeWidth="1" />
                    <line x1="5" y1="-8" x2="5" y2="4.5" stroke="#F5D88C" strokeWidth="1" />

                    {/* Steam Dome (Brass) */}
                    <ellipse cx="0" cy="-9" rx="3.2" ry="2.2" fill="#D4A843" stroke="#8C6B1F" strokeWidth="0.6" />
                    <circle cx="0" cy="-10.5" r="1" fill="#F5D88C" />

                    {/* Front Smokebox (Dark Indigo) */}
                    <path d="M 11 -8 L 15 -8 Q 17 -1.75 15 4.5 L 11 4.5 Z" fill="#251E33" stroke="#171221" strokeWidth="0.8" />

                    {/* Chimney Smokestack */}
                    <path d="M 9.5 -8 L 8.5 -14.5 L 13.5 -14.5 L 12.5 -8 Z" fill="#251E33" stroke="#171221" strokeWidth="0.8" />
                    <ellipse cx="11" cy="-14.5" rx="3" ry="1.2" fill="#D4A843" stroke="#8C6B1F" strokeWidth="0.6" />

                    {/* Front Brass Headlamp */}
                    <rect x="15" y="-5" width="4" height="6.5" rx="1" fill="#D4A843" stroke="#5C4033" strokeWidth="0.8" />
                    <ellipse cx="18" cy="-1.75" rx="1.6" ry="2.4" fill="#FFFDF9" />
                    <circle cx="18" cy="-1.75" r="4" fill="url(#beaconCoreGlow)" opacity="0.85" />

                    {/* Cab (Driver Cabin - Handcrafted Cream with Berry Arched Roof) */}
                    <rect x="-16" y="-12" width="10.5" height="16.5" rx="1.5" fill="#FFFDF9" stroke="#5C4033" strokeWidth="1.2" />
                    <path d="M -18 -12 Q -11 -15.5 -4 -12 L -4 -10 L -18 -10 Z" fill="#8B264A" stroke="#5C1630" strokeWidth="1" />
                    {/* Cab Arched Window with Warm Gold Glow */}
                    <rect x="-13.5" y="-8.5" width="5.5" height="6.5" rx="1.5" fill="#FFE082" stroke="#5C4033" strokeWidth="0.8" />
                    {/* Star insignia and Pip's tiny engineer mark */}
                    <text x="-12.5" y="1.5" fontSize="2.8" fontWeight="bold" fill="#8B264A">★ 003</text>

                    {/* Wheels & Linkage Group */}
                    <g className="train-wheels-group">
                      {/* 3 Driving Wheels */}
                      <g transform="translate(-10, 8)" className="train-wheel">
                        <circle cx="0" cy="0" r="4.2" fill="#251E33" stroke="#171221" strokeWidth="0.9" />
                        <circle cx="0" cy="0" r="1.8" fill="#D4A843" />
                        <line x1="-4.2" y1="0" x2="4.2" y2="0" stroke="#8C7A6B" strokeWidth="0.8" />
                        <line x1="0" y1="-4.2" x2="0" y2="4.2" stroke="#8C7A6B" strokeWidth="0.8" />
                      </g>
                      <g transform="translate(0, 8)" className="train-wheel">
                        <circle cx="0" cy="0" r="4.2" fill="#251E33" stroke="#171221" strokeWidth="0.9" />
                        <circle cx="0" cy="0" r="1.8" fill="#D4A843" />
                        <line x1="-4.2" y1="0" x2="4.2" y2="0" stroke="#8C7A6B" strokeWidth="0.8" />
                        <line x1="0" y1="-4.2" x2="0" y2="4.2" stroke="#8C7A6B" strokeWidth="0.8" />
                      </g>
                      <g transform="translate(10, 8)" className="train-wheel">
                        <circle cx="0" cy="0" r="4.2" fill="#251E33" stroke="#171221" strokeWidth="0.9" />
                        <circle cx="0" cy="0" r="1.8" fill="#D4A843" />
                        <line x1="-4.2" y1="0" x2="4.2" y2="0" stroke="#8C7A6B" strokeWidth="0.8" />
                        <line x1="0" y1="-4.2" x2="0" y2="4.2" stroke="#8C7A6B" strokeWidth="0.8" />
                      </g>

                      {/* Oscillating Connecting Rod */}
                      <line
                        x1="-10"
                        y1="8"
                        x2="10"
                        y2="8"
                        stroke="#F5D88C"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        className="train-connecting-rod"
                      />
                      {/* Piston Crosshead */}
                      <rect x="9.5" y="6.8" width="4.5" height="2.4" rx="0.6" fill="#3D3550" />
                    </g>
                  </g>
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
                    aria-label={`Send dream express to ${dest.name}`}
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
                  <span className="receipt-idle-text">Select a destination above to launch Locomotive No. 003!</span>
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
              <span>MIDNIGHT EXPRESS · SPECIAL SKYWAY RAIL · 003</span>
            </div>
          </footer>
        </article>
      </div>
    </section>
  );
}
