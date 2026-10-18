import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  playVocalLullaby,
  stopAllOrchestraAudio,
  playFaahSound,
  playStarSound,
} from '../utils/soundEngine';
import './MagicalStarTheater.css';

/**
 * PASS 01C.4A: Pip's Magical Star Theater Opening Animation
 * Full 2D storybook cinematic film staging:
 * - Scene A (0.0s - 2.0s): Bedroom transforms via sweeping paper-cut clouds; 3 depth layers; camera push-in.
 * - Scene B (2.0s - 2.8s): Star 1 enters from far left along high arc with comet trail; Pip tracks it.
 * - Scene C (2.8s - 4.5s): Star 2 loops from upper right; Star 3 shoots up from below.
 * - Scene D (4.5s - 7.0s): 3-star coordinated spiral around Pip with tapering golden ribbons.
 * - Scene E (7.0s - 9.7s): Magic settles; constellation lines form; moon nods; "Whoa... did I just invent a galaxy?!".
 * - Scene F (9.7s+): Vocal lullaby starts once; song performance begins.
 */
export default function MagicalStarTheater({
  isOpen = false,
  soundEnabled = false,
  onToggleSound,
  onCloseTheater,
  onTheaterComplete,
}) {
  // Phase state:
  // 'curtain' (0-2s) | 'star1-enter' (2-2.8s) | 'stars23-enter' (2.8-4.5s) | 'spiral' (4.5-7s) | 'settle' (7-9.7s) | 'performing' (9.7s-27.15s) | 'celebrating' (27.15-31.15s) | 'exiting'
  const [phase, setPhase] = useState('curtain');
  const [pipMotion, setPipMotion] = useState('idle');
  const [subtitle, setSubtitle] = useState({ speaker: 'Pip', text: '“Uh-oh... where did my bedroom go?!”' });
  const [activeSubScene, setActiveSubScene] = useState('A');
  const [curtainsOpen, setCurtainsOpen] = useState(false);

  // References
  const stageRef = useRef(null);
  const backBtnRef = useRef(null);
  const theaterTimersRef = useRef([]);
  const rAFRef = useRef(null);
  const startTimeRef = useRef(null);
  const audioStartedRef = useRef(false);

  // Star and trail DOM refs for 60fps direct transform updates without React re-renders
  const star1Ref = useRef(null);
  const star2Ref = useRef(null);
  const star3Ref = useRef(null);
  const trail1Ref = useRef(null);
  const trail2Ref = useRef(null);
  const trail3Ref = useRef(null);
  const constLineRef = useRef(null);

  // Coordinate history buffers for trailing comet ribbons
  const history1 = useRef([]);
  const history2 = useRef([]);
  const history3 = useRef([]);

  // Clear all pending timers safely
  const clearAllTimers = useCallback(() => {
    theaterTimersRef.current.forEach((t) => clearTimeout(t));
    theaterTimersRef.current = [];
    if (rAFRef.current) {
      cancelAnimationFrame(rAFRef.current);
      rAFRef.current = null;
    }
  }, []);

  // Safe Exit Handler
  const handleExit = useCallback(() => {
    clearAllTimers();
    stopAllOrchestraAudio();
    audioStartedRef.current = false;
    setPhase('exiting');
    setTimeout(() => {
      setCurtainsOpen(false);
      onCloseTheater();
    }, 800);
  }, [clearAllTimers, onCloseTheater]);

  // Keyboard Escape Handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleExit]);

  // Auto-focus back button on open
  useEffect(() => {
    if (isOpen) {
      backBtnRef.current?.focus();
    }
  }, [isOpen]);

  /**
   * Continuous Cinematic Star Trajectory Engine (rAF)
   * Evaluates exact mathematical paths for Stars 1, 2, 3 and ribbon trails based on elapsed seconds.
   */
  const updateStarPositions = useCallback((elapsedSec, width, height) => {
    const cx = width / 2;
    const cy = height / 2;

    // Mobile adaptation factor
    const isMobile = width < 600;
    const scale = isMobile ? 0.75 : 1.0;

    // Default resting positions if not yet active
    let p1 = { x: -150, y: cy, visible: false, scale: 1 };
    let p2 = { x: width + 150, y: -100, visible: false, scale: 1 };
    let p3 = { x: cx, y: height + 150, visible: false, scale: 1 };

    // Easing helper
    const easeOutQuad = (t) => t * (2 - t);
    const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // --- SCENE B: STAR 1 ENTERS (2.0s to 2.8s) ---
    if (elapsedSec >= 2.0 && elapsedSec < 4.5) {
      p1.visible = true;
      if (elapsedSec < 2.8) {
        const t = (elapsedSec - 2.0) / 0.8;
        const e = easeOutQuad(t);
        // Arcs from outside left (-120), loops up to high celestial arc, settles at (cx - 180, cy - 30)
        p1.x = -100 + (cx - 180 * scale + 100) * e;
        p1.y = cy - Math.sin(t * Math.PI) * 160 * scale - (30 * scale) * e;
        p1.scale = 1 + Math.sin(t * Math.PI) * 0.35;
      } else {
        // Subtle resting hover before spiral
        const hoverT = (elapsedSec - 2.8) * 3;
        p1.x = cx - 180 * scale + Math.cos(hoverT) * 4;
        p1.y = cy - 30 * scale + Math.sin(hoverT) * 6;
      }
    }

    // --- SCENE C: STARS 2 & 3 ENTER (2.8s to 4.5s) ---
    if (elapsedSec >= 2.8 && elapsedSec < 4.5) {
      p2.visible = true;
      if (elapsedSec < 3.7) {
        const t = (elapsedSec - 2.8) / 0.9;
        const e = easeOutQuad(t);
        // Enters from upper right, loops under moon to (cx + 170, cy + 20)
        p2.x = width + 80 - (width + 80 - (cx + 170 * scale)) * e;
        p2.y = -60 + (cy + 20 * scale + 60) * e + Math.sin(t * Math.PI) * 80 * scale;
        p2.scale = 1 + Math.sin(t * Math.PI) * 0.3;
      } else {
        const hoverT = (elapsedSec - 3.7) * 3;
        p2.x = cx + 170 * scale + Math.sin(hoverT) * 5;
        p2.y = cy + 20 * scale + Math.cos(hoverT) * 6;
      }
    }

    if (elapsedSec >= 3.6 && elapsedSec < 4.5) {
      p3.visible = true;
      if (elapsedSec < 4.5) {
        const t = (elapsedSec - 3.6) / 0.9;
        const e = easeOutQuad(t);
        // Shoots up from below, curves playfully to zenith (cx, cy - 200)
        p3.x = cx + 40 * scale - (40 * scale) * e + Math.sin(t * Math.PI * 2) * 30 * scale;
        p3.y = height + 80 - (height + 80 - (cy - 200 * scale)) * e;
        p3.scale = 1 + Math.sin(t * Math.PI) * 0.4;
      }
    }

    // --- SCENE D: THE COORDINATED SPIRAL (4.5s to 7.0s) ---
    if (elapsedSec >= 4.5 && elapsedSec < 7.0) {
      p1.visible = true;
      p2.visible = true;
      p3.visible = true;

      const t = (elapsedSec - 4.5) / 2.5; // 0 to 1
      const e = easeInOutCubic(t);

      // Angle: 1.75 revolutions
      const revs = 1.75 * Math.PI * 2;
      const angleOffset = e * revs;

      // Contracting radius from 290px to 190px (wide cinematic orbit)
      const r = (290 - 100 * e) * scale;
      const rY = r * 0.82; // Elliptical storybook tilt that never touches Pip's nightcap or face!

      // Star 1: Starts at -120 deg (240 deg)
      const a1 = (4 * Math.PI / 3) + angleOffset;
      p1.x = cx + r * Math.cos(a1);
      p1.y = cy + rY * Math.sin(a1);

      // Star 2: Starts at 0 deg
      const a2 = 0 + angleOffset;
      p2.x = cx + r * Math.cos(a2);
      p2.y = cy + rY * Math.sin(a2);

      // Star 3: Starts at 120 deg
      const a3 = (2 * Math.PI / 3) + angleOffset;
      p3.x = cx + r * Math.cos(a3);
      p3.y = cy + rY * Math.sin(a3);
    }

    // --- SCENE E: THE MAGIC SETTLES INTO CONSTELLATION (7.0s to 10.0s) ---
    if (elapsedSec >= 7.0) {
      p1.visible = true;
      p2.visible = true;
      p3.visible = true;

      const target1 = { x: cx - 210 * scale, y: cy - 90 * scale };
      const target2 = { x: cx + 210 * scale, y: cy - 70 * scale };
      const target3 = { x: cx, y: cy - 235 * scale };

      if (elapsedSec < 8.2) {
        const t = (elapsedSec - 7.0) / 1.2;
        const e = easeOutQuad(t);
        // Settle into final anchors from spiral exit
        p1.x = p1.x + (target1.x - p1.x) * e;
        p1.y = p1.y + (target1.y - p1.y) * e;
        p2.x = p2.x + (target2.x - p2.x) * e;
        p2.y = p2.y + (target2.y - p2.y) * e;
        p3.x = p3.x + (target3.x - p3.x) * e;
        p3.y = p3.y + (target3.y - p3.y) * e;
      } else {
        // Idle breathing in constellation
        const tIdle = (elapsedSec - 8.2) * 2;
        p1.x = target1.x + Math.sin(tIdle) * 3;
        p1.y = target1.y + Math.cos(tIdle) * 3;
        p2.x = target2.x + Math.cos(tIdle + 1) * 3;
        p2.y = target2.y + Math.sin(tIdle + 1) * 3;
        p3.x = target3.x + Math.sin(tIdle + 2) * 3;
        p3.y = target3.y + Math.cos(tIdle + 2) * 3;
      }
    }

    // Direct DOM transform updates for 60fps performance
    if (star1Ref.current) {
      star1Ref.current.style.opacity = p1.visible ? '1' : '0';
      star1Ref.current.style.transform = `translate(${p1.x - 20}px, ${p1.y - 20}px) scale(${p1.scale})`;
    }
    if (star2Ref.current) {
      star2Ref.current.style.opacity = p2.visible ? '1' : '0';
      star2Ref.current.style.transform = `translate(${p2.x - 20}px, ${p2.y - 20}px) scale(${p2.scale})`;
    }
    if (star3Ref.current) {
      star3Ref.current.style.opacity = p3.visible ? '1' : '0';
      star3Ref.current.style.transform = `translate(${p3.x - 20}px, ${p3.y - 20}px) scale(${p3.scale})`;
    }

    // Update coordinate history for luminous ribbons
    if (p1.visible) {
      history1.current.push({ x: p1.x, y: p1.y });
      if (history1.current.length > 20) history1.current.shift();
    }
    if (p2.visible) {
      history2.current.push({ x: p2.x, y: p2.y });
      if (history2.current.length > 20) history2.current.shift();
    }
    if (p3.visible) {
      history3.current.push({ x: p3.x, y: p3.y });
      if (history3.current.length > 20) history3.current.shift();
    }

    // Helper to format SVG path from history points
    const formatTrail = (pts) => {
      if (pts.length < 2) return '';
      return 'M ' + pts.map((pt) => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' L ');
    };

    if (trail1Ref.current) {
      trail1Ref.current.setAttribute('d', formatTrail(history1.current));
      // Fade trail after spiral completes
      if (elapsedSec > 7.0) {
        const fade = Math.max(0, 1 - (elapsedSec - 7.0) / 2.0);
        trail1Ref.current.style.opacity = fade.toString();
      } else {
        trail1Ref.current.style.opacity = '1';
      }
    }
    if (trail2Ref.current) {
      trail2Ref.current.setAttribute('d', formatTrail(history2.current));
      if (elapsedSec > 7.0) {
        const fade = Math.max(0, 1 - (elapsedSec - 7.0) / 2.0);
        trail2Ref.current.style.opacity = fade.toString();
      } else {
        trail2Ref.current.style.opacity = '1';
      }
    }
    if (trail3Ref.current) {
      trail3Ref.current.setAttribute('d', formatTrail(history3.current));
      if (elapsedSec > 7.0) {
        const fade = Math.max(0, 1 - (elapsedSec - 7.0) / 2.0);
        trail3Ref.current.style.opacity = fade.toString();
      } else {
        trail3Ref.current.style.opacity = '1';
      }
    }

    // Update constellation triangle polygon when settled
    if (constLineRef.current && elapsedSec >= 7.2) {
      const lineOpacity = Math.min(1, (elapsedSec - 7.2) / 1.0);
      constLineRef.current.style.opacity = lineOpacity.toString();
      constLineRef.current.setAttribute(
        'points',
        `${p1.x.toFixed(1)},${p1.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)} ${p3.x.toFixed(1)},${p3.y.toFixed(1)}`
      );
    } else if (constLineRef.current) {
      constLineRef.current.style.opacity = '0';
    }
  }, []);

  /**
   * Main Cinematic State Machine & rAF Loop
   */
  useEffect(() => {
    if (!isOpen) {
      clearAllTimers();
      stopAllOrchestraAudio();
      audioStartedRef.current = false;
      setPhase('inactive');
      setCurtainsOpen(false);
      return;
    }

    clearAllTimers();
    audioStartedRef.current = false;
    history1.current = [];
    history2.current = [];
    history3.current = [];

    // --- SCENE A: THE BEDROOM TRANSFORMS (0.0s - 2.0s) ---
    setPhase('curtain');
    setPipMotion('looking-up');
    setSubtitle({ speaker: 'Pip', text: '“Uh-oh... where did my bedroom go?!”' });

    // Open paper-cut clouds wipe after a brief 100ms mount
    const tCurtains = setTimeout(() => {
      setCurtainsOpen(true);
    }, 150);
    theaterTimersRef.current.push(tCurtains);

    // --- SCENE B: STAR 1 ENTERS (2.0s - 2.8s) ---
    const tSceneB = setTimeout(() => {
      setPhase('star1-enter');
      setPipMotion('tilt-left');
      if (soundEnabled) playStarSound(0);
      setSubtitle({ speaker: 'Pip', text: '“Look! The stars followed us into the sky!”' });
    }, 2000);
    theaterTimersRef.current.push(tSceneB);

    // --- SCENE C: STARS 2 & 3 ENTER (2.8s - 4.5s) ---
    const tSceneC1 = setTimeout(() => {
      setPhase('stars23-enter');
      setPipMotion('tilt-right');
      if (soundEnabled) playStarSound(1);
    }, 2800);
    theaterTimersRef.current.push(tSceneC1);

    const tSceneC2 = setTimeout(() => {
      if (soundEnabled) playStarSound(2);
      setPipMotion('looking-up');
    }, 3600);
    theaterTimersRef.current.push(tSceneC2);

    // --- SCENE D: THE SPIRAL PERFORMANCE (4.5s - 7.0s) ---
    const tSceneD = setTimeout(() => {
      setPhase('spiral');
      setPipMotion('spiral-dance');
      setSubtitle({ speaker: 'Night Sky', text: '★ The stars dance in cosmic harmony... ★' });
    }, 4500);
    theaterTimersRef.current.push(tSceneD);

    // --- SCENE E: THE MAGIC SETTLES (7.0s - 10.0s) ---
    const tSceneE = setTimeout(() => {
      setPhase('settle');
      setPipMotion('looking-up');
      setSubtitle({ speaker: 'Pip', text: '“Whoa... did I just invent a galaxy?!”' });
    }, 7000);
    theaterTimersRef.current.push(tSceneE);

    // Musical anticipation cue at 9.6s
    const tMusicCue = setTimeout(() => {
      setSubtitle({ speaker: 'The Stars', text: '✦ ✦ ✦ (Soft chimes build... lullaby about to begin!) ✦ ✦ ✦' });
    }, 9600);
    theaterTimersRef.current.push(tMusicCue);

    // --- SCENE F: LULLABY CONCERT (10.0s - 27.45s) ---
    // Single Audio Owner: Audio starts ONLY when the opening sequence finishes!
    const tSceneF = setTimeout(() => {
      setPhase('performing');
      setPipMotion('sway-song');
      setActiveSubScene('A');
      setSubtitle({ speaker: 'Pip & The Stars', text: '“Twinkle, twinkle, little star... ♫”' });

      audioStartedRef.current = true;
      playVocalLullaby({
        onEnded: () => {
          // If song audio ends naturally, proceed to finale
        },
      });

      // Synchronized story sub-scenes
      const tSubB = setTimeout(() => {
        setActiveSubScene('B');
        setSubtitle({ speaker: 'Pip & The Stars', text: '“How I wonder what you are... ♫”' });
      }, 4500);
      theaterTimersRef.current.push(tSubB);

      const tSubC = setTimeout(() => {
        setActiveSubScene('C');
        setSubtitle({ speaker: 'Pip & The Stars', text: '“Up above the world so high... ♫”' });
      }, 9000);
      theaterTimersRef.current.push(tSubC);

      const tSubD = setTimeout(() => {
        setActiveSubScene('D');
        setPipMotion('drowsy');
        setSubtitle({ speaker: 'Pip & The Stars', text: '“Like a diamond in the sky... ♫”' });
      }, 13500);
      theaterTimersRef.current.push(tSubD);

      // --- SCENE G: GRAND FINALE (at 17.45s after start of song -> 27150ms total) ---
      const tFinale = setTimeout(() => {
        setPhase('celebrating');
        setPipMotion('celebrate-jump');
        playFaahSound(1.0);
        setSubtitle({ speaker: 'Pip', text: '“WOOHOO! You turned my bedroom into a STUDIO!”' });

        // --- SCENE H: RETURN TO BEDROOM & POPUP TRIGGER ---
        const tReturn = setTimeout(() => {
          setPhase('exiting');
          const tComplete = setTimeout(() => {
            clearAllTimers();
            stopAllOrchestraAudio();
            setPhase('inactive');
            if (onTheaterComplete) onTheaterComplete();
          }, 1000);
          theaterTimersRef.current.push(tComplete);
        }, 4000);
        theaterTimersRef.current.push(tReturn);
      }, 17450);
      theaterTimersRef.current.push(tFinale);
    }, 9700);
    theaterTimersRef.current.push(tSceneF);

    // Start rAF loop
    startTimeRef.current = performance.now();
    const tick = (now) => {
      const elapsedSec = (now - startTimeRef.current) / 1000;
      if (stageRef.current) {
        const rect = stageRef.current.getBoundingClientRect();
        updateStarPositions(elapsedSec, rect.width, rect.height);
      }
      rAFRef.current = requestAnimationFrame(tick);
    };
    rAFRef.current = requestAnimationFrame(tick);

    return () => {
      clearAllTimers();
      stopAllOrchestraAudio();
    };
  }, [isOpen, soundEnabled, clearAllTimers, onTheaterComplete, updateStarPositions]);

  // Interactive star click during theater
  const handleTapStar = (starIndex, e) => {
    e.stopPropagation();
    if (soundEnabled) {
      playStarSound(starIndex);
    }
  };

  if (!isOpen && phase === 'inactive') return null;

  return (
    <div
      className={`magical-star-theater theater-active phase-${phase}`}
      role="dialog"
      aria-modal="true"
      aria-label="Pip's Magical Star Theater Film"
    >
      {/* =========================================================
         1. SCENE A: Sweeping Storybook Cloud Curtains (Wipe Transition)
         ========================================================= */}
      <div className={`storybook-curtain-layer ${curtainsOpen ? 'curtains-open' : ''}`} aria-hidden="true">
        <div className="curtain-cloud curtain-left">
          <svg viewBox="0 0 500 800" preserveAspectRatio="none">
            <path
              d="M0,0 L320,0 C380,80 340,160 410,240 C470,320 430,400 480,500 C520,590 440,680 470,800 L0,800 Z"
              fill="#FFF8F1"
            />
            <path
              d="M0,0 L270,0 C320,70 290,140 350,220 C400,300 370,380 410,480 C440,560 380,650 400,800 L0,800 Z"
              fill="#F5EFE6"
              opacity="0.8"
            />
          </svg>
        </div>
        <div className="curtain-cloud curtain-right">
          <svg viewBox="0 0 500 800" preserveAspectRatio="none">
            <path
              d="M500,0 L180,0 C120,80 160,160 90,240 C30,320 70,400 20,500 C-20,590 60,680 30,800 L500,800 Z"
              fill="#FFF8F1"
            />
            <path
              d="M500,0 L230,0 C180,70 210,140 150,220 C100,300 130,380 90,480 C60,560 120,650 100,800 L500,800 Z"
              fill="#F5EFE6"
              opacity="0.8"
            />
          </svg>
        </div>
      </div>

      {/* =========================================================
         2. LAYER 1: Deep Celestial Sky & Golden Stars
         ========================================================= */}
      <div className="scenery-deep-sky" aria-hidden="true">
        <div className="sky-nebula-glow" />
        <div className="celestial-stars-grid">
          {/* Handcrafted background twinkling stars */}
          <span className="twinkle-star star-t1" style={{ top: '12%', left: '15%' }}>✦</span>
          <span className="twinkle-star star-t2" style={{ top: '22%', left: '82%' }}>⋆</span>
          <span className="twinkle-star star-t3" style={{ top: '35%', left: '8%' }}>✧</span>
          <span className="twinkle-star star-t4" style={{ top: '18%', left: '60%' }}>✦</span>
          <span className="twinkle-star star-t5" style={{ top: '48%', left: '92%' }}>⋆</span>
          <span className="twinkle-star star-t6" style={{ top: '58%', left: '12%' }}>✧</span>
          <span className="twinkle-star star-t7" style={{ top: '8%', left: '38%' }}>⋆</span>
          <span className="twinkle-star star-t8" style={{ top: '65%', left: '78%' }}>✦</span>
        </div>

        {/* Storybook Smiling Crescent Moon */}
        <div className={`theater-moon ${phase === 'settle' ? 'moon-nodding' : ''}`}>
          <svg viewBox="0 0 60 60" width="64" height="64">
            <defs>
              <radialGradient id="theaterMoonGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFF4D1" stopOpacity="0.95" />
                <stop offset="60%" stopColor="#FFA62B" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#E6AF2E" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="30" cy="30" r="28" fill="url(#theaterMoonGlow)" />
            <path
              d="M36 12C26.059 12 18 20.059 18 30C18 39.941 26.059 48 36 48C30.2 46.5 25.8 41 25.8 30C25.8 19 30.2 13.5 36 12Z"
              fill="#FFD45A"
              stroke="#5C4033"
              strokeWidth="2"
            />
            <path
              d="M26 27C27.5 29 29.5 29 31 27"
              fill="none"
              stroke="#5C4033"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* =========================================================
         3. LAYER 2: Midground Fairytale Nursery Skyline & Clouds
         ========================================================= */}
      <div className="scenery-midground" aria-hidden="true">
        {/* Fairytale Nursery Rooftops with warm glowing windows */}
        <svg className="fairytale-skyline-svg" viewBox="0 0 1200 180" preserveAspectRatio="none">
          <defs>
            <linearGradient id="roofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E233E" />
              <stop offset="100%" stopColor="#111527" />
            </linearGradient>
          </defs>
          {/* Rooftop silhouette */}
          <path
            d="M0,180 L0,120 L60,95 L120,120 L150,80 L190,120 L280,120 L320,60 L360,120 L480,120 L530,70 L580,120 L700,120 L740,85 L780,120 L880,120 L920,50 L960,120 L1080,120 L1130,80 L1180,120 L1200,120 L1200,180 Z"
            fill="url(#roofGrad)"
          />
          {/* Little glowing windows */}
          <rect x="85" y="105" width="10" height="14" rx="2" fill="#FFD45A" opacity="0.85" className="glow-window-1" />
          <rect x="335" y="85" width="12" height="16" rx="2" fill="#FFD45A" opacity="0.9" className="glow-window-2" />
          <rect x="550" y="92" width="10" height="14" rx="2" fill="#FFD45A" opacity="0.8" className="glow-window-3" />
          <rect x="935" y="80" width="12" height="16" rx="2" fill="#FFD45A" opacity="0.9" className="glow-window-4" />
          <rect x="1145" y="100" width="10" height="14" rx="2" fill="#FFD45A" opacity="0.75" className="glow-window-5" />
        </svg>

        {/* Drifting storybook clouds */}
        <div className={`drifting-clouds-layer ${activeSubScene === 'B' || activeSubScene === 'C' ? 'clouds-visible' : ''}`}>
          <svg className="storybook-cloud cloud-drift-1" viewBox="0 0 200 60">
            <path d="M20,40 Q30,20 50,30 Q70,10 100,20 Q130,5 150,25 Q175,15 185,35 Q195,50 170,55 L20,55 Z" />
          </svg>
          <svg className="storybook-cloud cloud-drift-2" viewBox="0 0 220 70">
            <path d="M25,50 Q40,25 70,35 Q95,15 130,25 Q165,10 185,35 Q205,25 210,48 Q215,65 180,65 L25,65 Z" />
          </svg>
        </div>
      </div>

      {/* =========================================================
         4. TOP CONTROLS BAR: Minimalist & Clean (No Overlap)
         ========================================================= */}
      <header className="theater-top-controls">
        <button
          ref={backBtnRef}
          type="button"
          className="theater-ctrl-btn back-bedroom-btn"
          onClick={handleExit}
          aria-label="Back to Bedroom (or press Escape)"
        >
          <span className="btn-arrow" aria-hidden="true">←</span> Back to Bedroom
          <span className="btn-keycap" aria-hidden="true">Esc</span>
        </button>

        {/* Storybook Star Scene Indicator (Replaces large progress bar) */}
        <div className="theater-scene-indicator" aria-hidden="true">
          <span className={`ind-star ${phase !== 'curtain' ? 'active' : ''}`}>✦</span>
          <span className={`ind-star ${phase === 'spiral' || phase === 'settle' || phase === 'performing' || phase === 'celebrating' ? 'active' : ''}`}>✦</span>
          <span className={`ind-star ${phase === 'settle' || phase === 'performing' || phase === 'celebrating' ? 'active' : ''}`}>✦</span>
        </div>

        <button
          type="button"
          className={`theater-ctrl-btn sound-toggle-btn ${soundEnabled ? 'is-sound-on' : 'is-sound-off'}`}
          onClick={onToggleSound}
          aria-label={`Sound is currently ${soundEnabled ? 'ON' : 'OFF'}. Click to toggle.`}
          aria-pressed={soundEnabled}
        >
          <span className="btn-icon" aria-hidden="true">{soundEnabled ? '🔊' : '🔇'}</span>
          <span>Sound: {soundEnabled ? 'ON' : 'OFF'}</span>
        </button>
      </header>

      {/* =========================================================
         5. STAGE: Pip Storybook Cloud Bed & Choreographed Stars
         ========================================================= */}
      <main className="theater-stage" ref={stageRef}>
        {/* Dynamic SVG Layer for Luminous Ribbon Comet Trails & Constellation */}
        <svg className="theater-trails-svg" aria-hidden="true">
          <defs>
            <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF8F1" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#F5D88C" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#A34063" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Golden Constellation Lines */}
          <polygon
            ref={constLineRef}
            points="0,0 0,0 0,0"
            fill="none"
            className="constellation-polygon"
          />

          {/* Trailing Comet Ribbon Paths */}
          <path ref={trail1Ref} d="" fill="none" className="comet-ribbon-path ribbon-1" />
          <path ref={trail2Ref} d="" fill="none" className="comet-ribbon-path ribbon-2" />
          <path ref={trail3Ref} d="" fill="none" className="comet-ribbon-path ribbon-3" />
        </svg>

        {/* PIP'S STORYBOOK CLOUD CRADLE:
            Artistic compositing solution: Official artwork is nestled inside
            a layered storybook cloud bed with foreground puffs that lap over
            the lower base, fully eliminating rectangular edges without any oval shortcut! */}
        <div className={`pip-storybook-cradle pip-motion-${pipMotion}`}>
          {/* Celestial Moonlit Aura behind cloud */}
          <div className="cradle-celestial-aura" aria-hidden="true" />

          {/* Background Cloud Bed Backing */}
          <div className="cradle-cloud-backdrop" aria-hidden="true">
            <svg viewBox="0 0 340 380" className="cloud-backdrop-svg">
              <path
                d="M40,240 C20,180 60,110 130,100 C170,50 250,60 280,120 C330,140 340,210 310,260 C330,300 290,360 220,360 C170,370 120,360 80,340 C30,320 20,280 40,240 Z"
                fill="#FFF4E6"
                opacity="0.9"
              />
            </svg>
          </div>

          {/* SVG Definitions for Fairytale Cloud Cluster Mask */}
          <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
            <defs>
              <clipPath id="fairytaleCloudCluster" clipPathUnits="objectBoundingBox">
                <path d="M 0.22,0.12 C 0.12,0.14 0.04,0.25 0.04,0.38 C 0.01,0.50 0.06,0.62 0.10,0.72 C 0.05,0.82 0.14,0.92 0.26,0.95 C 0.36,0.98 0.64,0.98 0.74,0.95 C 0.86,0.92 0.95,0.82 0.90,0.72 C 0.95,0.62 0.99,0.50 0.96,0.38 C 0.96,0.25 0.88,0.14 0.78,0.12 C 0.70,0.05 0.58,0.03 0.50,0.05 C 0.42,0.03 0.30,0.05 0.22,0.12 Z" />
              </clipPath>
            </defs>
          </svg>

          {/* Official Character Artwork nestled in Storybook Cloud Cluster */}
          <div className="cradle-character-wrap">
            <img
              src="/assets/pip/pip_avatar_cloud.png"
              alt="Pip, a friendly baby with a round skull face and starry nightcap, nestled safely in the midnight sky clouds."
              className="pip-character-asset"
              width="310"
              height="360"
            />
          </div>

          {/* Golden Embroidered Cloud Rim */}
          <div className="cradle-cloud-rim" aria-hidden="true">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="cloud-rim-svg">
              <path
                d="M 22,12 C 12,14 4,25 4,38 C 1,50 6,62 10,72 C 5,82 14,92 26,95 C 36,98 64,98 74,95 C 86,92 95,82 90,72 C 95,62 99,50 96,38 C 96,25 88,14 78,12 C 70,5 58,3 50,5 C 42,3 30,5 22,12 Z"
                fill="none"
                stroke="#F5D88C"
                strokeWidth="2.5"
                strokeDasharray="5 4"
                opacity="0.85"
              />
            </svg>
          </div>

          {/* Foreground Cloud Puffs: Cup and blend the lower edge naturally into the sky */}
          <div className="cradle-foreground-puffs" aria-hidden="true">
            <svg viewBox="0 0 340 100" className="foreground-puffs-svg">
              <path
                d="M20,60 C40,30 80,30 110,50 C140,20 190,20 220,45 C250,25 290,35 315,65 C320,80 300,95 270,95 L50,95 C25,95 10,80 20,60 Z"
                fill="#FAF1E2"
                stroke="#E2D5C3"
                strokeWidth="1.5"
              />
              {/* Soft warm highlight puff */}
              <ellipse cx="110" cy="50" rx="30" ry="14" fill="#FFF9F0" />
              <ellipse cx="220" cy="46" rx="35" ry="16" fill="#FFF9F0" />
            </svg>
          </div>
        </div>

        {/* THE THREE MOVING CHOREOGRAPHED STARS */}
        <button
          ref={star1Ref}
          type="button"
          className="cinematic-star-node star-node-1"
          onClick={(e) => handleTapStar(0, e)}
          aria-label="Star 1: Click to hear bedtime chime"
        >
          <svg viewBox="0 0 32 32" className="star-svg">
            <polygon points="16,2 20,11 30,11 22,18 25,28 16,22 7,28 10,18 2,11 12,11" />
          </svg>
          <span className="star-glow-halo" aria-hidden="true" />
        </button>

        <button
          ref={star2Ref}
          type="button"
          className="cinematic-star-node star-node-2"
          onClick={(e) => handleTapStar(1, e)}
          aria-label="Star 2: Click to hear bedtime chime"
        >
          <svg viewBox="0 0 32 32" className="star-svg">
            <polygon points="16,2 20,11 30,11 22,18 25,28 16,22 7,28 10,18 2,11 12,11" />
          </svg>
          <span className="star-glow-halo" aria-hidden="true" />
        </button>

        <button
          ref={star3Ref}
          type="button"
          className="cinematic-star-node star-node-3"
          onClick={(e) => handleTapStar(2, e)}
          aria-label="Star 3: Click to hear bedtime chime"
        >
          <svg viewBox="0 0 32 32" className="star-svg">
            <polygon points="16,2 20,11 30,11 22,18 25,28 16,22 7,28 10,18 2,11 12,11" />
          </svg>
          <span className="star-glow-halo" aria-hidden="true" />
        </button>
      </main>

      {/* =========================================================
         6. LAYER 3: Foreground Framing Clouds
         ========================================================= */}
      <div className="scenery-foreground-clouds" aria-hidden="true">
        <svg className="fg-cloud fg-cloud-left" viewBox="0 0 350 120" preserveAspectRatio="none">
          <path d="M0,120 L0,50 Q40,10 90,35 Q140,5 190,40 Q250,20 300,70 Q330,85 350,120 Z" fill="#14192F" opacity="0.85" />
        </svg>
        <svg className="fg-cloud fg-cloud-right" viewBox="0 0 350 120" preserveAspectRatio="none">
          <path d="M350,120 L350,45 Q310,15 260,35 Q200,5 150,45 Q90,15 40,75 Q15,90 0,120 Z" fill="#14192F" opacity="0.85" />
        </svg>
      </div>

      {/* =========================================================
         7. DEDICATED CINEMATIC SUBTITLE LAYER: Bottom Safe Zone
         ========================================================= */}
      <footer className="cinematic-subtitle-layer">
        <div className="subtitle-card" aria-live="polite">
          <span className="subtitle-speaker">{subtitle.speaker}:</span>
          <p className="subtitle-text">{subtitle.text}</p>
        </div>
      </footer>
    </div>
  );
}
