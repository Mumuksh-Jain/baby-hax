import React, { useState, useRef, useEffect } from 'react';
import {
  playLanternSwitchSound,
  playDeliveryDispatchSound,
  playDeliveryArrivedSound,
  playStarSound,
} from '../utils/soundEngine';
import PipSecretPostcard from './PipSecretPostcard';
import './InventionWorkshop.css';

/**
 * Pip's Little Invention Workshop (Pass 02 Master Rescue)
 * Row 1: The Star Orchestra (EXP-001) & The Moonlight Lab (EXP-002) side by side
 * Row 2: The Living Dream Express (EXP-003) - 1200x520 Panoramic Miniature Railway World
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

  // --- Easter Egg State (Phase 15.2) ---
  const [isEasterEggOpen, setIsEasterEggOpen] = useState(false);

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
  // STATION 001 HANDLERS: STAR ORCHESTRA
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
  // STATION 003 HANDLERS: THE LIVING DREAM EXPRESS (1200x520 World)
  // -------------------------------------------------------------
  const DESTINATIONS = {
    'cloud-cottage': {
      id: 'cloud-cottage',
      name: 'Cloud Cottage',
      platform: 'Platform 1',
      icon: '☁️',
      color: '#6AAFE6',
      subtext: 'Fluffy cumulus roof nestled in the night sky',
      deliveryNote: 'Dream delivered! Soft vanilla cloud dreams tucked in safely. No nightmares included.',
      coords: { x: 410, y: 190 },
      routeDuration: 4200,
    },
    'ghost-house': {
      id: 'ghost-house',
      name: 'Sleepy Ghost House',
      platform: 'Platform 2',
      icon: '👻',
      color: '#B85075',
      subtext: 'Peaked roof with friendly waving attic ghost',
      deliveryNote: 'Dream delivered! Cozy blanket dreams arrived. Friendly ghost gave 5 stars!',
      coords: { x: 760, y: 360 },
      routeDuration: 4600,
    },
    'moonbeam-tower': {
      id: 'moonbeam-tower',
      name: 'Moonbeam Tower',
      platform: 'Platform 3',
      icon: '🏰',
      color: '#D4A843',
      subtext: 'High observatory bathed in silvery moonbeams',
      deliveryNote: 'Dream delivered! Astronomy stargazing dreams landed safely on the spire!',
      coords: { x: 1050, y: 240 },
      routeDuration: 5200,
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
      setIsDelivering(false);
      setDeliveryProgress(1);
      setDeliveredLocation(destId);
      setDeliveryMessage(dest.deliveryNote);
      if (soundEnabled) playDeliveryArrivedSound();
      return;
    }

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
  // TRAIN PATH SAMPLING (1200x520 STAGE, ARTICULATED TRAIN)
  // -------------------------------------------------------------
  const getTrainPositions = () => {
    // If no destination selected yet, park locomotive at Midnight Depot platform (130, 420)
    const DEPOT_LOCO_X = 140;
    const DEPOT_LOCO_Y = 420;
    const DEPOT_CAR_X = 68;
    const DEPOT_CAR_Y = 420;

    if (!selectedDestination && !deliveredLocation) {
      return {
        loco: { x: DEPOT_LOCO_X, y: DEPOT_LOCO_Y, angle: 0 },
        carriage: { x: DEPOT_CAR_X, y: DEPOT_CAR_Y, angle: 0 },
      };
    }

    const currentDestId = selectedDestination || deliveredLocation;
    const pathElem = pathRefs.current[currentDestId];
    if (!pathElem) {
      return {
        loco: { x: DEPOT_LOCO_X, y: DEPOT_LOCO_Y, angle: 0 },
        carriage: { x: DEPOT_CAR_X, y: DEPOT_CAR_Y, angle: 0 },
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

      // Carriage: distance offset of 72 units along the curved SVG path
      const CARRIAGE_OFFSET = 72;
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
        loco: { x: DEPOT_LOCO_X, y: DEPOT_LOCO_Y, angle: 0 },
        carriage: { x: DEPOT_CAR_X, y: DEPOT_CAR_Y, angle: 0 },
      };
    }
  };

  const trainPos = getTrainPositions();

  // Lighthouse beacon searchlight state
  const getBeaconMode = () => {
    if (deliveredLocation === 'moonbeam-tower') return 'beacon-celebration-mode';
    if (selectedDestination === 'moonbeam-tower' && isDelivering && deliveryProgress > 0.45) {
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

      {/* Workshop Header & Archival Identity with Easter Egg Wax Seal Button */}
      <header className="workshop-header">
        <button
          type="button"
          className="workshop-archive-badge interactive-easter-seal"
          onClick={() => setIsEasterEggOpen(true)}
          aria-label="Inspect Pip's secret archival seal and hidden document"
          title="Click to inspect Pip's secret seal!"
        >
          <span className="badge-pin" aria-hidden="true">📌</span>
          <span className="badge-text">PIP'S INVENTION ARCHIVE · 003 EXPERIMENTS</span>
          <span className="secret-seal-star" aria-hidden="true">★</span>
        </button>

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

              {/* Music-Box Visual Artwork (Hero Scale ~220px) */}
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

              {/* Music Box Pedestal Stage */}
              <div className="musicbox-stage-pedestal" aria-hidden="true"></div>

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
              {/* Cozy Illustrated Lantern Artwork (~220px) on Bedside Shelf */}
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

              {/* Bedside Grounding Shelf */}
              <div className="lantern-bedside-shelf" aria-hidden="true"></div>

              {/* Pip's Quote for Current Mood */}
              <div className="pip-speech-bubble" aria-live="polite">
                <span className="bubble-pip-avatar" aria-hidden="true">💀</span>
                <span className="speech-text">{getMoodPipQuote()}</span>
              </div>
            </div>
          </div>

          {/* Bedside Brass Toggle Buttons in Action Row (Matches baseline of Star Orchestra button) */}
          <div className="station-actions-row moonlight-actions-row">
            <div className="mood-switchboard-tray" role="group" aria-label="Nightlight Mood Presets">
              <button
                type="button"
                className={`mood-toggle-btn ${lanternMood === 'warm' ? 'is-active' : ''}`}
                onClick={() => handleMoodSelect('warm')}
                aria-pressed={lanternMood === 'warm'}
              >
                <span className="toggle-icon">🕯️</span>
                <span className="toggle-label">Warm &amp; Cozy</span>
              </button>
              <button
                type="button"
                className={`mood-toggle-btn ${lanternMood === 'sleepy' ? 'is-active' : ''}`}
                onClick={() => handleMoodSelect('sleepy')}
                aria-pressed={lanternMood === 'sleepy'}
              >
                <span className="toggle-icon">🌙</span>
                <span className="toggle-label">Sleepy Moon</span>
              </button>
              <button
                type="button"
                className={`mood-toggle-btn ${lanternMood === 'starlight' ? 'is-active' : ''}`}
                onClick={() => handleMoodSelect('starlight')}
                aria-pressed={lanternMood === 'starlight'}
              >
                <span className="toggle-icon">✨</span>
                <span className="toggle-label">Little Starlight</span>
              </button>
            </div>
          </div>

          {/* Pip's Sticky Note & Rubber Stamp */}
          <footer className="station-footer">
            <div className="station-sticky-note note-lantern">
              <span className="sticky-pin" aria-hidden="true">📌</span>
              <p>“Ghosts are just shy blankets that need a soft nightlight.”</p>
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
              <span className="station-category">Miniature Railway &amp; Dream Transport</span>
            </div>
            <span className="station-archival-callout">
              No. 003 LOCOMOTIVE · 1200×520 ARTICULATED SKYWAY
            </span>
          </div>

          <h3 id="exp-003-title" className="station-title">
            The Living Dream Express
          </h3>

          <p className="station-desc">
            “Midnight postal service for sleepy houses. Locomotive No. 003 delivers cozy dreams
            along magical sky-rails before morning comes.”
          </p>

          {/* Full Panoramic Whimsical Nursery Railway Map (1200x520) */}
          <div className="exhibit-preview-frame map-preview-frame">
            <div className="nursery-map-container">
              {/* Compass Rose Accent */}
              <div className="map-compass" aria-hidden="true">
                <span className="compass-star">✦</span>
                <span className="compass-lbl">NURSERY SKYWAY · OFFICIAL RAILWAY CHART</span>
              </div>

              {/* Full Whimsical Nursery World SVG (1200x520) */}
              <svg
                viewBox="0 0 1200 520"
                className="delivery-routes-svg"
                preserveAspectRatio="xMidYMid meet"
                aria-hidden="true"
              >
                <defs>
                  {/* Sky Gradient: Deep Night to Warm Dusk Horizon */}
                  <linearGradient id="dreamSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#131B38" />
                    <stop offset="35%" stopColor="#1E2F56" />
                    <stop offset="70%" stopColor="#354E7E" />
                    <stop offset="100%" stopColor="#E6D3C2" />
                  </linearGradient>

                  {/* Moon Glow */}
                  <filter id="moonGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#FFE8A3" floodOpacity="0.85" />
                  </filter>

                  {/* Glowing Filter for Golden Sky-Rails */}
                  <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="1" stdDeviation="4" floodColor="#F5D88C" floodOpacity="0.8" />
                  </filter>

                  {/* Headlamp Light Cone Gradient */}
                  <linearGradient id="headlampBeamGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                    <stop offset="0%" stopColor="#FFFDF9" stopOpacity="0.9" />
                    <stop offset="35%" stopColor="#FFF59D" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#FFF59D" stopOpacity="0" />
                  </linearGradient>

                  {/* Anime-Inspired Lighthouse Searchlight Gradient */}
                  <linearGradient id="lighthouseBeamGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
                    <stop offset="25%" stopColor="#E0ECFF" stopOpacity="0.55" />
                    <stop offset="65%" stopColor="#9AB8F5" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#8CA8F5" stopOpacity="0" />
                  </linearGradient>

                  {/* Lighthouse Core Bright Beam */}
                  <linearGradient id="lighthouseBeamCoreGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                    <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.7" />
                    <stop offset="70%" stopColor="#C9DCFD" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#C9DCFD" stopOpacity="0" />
                  </linearGradient>

                  {/* Radial Beacon Core Glow */}
                  <radialGradient id="beaconCoreGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                    <stop offset="45%" stopColor="#FFE082" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#D4A843" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* --- LAYER 1: Deep Paper Sky --- */}
                <rect width="1200" height="520" fill="url(#dreamSkyGrad)" />

                {/* --- LAYER 2: Celestial Moon & Stars --- */}
                {/* Crescent Moon in top-left sky */}
                <g transform="translate(100, 75)" filter="url(#moonGlow)">
                  <path
                    d="M 0 -24 A 28 28 0 0 0 24 16 A 24 24 0 0 1 -2 0 A 24 24 0 0 1 0 -24 Z"
                    fill="#FFF3C4"
                  />
                  {/* Subtle Moon Craters */}
                  <circle cx="8" cy="-4" r="2.5" fill="#F0DC94" opacity="0.6" />
                  <circle cx="14" cy="8" r="1.8" fill="#F0DC94" opacity="0.6" />
                </g>

                {/* Celestial Twinkling Stars */}
                <g fill="#F5D88C" opacity="0.75">
                  <circle cx="180" cy="55" r="2" />
                  <circle cx="270" cy="35" r="1.5" />
                  <circle cx="340" cy="85" r="2.5" />
                  <circle cx="480" cy="40" r="1.5" />
                  <circle cx="560" cy="70" r="2" />
                  <circle cx="680" cy="30" r="2" />
                  <circle cx="750" cy="65" r="1.5" />
                  <circle cx="860" cy="45" r="2.5" />
                  <circle cx="940" cy="80" r="1.5" />
                  <circle cx="1120" cy="40" r="2" />
                  {/* Stardust Cross Accents */}
                  <path d="M 230 45 L 230 55 M 225 50 L 235 50" stroke="#FFF" strokeWidth="1" opacity="0.8" />
                  <path d="M 610 50 L 610 60 M 605 55 L 615 55" stroke="#FFF" strokeWidth="1" opacity="0.8" />
                  <path d="M 890 60 L 890 70 M 885 65 L 895 65" stroke="#FFF" strokeWidth="1" opacity="0.8" />
                </g>

                {/* --- LAYER 3: Distant Sculpted Rolling Paper Hills & Cloud Banks --- */}
                {/* Furthest Deep Hills */}
                <path
                  d="M 0 520 L 0 380 Q 220 290 460 340 Q 740 280 1020 330 Q 1120 350 1200 370 L 1200 520 Z"
                  fill="#2A3D66"
                  opacity="0.55"
                />
                {/* Mid-Distant Rolling Hills */}
                <path
                  d="M 0 520 L 0 410 Q 280 340 580 380 Q 860 330 1200 400 L 1200 520 Z"
                  fill="#415B8C"
                  opacity="0.65"
                />
                {/* Cloud Island Base Under Cloud Cottage */}
                <ellipse cx="410" cy="225" rx="140" ry="42" fill="#2E456E" opacity="0.45" />

                {/* --- LAYER 4: Wooden Trestle Bridge Structures --- */}
                {/* Trestle Piers for Route 1 (Depot -> Cloud Cottage) */}
                <g stroke="#7A5638" strokeWidth="2.5" opacity="0.5">
                  <line x1="210" y1="420" x2="210" y2="470" />
                  <line x1="260" y1="360" x2="260" y2="470" />
                  <line x1="310" y1="300" x2="310" y2="470" />
                  {/* Cross Bracing */}
                  <line x1="210" y1="420" x2="260" y2="450" strokeWidth="1.5" />
                  <line x1="260" y1="360" x2="310" y2="420" strokeWidth="1.5" />
                </g>

                {/* Trestle Piers for Route 2 (Depot -> Ghost House) */}
                <g stroke="#7A5638" strokeWidth="2.5" opacity="0.45">
                  <line x1="380" y1="425" x2="380" y2="480" />
                  <line x1="480" y1="432" x2="480" y2="480" />
                  <line x1="590" y1="420" x2="590" y2="480" />
                </g>

                {/* Trestle Piers for Route 3 (Depot -> Moonbeam Tower) */}
                <g stroke="#7A5638" strokeWidth="2.5" opacity="0.45">
                  <line x1="520" y1="360" x2="520" y2="480" />
                  <line x1="680" y1="315" x2="680" y2="480" />
                  <line x1="840" y1="300" x2="840" y2="480" />
                </g>

                {/* --- RAILWAY TRACKS (1200x520 Scaled Paths) --- */}
                {/* Route 1: Depot (130, 420) -> Cloud Cottage (365, 230) */}
                <g className={`sky-rail-system ${selectedDestination === 'cloud-cottage' ? 'is-active' : ''}`}>
                  <path
                    d="M 130 420 C 210 420, 260 280, 365 230"
                    fill="none"
                    stroke="#D4A843"
                    strokeWidth="2"
                    strokeDasharray="4 6"
                    opacity="0.3"
                  />
                  {selectedDestination === 'cloud-cottage' && (
                    <g className="sky-rail-golden-track">
                      <path
                        d="M 130 420 C 210 420, 260 280, 365 230"
                        fill="none"
                        stroke="#F5D88C"
                        strokeWidth="8"
                        opacity="0.4"
                        filter="url(#routeGlow)"
                      />
                      <path
                        d="M 130 420 C 210 420, 260 280, 365 230"
                        fill="none"
                        stroke="#C59B3F"
                        strokeWidth="8"
                        strokeDasharray="3 9"
                        opacity="0.8"
                      />
                      <path
                        d="M 130 420 C 210 420, 260 280, 365 230"
                        fill="none"
                        stroke="#FFFDF9"
                        strokeWidth="2.5"
                      />
                    </g>
                  )}
                  {/* Invisible sampling path */}
                  <path
                    ref={(el) => (pathRefs.current['cloud-cottage'] = el)}
                    d="M 130 420 C 210 420, 260 280, 365 230"
                    fill="none"
                    stroke="transparent"
                    strokeWidth="1"
                  />
                </g>

                {/* Route 2: Depot (130, 420) -> Sleepy Ghost House (705, 390) */}
                <g className={`sky-rail-system ${selectedDestination === 'ghost-house' ? 'is-active' : ''}`}>
                  <path
                    d="M 130 420 C 280 420, 480 440, 705 390"
                    fill="none"
                    stroke="#D4A843"
                    strokeWidth="2"
                    strokeDasharray="4 6"
                    opacity="0.3"
                  />
                  {selectedDestination === 'ghost-house' && (
                    <g className="sky-rail-golden-track">
                      <path
                        d="M 130 420 C 280 420, 480 440, 705 390"
                        fill="none"
                        stroke="#F5D88C"
                        strokeWidth="8"
                        opacity="0.4"
                        filter="url(#routeGlow)"
                      />
                      <path
                        d="M 130 420 C 280 420, 480 440, 705 390"
                        fill="none"
                        stroke="#C59B3F"
                        strokeWidth="8"
                        strokeDasharray="3 9"
                        opacity="0.8"
                      />
                      <path
                        d="M 130 420 C 280 420, 480 440, 705 390"
                        fill="none"
                        stroke="#FFFDF9"
                        strokeWidth="2.5"
                      />
                    </g>
                  )}
                  {/* Invisible sampling path */}
                  <path
                    ref={(el) => (pathRefs.current['ghost-house'] = el)}
                    d="M 130 420 C 280 420, 480 440, 705 390"
                    fill="none"
                    stroke="transparent"
                    strokeWidth="1"
                  />
                </g>

                {/* Route 3: Depot (130, 420) -> Moonbeam Tower (985, 320) */}
                <g className={`sky-rail-system ${selectedDestination === 'moonbeam-tower' ? 'is-active' : ''}`}>
                  <path
                    d="M 130 420 C 350 420, 680 270, 985 320"
                    fill="none"
                    stroke="#D4A843"
                    strokeWidth="2"
                    strokeDasharray="4 6"
                    opacity="0.3"
                  />
                  {selectedDestination === 'moonbeam-tower' && (
                    <g className="sky-rail-golden-track">
                      <path
                        d="M 130 420 C 350 420, 680 270, 985 320"
                        fill="none"
                        stroke="#F5D88C"
                        strokeWidth="8"
                        opacity="0.4"
                        filter="url(#routeGlow)"
                      />
                      <path
                        d="M 130 420 C 350 420, 680 270, 985 320"
                        fill="none"
                        stroke="#C59B3F"
                        strokeWidth="8"
                        strokeDasharray="3 9"
                        opacity="0.8"
                      />
                      <path
                        d="M 130 420 C 350 420, 680 270, 985 320"
                        fill="none"
                        stroke="#FFFDF9"
                        strokeWidth="2.5"
                      />
                    </g>
                  )}
                  {/* Invisible sampling path */}
                  <path
                    ref={(el) => (pathRefs.current['moonbeam-tower'] = el)}
                    d="M 130 420 C 350 420, 680 270, 985 320"
                    fill="none"
                    stroke="transparent"
                    strokeWidth="1"
                  />
                </g>

                {/* --- LANDMARK 0: MIDNIGHT DEPOT (130, 420) --- */}
                <g className="map-landmark depot-landmark" transform="translate(130, 420)">
                  {/* Wooden Station Platform */}
                  <rect x="-85" y="0" width="115" height="14" rx="2" fill="#5C4033" stroke="#422C20" strokeWidth="2" />
                  <line x1="-85" y1="4" x2="30" y2="4" stroke="#8C5835" strokeWidth="1" />
                  {/* Station Canopy Posts */}
                  <rect x="-75" y="-38" width="5" height="38" fill="#8C5835" />
                  <rect x="-30" y="-38" width="5" height="38" fill="#8C5835" />
                  {/* Sloped Station Canopy */}
                  <polygon points="-85,-38 10,-38 0,-48 -75,-48" fill="#A34063" stroke="#5C4033" strokeWidth="1.5" />
                  {/* Depot Sign */}
                  <rect x="-70" y="-32" width="45" height="14" rx="2" fill="#FFFDF8" stroke="#5C4033" strokeWidth="1" />
                  <text x="-48" y="-22" textAnchor="middle" fill="#5C4033" fontSize="7" fontWeight="bold" fontFamily="monospace">
                    DEPOT 003
                  </text>
                  {/* Brass Station Clock */}
                  <circle cx="-10" cy="-24" r="8" fill="#FFFDF8" stroke="#D4A843" strokeWidth="1.5" />
                  <line x1="-10" y1="-24" x2="-10" y2="-29" stroke="#5C4033" strokeWidth="1.2" />
                  <line x1="-10" y1="-24" x2="-6" y2="-24" stroke="#5C4033" strokeWidth="1.2" />
                  {/* Station Lantern Glow */}
                  <circle cx="15" cy="-15" r="14" fill="#FFE885" opacity="0.35" />
                  <circle cx="15" cy="-15" r="4" fill="#FFF" />
                </g>

                {/* --- LANDMARK 1: CLOUD COTTAGE (410, 190) --- */}
                <g
                  className={`map-landmark cloud-cottage-landmark ${
                    deliveredLocation === 'cloud-cottage' ? 'is-delivered' : ''
                  }`}
                  transform="translate(410, 190)"
                >
                  {/* Sculpted Cumulus Cloud Layers */}
                  <ellipse cx="0" cy="35" rx="110" ry="32" fill="#CBDDF2" />
                  <circle cx="-55" cy="20" r="38" fill="#E8F1FC" />
                  <circle cx="55" cy="20" r="38" fill="#E8F1FC" />
                  <circle cx="0" cy="10" r="48" fill="#FFFDF8" />
                  <ellipse cx="0" cy="25" rx="85" ry="24" fill="#FFFFFF" />

                  {/* Charming Cottage House Body */}
                  <rect x="-40" y="-35" width="80" height="52" rx="4" fill="#FFFDF9" stroke="#5C4033" strokeWidth="2.5" />
                  {/* Pitched Shingle Storybook Roof */}
                  <polygon points="-52,-32 0,-75 52,-32" fill="#8C3B56" stroke="#5C4033" strokeWidth="2.5" />
                  {/* Chimney & Puffs */}
                  <rect x="22" y="-70" width="14" height="24" fill="#A34063" stroke="#5C4033" strokeWidth="1.5" />
                  <circle cx="29" cy="-78" r="4" fill="#FFF" opacity="0.75" className="anim-cottage-smoke" />
                  <circle cx="34" cy="-88" r="6" fill="#FFF" opacity="0.5" className="anim-cottage-smoke smoke-2" />

                  {/* Warm Glowing Windows */}
                  <rect
                    x="-24"
                    y="-20"
                    width="22"
                    height="24"
                    rx="3"
                    fill={deliveredLocation === 'cloud-cottage' ? '#FFF59D' : '#FFE885'}
                    stroke="#5C4033"
                    strokeWidth="1.5"
                  />
                  <line x1="-13" y1="-20" x2="-13" y2="4" stroke="#5C4033" strokeWidth="1" />
                  <line x1="-24" y1="-8" x2="-2" y2="-8" stroke="#5C4033" strokeWidth="1" />

                  {/* Porch Steps & Arrival Platform */}
                  <rect x="-48" y="10" width="28" height="8" rx="2" fill="#D4A843" stroke="#5C4033" strokeWidth="1.2" />
                  {/* Hanging Porch Star Lantern */}
                  <line x1="-38" y1="-32" x2="-38" y2="-20" stroke="#5C4033" strokeWidth="1" />
                  <circle cx="-38" cy="-16" r="4" fill="#FFE885" />

                  {/* Destination Label Pin */}
                  <g className="landmark-tag-group" transform="translate(0, -96)">
                    <rect x="-65" y="-14" width="130" height="24" rx="12" fill="#FFFDF8" stroke="#5C4033" strokeWidth="1.8" />
                    <text x="0" y="3" textAnchor="middle" fill="#5C4033" fontSize="10" fontWeight="bold" fontFamily="var(--font-display)">
                      ☁️ Cloud Cottage
                    </text>
                  </g>
                </g>

                {/* --- LANDMARK 2: SLEEPY GHOST HOUSE (760, 360) --- */}
                <g
                  className={`map-landmark ghost-house-landmark ${
                    deliveredLocation === 'ghost-house' ? 'is-delivered' : ''
                  }`}
                  transform="translate(760, 360)"
                >
                  {/* Hillside Mound */}
                  <path d="M -85 45 Q 0 15 85 45 L 85 65 L -85 65 Z" fill="#3D5684" />
                  {/* Victorian Nursery House Body */}
                  <rect x="-45" y="-38" width="90" height="74" rx="4" fill="#3A324D" stroke="#251E38" strokeWidth="2.5" />
                  {/* Steep Lilac Roof */}
                  <polygon points="-58,-35 0,-95 58,-35" fill="#6C597E" stroke="#251E38" strokeWidth="2.5" />
                  {/* Attic Round Window with Friendly Ghost */}
                  <circle cx="0" cy="-58" r="16" fill="#251E38" stroke="#FFE58F" strokeWidth="2" />

                  {/* Friendly Illustrated Ghost Peeking and Waving */}
                  <g className={`ghost-character ${deliveredLocation === 'ghost-house' ? 'is-celebrating' : ''}`} transform="translate(0, -56)">
                    <path
                      d="M -9 6 C -9 -8, 9 -8, 9 6 C 6 12, 3 9, 0 12 C -3 9, -6 12, -9 6 Z"
                      fill="#FFFDF8"
                      stroke="#5C4033"
                      strokeWidth="1.2"
                    />
                    <circle cx="-3" cy="1" r="1.2" fill="#5C4033" />
                    <circle cx="3" cy="1" r="1.2" fill="#5C4033" />
                    <circle cx="-5" cy="4" r="1.6" fill="#F5C0C0" opacity="0.85" />
                    <circle cx="5" cy="4" r="1.6" fill="#F5C0C0" opacity="0.85" />
                    {/* Waving Ghost Arm */}
                    <path
                      className="ghost-arm"
                      d="M 6 3 Q 12 0 14 -6"
                      fill="none"
                      stroke="#FFFDF8"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </g>

                  {/* Warm Lower Windows */}
                  <rect x="-30" y="-12" width="24" height="26" rx="3" fill="#FFE58F" stroke="#251E38" strokeWidth="1.5" />
                  <rect x="8" y="-12" width="24" height="26" rx="3" fill="#FFE58F" stroke="#251E38" strokeWidth="1.5" />

                  {/* Arrival Platform */}
                  <rect x="-62" y="24" width="30" height="8" rx="2" fill="#8C5835" stroke="#251E38" strokeWidth="1.2" />

                  {/* Destination Label Pin */}
                  <g className="landmark-tag-group" transform="translate(0, -114)">
                    <rect x="-75" y="-14" width="150" height="24" rx="12" fill="#FFFDF8" stroke="#5C4033" strokeWidth="1.8" />
                    <text x="0" y="3" textAnchor="middle" fill="#5C4033" fontSize="10" fontWeight="bold" fontFamily="var(--font-display)">
                      👻 Sleepy Ghost House
                    </text>
                  </g>
                </g>

                {/* --- LANDMARK 3: MOONBEAM TOWER & LIGHTHOUSE (1050, 240) --- */}
                {/* Note: Tower height ~210 units, summit lamp chamber at (1050, 110) */}
                <g
                  className={`map-landmark moonbeam-tower-landmark ${
                    deliveredLocation === 'moonbeam-tower' ? 'is-delivered' : ''
                  }`}
                  transform="translate(1050, 240)"
                >
                  {/* Mountain Cliff Pedestal */}
                  <path d="M -70 80 L -50 0 L 50 0 L 70 80 Z" fill="#2E446B" stroke="#1D2F4E" strokeWidth="2" />

                  {/* Tapering Masonry Stone Observatory Tower */}
                  <polygon points="-35,0 -22,-110 22,-110 35,0" fill="#E8DEC8" stroke="#5C4033" strokeWidth="2.5" />
                  {/* Masonry Ring Courses */}
                  <line x1="-31" y1="-30" x2="31" y2="-30" stroke="#C4B495" strokeWidth="2" />
                  <line x1="-27" y1="-65" x2="27" y2="-65" stroke="#C4B495" strokeWidth="2" />

                  {/* Observation Balcony Railing */}
                  <rect x="-28" y="-114" width="56" height="8" rx="2" fill="#D4A843" stroke="#5C4033" strokeWidth="1.5" />
                  {/* Lamp Glass Chamber */}
                  <rect x="-18" y="-136" width="36" height="22" rx="3" fill="#FFFDF8" stroke="#5C4033" strokeWidth="2" />

                  {/* Rotating Anime Lighthouse Searchlight Beam (Centered at summit lamp chamber y: -130) */}
                  <g className={`lighthouse-beam-rotor ${beaconMode}`} transform="translate(0, -125)">
                    {/* Broad Atmospheric Light Cone Sweeping into the Night Sky */}
                    <polygon points="0,0 -480,-140 -480,140" fill="url(#lighthouseBeamGrad)" />
                    {/* Bright Core Penetrating Beam */}
                    <polygon points="0,0 -420,-60 -420,60" fill="url(#lighthouseBeamCoreGrad)" />
                    {/* Glowing Beacon Core */}
                    <circle cx="0" cy="0" r="16" fill="url(#beaconCoreGlow)" />
                    <circle cx="0" cy="0" r="6" fill="#FFFFFF" />
                  </g>

                  {/* Observatory Copper Dome Spire */}
                  <path d="M -22 -136 Q 0 -165 22 -136 Z" fill="#466B9B" stroke="#5C4033" strokeWidth="2" />
                  <line x1="0" y1="-165" x2="0" y2="-178" stroke="#D4A843" strokeWidth="2" />
                  <circle cx="0" cy="-180" r="3.5" fill="#FFE082" />

                  {/* Arrival Platform Base */}
                  <rect x="-65" y="6" width="35" height="10" rx="2" fill="#D4A843" stroke="#5C4033" strokeWidth="1.5" />

                  {/* Destination Label Pin */}
                  <g className="landmark-tag-group" transform="translate(0, -196)">
                    <rect x="-75" y="-14" width="150" height="24" rx="12" fill="#FFFDF8" stroke="#5C4033" strokeWidth="1.8" />
                    <text x="0" y="3" textAnchor="middle" fill="#5C4033" fontSize="10" fontWeight="bold" fontFamily="var(--font-display)">
                      🏰 Moonbeam Tower
                    </text>
                  </g>
                </g>

                {/* --- LAYER 5: Foreground Nursery Cloud Bank Framing --- */}
                <path
                  d="M 0 520 L 0 475 Q 320 435 600 460 Q 900 435 1200 470 L 1200 520 Z"
                  fill="#FAF4EC"
                  opacity="0.9"
                />

                {/* --- LAYER 6: ARTICULATED TRAIN No. 003 (LOCOMOTIVE + POSTAL CARRIAGE) --- */}
                {/* 1. Postal Mail Carriage (~80 units) */}
                <g
                  className="carriage-group"
                  transform={`translate(${trainPos.carriage.x}, ${trainPos.carriage.y}) rotate(${trainPos.carriage.angle})`}
                >
                  {/* Brass Coupler Link */}
                  <line x1="26" y1="-4" x2="42" y2="-4" stroke="#5C4033" strokeWidth="4" strokeLinecap="round" />
                  {/* Carriage Dark Chassis */}
                  <rect x="-36" y="-8" width="72" height="14" rx="2" fill="#422C20" stroke="#2B1E17" strokeWidth="1.5" />
                  {/* Carriage Enamel Body */}
                  <rect x="-34" y="-36" width="68" height="28" rx="4" fill="#A34063" stroke="#5C4033" strokeWidth="2" />
                  {/* Cream Clerestory Roof */}
                  <rect x="-36" y="-42" width="72" height="8" rx="3" fill="#FFFDF9" stroke="#5C4033" strokeWidth="1.5" />
                  {/* Mail Compartment Warm Glowing Window */}
                  <rect x="-24" y="-28" width="22" height="14" rx="2" fill="#FFE885" stroke="#5C4033" strokeWidth="1.2" />
                  {/* Tiny Brass Parcels inside window */}
                  <rect x="-20" y="-24" width="14" height="8" rx="1" fill="#D4A843" />
                  {/* Postal Cargo Door */}
                  <rect x="6" y="-32" width="20" height="24" rx="2" fill="#872E4C" stroke="#5C4033" strokeWidth="1.2" />
                  <circle cx="10" cy="-20" r="1.5" fill="#D4A843" />

                  {/* Carriage Wheels (Spin only while moving) */}
                  <g className={`carriage-wheels ${isDelivering ? 'anim-wheels-spin' : ''}`}>
                    {/* Rear Wheel */}
                    <circle cx="-20" cy="6" r="9" fill="#2B1E17" stroke="#D4A843" strokeWidth="2" />
                    <line x1="-20" y1="-3" x2="-20" y2="15" stroke="#D4A843" strokeWidth="1.2" />
                    <line x1="-29" y1="6" x2="-11" y2="6" stroke="#D4A843" strokeWidth="1.2" />
                    {/* Front Wheel */}
                    <circle cx="16" cy="6" r="9" fill="#2B1E17" stroke="#D4A843" strokeWidth="2" />
                    <line x1="16" y1="-3" x2="16" y2="15" stroke="#D4A843" strokeWidth="1.2" />
                    <line x1="7" y1="6" x2="25" y2="6" stroke="#D4A843" strokeWidth="1.2" />
                  </g>
                </g>

                {/* 2. Articulated Locomotive No. 003 (~120 units) */}
                <g
                  className="loco-group"
                  transform={`translate(${trainPos.loco.x}, ${trainPos.loco.y}) rotate(${trainPos.loco.angle})`}
                >
                  {/* Forward Headlamp Light Cone */}
                  <polygon
                    points="70,-22 220,-50 220,6"
                    fill="url(#headlampBeamGrad)"
                    opacity={isDelivering ? 0.9 : 0.45}
                  />

                  {/* Dark Mechanical Chassis */}
                  <rect x="-46" y="-8" width="108" height="16" rx="3" fill="#422C20" stroke="#2B1E17" strokeWidth="1.5" />

                  {/* Cowcatcher Front Wedge */}
                  <polygon points="62,8 78,8 62,-6" fill="#D4A843" stroke="#5C4033" strokeWidth="1.5" />
                  <line x1="66" y1="8" x2="64" y2="0" stroke="#5C4033" strokeWidth="1" />
                  <line x1="72" y1="8" x2="68" y2="2" stroke="#5C4033" strokeWidth="1" />

                  {/* Berry Enamel Boiler Cylinder */}
                  <rect x="-12" y="-38" width="70" height="32" rx="6" fill="#A34063" stroke="#5C4033" strokeWidth="2" />
                  {/* Golden Brass Boiler Bands */}
                  <line x1="8" y1="-38" x2="8" y2="-6" stroke="#F5D88C" strokeWidth="2.5" />
                  <line x1="32" y1="-38" x2="32" y2="-6" stroke="#F5D88C" strokeWidth="2.5" />

                  {/* Smokebox Front Face */}
                  <rect x="50" y="-38" width="14" height="32" rx="4" fill="#2B1E17" stroke="#5C4033" strokeWidth="1.5" />
                  {/* Brass Engine Number Plate '003' */}
                  <circle cx="57" cy="-22" r="5" fill="#D4A843" stroke="#5C4033" strokeWidth="1" />
                  <text x="57" y="-20" textAnchor="middle" fill="#5C4033" fontSize="5" fontWeight="bold" fontFamily="monospace">
                    3
                  </text>

                  {/* Smokestack Chimney */}
                  <rect x="42" y="-56" width="12" height="18" rx="2" fill="#2B1E17" stroke="#5C4033" strokeWidth="1.5" />
                  <rect x="40" y="-58" width="16" height="4" rx="1.5" fill="#D4A843" />

                  {/* Brass Steam Dome */}
                  <ellipse cx="12" cy="-40" rx="8" ry="7" fill="#F5D88C" stroke="#C59B3F" strokeWidth="1.5" />

                  {/* Cream Driver Cabin */}
                  <rect x="-44" y="-50" width="36" height="44" rx="4" fill="#FFFDF9" stroke="#5C4033" strokeWidth="2" />
                  <path d="M -46 -50 Q -26 -58 -6 -50" fill="#A34063" stroke="#5C4033" strokeWidth="1.8" />
                  {/* Warm Glowing Cab Window */}
                  <rect x="-38" y="-44" width="24" height="20" rx="3" fill="#FFE885" stroke="#5C4033" strokeWidth="1.2" />

                  {/* Front Brass Headlamp */}
                  <rect x="58" y="-30" width="14" height="14" rx="2" fill="#D4A843" stroke="#5C4033" strokeWidth="1.5" />
                  <circle cx="70" cy="-23" r="5" fill="#FFF" />

                  {/* Locomotive Wheels (Spin only while moving) */}
                  <g className={`loco-wheels ${isDelivering ? 'anim-wheels-spin' : ''}`}>
                    {/* Rear Drive Wheel (r: 14) */}
                    <circle cx="-25" cy="8" r="14" fill="#2B1E17" stroke="#D4A843" strokeWidth="2.5" />
                    <line x1="-25" y1="-6" x2="-25" y2="22" stroke="#D4A843" strokeWidth="1.5" />
                    <line x1="-39" y1="8" x2="-11" y2="8" stroke="#D4A843" strokeWidth="1.5" />
                    {/* Middle Drive Wheel (r: 14) */}
                    <circle cx="8" cy="8" r="14" fill="#2B1E17" stroke="#D4A843" strokeWidth="2.5" />
                    <line x1="8" y1="-6" x2="8" y2="22" stroke="#D4A843" strokeWidth="1.5" />
                    <line x1="-6" y1="8" x2="22" y2="8" stroke="#D4A843" strokeWidth="1.5" />
                    {/* Front Lead Wheel (r: 9) */}
                    <circle cx="45" cy="11" r="9" fill="#2B1E17" stroke="#D4A843" strokeWidth="2" />
                    <line x1="45" y1="2" x2="45" y2="20" stroke="#D4A843" strokeWidth="1.2" />
                    <line x1="36" y1="11" x2="54" y2="11" stroke="#D4A843" strokeWidth="1.2" />
                  </g>

                  {/* Connecting Rod Linkage across drive wheels */}
                  <line
                    x1="-25"
                    y1="8"
                    x2="8"
                    y2="8"
                    className={`connecting-rod ${isDelivering ? 'anim-rod-piston' : ''}`}
                    stroke="#FAF1E2"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Chimney Steam Puffs (Active ONLY during flight) */}
                  {isDelivering && (
                    <g className="loco-steam-puffs" aria-hidden="true">
                      <circle className="puff-item p1" cx="48" cy="-68" r="5" fill="#FFFFFF" opacity="0.9" />
                      <circle className="puff-item p2" cx="42" cy="-80" r="8" fill="#FFFDF8" opacity="0.75" />
                      <circle className="puff-item p3" cx="34" cy="-96" r="12" fill="#F0F4FC" opacity="0.55" />
                    </g>
                  )}
                </g>
              </svg>
            </div>

            {/* Live Delivery Receipt Card (Appears on arrival) */}
            {deliveryMessage && deliveredLocation && (
              <div
                className="delivery-confirmation-card"
                role="region"
                aria-label="Postal Delivery Receipt"
              >
                <div className="receipt-stamp-header">
                  <span className="stamp-badge">
                    {DESTINATIONS[deliveredLocation]?.icon} OFFICIAL POSTAL RECEIPT · DELIVERED
                  </span>
                  <button
                    type="button"
                    className="receipt-close-btn"
                    onClick={() => {
                      setDeliveryMessage(null);
                      setDeliveredLocation(null);
                    }}
                    aria-label="Dismiss receipt"
                  >
                    ✕
                  </button>
                </div>
                <h4 className="receipt-destination-name">
                  {DESTINATIONS[deliveredLocation]?.name}
                </h4>
                <p className="receipt-note-text">{deliveryMessage}</p>
                <div className="receipt-footer-row">
                  <span className="receipt-spec">
                    Delivered by No. 003 · Certified 100% Cozy
                  </span>
                  <button
                    type="button"
                    className="receipt-dispatch-again-btn"
                    onClick={() => {
                      setDeliveryMessage(null);
                      setDeliveredLocation(null);
                    }}
                  >
                    <span>Deliver Another Dream ➔</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Destination Selector Tray */}
          <div className="express-destinations-tray">
            <span className="tray-instruction-heading">
              Choose where the next dream should go:
            </span>
            <div className="destination-buttons-grid" role="group" aria-label="Dream Delivery Destinations">
              {Object.values(DESTINATIONS).map((dest) => {
                const isSelected = selectedDestination === dest.id;
                const isCurrentDelivered = deliveredLocation === dest.id;

                return (
                  <button
                    key={dest.id}
                    type="button"
                    className={`destination-card-btn ${isSelected ? 'is-selected' : ''} ${
                      isCurrentDelivered ? 'is-delivered-target' : ''
                    } ${isDelivering ? 'is-disabled' : ''}`}
                    onClick={() => handleSelectDestination(dest.id)}
                    disabled={isDelivering}
                    aria-pressed={isSelected || isCurrentDelivered}
                  >
                    <div className="dest-btn-top">
                      <span className="dest-icon" aria-hidden="true">{dest.icon}</span>
                      <span className="dest-platform-chip">{dest.platform}</span>
                    </div>
                    <span className="dest-name">{dest.name}</span>
                    <span className="dest-subtext">{dest.subtext}</span>
                    <div className="dest-action-pill">
                      {isDelivering && isSelected
                        ? 'Express Traveling... 🚂'
                        : isCurrentDelivered
                        ? 'Delivered ✓'
                        : 'Dispatch Train ➔'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Station Footer / Pip Note & Postal Stamp */}
          <footer className="station-footer">
            <div className="station-sticky-note note-express">
              <span className="sticky-pin" aria-hidden="true">📌</span>
              <p>“All dreams arrive with extra fluffy pillows. No bad dreams past midnight.”</p>
            </div>
            <div className="station-stamp stamp-express">
              <span>SCHEDULE: ON-TIME · EVERY NIGHT</span>
            </div>
          </footer>
        </article>
      </div>

      {/* Hidden Easter Egg Postcard Modal (Phase 15.2) */}
      <PipSecretPostcard
        isOpen={isEasterEggOpen}
        onClose={() => setIsEasterEggOpen(false)}
      />
    </section>
  );
}
