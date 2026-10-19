import React, { useEffect, useState, useRef, useCallback } from 'react';
import { OfficialPip } from './OfficialArt';
import { theaterStarPoses } from './theaterMotion';
import {
  playVocalLullaby,
  playTheaterNarration,
  stopTheaterNarration,
  preloadTheaterNarration,
  stopAllOrchestraAudio,
  playFaahSound,
  playStarSound,
} from '../utils/soundEngine';
import './MagicalStarTheater.css';
import './TheaterDirector.css';

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
  const completionRef = useRef(onTheaterComplete);
  completionRef.current = onTheaterComplete;
  // Cinematic phase state:
  // 'curtain' (0-2s) | 'star1-enter' (2-2.8s) | 'stars23-enter' (2.8-4.5s) | 'spiral' (4.5-7.5s) | 'settle' (7.5-10s) | 'performing' (10s+) | 'celebrating' | 'exiting'
  const [phase, setPhase] = useState('inactive');
  const [pipMotion, setPipMotion] = useState('idle');
  // Pip's cute thought-cloud popup emerging from Pip's head (Problem 2)
  const [pipThought, setPipThought] = useState({ text: '“Uh-oh... where did my bedroom go?!”', visible: true });
  // Bottom subtitle plaque reserved strictly for narration and song lyrics (Problem 2)
  const [subtitle, setSubtitle] = useState(null);
  const [activeSubScene, setActiveSubScene] = useState('A');
  const [curtainsOpen, setCurtainsOpen] = useState(false);
  const [narrationEnabled, setNarrationEnabled] = useState(true);
  const [tappedStar, setTappedStar] = useState(null);
  const tapTimer = useRef(null);
  useEffect(() => {if(isOpen && soundEnabled) preloadTheaterNarration();}, [isOpen, soundEnabled]);
  useEffect(() => {
    if(isOpen && soundEnabled && narrationEnabled && subtitle?.audio) playTheaterNarration(subtitle.audio);
    else stopTheaterNarration();
    return stopTheaterNarration;
  }, [isOpen, soundEnabled, narrationEnabled, subtitle?.audio]);
  useEffect(() => () => clearTimeout(tapTimer.current), []);

  // References
  const stageRef = useRef(null);
  const stageSizeRef = useRef({width:1200,height:700});
  useEffect(()=>{if(!isOpen||!stageRef.current)return;const observer=new ResizeObserver(([entry])=>{stageSizeRef.current={width:entry.contentRect.width,height:entry.contentRect.height};});observer.observe(stageRef.current);return()=>observer.disconnect();},[isOpen]);
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

  // Glitter & sprinkler particle refs (Problem 4)
  const glitterPoolRef = useRef([]);
  const glitterDiamondsRef = useRef(null);
  const glitterSpecksRef = useRef(null);

  // Coordinate history buffers for trailing comet ribbons
  const history1 = useRef([]);
  const history2 = useRef([]);
  const history3 = useRef([]);

  // Clear all pending timers safely
  const clearAllTimers = useCallback(() => {
    theaterTimersRef.current.forEach((t) => clearTimeout(t));
    theaterTimersRef.current = [];
    if (pipTapTimeoutRef.current) {
      clearTimeout(pipTapTimeoutRef.current);
      pipTapTimeoutRef.current = null;
    }
    if (pipThoughtRestoreTimeoutRef.current) {
      clearTimeout(pipThoughtRestoreTimeoutRef.current);
      pipThoughtRestoreTimeoutRef.current = null;
    }
    if (rAFRef.current) {
      cancelAnimationFrame(rAFRef.current);
      rAFRef.current = null;
    }
    glitterPoolRef.current = [];
    if (glitterDiamondsRef.current) glitterDiamondsRef.current.setAttribute('d', '');
    if (glitterSpecksRef.current) glitterSpecksRef.current.setAttribute('d', '');
  }, []);

  // Safe Exit Handler
  const handleExit = useCallback(() => {
    clearAllTimers();
    stopAllOrchestraAudio();
    setSubtitle(null);
    audioStartedRef.current = false;
    setPhase('exiting');
    const exitTimer = setTimeout(() => {
      setCurtainsOpen(false);
      onCloseTheater();
    }, 750);
    theaterTimersRef.current.push(exitTimer);
  }, [clearAllTimers, onCloseTheater]);

  // Keyboard Escape Handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); handleExit(); }
      if (e.key === 'Tab') {
        const items = [...document.querySelectorAll('.magical-star-theater button:not(:disabled), .magical-star-theater [tabindex="0"]')].filter(el => el.getClientRects().length && getComputedStyle(el).opacity !== '0');
        const index = items.indexOf(document.activeElement);
        if (e.shiftKey && index <= 0) { e.preventDefault(); items.at(-1)?.focus(); }
        else if (!e.shiftKey && (index === items.length - 1 || index === -1)) { e.preventDefault(); items[0]?.focus(); }
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
   * Continuous Cinematic Star Trajectory & Glitter Spray Engine (60fps rAF)
   * Math-driven graceful flight paths, tangent banking, and stardust particle spray.
   */
  const updateStarPositions = useCallback((elapsedSec, width, height) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const [p1,p2,p3] = theaterStarPoses(elapsedSec,width,height,reduced);
    if (star1Ref.current) {
      star1Ref.current.tabIndex = p1.visible ? 0 : -1;
      star1Ref.current.style.opacity = p1.visible ? '1' : '0';
      star1Ref.current.style.transform = `translate(${p1.x - 36}px, ${p1.y - 44}px) rotate(${p1.rot.toFixed(1)}deg) scale(${p1.scale.toFixed(2)})`;
    }
    if (star2Ref.current) {
      star2Ref.current.tabIndex = p2.visible ? 0 : -1;
      star2Ref.current.style.opacity = p2.visible ? '1' : '0';
      star2Ref.current.style.transform = `translate(${p2.x - 36}px, ${p2.y - 44}px) rotate(${p2.rot.toFixed(1)}deg) scale(${p2.scale.toFixed(2)})`;
    }
    if (star3Ref.current) {
      star3Ref.current.tabIndex = p3.visible ? 0 : -1;
      star3Ref.current.style.opacity = p3.visible ? '1' : '0';
      star3Ref.current.style.transform = `translate(${p3.x - 36}px, ${p3.y - 44}px) rotate(${p3.rot.toFixed(1)}deg) scale(${p3.scale.toFixed(2)})`;
    }

    // Coordinate history buffers for luminous ribbon trails
    if (p1.visible) {
      history1.current.push({ x: p1.x, y: p1.y });
      if (history1.current.length > 24) history1.current.shift();
    }
    if (p2.visible) {
      history2.current.push({ x: p2.x, y: p2.y });
      if (history2.current.length > 24) history2.current.shift();
    }
    if (p3.visible) {
      history3.current.push({ x: p3.x, y: p3.y });
      if (history3.current.length > 24) history3.current.shift();
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

    // --- GLITTER / SPRINKLER / SPARKLING DUST SPRAY (Pass 01C.4C) ---
    // Golden stardust particles during opening, Scene 1 rhythm blooms, and Scene 4 diamond shower
    const activeStars = [p1, p2, p3].filter((p) => p.visible);
    const isSpraying =
      (elapsedSec >= 2.0 && elapsedSec < 7.8) ||
      (elapsedSec >= 10.0 && elapsedSec < 14.2 && Math.sin(elapsedSec * 4) > 0.6) ||
      (elapsedSec >= 24.2 && elapsedSec < 29.8);

    if (isSpraying && !reduced) {
      const spawnCount = (elapsedSec >= 4.5 && elapsedSec < 7.5) || elapsedSec >= 24.2 ? 2 : 1;
      activeStars.forEach((star) => {
        if (glitterPoolRef.current.length < 95) {
          for (let s = 0; s < spawnCount; s++) {
            const sprayAngle = Math.random() * Math.PI * 2;
            const spraySpeed = 0.6 + Math.random() * 2.6;
            glitterPoolRef.current.push({
              x: star.x + (Math.random() - 0.5) * 14,
              y: star.y + (Math.random() - 0.5) * 14,
              vx: Math.cos(sprayAngle) * spraySpeed,
              vy: Math.sin(sprayAngle) * spraySpeed,
              size: 2.2 + Math.random() * 4.5,
              life: 1.0,
              decay: 0.022 + Math.random() * 0.030, // ~0.6s - 0.9s lifespan
              isDiamond: Math.random() > 0.4,
            });
          }
        }
      });
    }

    // Update particle physics and build SVG path commands
    let diamondPaths = '';
    let speckPaths = '';
    const survivingParticles = [];

    for (let i = 0; i < glitterPoolRef.current.length; i++) {
      const pt = glitterPoolRef.current[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.vx *= 0.95; // subtle aerodynamic drag
      pt.vy *= 0.95;
      pt.life -= pt.decay;

      if (pt.life > 0) {
        survivingParticles.push(pt);
        const r = pt.size * (0.35 + pt.life * 0.65);
        if (pt.isDiamond) {
          // 4-point diamond sparkle
          diamondPaths += `M ${pt.x.toFixed(1)} ${(pt.y - r).toFixed(1)} L ${(pt.x + r * 0.35).toFixed(1)} ${pt.y.toFixed(1)} L ${pt.x.toFixed(1)} ${(pt.y + r).toFixed(1)} L ${(pt.x - r * 0.35).toFixed(1)} ${pt.y.toFixed(1)} Z `;
        } else {
          // Stardust cross/speck
          speckPaths += `M ${(pt.x - r * 0.5).toFixed(1)} ${pt.y.toFixed(1)} L ${(pt.x + r * 0.5).toFixed(1)} ${pt.y.toFixed(1)} M ${pt.x.toFixed(1)} ${(pt.y - r * 0.5).toFixed(1)} L ${pt.x.toFixed(1)} ${(pt.y + r * 0.5).toFixed(1)} `;
        }
      }
    }
    glitterPoolRef.current = survivingParticles;

    if (glitterDiamondsRef.current) {
      glitterDiamondsRef.current.setAttribute('d', diamondPaths);
    }
    if (glitterSpecksRef.current) {
      glitterSpecksRef.current.setAttribute('d', speckPaths);
    }

    // Constellation lines form between the three settled stars
    if (constLineRef.current && elapsedSec >= 7.8) {
      let lineOpacity = Math.min(1, (elapsedSec - 7.8) / 1.0);
      if (elapsedSec >= 14.5 && elapsedSec < 19.0) {
        lineOpacity = 0.3; // softened during Question-Mark constellation
      } else if (elapsedSec >= 24.0) {
        lineOpacity = 0; // Diamond component renders its own complete 4-point constellation!
      }
      constLineRef.current.style.opacity = lineOpacity.toString();
      constLineRef.current.setAttribute(
        'points',
        `${p1.x.toFixed(1)},${p1.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)} ${p3.x.toFixed(1)},${p3.y.toFixed(1)}`
      );
    } else if (constLineRef.current) {
      constLineRef.current.style.opacity = '0';
    }
  }, []);

  const [pipTapAnim, setPipTapAnim] = useState(null);
  const pipTapTimeoutRef = useRef(null);
  const pipThoughtRestoreTimeoutRef = useRef(null);
  const soundEnabledRef = useRef(soundEnabled);
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  /**
   * PASS 01C.4C — TASK A: Gentle Pip Interaction
   * Clicking Pip during theater NEVER skips the lullaby or triggers premature finale!
   * During intro: small surprised bounce.
   * During vocal singing: adorable listening reaction ("Shhh... I'm listening!"), song continues uninterrupted.
   */
  const handlePipTap = useCallback(() => {
    if (phase === 'celebrating' || phase === 'exiting' || phase === 'inactive') return;

    if (pipTapTimeoutRef.current) clearTimeout(pipTapTimeoutRef.current);
    if (pipThoughtRestoreTimeoutRef.current) clearTimeout(pipThoughtRestoreTimeoutRef.current);

    if (phase === 'performing') {
      // Tiny adorable listening reaction: song continues completely uninterrupted!
      setPipTapAnim('listening');
      setPipThought({ text: '“Shhh... I’m listening! ♫”', visible: true });

      pipTapTimeoutRef.current = setTimeout(() => {
        setPipTapAnim(null);
      }, 1200);

      // Hide thought cloud after brief listen so lyrics remain the star
      pipThoughtRestoreTimeoutRef.current = setTimeout(() => {
        setPipThought({ text: '', visible: false });
      }, 2400);
    } else {
      // Intro / earlier scenes: small surprised bounce, timeline continues uninterrupted!
      setPipTapAnim('bounce');
      pipTapTimeoutRef.current = setTimeout(() => {
        setPipTapAnim(null);
      }, 600);
    }
  }, [phase]);

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
    glitterPoolRef.current = [];

    // --- 0.0s to 2.0s: SCENE A (Paper Sky Opens) ---
    // Pip reaction appears as cute thought-cloud popup near Pip's head (Problem 2)
    setPhase('curtain');
    setActiveSubScene('A');
    setTappedStar(null);
    setPipMotion('looking-up');
    setPipThought({ text: '“Uh-oh... where did my bedroom go?!”', visible: true });
    setSubtitle({ speaker: 'The Night Sky', text: 'Tonight, three stars found Pip.', audio: 'arrival' });

    const tCurtains = setTimeout(() => {
      setCurtainsOpen(true);
    }, 120);
    theaterTimersRef.current.push(tCurtains);

    // --- 2.0s to 3.8s: SCENE B (Star 1 Enters from Left) ---
    const tSceneB = setTimeout(() => {
      setPhase('star1-enter');
      setPipMotion('tilt-left');
      if (soundEnabledRef.current) playStarSound(0);
      setPipThought({ text: '“Look! The stars followed us into the sky!”', visible: true });
    }, 2000);
    theaterTimersRef.current.push(tSceneB);

    // --- 2.8s to 4.5s: SCENE C (Stars 2 & 3 Enter) ---
    const tSceneC1 = setTimeout(() => {
      setSubtitle({speaker:'The Night Sky',text:'They had a tiny wish.',audio:'wish'});
      setPhase('stars23-enter');
      setPipMotion('tilt-right');
      if (soundEnabledRef.current) playStarSound(1);
    }, 2800);
    theaterTimersRef.current.push(tSceneC1);

    const tSceneC2 = setTimeout(() => {
      if (soundEnabledRef.current) playStarSound(2);
      setPipMotion('looking-up');
    }, 3600);
    theaterTimersRef.current.push(tSceneC2);

    // Briefly tuck away thought cloud before the grand spiral
    const tHideThought = setTimeout(() => {
      setPipThought({ text: '', visible: false });
    }, 4000);
    theaterTimersRef.current.push(tHideThought);

    // --- 4.5s to 7.5s: SCENE D (The Choreographed Spiral Dance & Glitter Spray) ---
    const tSceneD = setTimeout(() => {
      setPhase('spiral');
      setPipMotion('spiral-dance');
      setPipThought({ text: '', visible: false });
      // Bottom subtitle strictly reserved for cosmic narration (Problem 2)
      setSubtitle({ speaker: 'The Night Sky', text: 'Teach the whole sky to sing.', audio: 'dance' });
    }, 4600);
    theaterTimersRef.current.push(tSceneD);

    // --- 7.5s to 10.0s: SCENE E (The Stars Settle into Constellation) ---
    const tSceneE = setTimeout(() => {
      setPhase('settle');
      setPipMotion('looking-up');
      setSubtitle({speaker:'The Night Sky',text:'And then, a lullaby.',audio:'listen'});
      // Pip reaction thought cloud pops up (Problem 2)
      setPipThought({ text: '“Whoa... did I just invent a galaxy?!”', visible: true });
    }, 7500);
    theaterTimersRef.current.push(tSceneE);

    // Anticipation cue at 9.5s
    const tMusicCue = setTimeout(() => {
      setPipThought({ text: '“Wait... are they singing?!”', visible: true });
    }, 9500);
    theaterTimersRef.current.push(tMusicCue);

    // --- 10.0s+: SCENE F (Lullaby Concert Begins with twinkle_vocal_short_v2.mp3) ---
    // Audio starts strictly from the beginning "Twinkle, twinkle, little star..." (Problem 1)
    const tSceneF = setTimeout(() => {
      setPhase('performing');
      setPipMotion('sway-song');
      setActiveSubScene('A');
      setPipThought({ text: '', visible: false });
      setSubtitle({ speaker: 'Lullaby', text: '♫ “Twinkle, twinkle, little star...” ♫' });

      audioStartedRef.current = true;
      if (soundEnabledRef.current) {
        playVocalLullaby({
          onEnded: () => {
            // Handled on completion
          },
        });
      }

      // Synchronized lyrical subtitles & storybook scene changes matching the 20.0s musical phrases
      // SCENE 2 (4.5s into song = 14.5s overall): "How I wonder what you are"
      const tSubB = setTimeout(() => {
        setActiveSubScene('B');
        setPipMotion('curious-look');
        setSubtitle({ speaker: 'Lullaby', text: '♫ “How I wonder what you are...” ♫' });
      }, 4500);
      theaterTimersRef.current.push(tSubB);

      // SCENE 3 (9.0s into song = 19.0s overall): "Up above the world so high"
      const tSubC = setTimeout(() => {
        setActiveSubScene('C');
        setPipMotion('looking-down');
        setSubtitle({ speaker: 'Lullaby', text: '♫ “Up above the world so high...” ♫' });
      }, 9000);
      theaterTimersRef.current.push(tSubC);

      // SCENE 4 (14.0s into song = 24.0s overall): "Like a diamond in the sky"
      const tSubD = setTimeout(() => {
        setActiveSubScene('D');
        setPipMotion('drowsy');
        setSubtitle({ speaker: 'Lullaby', text: '♫ “Like a diamond in the sky...” ♫' });
      }, 14000);
      theaterTimersRef.current.push(tSubD);

      // GRAND FINALE (20.00s song end = 30.0s overall)
      const tFinale = setTimeout(() => {
        // Breathless stillness pause (250ms) before the grand celebration!
        setPhase('pause-stillness');
        setSubtitle(null);

        const tGrandCeleb = setTimeout(() => {
          setPhase('celebrating');
          setPipMotion('celebrate-jump');
          setSubtitle({speaker:'The Night Sky',text:'And one small room became a sky full of friends.',audio:'goodnight'});
          setPipThought({ text: '“WOOHOO! You turned my bedroom into a STUDIO!”', visible: true });

          const tReturn = setTimeout(() => {
            setPhase('exiting');
            const tComplete = setTimeout(() => {
              clearAllTimers();
              stopAllOrchestraAudio();
              setPhase('inactive');
              completionRef.current?.();
            }, 1000);
            theaterTimersRef.current.push(tComplete);
          }, 4500);
          theaterTimersRef.current.push(tReturn);
        }, 250);
        theaterTimersRef.current.push(tGrandCeleb);
      }, 20000);
      theaterTimersRef.current.push(tFinale);
    }, 10000);
    theaterTimersRef.current.push(tSceneF);

    // Start 60fps rAF loop
    startTimeRef.current = performance.now();
    const tick = (now) => {
      const elapsedSec = (now - startTimeRef.current) / 1000;
      if (stageRef.current) {
        const rect = stageSizeRef.current;
        updateStarPositions(elapsedSec, rect.width, rect.height);
      }
      rAFRef.current = requestAnimationFrame(tick);
    };
    rAFRef.current = requestAnimationFrame(tick);

    return () => {
      clearAllTimers();
      stopAllOrchestraAudio();
    };
  }, [isOpen, clearAllTimers, updateStarPositions]);

  // Interactive star click during theater
  const handleTapStar = (starIndex, e) => {
    e.stopPropagation();
    setTappedStar(starIndex);
    clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => setTappedStar(null), 900);
    if (soundEnabled) {
      playStarSound(starIndex);
    }
  };

  if (!isOpen && phase === 'inactive') return null;

  return (
    <div
      className={`magical-star-theater theater-active phase-${phase} subscene-${activeSubScene || 'none'} ${tappedStar !== null ? 'star-answered' : ''}`}
      data-tapped-star={tappedStar}
      role="dialog"
      aria-modal="true"
      aria-label="Pip's Magical Star Theater Film"
    >
      {/* =========================================================
         LAYER A: Deep Midnight Paper Sky (#08102B -> #182E62)
         ========================================================= */}
      <div className="layer-a-midnight-sky" aria-hidden="true">
        <div className="theater-atmosphere"/>
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
        <svg viewBox="0 0 380 650" preserveAspectRatio="none" className="left-paper-cloud-svg">
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
        <svg viewBox="0 0 380 650" preserveAspectRatio="none" className="right-paper-cloud-svg">
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
      <main className="theater-stage" ref={stageRef} onPointerMove={e=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const r=e.currentTarget.getBoundingClientRect();e.currentTarget.style.setProperty('--conduct-x',((e.clientX-r.left)/r.width*100)+'%');e.currentTarget.style.setProperty('--conduct-y',((e.clientY-r.top)/r.height*100)+'%');}}>
        <div className="theater-conductor-light" aria-hidden="true"/>
        <div className="theater-story-chapter" aria-hidden="true"><span>{phase==='performing'?({A:'01 · A LITTLE WONDER',B:'02 · A QUESTION FOR THE SKY',C:'03 · ABOVE THE SLEEPING WORLD',D:'04 · A POCKET FULL OF LIGHT'}[activeSubScene]):phase==='celebrating'?'FINALE · A SKY FULL OF FRIENDS':'PROLOGUE · THREE STARS, ONE WISH'}</span></div>
        {/* Dynamic SVG Layer for Luminous Ribbon Comet Trails, Constellation & Glitter Spray */}
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

          {/* Glitter / Sprinkler Dust Spray Paths (Problem 4) */}
          <path ref={glitterDiamondsRef} d="" className="glitter-spray-diamonds" />
          <path ref={glitterSpecksRef} d="" className="glitter-spray-specks" />
        </svg>

        {/* =========================================================
           LAYER G: Pip Seated on Cloud inside Storybook Cloud Cradle
           ========================================================= */}
        <div className={`pip-storybook-cradle pip-motion-${pipMotion} ${pipTapAnim ? `pip-tap-${pipTapAnim}` : ''}`}>
          {/* Celestial Moonlit Aura */}
          <div className="cradle-celestial-aura" aria-hidden="true" />

          {/* Pip's Storybook Thought Cloud (Problem 2) */}
          {pipThought && pipThought.visible && (
            <div className="pip-thought-cloud-wrapper" aria-live="polite">
              <div className="thought-cloud-bubble">
                <span className="thought-cloud-star" aria-hidden="true">✦</span>
                <p className="thought-cloud-text">{pipThought.text}</p>
                <svg className="thought-cloud-svg" viewBox="0 0 280 160" preserveAspectRatio="none" aria-hidden="true">
                  <defs>
                    <filter id="thoughtPaperShadow" x="-20%" y="-20%" width="140%" height="150%">
                      <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#04081c" floodOpacity="0.4" />
                      <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#04081c" floodOpacity="0.25" />
                    </filter>
                  </defs>
                  <path
                    d="M 60,135 C 40,135 25,120 25,100 C 10,95 5,80 10,65 C 12,45 28,32 45,35 C 52,18 70,8 90,12 C 105,5 125,5 140,14 C 155,5 175,5 190,12 C 210,8 228,18 235,35 C 252,32 268,45 270,65 C 275,80 270,95 255,100 C 255,120 240,135 220,135 C 200,142 180,138 170,132 C 155,140 125,140 110,132 C 100,138 80,142 60,135 Z"
                    fill="#FAF3E6"
                    stroke="#F2DFBC"
                    strokeWidth="2.5"
                    filter="url(#thoughtPaperShadow)"
                  />
                  <path
                    d="M 65,130 C 48,130 32,118 32,100 C 18,95 14,82 18,68 C 20,50 34,38 48,40 C 55,25 72,16 88,18 C 102,12 122,12 140,19 C 158,12 178,12 192,18 C 208,16 225,25 232,40 C 246,38 260,50 262,68 C 266,82 262,95 248,100 C 248,118 232,130 215,130 Z"
                    fill="#FFFDF8"
                    opacity="0.8"
                  />
                </svg>
              </div>
              <div className="thought-trail-dots" aria-hidden="true">
                <div className="thought-dot dot-1" />
                <div className="thought-dot dot-2" />
                <div className="thought-dot dot-3" />
              </div>
            </div>
          )}

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
          <div
            className="cradle-character-wrap"
            onClick={handlePipTap}
            style={{ cursor: 'pointer' }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handlePipTap();
              }
            }}
            aria-label="Pip resting in starry cloud. Click to interact."
          >
            <OfficialPip className="pip-character-asset" />
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
          <img className="star-sprite-img production-star-1" src="/assets/optimized/production-art/sprites/orchestra_star_1.webp" alt="" />
          <span className="star-glow-halo" aria-hidden="true" />
        </button>

        <button
          ref={star2Ref}
          type="button"
          className="cinematic-star-node star-node-2"
          onClick={(e) => handleTapStar(1, e)}
          aria-label="Star 2: Click to hear bedtime chime"
        >
          <img className="star-sprite-img production-star-2" src="/assets/optimized/production-art/sprites/orchestra_star_2.webp" alt="" />
          <span className="star-glow-halo" aria-hidden="true" />
        </button>

        <button
          ref={star3Ref}
          type="button"
          className="cinematic-star-node star-node-3"
          onClick={(e) => handleTapStar(2, e)}
          aria-label="Star 3: Click to hear bedtime chime"
        >
          <img className="star-sprite-img production-star-3" src="/assets/optimized/production-art/sprites/orchestra_star_3.webp" alt="" />
          <span className="star-glow-halo" aria-hidden="true" />
        </button>

        {/* =========================================================
           SCENE 2: The Curious Sky — Question-Mark Constellation
           ========================================================= */}
        <div
          className={`scene-storybook-question-mark ${
            activeSubScene === 'B' ? 'is-visible' : ''
          }`}
          aria-hidden="true"
        >
          <svg viewBox="0 0 160 200" className="question-mark-svg">
            <defs>
              <filter id="questionStarlight" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#FFD700" floodOpacity="0.85" />
              </filter>
            </defs>
            {/* Golden Constellation Line */}
            <path
              d="M 36,55 C 42,22 118,18 124,58 C 126,88 92,98 84,120"
              fill="none"
              stroke="#FFE082"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              filter="url(#questionStarlight)"
              className="question-constellation-curve"
            />
            {/* 5 Constellation Golden Stars */}
            <g className="question-stars-group">
              <circle cx="36" cy="55" r="5" fill="#FFFDE7" stroke="#FFD700" strokeWidth="1.5" />
              <circle cx="80" cy="22" r="6" fill="#FFF8E7" stroke="#FFA726" strokeWidth="1.5" />
              <circle cx="124" cy="58" r="5.5" fill="#FFFDE7" stroke="#FFD700" strokeWidth="1.5" />
              <circle cx="84" cy="120" r="5" fill="#FFFDE7" stroke="#FFD700" strokeWidth="1.5" />
              {/* Distinct Question Mark Dot */}
              <circle cx="84" cy="155" r="7" fill="#FFE082" stroke="#FF9800" strokeWidth="2" filter="url(#questionStarlight)" />
            </g>
          </svg>
        </div>

        {/* =========================================================
           SCENE 2: Miniature Paper-Craft Telescope Unfolding
           ========================================================= */}
        <div
          className={`scene-storybook-telescope ${
            activeSubScene === 'B' ? 'is-visible' : ''
          }`}
          aria-hidden="true"
        >
          <svg viewBox="0 0 140 180" className="telescope-svg">
            {/* Paper Tripod Stand */}
            <path d="M 70,115 L 25,175 M 70,115 L 115,175 M 70,115 L 70,172" stroke="#8C6832" strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="70" cy="115" r="7" fill="#E6AF2E" stroke="#5C4033" strokeWidth="1.5" />
            {/* Telescope Barrel Assembly tilted toward the stars */}
            <g className="telescope-barrel-group">
              <rect x="52" y="88" width="46" height="24" rx="3" fill="#D4AF37" stroke="#5C4033" strokeWidth="1.5" />
              <rect x="36" y="72" width="40" height="20" rx="2" fill="#FAF0D7" stroke="#8C6832" strokeWidth="1.5" />
              <rect x="20" y="58" width="34" height="16" rx="2" fill="#E8D3A2" stroke="#5C4033" strokeWidth="1.5" />
              {/* Ocular Brass Lens */}
              <ellipse cx="20" cy="66" rx="5" ry="9" fill="#FFF9D2" stroke="#FFD700" strokeWidth="1.5" />
              {/* Soft celestial flare rays */}
              <line x1="16" y1="66" x2="-8" y2="48" stroke="#FFF7C2" strokeWidth="2" strokeDasharray="3 3" opacity="0.85" />
              <line x1="16" y1="62" x2="-6" y2="38" stroke="#FFE082" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.75" />
            </g>
          </svg>
        </div>

        {/* =========================================================
           SCENE 4: "Like a diamond in the sky" — Brilliant Diamond Constellation
           ========================================================= */}
        <div
          className={`scene-storybook-diamond ${
            activeSubScene === 'D' ? 'is-visible' : ''
          }`}
          aria-hidden="true"
        >
          <svg viewBox="0 0 460 460" className="diamond-constellation-svg">
            <defs>
              <linearGradient id="diamondEdgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="40%" stopColor="#FFF2A3" stopOpacity="0.95" />
                <stop offset="70%" stopColor="#FFD700" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
              </linearGradient>
              <filter id="diamondGlowFilter" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#FFD700" floodOpacity="0.85" />
                <feDropShadow dx="0" dy="0" stdDeviation="16" floodColor="#FFE082" floodOpacity="0.5" />
              </filter>
            </defs>
            {/* Outer Diamond Rhombus Perimeter */}
            <polygon
              points="230,35 390,205 230,375 70,205"
              fill="rgba(255, 248, 225, 0.08)"
              stroke="url(#diamondEdgeGrad)"
              strokeWidth="3.5"
              filter="url(#diamondGlowFilter)"
              className="diamond-perimeter-line"
            />
            {/* Internal Facet Cross Struts */}
            <line x1="230" y1="35" x2="230" y2="375" stroke="#FFFDE7" strokeWidth="2" strokeDasharray="5 4" opacity="0.85" />
            <line x1="70" y1="205" x2="390" y2="205" stroke="#FFFDE7" strokeWidth="2" strokeDasharray="5 4" opacity="0.85" />
            {/* Inner Facet Gem Core */}
            <polygon
              points="230,120 310,205 230,290 150,205"
              fill="rgba(255, 215, 0, 0.12)"
              stroke="#FFE57F"
              strokeWidth="2"
              className="diamond-facet-core"
            />
            {/* Radiant Top Apex Star (4th vertex) */}
            <g transform="translate(230, 35)" className="diamond-apex-node">
              <circle cx="0" cy="0" r="16" fill="rgba(255, 235, 59, 0.35)" />
              <polygon points="0,-16 4,-5 15,-5 7,2 10,13 0,7 -10,13 -7,2 -15,-5 -4,-5" fill="#FFFDE7" stroke="#FFD700" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="4" fill="#FFFFFF" />
            </g>
          </svg>
        </div>
      </main>

      {/* =========================================================
         SCENE 3: "Up above the world so high" — Sleeping Paper Village
         (Inspired directly by Reference 3 with rooftops & glowing amber windows)
         ========================================================= */}
      <div
        className={`scene-storybook-village ${
          activeSubScene === 'C' ? 'is-visible' : ''
        }`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 1200 240" preserveAspectRatio="none" className="village-svg">
          <defs>
            <filter id="villageWindowGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#FFB703" floodOpacity="0.85" />
            </filter>
          </defs>
          {/* Distant Hills */}
          <path d="M 0,240 L 0,165 Q 240,125 480,155 Q 720,120 960,150 Q 1100,130 1200,155 L 1200,240 Z" fill="#0A1329" />
          {/* Tree Cutouts */}
          <polygon points="120,165 135,135 150,165" fill="#070E1E" />
          <polygon points="140,170 155,140 170,170" fill="#070E1E" />
          <polygon points="980,155 995,125 1010,155" fill="#070E1E" />
          <polygon points="1005,160 1020,130 1035,160" fill="#070E1E" />

          {/* Cottage 1 (Left) */}
          <polygon points="190,185 235,135 280,185" fill="#122144" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <rect x="200" y="185" width="70" height="50" fill="#14264E" />
          <rect x="215" y="195" width="16" height="20" rx="2" fill="#FFD54F" filter="url(#villageWindowGlow)" className="village-window win-1" />
          <rect x="242" y="195" width="16" height="20" rx="2" fill="#FFD54F" filter="url(#villageWindowGlow)" className="village-window win-2" />
          <rect x="260" y="130" width="10" height="25" fill="#122144" />
          <path d="M 265,128 Q 272,112 268,98 Q 260,85 268,75" fill="none" stroke="#FAF3E6" strokeWidth="2" opacity="0.6" className="chimney-smoke-wisp smoke-1" />

          {/* Steeple / Bell Tower (Center-Left) */}
          <polygon points="380,175 405,65 430,175" fill="#182E62" stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
          <rect x="385" y="175" width="40" height="60" fill="#14264E" />
          <circle cx="405" cy="125" r="10" fill="#FFE082" filter="url(#villageWindowGlow)" className="village-window win-clock" />
          <path d="M 405,55 L 405,65 M 400,60 L 410,60" stroke="#FFD700" strokeWidth="2" />

          {/* Cottage 2 (Center) */}
          <polygon points="500,185 550,130 600,185" fill="#122144" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <rect x="510" y="185" width="80" height="50" fill="#162A54" />
          <rect x="525" y="196" width="18" height="22" rx="2" fill="#FFA726" filter="url(#villageWindowGlow)" className="village-window win-3" />
          <rect x="560" y="196" width="18" height="22" rx="2" fill="#FFA726" filter="url(#villageWindowGlow)" className="village-window win-4" />
          <rect x="580" y="122" width="12" height="30" fill="#101C38" />
          <path d="M 586,120 Q 594,104 590,90 Q 584,76 592,66" fill="none" stroke="#FAF3E6" strokeWidth="2" opacity="0.6" className="chimney-smoke-wisp smoke-2" />

          {/* Cottage 3 (Right Cluster) */}
          <polygon points="700,185 750,142 800,185" fill="#15274E" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <rect x="710" y="185" width="80" height="50" fill="#101E3D" />
          <rect x="725" y="195" width="16" height="20" rx="2" fill="#FFD54F" filter="url(#villageWindowGlow)" className="village-window win-5" />
          <rect x="758" y="195" width="16" height="20" rx="2" fill="#FFD54F" filter="url(#villageWindowGlow)" className="village-window win-6" />

          {/* Little Cottage (Far Right) */}
          <polygon points="850,190 885,155 920,190" fill="#122144" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <rect x="860" y="190" width="50" height="45" fill="#14264E" />
          <rect x="875" y="200" width="14" height="18" rx="2" fill="#FFA726" filter="url(#villageWindowGlow)" className="village-window win-7" />

          {/* Street Lantern Post */}
          <path d="M 460,230 L 460,185 Q 460,177 468,177 L 472,177" fill="none" stroke="#8C6832" strokeWidth="2.5" />
          <polygon points="470,177 474,183 466,183" fill="#FFD700" />
          <circle cx="470" cy="187" r="5" fill="#FFE082" filter="url(#villageWindowGlow)" />
          <ellipse cx="470" cy="230" rx="26" ry="8" fill="rgba(255, 215, 0, 0.28)" />
        </svg>
      </div>

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
         (Strictly reserved for Narration and Song Lyrics - Problem 2)
         ========================================================= */}
        <footer className="layer-j-cinematic-subtitles">
          <div className="subtitle-card" aria-live="polite">
            {subtitle?.speaker && <span className="subtitle-speaker">{subtitle.speaker}:</span>}
            <p className="subtitle-text">{subtitle?.text || '\u00a0'}</p>
            <div className="theater-caption-tools"><button type="button" aria-pressed={narrationEnabled} onClick={()=>setNarrationEnabled(v=>!v)}>Narration {narrationEnabled?'on':'off'}</button><span>{tappedStar!==null?'A little note, just from you.':'Touch a star. Add your note.'}</span></div>
          </div>
        </footer>
    </div>
  );
}

