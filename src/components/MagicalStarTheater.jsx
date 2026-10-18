import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  playVocalLullaby,
  stopAllOrchestraAudio,
  playFaahSound,
  playStarSound,
} from '../utils/soundEngine';
import './MagicalStarTheater.css';

/**
 * Pip's Magical Star Theater Component
 * PASS 01C.4: Fullscreen Animated Cinematic Experience
 * Choreographs:
 * 1. Scene 1 — Entering the Sky
 * 2. Scene 2 — Three-Star Entrance
 * 3. Scene 3 — The Magical Spiral & Constellation Hold
 * 4. Scene 4 — Animated Twinkle Twinkle Story (4 Sub-scenes A, B, C, D)
 * 5. Scene 5 — Grand Finale ("WOOHOO! You turned my bedroom into a STUDIO!")
 * 6. Scene 6 — Return to Bedroom & Achievement Trigger
 */
export default function MagicalStarTheater({
  isOpen = false,
  soundEnabled = false,
  onToggleSound,
  onCloseTheater,
  onTheaterComplete,
}) {
  // Cinematic phase state:
  // 'inactive' | 'entering' | 'star-arrival' | 'spiral' | 'spiral-hold' | 'performing' | 'celebrating' | 'exiting'
  const [phase, setPhase] = useState('inactive');
  const [pipMotion, setPipMotion] = useState('idle');
  const [dialogue, setDialogue] = useState(null);
  const [activeSubScene, setActiveSubScene] = useState('A'); // 'A' | 'B' | 'C' | 'D'
  const [progressPercent, setProgressPercent] = useState(0);
  const [statusCaption, setStatusCaption] = useState('Entering the midnight sky...');
  const [tapParticles, setTapParticles] = useState([]);

  // Responsive center stage dimensions for star orbits
  const [stageDimensions, setStageDimensions] = useState({ width: 800, height: 600 });
  const stageRef = useRef(null);
  const theaterTimersRef = useRef([]);
  const backBtnRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioStartedRef = useRef(false);

  // Clear all pending timers safely
  const clearTheaterTimers = useCallback(() => {
    theaterTimersRef.current.forEach((t) => clearTimeout(t));
    theaterTimersRef.current = [];
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Safe Exit Handler
  const handleExit = useCallback(() => {
    clearTheaterTimers();
    stopAllOrchestraAudio();
    setPhase('exiting');
    setTimeout(() => {
      setPhase('inactive');
      onCloseTheater();
    }, 1200);
  }, [clearTheaterTimers, onCloseTheater]);

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

  // Focus management
  useEffect(() => {
    if (isOpen) {
      backBtnRef.current?.focus();
    }
  }, [isOpen]);

  // Resize listener for responsive coordinates
  useEffect(() => {
    if (!isOpen) return;
    const updateSize = () => {
      if (stageRef.current) {
        const rect = stageRef.current.getBoundingClientRect();
        setStageDimensions({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [isOpen]);

  // Interactive Tap on Star during Theater
  const handleTapStar = (starIndex, e) => {
    e.stopPropagation();
    if (soundEnabled) {
      playStarSound(starIndex);
    }
    const id = Date.now() + Math.random();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const newParticles = [
      { id: id + '-1', x, y, dx: -24, dy: -28, symbol: '★' },
      { id: id + '-2', x, y, dx: 26, dy: -32, symbol: '✨' },
      { id: id + '-3', x, y, dx: 0, dy: -42, symbol: '✦' },
    ];
    setTapParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setTapParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
    }, 900);
  };

  /**
   * Main Choreographed Timeline Orchestrator
   */
  useEffect(() => {
    if (!isOpen) {
      clearTheaterTimers();
      stopAllOrchestraAudio();
      setPhase('inactive');
      audioStartedRef.current = false;
      return;
    }

    clearTheaterTimers();
    audioStartedRef.current = false;

    // --- SCENE 1: ENTERING THE SKY (0 to 2000ms) ---
    setPhase('entering');
    setPipMotion('looking-up');
    setDialogue({
      tag: '★ Pip in the midnight sky:',
      quote: '“Uh-oh... where did my bedroom go?!”',
    });
    setStatusCaption('Transforming bedroom into midnight sky...');
    setProgressPercent(5);

    // --- SCENE 2: THREE-STAR ENTRANCE (2000ms to 4500ms) ---
    const tStarArrival = setTimeout(() => {
      setPhase('star-arrival');
      setPipMotion('tilt-left');
      setDialogue({
        tag: '★ Three stars gather:',
        quote: '“Look! The stars followed us into the clouds!”',
      });
      setStatusCaption('Three bedtime stars arriving...');
      setProgressPercent(18);
    }, 2000);
    theaterTimersRef.current.push(tStarArrival);

    // --- SCENE 3: THE MAGICAL SPIRAL (4500ms to 7500ms) ---
    const tSpiral = setTimeout(() => {
      setPhase('spiral');
      setPipMotion('tilt-right');
      setDialogue({
        tag: '★ Pip marvels at the spiral:',
        quote: '“Whoa... did I just invent a galaxy?!”',
      });
      setStatusCaption('Stars weaving a celestial spiral...');
      setProgressPercent(32);
    }, 4500);
    theaterTimersRef.current.push(tSpiral);

    // --- SCENE 3 HOLD: CONSTELLATION FORMATION (7500ms to 9700ms) ---
    const tSpiralHold = setTimeout(() => {
      setPhase('spiral-hold');
      setPipMotion('looking-up');
      setStatusCaption('Constellation glowing softly...');
      setProgressPercent(45);
    }, 7500);
    theaterTimersRef.current.push(tSpiralHold);

    // --- SCENE 4: ANIMATED TWINKLE TWINKLE STORY (9700ms to 27150ms ~ 17.45s) ---
    const tPerforming = setTimeout(() => {
      setPhase('performing');
      setPipMotion('sway-song');
      setActiveSubScene('A');
      setDialogue({
        tag: '★ Twinkle Twinkle Lullaby:',
        quote: '“Twinkle, twinkle, little star... ♫”',
      });
      setStatusCaption('Pip’s Tiny Star Orchestra in concert...');
      setProgressPercent(50);

      // Start vocal lullaby audio
      audioStartedRef.current = true;
      playVocalLullaby({
        onEnded: () => {
          // If song audio ends naturally, proceed to finale
        },
      });

      // Sub-scene B: The Sky Responds (at +4.5s)
      const tSubB = setTimeout(() => {
        setActiveSubScene('B');
        setDialogue({
          tag: '★ The Sky Responds:',
          quote: '“How I wonder what you are... ♫”',
        });
        setProgressPercent(65);
      }, 4500);
      theaterTimersRef.current.push(tSubB);

      // Sub-scene C: The Constellation Dances (at +9.0s)
      const tSubC = setTimeout(() => {
        setActiveSubScene('C');
        setDialogue({
          tag: '★ The Constellation Dances:',
          quote: '“Up above the world so high... ♫”',
        });
        setProgressPercent(80);
      }, 9000);
      theaterTimersRef.current.push(tSubC);

      // Sub-scene D: The Whole Nursery Rests (at +13.5s)
      const tSubD = setTimeout(() => {
        setActiveSubScene('D');
        setPipMotion('drowsy');
        setDialogue({
          tag: '★ Midnight Nursery Wing A:',
          quote: '“Like a diamond in the sky... ♫”',
        });
        setStatusCaption('Nursery rooftop windows dimming softly...');
        setProgressPercent(92);
      }, 13500);
      theaterTimersRef.current.push(tSubD);

      // --- SCENE 5: GRAND FINALE (at 17.45s after start of song -> 27150ms total) ---
      const tFinale = setTimeout(() => {
        setPhase('celebrating');
        setPipMotion('celebrate-jump');
        playFaahSound(1.0);
        setDialogue({
          tag: '★ Pip celebrates joyfully:',
          quote: '“WOOHOO! You turned my bedroom into a STUDIO!”',
        });
        setStatusCaption('Standing ovation for Junior Dream Engineer Pip!');
        setProgressPercent(100);

        // --- SCENE 6: RETURN TO BEDROOM & POPUP TRIGGER (after 4.0s of celebration) ---
        const tReturn = setTimeout(() => {
          setPhase('exiting');
          setStatusCaption('Gently returning to bedroom...');

          const tComplete = setTimeout(() => {
            clearTheaterTimers();
            stopAllOrchestraAudio();
            setPhase('inactive');
            if (onTheaterComplete) {
              onTheaterComplete();
            }
          }, 1200);
          theaterTimersRef.current.push(tComplete);
        }, 4000);
        theaterTimersRef.current.push(tReturn);
      }, 17450); // Exact 17.45s song duration!
      theaterTimersRef.current.push(tFinale);
    }, 9700);
    theaterTimersRef.current.push(tPerforming);

    return () => {
      clearTheaterTimers();
      stopAllOrchestraAudio();
    };
  }, [isOpen, clearTheaterTimers, onTheaterComplete]);

  if (!isOpen && phase === 'inactive') {
    return null;
  }

  // Pre-calculated star constellation positions relative to center stage
  const R = Math.min(stageDimensions.width, stageDimensions.height) * 0.28;
  const star1Pos = { x: -R * 0.95, y: -R * 0.75 };
  const star2Pos = { x: R * 0.95, y: -R * 0.82 };
  const star3Pos = { x: 0, y: R * 0.95 };

  return (
    <div
      className={`magical-star-theater ${isOpen ? 'theater-active' : ''} phase-${phase}`}
      role="dialog"
      aria-modal="true"
      aria-label="Pip's Magical Star Theater"
    >
      {/* 1. Theater Navigation Top Bar */}
      <header className="theater-top-bar">
        <button
          type="button"
          ref={backBtnRef}
          className="theater-nav-btn back-bedroom-btn"
          onClick={handleExit}
          aria-label="Exit theater and return to bedroom"
          title="Return to bedroom (Esc)"
        >
          <span aria-hidden="true">←</span>
          <span>Back to Bedroom</span>
          <span className="esc-pill" aria-hidden="true">Esc</span>
        </button>

        <div className="theater-title-badge">
          <span className="theater-sparkle">★</span>
          <span>Pip’s Magical Star Theater</span>
          <span className="theater-sparkle">★</span>
        </div>

        <button
          type="button"
          className="theater-nav-btn sound-theater-btn"
          onClick={onToggleSound}
          aria-label={`Sound is currently ${soundEnabled ? 'ON' : 'OFF'}. Click to toggle.`}
          aria-pressed={soundEnabled}
        >
          <span>{soundEnabled ? '🔊 Sound: ON' : '🔈 Sound: OFF'}</span>
        </button>
      </header>

      {/* 2. Distant Twinkling Midnight Sky Layer */}
      <div className="theater-sky-layer" aria-hidden="true">
        {/* Procedural tiny background stars */}
        {[
          { t: 12, l: 15, s: 2, d: 2.8 },
          { t: 22, l: 82, s: 3, d: 3.5 },
          { t: 35, l: 8, s: 2, d: 2.2 },
          { t: 18, l: 45, s: 4, d: 4.1 },
          { t: 65, l: 88, s: 3, d: 3.0 },
          { t: 78, l: 14, s: 2, d: 2.5 },
          { t: 82, l: 75, s: 3, d: 3.8 },
          { t: 40, l: 92, s: 2, d: 2.6 },
          { t: 14, l: 68, s: 3, d: 3.2 },
          { t: 55, l: 5, s: 3, d: 4.0 },
          { t: 88, l: 35, s: 2, d: 2.1 },
        ].map((st, i) => (
          <div
            key={i}
            className="sky-star"
            style={{
              top: `${st.t}%`,
              left: `${st.l}%`,
              width: `${st.s}px`,
              height: `${st.s}px`,
              '--twinkle-dur': `${st.d}s`,
            }}
          />
        ))}

        {/* Ambient Smiling Theater Moon */}
        <div className={`theater-moon ${activeSubScene === 'B' ? 'moon-smiling' : ''}`}>
          <svg viewBox="0 0 60 60" width="100%" height="100%">
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
            {/* Gentle smile */}
            <path
              d="M26 27C27.5 29 29.5 29 31 27"
              fill="none"
              stroke="#5C4033"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Drifting Storybook Clouds (Scene 4B) */}
        <div className={`drifting-clouds-layer ${activeSubScene === 'B' || activeSubScene === 'C' ? 'clouds-visible' : ''}`}>
          <svg className="storybook-cloud cloud-drift-1" viewBox="0 0 200 60">
            <path d="M20,40 Q30,20 50,30 Q70,10 100,20 Q130,5 150,25 Q175,15 185,35 Q195,50 170,55 L20,55 Z" />
          </svg>
          <svg className="storybook-cloud cloud-drift-2" viewBox="0 0 220 70">
            <path d="M25,50 Q40,25 70,35 Q95,15 130,25 Q165,10 185,35 Q205,25 210,48 Q215,65 180,65 L25,65 Z" />
          </svg>
        </div>
      </div>

      {/* 3. Center Stage & Pip Dream Island */}
      <main className="theater-stage-center" ref={stageRef}>
        {/* Dialogue Bubble */}
        {dialogue && (
          <div className="theater-dialogue-wrap" aria-live="polite">
            <div className="theater-dialogue-box">
              <span className="theater-dialogue-tag">{dialogue.tag}</span>
              <span className="theater-dialogue-quote">{dialogue.quote}</span>
            </div>
            <div className="theater-dialogue-tail" aria-hidden="true" />
          </div>
        )}

        {/* Constellation SVG Lines & Spiral Motion Trails */}
        <svg className="theater-constellation-svg" aria-hidden="true">
          <defs>
            <linearGradient id="goldenTrailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF8F1" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#F5D88C" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#A34063" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Golden Constellation Lines (Triangle between the 3 stars) */}
          <polygon
            points={`
              ${stageDimensions.width / 2 + star1Pos.x},${stageDimensions.height / 2 + star1Pos.y}
              ${stageDimensions.width / 2 + star2Pos.x},${stageDimensions.height / 2 + star2Pos.y}
              ${stageDimensions.width / 2 + star3Pos.x},${stageDimensions.height / 2 + star3Pos.y}
            `}
            fill="none"
            className={`constellation-line ${
              phase === 'spiral-hold' || activeSubScene === 'C' ? 'lines-visible' : ''
            }`}
          />

          {/* Spiral Motion Trails */}
          {(phase === 'spiral' || phase === 'spiral-hold') && (
            <ellipse
              cx={stageDimensions.width / 2}
              cy={stageDimensions.height / 2}
              rx={R * 1.05}
              ry={R * 0.85}
              className={`constellation-trail ${phase === 'spiral' ? 'trail-active' : 'trail-fading'}`}
              transform={`rotate(-15, ${stageDimensions.width / 2}, ${stageDimensions.height / 2})`}
            />
          )}
        </svg>

        {/* Pip's Dream Cloud Vignette:
            Preserves official artwork faithfully inside a warm, soft, glowing cloud island */}
        <div className={`pip-dream-island pip-${pipMotion}`}>
          <div className="cloud-island-aura" aria-hidden="true" />
          <div className="cloud-island-mask">
            <img
              src="/assets/pip/pip_avatar_cloud.png"
              alt="Pip, a friendly baby with a round skull face and starry nightcap, floating peacefully in the midnight sky theater."
              className="pip-official-character"
              width="310"
              height="360"
            />
          </div>
        </div>

        {/* The Three Choreographed Stars */}
        {phase !== 'inactive' && phase !== 'entering' && (
          <>
            {/* Star 1 */}
            <button
              type="button"
              className={`theater-star-node star-node-1 ${activeSubScene === 'A' || activeSubScene === 'C' ? 'star-pulsing' : ''}`}
              style={{
                transform:
                  phase === 'star-arrival'
                    ? `translate(${stageDimensions.width / 2 - 280}px, ${stageDimensions.height / 2 - 40}px)`
                    : phase === 'spiral'
                    ? `translate(${stageDimensions.width / 2 + star2Pos.x}px, ${stageDimensions.height / 2 + star2Pos.y}px)`
                    : `translate(${stageDimensions.width / 2 + star1Pos.x}px, ${stageDimensions.height / 2 + star1Pos.y}px)`,
              }}
              onClick={(e) => handleTapStar(0, e)}
              aria-label="Star 1: Click to trigger gentle twinkle chime"
              title="Click star to hear a bedtime chime!"
            >
              <svg viewBox="0 0 24 24" fill="#F5D88C" stroke="#5C4033" strokeWidth="1.5">
                <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
              </svg>
            </button>

            {/* Star 2 */}
            <button
              type="button"
              className={`theater-star-node star-node-2 ${activeSubScene === 'B' || activeSubScene === 'C' ? 'star-pulsing' : ''}`}
              style={{
                transform:
                  phase === 'star-arrival'
                    ? `translate(${stageDimensions.width / 2 + 10}px, ${stageDimensions.height / 2 - 220}px)`
                    : phase === 'spiral'
                    ? `translate(${stageDimensions.width / 2 + star3Pos.x}px, ${stageDimensions.height / 2 + star3Pos.y}px)`
                    : `translate(${stageDimensions.width / 2 + star2Pos.x}px, ${stageDimensions.height / 2 + star2Pos.y}px)`,
              }}
              onClick={(e) => handleTapStar(1, e)}
              aria-label="Star 2: Click to trigger gentle twinkle chime"
              title="Click star to hear a bedtime chime!"
            >
              <svg viewBox="0 0 24 24" fill="#F5D88C" stroke="#5C4033" strokeWidth="1.5">
                <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
              </svg>
            </button>

            {/* Star 3 */}
            <button
              type="button"
              className={`theater-star-node star-node-3 ${activeSubScene === 'C' ? 'star-pulsing' : ''}`}
              style={{
                transform:
                  phase === 'star-arrival'
                    ? `translate(${stageDimensions.width / 2 + 280}px, ${stageDimensions.height / 2 + 30}px)`
                    : phase === 'spiral'
                    ? `translate(${stageDimensions.width / 2 + star1Pos.x}px, ${stageDimensions.height / 2 + star1Pos.y}px)`
                    : `translate(${stageDimensions.width / 2 + star3Pos.x}px, ${stageDimensions.height / 2 + star3Pos.y}px)`,
              }}
              onClick={(e) => handleTapStar(2, e)}
              aria-label="Star 3: Click to trigger gentle twinkle chime"
              title="Click star to hear a bedtime chime!"
            >
              <svg viewBox="0 0 24 24" fill="#F5D88C" stroke="#5C4033" strokeWidth="1.5">
                <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
              </svg>
            </button>
          </>
        )}

        {/* Floating Musical Notes during Scene 4C */}
        {activeSubScene === 'C' && (
          <div className="theater-notes-layer" aria-hidden="true">
            <span className="theater-float-note" style={{ top: '40%', left: '30%', '--note-dx': '-35px' }}>♪</span>
            <span className="theater-float-note" style={{ top: '35%', right: '32%', animationDelay: '1.2s', '--note-dx': '40px' }}>♫</span>
            <span className="theater-float-note" style={{ top: '65%', left: '48%', animationDelay: '2.4s', '--note-dx': '15px' }}>♩</span>
          </div>
        )}

        {/* Interactive Tap Sparkle Particles */}
        {tapParticles.map((tp) => (
          <span
            key={tp.id}
            className="theater-tap-particle"
            style={{
              left: `${tp.x}px`,
              top: `${tp.y}px`,
              '--p-dx': `${tp.dx}px`,
              '--p-dy': `${tp.dy}px`,
            }}
            aria-hidden="true"
          >
            {tp.symbol}
          </span>
        ))}

        {/* Celebratory Starburst Rays (Scene 5 Finale) */}
        {phase === 'celebrating' && (
          <div className="theater-celebration-burst" aria-hidden="true">
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
              <div
                key={i}
                className="celebration-ray"
                style={{
                  '--ray-rot': `${deg}deg`,
                  animationDelay: `${(i % 3) * 0.15}s`,
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* 4. Scene 4D: Distant Nursery Rooftop Silhouette */}
      <div
        className={`theater-horizon-silhouette ${activeSubScene === 'D' || phase === 'celebrating' ? 'silhouette-visible' : ''}`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="nursery-roofline-svg">
          {/* Midnight nursery silhouette with sleepy rooftops */}
          <path
            d="M0,120 L0,70 L80,50 L120,70 L240,65 L280,45 L340,65 L460,75 L520,35 L580,75 L700,60 L760,40 L820,60 L940,70 L1000,45 L1060,70 L1200,65 L1200,120 Z"
            fill="#17172B"
          />
          {/* Warm bedroom windows that dim as bedtime nears */}
          <rect
            x="290"
            y="52"
            width="14"
            height="10"
            rx="2"
            className={`roof-window-light ${activeSubScene === 'D' ? 'light-dimmed' : ''}`}
          />
          <rect
            x="530"
            y="42"
            width="16"
            height="12"
            rx="2"
            className={`roof-window-light ${activeSubScene === 'D' ? 'light-dimmed' : ''}`}
          />
          <rect
            x="770"
            y="48"
            width="14"
            height="10"
            rx="2"
            className={`roof-window-light ${activeSubScene === 'D' ? 'light-dimmed' : ''}`}
          />
        </svg>
      </div>

      {/* 5. Theater Bottom Progress Status Bar */}
      <footer className="theater-bottom-status">
        <div className="theater-progress-track" role="progressbar" aria-valuenow={progressPercent} aria-valuemin="0" aria-valuemax="100">
          <div className="theater-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <span className="theater-status-caption">{statusCaption}</span>
      </footer>
    </div>
  );
}
