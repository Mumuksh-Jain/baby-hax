import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  playVocalLullaby,
  stopAllOrchestraAudio,
  playFaahSound,
  playStarSound,
} from '../utils/soundEngine';
import './MagicalStarTheater.css';

/**
 * PASS 01C.4A: Pip's Magical Star Theater — Living Paper-Craft World
 * Inspired by layered 3D paper-quilling art:
 * - Layer A: Deep midnight paper sky (#08102B -> #182E62)
 * - Layer B: Small distant golden stars twinkling in coordinated waves
 * - Layer C: Left-side cut-paper formations & animated quilled paper spirals
 * - Layer D: Right-side cut-paper formations & rolled cloud shapes
 * - Layer E: Partially hidden golden crescent moon peeking through paper clouds
 * - Layer F: Midground clouds framing the central opening
 * - Layer G: Pip seated on the cloud at the center, nestled in paper cloud cradle
 * - Layer H: Three major animated golden stars with continuous comet ribbons & spiral
 * - Layer I: Foreground overlapping blue paper clouds with breathing motion
 * - Layer J: Dedicated readable cinematic subtitle layer & accessible controls
 */
export default function MagicalStarTheater({
  isOpen = false,
  soundEnabled = false,
  onToggleSound,
  onCloseTheater,
  onTheaterComplete,
}) {
  // Cinematic phase state:
  // 'curtain' (0-2s) | 'star1-enter' (2-2.8s) | 'stars23-enter' (2.8-4.5s) | 'spiral' (4.5-7.5s) | 'settle' (7.5-10s) | 'performing' (10s+) | 'celebrating' | 'exiting'
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
    }, 750);
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
   * Mathematical flight paths for Stars 1, 2, 3 and luminous ribbon trails.
   */
  const updateStarPositions = useCallback((elapsedSec, width, height) => {
    const cx = width / 2;
    const cy = height / 2;

    const isMobile = width < 600;
    const scale = isMobile ? 0.72 : 1.0;

    let p1 = { x: -160, y: cy, visible: false, scale: 1 };
    let p2 = { x: cx + 40, y: -160, visible: false, scale: 1 };
    let p3 = { x: width + 160, y: cy + 120, visible: false, scale: 1 };

    const easeOutQuad = (t) => t * (2 - t);
    const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    // --- SCENE B: STAR 1 ENTERS FROM LEFT (2.0s to 2.8s) ---
    if (elapsedSec >= 2.0 && elapsedSec < 4.5) {
      p1.visible = true;
      if (elapsedSec < 2.8) {
        const t = (elapsedSec - 2.0) / 0.8;
        const e = easeOutQuad(t);
        p1.x = -120 + (cx - 190 * scale + 120) * e;
        p1.y = cy - Math.sin(t * Math.PI) * 170 * scale - (35 * scale) * e;
        p1.scale = 1 + Math.sin(t * Math.PI) * 0.35;
      } else {
        const hoverT = (elapsedSec - 2.8) * 3;
        p1.x = cx - 190 * scale + Math.cos(hoverT) * 4;
        p1.y = cy - 35 * scale + Math.sin(hoverT) * 6;
      }
    }

    // --- SCENE C: STAR 2 LOOPS FROM ABOVE & STAR 3 ENTERS FROM RIGHT (2.8s to 4.5s) ---
    if (elapsedSec >= 2.8 && elapsedSec < 4.5) {
      p2.visible = true;
      if (elapsedSec < 3.7) {
        const t = (elapsedSec - 2.8) / 0.9;
        const e = easeOutQuad(t);
        // Loops in from above, dipping gently past the moon
        p2.x = cx + 60 * scale + Math.sin(t * Math.PI * 1.5) * 120 * scale;
        p2.y = -100 + (cy - 190 * scale + 100) * e;
        p2.scale = 1 + Math.sin(t * Math.PI) * 0.3;
      } else {
        const hoverT = (elapsedSec - 3.7) * 3;
        p2.x = cx + 20 * scale + Math.sin(hoverT) * 5;
        p2.y = cy - 190 * scale + Math.cos(hoverT) * 5;
      }
    }

    if (elapsedSec >= 3.6 && elapsedSec < 4.5) {
      p3.visible = true;
      if (elapsedSec < 4.5) {
        const t = (elapsedSec - 3.6) / 0.9;
        const e = easeOutQuad(t);
        // Swoops in from lower right across the paper clouds
        p3.x = width + 80 - (width + 80 - (cx + 180 * scale)) * e;
        p3.y = height * 0.8 - (height * 0.8 - (cy + 15 * scale)) * e + Math.sin(t * Math.PI) * 70 * scale;
        p3.scale = 1 + Math.sin(t * Math.PI) * 0.4;
      }
    }

    // --- SCENE D: A REAL SPIRAL DANCE (4.5s to 7.5s) ---
    if (elapsedSec >= 4.5 && elapsedSec < 7.5) {
      p1.visible = true;
      p2.visible = true;
      p3.visible = true;

      const t = (elapsedSec - 4.5) / 3.0; // 0 to 1 over 3 full seconds
      const e = easeInOutCubic(t);

      // 1.85 revolutions
      const revs = 1.85 * Math.PI * 2;
      const angleOffset = e * revs;

      // Contracting spiral radius from 300px to 195px
      const r = (300 - 105 * e) * scale;
      const rY = r * 0.82; // Elliptical 2.5D tilt that stays clear of Pip's face

      // Star 1 (starts at 240 deg)
      const a1 = (4 * Math.PI / 3) + angleOffset;
      p1.x = cx + r * Math.cos(a1);
      p1.y = cy + rY * Math.sin(a1);

      // Star 2 (starts at 0 deg)
      const a2 = 0 + angleOffset;
      p2.x = cx + r * Math.cos(a2);
      p2.y = cy + rY * Math.sin(a2);

      // Star 3 (starts at 120 deg)
      const a3 = (2 * Math.PI / 3) + angleOffset;
      p3.x = cx + r * Math.cos(a3);
      p3.y = cy + rY * Math.sin(a3);
    }

    // --- SCENE E: THE STARS SETTLE (7.5s to 10.0s) ---
    if (elapsedSec >= 7.5) {
      p1.visible = true;
      p2.visible = true;
      p3.visible = true;

      const target1 = { x: cx - 215 * scale, y: cy - 90 * scale };
      const target2 = { x: cx + 215 * scale, y: cy - 70 * scale };
      const target3 = { x: cx, y: cy - 240 * scale };

      if (elapsedSec < 8.6) {
        const t = (elapsedSec - 7.5) / 1.1;
        const e = easeOutQuad(t);
        p1.x = p1.x + (target1.x - p1.x) * e;
        p1.y = p1.y + (target1.y - p1.y) * e;
        p2.x = p2.x + (target2.x - p2.x) * e;
        p2.y = p2.y + (target2.y - p2.y) * e;
        p3.x = p3.x + (target3.x - p3.x) * e;
        p3.y = p3.y + (target3.y - p3.y) * e;
      } else {
        const tIdle = (elapsedSec - 8.6) * 2;
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

    // Coordinate history buffers for luminous ribbon trails
    if (p1.visible) {
      history1.current.push({ x: p1.x, y: p1.y });
      if (history1.current.length > 22) history1.current.shift();
    }
    if (p2.visible) {
      history2.current.push({ x: p2.x, y: p2.y });
      if (history2.current.length > 22) history2.current.shift();
    }
    if (p3.visible) {
      history3.current.push({ x: p3.x, y: p3.y });
      if (history3.current.length > 22) history3.current.shift();
    }

    const formatTrail = (pts) => {
      if (pts.length < 2) return '';
      return 'M ' + pts.map((pt) => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' L ');
    };

    if (trail1Ref.current) {
      trail1Ref.current.setAttribute('d', formatTrail(history1.current));
      if (elapsedSec > 7.5) {
        const fade = Math.max(0, 1 - (elapsedSec - 7.5) / 2.2);
        trail1Ref.current.style.opacity = fade.toString();
      } else {
        trail1Ref.current.style.opacity = '1';
      }
    }
    if (trail2Ref.current) {
      trail2Ref.current.setAttribute('d', formatTrail(history2.current));
      if (elapsedSec > 7.5) {
        const fade = Math.max(0, 1 - (elapsedSec - 7.5) / 2.2);
        trail2Ref.current.style.opacity = fade.toString();
      } else {
        trail2Ref.current.style.opacity = '1';
      }
    }
    if (trail3Ref.current) {
      trail3Ref.current.setAttribute('d', formatTrail(history3.current));
      if (elapsedSec > 7.5) {
        const fade = Math.max(0, 1 - (elapsedSec - 7.5) / 2.2);
        trail3Ref.current.style.opacity = fade.toString();
      } else {
        trail3Ref.current.style.opacity = '1';
      }
    }

    // Constellation lines form between the three settled stars
    if (constLineRef.current && elapsedSec >= 7.8) {
      const lineOpacity = Math.min(1, (elapsedSec - 7.8) / 1.0);
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
   * Main Choreographed State Machine
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

    // --- 0.0s to 2.0s: SCENE A (Paper Sky Opens) ---
    setPhase('curtain');
    setPipMotion('looking-up');
    setSubtitle({ speaker: 'Pip', text: '“Uh-oh... where did my bedroom go?!”' });

    const tCurtains = setTimeout(() => {
      setCurtainsOpen(true);
    }, 120);
    theaterTimersRef.current.push(tCurtains);

    // --- 2.0s to 2.8s: SCENE B (Star 1 Enters from Left) ---
    const tSceneB = setTimeout(() => {
      setPhase('star1-enter');
      setPipMotion('tilt-left');
      if (soundEnabled) playStarSound(0);
      setSubtitle({ speaker: 'Pip', text: '“Look! The stars followed us into the sky!”' });
    }, 2000);
    theaterTimersRef.current.push(tSceneB);

    // --- 2.8s to 4.5s: SCENE C (Stars 2 & 3 Enter) ---
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

    // --- 4.5s to 7.5s: SCENE D (A Real Spiral Dance) ---
    const tSceneD = setTimeout(() => {
      setPhase('spiral');
      setPipMotion('spiral-dance');
      setSubtitle({ speaker: 'Night Sky', text: '★ The stars dance in cosmic harmony... ★' });
    }, 4500);
    theaterTimersRef.current.push(tSceneD);

    // --- 7.5s to 10.0s: SCENE E (The Stars Settle) ---
    const tSceneE = setTimeout(() => {
      setPhase('settle');
      setPipMotion('looking-up');
      setSubtitle({ speaker: 'Pip', text: '“Whoa... did I just invent a galaxy?!”' });
    }, 7500);
    theaterTimersRef.current.push(tSceneE);

    // Anticipation cue at 9.6s before song begins
    const tMusicCue = setTimeout(() => {
      setSubtitle({ speaker: 'The Stars', text: '✦ ✦ ✦ (Soft chimes build... lullaby about to begin!) ✦ ✦ ✦' });
    }, 9600);
    theaterTimersRef.current.push(tMusicCue);

    // --- 10.0s+: SCENE F (Lullaby Concert Begins) ---
    // Single Audio Owner: Audio starts ONLY after the 10-second opening sequence completes!
    const tSceneF = setTimeout(() => {
      setPhase('performing');
      setPipMotion('sway-song');
      setActiveSubScene('A');
      setSubtitle({ speaker: 'Pip & The Stars', text: '“Twinkle, twinkle, little star... ♫”' });

      audioStartedRef.current = true;
      playVocalLullaby({
        onEnded: () => {
          // Handled on completion
        },
      });

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

      // Finale after 17.45s song
      const tFinale = setTimeout(() => {
        setPhase('celebrating');
        setPipMotion('celebrate-jump');
        playFaahSound(1.0);
        setSubtitle({ speaker: 'Pip', text: '“WOOHOO! You turned my bedroom into a STUDIO!”' });

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
    }, 10000);
    theaterTimersRef.current.push(tSceneF);

    // Start 60fps rAF loop
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
         LAYER A: Deep Midnight Paper Sky (#08102B -> #182E62)
         ========================================================= */}
      <div className="layer-a-midnight-sky" aria-hidden="true">
        <div className="sky-paper-fiber-overlay" />
        <div className="sky-celestial-nebula" />
      </div>

      {/* =========================================================
         LAYER B: Small Distant Golden Stars (Twinkling in Waves)
         ========================================================= */}
      <div className="layer-b-distant-stars" aria-hidden="true">
        <span className="star-twinkle-wave w-1" style={{ top: '10%', left: '16%' }}>✦</span>
        <span className="star-twinkle-wave w-2" style={{ top: '18%', left: '80%' }}>⋆</span>
        <span className="star-twinkle-wave w-3" style={{ top: '28%', left: '32%' }}>✧</span>
        <span className="star-twinkle-wave w-1" style={{ top: '14%', left: '62%' }}>✦</span>
        <span className="star-twinkle-wave w-2" style={{ top: '34%', left: '88%' }}>⋆</span>
        <span className="star-twinkle-wave w-3" style={{ top: '48%', left: '14%' }}>✧</span>
        <span className="star-twinkle-wave w-1" style={{ top: '6%', left: '46%' }}>⋆</span>
        <span className="star-twinkle-wave w-2" style={{ top: '56%', left: '74%' }}>✦</span>
        <span className="star-twinkle-wave w-3" style={{ top: '68%', left: '26%' }}>✧</span>
        <span className="star-twinkle-wave w-1" style={{ top: '40%', left: '52%' }}>⋆</span>
      </div>

      {/* =========================================================
         SCENE A: Blue Cut-Paper Stage Curtains (Wipe Transition)
         ========================================================= */}
      <div className={`paper-curtain-layer ${curtainsOpen ? 'curtains-open' : ''}`} aria-hidden="true">
        <div className="curtain-sheet curtain-left-sheet">
          <svg viewBox="0 0 600 900" preserveAspectRatio="none">
            <path
              d="M0,0 L420,0 C480,90 440,180 510,270 C570,360 520,450 580,560 C620,660 540,760 580,900 L0,900 Z"
              fill="#142654"
            />
            <path
              d="M0,0 L360,0 C410,80 380,160 440,250 C490,340 450,430 500,530 C540,630 470,730 500,900 L0,900 Z"
              fill="#1E3875"
              opacity="0.9"
            />
            <path
              d="M0,0 L300,0 C340,70 320,140 370,230 C410,310 380,390 420,490 C450,580 400,680 420,900 L0,900 Z"
              fill="#2B4E9A"
              opacity="0.85"
            />
          </svg>
        </div>
        <div className="curtain-sheet curtain-right-sheet">
          <svg viewBox="0 0 600 900" preserveAspectRatio="none">
            <path
              d="M600,0 L180,0 C120,90 160,180 90,270 C30,360 80,450 20,560 C-20,660 60,760 20,900 L600,900 Z"
              fill="#142654"
            />
            <path
              d="M600,0 L240,0 C190,80 220,160 160,250 C110,340 150,430 100,530 C60,630 130,730 100,900 L600,900 Z"
              fill="#1E3875"
              opacity="0.9"
            />
            <path
              d="M600,0 L300,0 C260,70 280,140 230,230 C190,310 220,390 180,490 C150,580 200,680 180,900 L600,900 Z"
              fill="#2B4E9A"
              opacity="0.85"
            />
          </svg>
        </div>
      </div>

      {/* =========================================================
         LAYER C: Left-Side Cut-Paper Formations & Quilled Spirals
         ========================================================= */}
      <div className="layer-c-left-paper-clouds" aria-hidden="true">
        <svg viewBox="0 0 380 650" className="left-paper-cloud-svg">
          <defs>
            <filter id="paperShadowL" x="-10%" y="-10%" width="140%" height="140%">
              <feDropShadow dx="6" dy="12" stdDeviation="10" floodColor="#060C1F" floodOpacity="0.75" />
            </filter>
          </defs>

          {/* Tier 1: Deep Navy Paper Base */}
          <path
            d="M-20,0 L220,0 Q290,60 250,140 Q320,200 270,290 Q340,380 280,480 Q320,580 240,650 L-20,650 Z"
            fill="#0F1C3F"
            filter="url(#paperShadowL)"
          />

          {/* Tier 2: Royal Blue Paper Layer */}
          <path
            d="M-20,0 L180,0 Q240,50 200,120 Q260,180 220,260 Q270,340 210,430 Q250,520 180,650 L-20,650 Z"
            fill="#1B336E"
            stroke="rgba(120, 160, 220, 0.2)"
            strokeWidth="1.5"
            filter="url(#paperShadowL)"
          />

          {/* Quilled Spirals on Left Cloud Formations */}
          {/* Spiral 1 (Top Left) */}
          <g className="quill-coil quill-l1" transform="translate(140, 100)">
            <circle cx="30" cy="30" r="26" fill="#142756" stroke="#3A64A8" strokeWidth="2" />
            <path
              d="M 30,6 A 24,24 0 0,1 54,30 A 21,21 0 0,1 32,51 A 18,18 0 0,1 12,32 A 15,15 0 0,1 30,17 A 12,12 0 0,1 42,30 A 9,9 0 0,1 31,39 A 6,6 0 0,1 25,30 A 3,3 0 0,1 30,27"
              fill="none"
              stroke="#7AA6E0"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <circle cx="30" cy="30" r="4" fill="#0D1836" stroke="#F5D88C" strokeWidth="1.5" />
          </g>

          {/* Spiral 2 (Mid Left) */}
          <g className="quill-coil quill-l2" transform="translate(170, 240)">
            <circle cx="35" cy="35" r="32" fill="#1E3875" stroke="#4878C2" strokeWidth="2.5" />
            <path
              d="M 35,5 A 30,30 0 0,1 65,35 A 26,26 0 0,1 37,61 A 22,22 0 0,1 13,37 A 18,18 0 0,1 35,19 A 14,14 0 0,1 49,35 A 10,10 0 0,1 36,45 A 6,6 0 0,1 29,35 A 3,3 0 0,1 35,32"
              fill="none"
              stroke="#98BEEB"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="35" cy="35" r="5" fill="#142654" stroke="#FFE8A3" strokeWidth="2" />
          </g>

          {/* Spiral 3 (Lower Left) */}
          <g className="quill-coil quill-l3" transform="translate(130, 420)">
            <circle cx="28" cy="28" r="25" fill="#142756" stroke="#3A64A8" strokeWidth="2" />
            <path
              d="M 28,5 A 23,23 0 0,1 51,28 A 20,20 0 0,1 30,48 A 17,17 0 0,1 11,30 A 14,14 0 0,1 28,16 A 11,11 0 0,1 39,28 A 8,8 0 0,1 29,36 A 5,5 0 0,1 23,28"
              fill="none"
              stroke="#7AA6E0"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <circle cx="28" cy="28" r="3.5" fill="#0D1836" stroke="#F5D88C" strokeWidth="1.5" />
          </g>

          {/* Tier 3: Cerulean Paper Crest */}
          <path
            d="M-20,0 L120,0 Q180,40 140,110 Q200,160 160,230 Q210,310 150,390 Q190,480 130,650 L-20,650 Z"
            fill="#2B4D96"
            stroke="rgba(160, 200, 255, 0.3)"
            strokeWidth="1.5"
            filter="url(#paperShadowL)"
          />

          {/* Tier 4: Soft Periwinkle Fringe */}
          <path
            d="M-20,0 L70,0 Q120,40 90,100 Q140,150 100,210 Q140,280 90,360 L-20,650 Z"
            fill="#4F7BB8"
            opacity="0.85"
          />
        </svg>
      </div>

      {/* =========================================================
         LAYER E: Partially Hidden Golden Crescent Moon
         (Nestled between Layer D and Layer F on the right)
         ========================================================= */}
      <div className={`layer-e-paper-moon ${phase === 'settle' ? 'moon-peeking-out' : ''}`} aria-hidden="true">
        <svg viewBox="0 0 120 120" className="crescent-moon-svg">
          <defs>
            <radialGradient id="paperMoonGrad" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FFF9E6" />
              <stop offset="50%" stopColor="#FFE082" />
              <stop offset="100%" stopColor="#FFB74D" />
            </radialGradient>
            <filter id="moonGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          {/* Warm paper moon aura */}
          <circle cx="60" cy="60" r="54" fill="rgba(255, 224, 130, 0.25)" filter="url(#moonGlowFilter)" />
          {/* Layered cut-paper crescent */}
          <path
            d="M 75,15 C 42,15 22,42 22,65 C 22,88 42,105 75,105 C 55,98 42,84 42,65 C 42,46 55,22 75,15 Z"
            fill="url(#paperMoonGrad)"
            stroke="#5C4033"
            strokeWidth="2.5"
          />
          {/* Gentle sleeping smile */}
          <path
            d="M 44,58 C 47,62 52,62 55,58"
            fill="none"
            stroke="#5C4033"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* =========================================================
         LAYER D: Right-Side Cut-Paper Formations & Rolled Cloud Shapes
         ========================================================= */}
      <div className="layer-d-right-paper-clouds" aria-hidden="true">
        <svg viewBox="0 0 380 650" className="right-paper-cloud-svg">
          <defs>
            <filter id="paperShadowR" x="-10%" y="-10%" width="140%" height="140%">
              <feDropShadow dx="-6" dy="12" stdDeviation="10" floodColor="#060C1F" floodOpacity="0.75" />
            </filter>
          </defs>

          {/* Tier 1: Deep Navy Paper Base */}
          <path
            d="M400,0 L160,0 Q90,60 130,140 Q60,200 110,290 Q40,380 100,480 Q60,580 140,650 L400,650 Z"
            fill="#0F1C3F"
            filter="url(#paperShadowR)"
          />

          {/* Tier 2: Royal Blue Paper Layer (Embraces the Moon) */}
          <path
            d="M400,0 L200,0 Q140,50 180,120 Q120,180 160,260 Q110,340 170,430 Q130,520 200,650 L400,650 Z"
            fill="#1B336E"
            stroke="rgba(120, 160, 220, 0.2)"
            strokeWidth="1.5"
            filter="url(#paperShadowR)"
          />

          {/* Quilled Spirals on Right Cloud Formations */}
          {/* Spiral 1 (Upper Right) */}
          <g className="quill-coil quill-r1" transform="translate(180, 140)">
            <circle cx="32" cy="32" r="28" fill="#1E3875" stroke="#4878C2" strokeWidth="2.2" />
            <path
              d="M 32,5 A 27,27 0 0,1 59,32 A 23,23 0 0,1 34,55 A 19,19 0 0,1 13,34 A 15,15 0 0,1 32,17 A 11,11 0 0,1 43,32 A 8,8 0 0,1 33,40 A 5,5 0 0,1 27,32"
              fill="none"
              stroke="#98BEEB"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <circle cx="32" cy="32" r="4.5" fill="#142654" stroke="#FFE8A3" strokeWidth="2" />
          </g>

          {/* Spiral 2 (Lower Right) */}
          <g className="quill-coil quill-r2" transform="translate(140, 320)">
            <circle cx="36" cy="36" r="32" fill="#142756" stroke="#3A64A8" strokeWidth="2.5" />
            <path
              d="M 36,6 A 30,30 0 0,1 66,36 A 26,26 0 0,1 38,62 A 22,22 0 0,1 14,38 A 18,18 0 0,1 36,20 A 14,14 0 0,1 50,36 A 10,10 0 0,1 37,46 A 6,6 0 0,1 30,36 A 3,3 0 0,1 36,33"
              fill="none"
              stroke="#7AA6E0"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="36" cy="36" r="5" fill="#0D1836" stroke="#F5D88C" strokeWidth="2" />
          </g>

          {/* Tier 3: Cerulean Paper Crest */}
          <path
            d="M400,0 L260,0 Q200,40 240,110 Q180,160 220,230 Q170,310 230,390 Q190,480 250,650 L400,650 Z"
            fill="#2B4D96"
            stroke="rgba(160, 200, 255, 0.3)"
            strokeWidth="1.5"
            filter="url(#paperShadowR)"
          />

          {/* Tier 4: Slate Paper Fringe */}
          <path
            d="M400,0 L310,0 Q260,40 290,100 Q240,150 280,210 Q240,280 290,360 L400,650 Z"
            fill="#4F7BB8"
            opacity="0.85"
          />
        </svg>
      </div>

      {/* =========================================================
         LAYER F: Midground Clouds Framing Central Skylight
         ========================================================= */}
      <div className="layer-f-midground-clouds" aria-hidden="true">
        <svg viewBox="0 0 1200 300" className="midground-cloud-shelf-svg" preserveAspectRatio="none">
          <defs>
            <filter id="shelfShadow" x="0" y="-20%" width="100%" height="150%">
              <feDropShadow dx="0" dy="-8" stdDeviation="12" floodColor="#060C1F" floodOpacity="0.6" />
            </filter>
          </defs>
          <path
            d="M0,300 L0,180 Q140,110 320,150 Q500,80 680,140 Q860,90 1040,160 Q1140,130 1200,170 L1200,300 Z"
            fill="#1E3875"
            filter="url(#shelfShadow)"
          />
          <path
            d="M0,300 L0,210 Q180,150 400,180 Q620,130 820,175 Q1020,140 1200,195 L1200,300 Z"
            fill="#2D529E"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* =========================================================
         TOP CONTROLS BAR: Accessible & Uncluttered
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
         LAYERS G & H: Stage with Pip Cloud Cradle & Moving Stars
         ========================================================= */}
      <main className="theater-stage" ref={stageRef}>
        {/* Dynamic SVG Layer for Luminous Ribbon Comet Trails & Constellation */}
        <svg className="theater-trails-svg" aria-hidden="true">
          <defs>
            <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF9E6" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#FFD45A" stopOpacity="0.85" />
              <stop offset="85%" stopColor="#E6983B" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#A34063" stopOpacity="0" />
            </linearGradient>
            <filter id="ribbonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Golden Constellation Polygon */}
          <polygon
            ref={constLineRef}
            points="0,0 0,0 0,0"
            fill="none"
            className="constellation-polygon"
          />

          {/* Dynamic 60fps Comet Ribbon Paths */}
          <path ref={trail1Ref} d="" fill="none" className="comet-ribbon-path ribbon-1" />
          <path ref={trail2Ref} d="" fill="none" className="comet-ribbon-path ribbon-2" />
          <path ref={trail3Ref} d="" fill="none" className="comet-ribbon-path ribbon-3" />
        </svg>

        {/* =========================================================
           LAYER G: Pip Seated on Cloud inside Storybook Cloud Cradle
           ========================================================= */}
        <div className={`pip-storybook-cradle pip-motion-${pipMotion}`}>
          {/* Celestial Moonlit Aura */}
          <div className="cradle-celestial-aura" aria-hidden="true" />

          {/* SVG Definitions for Fairytale Multi-Lobed Cloud Mask */}
          <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
            <defs>
              <clipPath id="fairytaleCloudCluster" clipPathUnits="objectBoundingBox">
                <path d="M 0.22,0.12 C 0.12,0.14 0.04,0.25 0.04,0.38 C 0.01,0.50 0.06,0.62 0.10,0.72 C 0.05,0.82 0.14,0.92 0.26,0.95 C 0.36,0.98 0.64,0.98 0.74,0.95 C 0.86,0.92 0.95,0.82 0.90,0.72 C 0.95,0.62 0.99,0.50 0.96,0.38 C 0.96,0.25 0.88,0.14 0.78,0.12 C 0.70,0.05 0.58,0.03 0.50,0.05 C 0.42,0.03 0.30,0.05 0.22,0.12 Z" />
              </clipPath>
            </defs>
          </svg>

          {/* Paper-Craft Cloud Backing Shell */}
          <div className="cradle-cloud-backdrop" aria-hidden="true">
            <svg viewBox="0 0 340 380" className="cloud-backdrop-svg">
              <path
                d="M40,240 C20,180 60,110 130,100 C170,50 250,60 280,120 C330,140 340,210 310,260 C330,300 290,360 220,360 C170,370 120,360 80,340 C30,320 20,280 40,240 Z"
                fill="#FFF4E6"
                opacity="0.95"
              />
            </svg>
          </div>

          {/* Official Character Artwork (Untouched pixels, nestled inside Cloud Mask) */}
          <div className="cradle-character-wrap">
            <img
              src="/assets/pip/pip_avatar_cloud.png"
              alt="Pip, a friendly baby with a round skull face and starry nightcap, nestled safely in the midnight sky clouds."
              className="pip-character-asset"
              width="310"
              height="360"
            />
          </div>

          {/* Embroidered Paper-Cut Golden Rim */}
          <div className="cradle-cloud-rim" aria-hidden="true">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="cloud-rim-svg">
              <path
                d="M 22,12 C 12,14 4,25 4,38 C 1,50 6,62 10,72 C 5,82 14,92 26,95 C 36,98 64,98 74,95 C 86,92 95,82 90,72 C 95,62 99,50 96,38 C 96,25 88,14 78,12 C 70,5 58,3 50,5 C 42,3 30,5 22,12 Z"
                fill="none"
                stroke="#F5D88C"
                strokeWidth="2.5"
                strokeDasharray="5 4"
                opacity="0.9"
              />
            </svg>
          </div>

          {/* Layered Foreground Paper Puffs (Physical overlap cupping Pip's cloud) */}
          <div className="cradle-foreground-puffs" aria-hidden="true">
            <svg viewBox="0 0 340 100" className="foreground-puffs-svg">
              <path
                d="M20,60 C40,30 80,30 110,50 C140,20 190,20 220,45 C250,25 290,35 315,65 C320,80 300,95 270,95 L50,95 C25,95 10,80 20,60 Z"
                fill="#FAF1E2"
                stroke="#E2D5C3"
                strokeWidth="1.5"
              />
              <ellipse cx="110" cy="50" rx="32" ry="15" fill="#FFF9F0" />
              <ellipse cx="220" cy="46" rx="36" ry="17" fill="#FFF9F0" />
            </svg>
          </div>
        </div>

        {/* =========================================================
           LAYER H: The Three Major Animated Golden Stars
           ========================================================= */}
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
         LAYER I: Foreground Overlapping Blue Paper Clouds
         (Breathing/dancing with subtle vertical motion)
         ========================================================= */}
      <div className="layer-i-foreground-paper-clouds" aria-hidden="true">
        <svg viewBox="0 0 1440 240" className="foreground-paper-waves-svg" preserveAspectRatio="none">
          <defs>
            <filter id="fgWaveShadow" x="0" y="-30%" width="100%" height="160%">
              <feDropShadow dx="0" dy="-10" stdDeviation="14" floodColor="#040815" floodOpacity="0.8" />
            </filter>
          </defs>
          {/* Deep Navy Lower Paper Bank */}
          <path
            d="M0,240 L0,120 Q160,50 360,95 Q560,40 760,85 Q960,35 1160,80 Q1300,50 1440,90 L1440,240 Z"
            fill="#0E1938"
            filter="url(#fgWaveShadow)"
          />
          {/* Royal Blue Mid-Paper Bank */}
          <path
            d="M0,240 L0,150 Q180,90 420,130 Q660,75 900,120 Q1140,80 1440,125 L1440,240 Z"
            fill="#182E62"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1.5"
          />
          {/* Cerulean Wave Crest with Soft Quilled Details */}
          <path
            d="M0,240 L0,175 Q220,130 500,165 Q780,120 1060,155 Q1260,135 1440,160 L1440,240 Z"
            fill="#274688"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* =========================================================
         LAYER J: Dedicated Readable Cinematic Subtitle Plaque
         ========================================================= */}
      <footer className="layer-j-cinematic-subtitles">
        <div className="subtitle-card" aria-live="polite">
          <span className="subtitle-speaker">{subtitle.speaker}:</span>
          <p className="subtitle-text">{subtitle.text}</p>
        </div>
      </footer>
    </div>
  );
}
