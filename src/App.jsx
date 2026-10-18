import React, { useState, useRef, useEffect, useCallback } from 'react';
import RetroBrowserFrame from './components/RetroBrowserFrame';
import HeroSection from './components/HeroSection';
import {
  setSoundEnabled as updateSoundEngine,
  isSoundEnabled,
  playPsstSound,
  playPipPokeSound,
  playStarSound,
  playMoonSound,
  playTabSound,
  playPanicSound,
  playTwinkleMelody,
  stopTwinkleMelody,
  playFaahSound,
} from './utils/soundEngine';
import './App.css';

/**
 * 5 Distinct, Funny, Canonical Pip Bedtime Reactions (Pass 01B)
 */
export const PIP_REACTIONS = [
  {
    id: 'psst-panic',
    quote: '“Shhh! I’m trying to put a WEBSITE to sleep!”',
    whisperTag: '★ Pip whispers loudly:',
    status: 'PIP IS PANICKING (politely)',
    overlay: 'sweat',
    animationClass: 'anim-wiggle',
    srText: 'Pip whispers loudly: Shhh! I’m trying to put a WEBSITE to sleep! Status: Pip is panicking politely.',
  },
  {
    id: 'css-grid',
    quote: '“Careful! If you tap too hard, the CSS grid will wake up!”',
    whisperTag: '★ Pip giggles nervously:',
    status: 'PIP IS TIP-TOEING (carefully)',
    overlay: 'warning',
    animationClass: 'anim-hop',
    srText: 'Pip warns: Careful! If you tap too hard, the CSS grid will wake up! Status: Pip is tip-toeing carefully.',
  },
  {
    id: 'warm-milk',
    quote: '“I accidentally spilled warm milk on the bedtime database...”',
    whisperTag: '★ Pip confesses sleepily:',
    status: 'PIP IS CLEANING UP (with a tiny sponge)',
    overlay: 'milk',
    animationClass: 'anim-squash',
    srText: 'Pip confesses: I accidentally spilled warm milk on the bedtime database. Status: Pip is cleaning up with a tiny sponge.',
  },
  {
    id: 'contagious-yawn',
    quote: '“Yawwwn... *faaahhh*... wait! Don’t look at me, yawns are contagious across HTTP!”',
    whisperTag: '★ Pip yawns dramatically:',
    status: 'PIP IS YAWNING (100% contagious)',
    overlay: 'zzz',
    animationClass: 'anim-drift',
    srText: 'Pip yawns faaahhh... wait! Don’t look at me, yawns are contagious across HTTP! Status: Pip is yawning.',
  },
  {
    id: 'moonbeam-pr',
    quote: '“Has anyone reviewed my bedtime pull request? The moon is waiting!”',
    whisperTag: '★ Pip inspects the stars:',
    status: 'PIP IS CODE-REVIEWING (dreamy)',
    overlay: 'stars',
    animationClass: 'anim-tilt',
    srText: 'Pip asks: Has anyone reviewed my bedtime pull request? The moon is waiting! Status: Pip is code-reviewing.',
  },
];

/**
 * Pip's Tiny Star Orchestra Finale Dialogue Reactions (Pass 01C)
 */
export const ORCHESTRA_REACTIONS = [
  {
    id: 'orchestra-band',
    quote: '“Wait... did you just turn my stars into a band?!”',
    whisperTag: '★ Pip gasps in disbelief:',
    status: 'PIP IS DUMBFOUNDED (in a musical way)',
    overlay: 'stars',
    animationClass: 'anim-tilt',
    srText: 'Pip gasps in disbelief: Wait... did you just turn my stars into a band?!',
  },
  {
    id: 'orchestra-hand',
    quote: '“My first website has its own orchestra. This is getting out of hand... *faaahhh*”',
    whisperTag: '★ Pip sighs softly:',
    status: 'PIP IS IMPRESSED (and sleepy)',
    overlay: 'zzz',
    animationClass: 'anim-drift',
    srText: 'Pip sighs softly: My first website has its own orchestra. This is getting out of hand... faaahhh.',
  },
];

/**
 * App Root Component
 * haX.baby Hackathon submission — Track 1: Pip the Skull Baby
 * Pass 01C: Pip's Tiny Star Orchestra
 */
export default function App() {
  // Navigation tabs: 'bedroom' | 'log' | 'blueprint'
  const [activeTab, setActiveTab] = useState('bedroom');

  // Sound switch: Default OFF until visitor opts in
  const [soundOn, setSoundOn] = useState(false);

  // Cozy Nightlight Mode
  const [isNightlight, setIsNightlight] = useState(false);

  // Pip reaction states
  const [isPanicking, setIsPanicking] = useState(false);
  const [showDialogue, setShowDialogue] = useState(false);
  const [reactionIndex, setReactionIndex] = useState(0);

  // Pass 01C: Star Orchestra States
  // orchestraState: 'idle' | 'collecting' | 'performing' | 'reacting' | 'returning'
  const [collectedStars, setCollectedStars] = useState([]);
  const [orchestraState, setOrchestraState] = useState('idle');
  const [activeSoundingStar, setActiveSoundingStar] = useState(null);
  const [orchestraReactionIndex, setOrchestraReactionIndex] = useState(null);

  // Live accessibility announcements
  const [srAnnouncement, setSrAnnouncement] = useState('');

  const panicTimerRef = useRef(null);
  const orchestraTimersRef = useRef([]);

  const clearOrchestraTimers = useCallback(() => {
    orchestraTimersRef.current.forEach((t) => clearTimeout(t));
    orchestraTimersRef.current = [];
  }, []);

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      if (panicTimerRef.current) {
        clearTimeout(panicTimerRef.current);
      }
      stopTwinkleMelody();
      clearOrchestraTimers();
    };
  }, [clearOrchestraTimers]);

  /**
   * Sound Toggle Switch
   */
  const handleToggleSound = useCallback(() => {
    setSoundOn((prev) => {
      const next = !prev;
      updateSoundEngine(next);
      if (next) {
        // Welcome chime upon enabling sound
        playStarSound(0);
        setSrAnnouncement('Sound effects enabled.');
      } else {
        setSrAnnouncement('Sound effects muted.');
      }
      return next;
    });
  }, []);

  /**
   * Tab Selection Handler
   */
  const handleSelectTab = useCallback(
    (tabId) => {
      playTabSound();
      setActiveTab(tabId);
      setSrAnnouncement(
        `Switched to tab: ${
          tabId === 'bedroom'
            ? 'Pip Bedroom'
            : tabId === 'log'
            ? 'Midnight Nursery Log'
            : 'Dream Blueprints'
        }`
      );

      // If user switches away from bedroom, safely halt any active orchestra melody
      if (tabId !== 'bedroom') {
        stopTwinkleMelody();
        clearOrchestraTimers();
        setCollectedStars([]);
        setOrchestraState('idle');
        setActiveSoundingStar(null);
        setOrchestraReactionIndex(null);
        setIsPanicking(false);
        setShowDialogue(false);
      }
    },
    [clearOrchestraTimers]
  );

  /**
   * Interactive Moon Toggle (Nightlight Mode)
   */
  const handleToggleMoon = useCallback(() => {
    setIsNightlight((prev) => {
      const next = !prev;
      playMoonSound(next);
      setSrAnnouncement(
        next
          ? 'Cozy bedtime nightlight turned ON.'
          : 'Switched back to warm nursery daytime.'
      );
      return next;
    });
  }, []);

  /**
   * Primary Interaction: 'Psst, Pip?'
   * Triggers signature reaction 0 (panicking politely), preserving Pass 01 behavior.
   */
  const handlePsst = useCallback(() => {
    if (orchestraState === 'performing' || orchestraState === 'returning') {
      return;
    }

    if (panicTimerRef.current) {
      clearTimeout(panicTimerRef.current);
      panicTimerRef.current = null;
    }

    playPsstSound();
    playPanicSound();

    setOrchestraReactionIndex(null);
    setReactionIndex(0);
    setIsPanicking(false);
    setShowDialogue(false);

    requestAnimationFrame(() => {
      setIsPanicking(true);
      setShowDialogue(true);
      setSrAnnouncement(PIP_REACTIONS[0].srText);

      panicTimerRef.current = setTimeout(() => {
        setIsPanicking(false);
        setShowDialogue(false);
        setSrAnnouncement('Bedtime status returned to wide awake.');
        panicTimerRef.current = null;
      }, 4500);
    });
  }, [orchestraState]);

  /**
   * Direct Pip Poke Interaction
   * Cycles sequentially through all 5 funny personality reactions.
   */
  const handlePokePip = useCallback(() => {
    if (orchestraState === 'performing' || orchestraState === 'returning') {
      return;
    }

    if (panicTimerRef.current) {
      clearTimeout(panicTimerRef.current);
      panicTimerRef.current = null;
    }

    setOrchestraReactionIndex(null);
    setReactionIndex((prev) => {
      const nextIndex = (prev + 1) % PIP_REACTIONS.length;
      playPipPokeSound(nextIndex);

      setIsPanicking(false);
      setShowDialogue(false);

      requestAnimationFrame(() => {
        setIsPanicking(true);
        setShowDialogue(true);
        setSrAnnouncement(PIP_REACTIONS[nextIndex].srText);

        panicTimerRef.current = setTimeout(() => {
          setIsPanicking(false);
          setShowDialogue(false);
          setSrAnnouncement('Bedtime status returned to wide awake.');
          panicTimerRef.current = null;
        }, 4500);
      });

      return nextIndex;
    });
  }, [orchestraState]);

  /**
   * Pass 01C: Pip's Tiny Star Orchestra Interaction
   * Visitors collect 3 interactive stars. When the 3rd star is gathered,
   * the stars assemble into an orbital concert playing Twinkle Twinkle Little Star.
   */
  const handleStarClick = useCallback(
    (starId) => {
      // Disallow clicks during active performance or return sequence
      if (
        orchestraState === 'performing' ||
        orchestraState === 'reacting' ||
        orchestraState === 'returning'
      ) {
        return;
      }

      // Disallow duplicate collection of the same star
      if (collectedStars.includes(starId)) {
        return;
      }

      const nextCollected = [...collectedStars, starId];
      setCollectedStars(nextCollected);

      if (nextCollected.length < 3) {
        // Phase B — Collecting (Stars 1 & 2)
        setOrchestraState('collecting');
        playStarSound(starId - 1);
        setSrAnnouncement(
          `Tickled star #${starId}. It joined orbit around Pip! (${nextCollected.length} of 3 stars gathered).`
        );
      } else {
        // Phase D — The Musical Surprise! 3rd Star completes the orchestra
        setOrchestraState('performing');
        playStarSound(starId - 1);
        setSrAnnouncement(
          "All 3 stars assembled! Pip's Tiny Star Orchestra is now playing Twinkle Twinkle Little Star in orbit."
        );

        if (panicTimerRef.current) {
          clearTimeout(panicTimerRef.current);
          panicTimerRef.current = null;
        }
        setIsPanicking(false);
        setShowDialogue(false);
        setOrchestraReactionIndex(null);

        // Start bounded musical Twinkle Twinkle sequence (~11.2s)
        playTwinkleMelody({
          onNoteStart: (noteIndex, noteStarId) => {
            setActiveSoundingStar(noteStarId);
            const pulseTimer = setTimeout(() => {
              setActiveSoundingStar((curr) => (curr === noteStarId ? null : curr));
            }, 450);
            orchestraTimersRef.current.push(pulseTimer);
          },
          onComplete: () => {
            setActiveSoundingStar(null);
            setOrchestraState('reacting');

            // Phase E — Pip Reacts
            // Part 1: Disbelief
            setOrchestraReactionIndex(0);
            setIsPanicking(true);
            setShowDialogue(true);
            setSrAnnouncement(ORCHESTRA_REACTIONS[0].srText);

            // Part 2: Impressed & Sleepy sigh after 3.6s
            const part2Timer = setTimeout(() => {
              setOrchestraReactionIndex(1);
              playFaahSound(1.0); // Exact uploaded faaahhh audio!
              setSrAnnouncement(ORCHESTRA_REACTIONS[1].srText);

              // Phase F — Return & Replay after 3.8s
              const returnTimer = setTimeout(() => {
                setOrchestraState('returning');
                setIsPanicking(false);
                setShowDialogue(false);
                setOrchestraReactionIndex(null);
                setSrAnnouncement(
                  'The stars gently glide back to their bedside positions. Ready to play again!'
                );

                // Reset to idle once return flight finishes (~1100ms)
                const resetTimer = setTimeout(() => {
                  setCollectedStars([]);
                  setOrchestraState('idle');
                  clearOrchestraTimers();
                }, 1100);
                orchestraTimersRef.current.push(resetTimer);
              }, 3800);
              orchestraTimersRef.current.push(returnTimer);
            }, 3600);
            orchestraTimersRef.current.push(part2Timer);
          },
        });
      }
    },
    [collectedStars, orchestraState, clearOrchestraTimers]
  );

  /**
   * Dismiss Dialogue
   */
  const handleDismissDialogue = useCallback(() => {
    if (panicTimerRef.current) {
      clearTimeout(panicTimerRef.current);
      panicTimerRef.current = null;
    }
    setIsPanicking(false);
    setShowDialogue(false);
    setOrchestraReactionIndex(null);
  }, []);

  const currentReaction =
    orchestraReactionIndex !== null
      ? ORCHESTRA_REACTIONS[orchestraReactionIndex]
      : PIP_REACTIONS[reactionIndex];

  return (
    <div className={`app-shell ${isNightlight ? 'shell-nightlight' : ''}`}>
      {/* Skip to Main Content Link */}
      <a href="#main-content" className="skip-link">
        Skip to bedtime website
      </a>

      {/* Screen Reader Live Region */}
      <div aria-live="polite" className="sr-only">
        {srAnnouncement}
      </div>

      {/* Background Storybook Ambience Accents */}
      <div className="storybook-ambience" aria-hidden="true">
        <span className="ambient-star amb-star-1">✦</span>
        <span className="ambient-star amb-star-2">✦</span>
        <span className="ambient-star amb-star-3">✦</span>
        <span className="ambient-star amb-star-4">✦</span>
        <span className="ambient-star amb-star-5">✦</span>
      </div>

      {/* Miniature Fictional Website in Retro Scrapbook Browser Frame */}
      <RetroBrowserFrame
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        soundEnabled={soundOn}
        onToggleSound={handleToggleSound}
        isNightlight={isNightlight}
      >
        <HeroSection
          isPanicking={isPanicking}
          showDialogue={showDialogue}
          currentReaction={currentReaction}
          onPsst={handlePsst}
          onPokePip={handlePokePip}
          onDismissDialogue={handleDismissDialogue}
          isNightlight={isNightlight}
          onToggleMoon={handleToggleMoon}
          onStarClick={handleStarClick}
          collectedStars={collectedStars}
          orchestraState={orchestraState}
          activeSoundingStar={activeSoundingStar}
        />
      </RetroBrowserFrame>
    </div>
  );
}
