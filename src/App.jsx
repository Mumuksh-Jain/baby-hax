import React, { useState, useRef, useEffect, useCallback } from 'react';
import RetroBrowserFrame from './components/RetroBrowserFrame';
import HeroSection from './components/HeroSection';
import {
  setSoundEnabled as updateSoundEngine,
  isSoundEnabled,
  playPsstSound,
  playPipPokeSound,
  playStarSound,
  playStarTwoChime,
  playMoonSound,
  playTabSound,
  playPanicSound,
  playVocalLullaby,
  stopAllOrchestraAudio,
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
 * Pip's Star Orchestra Reactions & Dialogue (PASS 01C.1 & 01C.2)
 */
export const STAR_COLLECTION_REACTIONS = {
  star1: {
    id: 'star-1-collected',
    quote: '“One little star? For me?”',
    whisperTag: '★ Pip blinks in surprise:',
    status: 'BEDTIME ORCHESTRA: 1/3 (One star for Pip!)',
    overlay: 'stars',
    animationClass: '',
    srText: 'Pip blinks in surprise: One little star? For me? 1 of 3 stars gathered.',
  },
  star2: {
    id: 'star-2-collected',
    quote: '“Wait... are you starting a band?!”',
    whisperTag: '★ Pip listens closely:',
    status: 'BEDTIME ORCHESTRA: 2/3 (Two stars in orbit!)',
    overlay: 'stars',
    animationClass: '',
    srText: 'Pip listens closely: Wait... are you starting a band?! 2 of 3 stars gathered.',
  },
  performing: {
    id: 'star-3-singing',
    quote: '“Wait... they’re singing?!”',
    whisperTag: '★ Pip is in awe:',
    status: 'BEDTIME ORCHESTRA: 3/3 (Vocal Lullaby Playing ♫)',
    overlay: 'stars',
    animationClass: '',
    srText: 'Pip is in awe: Wait... they’re singing?! All 3 stars assembled in vocal lullaby.',
  },
  finale: {
    id: 'orchestra-finale',
    quote: '“Wow! You turned my bedroom into a studio!”',
    whisperTag: '★ Pip celebrates joyfully:',
    status: 'BEDTIME ORCHESTRA: FINALE! (Pip is amazed)',
    overlay: 'stars',
    animationClass: '',
    srText: 'Pip celebrates joyfully: Wow! You turned my bedroom into a studio!',
  },
};

/**
 * App Root Component
 * haX.baby Hackathon submission — Track 1: Pip the Skull Baby
 * Pass 01C.1 & 01C.2: Vocal Lullaby & Pip Puppet Motion
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

  // Pass 01C.1 & 01C.2: Star Orchestra & Pip Motion States
  // orchestraState: 'idle' | 'collecting' | 'performing' | 'celebrating' | 'returning'
  const [collectedStars, setCollectedStars] = useState([]);
  const [orchestraState, setOrchestraState] = useState('idle');
  const [activeSoundingStar, setActiveSoundingStar] = useState(null);

  // pipMotionState: 'idle' | 'surprised' | 'curious' | 'listening' | 'celebrating'
  const [pipMotionState, setPipMotionState] = useState('idle');

  // Custom reaction override (for Star 1, 2, 3, and Finale)
  const [customReaction, setCustomReaction] = useState(null);

  // Live accessibility announcements
  const [srAnnouncement, setSrAnnouncement] = useState('');

  const panicTimerRef = useRef(null);
  const orchestraTimersRef = useRef([]);
  const starPulseIntervalRef = useRef(null);
  const pipMotionTimerRef = useRef(null);
  const dialogueTimerRef = useRef(null);

  const clearPipMotionTimer = useCallback(() => {
    if (pipMotionTimerRef.current) {
      clearTimeout(pipMotionTimerRef.current);
      pipMotionTimerRef.current = null;
    }
  }, []);

  const clearDialogueTimer = useCallback(() => {
    if (dialogueTimerRef.current) {
      clearTimeout(dialogueTimerRef.current);
      dialogueTimerRef.current = null;
    }
  }, []);

  const clearOrchestraTimers = useCallback(() => {
    orchestraTimersRef.current.forEach((t) => clearTimeout(t));
    orchestraTimersRef.current = [];
    if (starPulseIntervalRef.current) {
      clearInterval(starPulseIntervalRef.current);
      starPulseIntervalRef.current = null;
    }
    clearPipMotionTimer();
    clearDialogueTimer();
  }, [clearPipMotionTimer, clearDialogueTimer]);

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      if (panicTimerRef.current) {
        clearTimeout(panicTimerRef.current);
      }
      stopAllOrchestraAudio();
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

      // If visitor switches away from bedroom, safely stop any vocal singing or synthesized music
      if (tabId !== 'bedroom') {
        stopAllOrchestraAudio();
        clearOrchestraTimers();
        setCollectedStars([]);
        setOrchestraState('idle');
        setPipMotionState('idle');
        setActiveSoundingStar(null);
        setCustomReaction(null);
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
   */
  const handlePsst = useCallback(() => {
    if (
      orchestraState === 'performing' ||
      orchestraState === 'celebrating' ||
      orchestraState === 'returning'
    ) {
      return;
    }

    if (panicTimerRef.current) {
      clearTimeout(panicTimerRef.current);
      panicTimerRef.current = null;
    }

    clearPipMotionTimer();
    clearDialogueTimer();

    playPsstSound();
    playPanicSound();

    setCustomReaction(null);
    setReactionIndex(0);
    setPipMotionState('idle');
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
  }, [orchestraState, clearPipMotionTimer, clearDialogueTimer]);

  /**
   * Direct Pip Poke Interaction
   */
  const handlePokePip = useCallback(() => {
    if (
      orchestraState === 'performing' ||
      orchestraState === 'celebrating' ||
      orchestraState === 'returning'
    ) {
      return;
    }

    if (panicTimerRef.current) {
      clearTimeout(panicTimerRef.current);
      panicTimerRef.current = null;
    }

    clearPipMotionTimer();
    clearDialogueTimer();

    setCustomReaction(null);
    setPipMotionState('idle');
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
  }, [orchestraState, clearPipMotionTimer, clearDialogueTimer]);

  /**
   * Phase 4 & Finale: Pip's Celebratory Payoff Reaction
   */
  const triggerFinale = useCallback(() => {
    clearPipMotionTimer();
    clearDialogueTimer();

    if (starPulseIntervalRef.current) {
      clearInterval(starPulseIntervalRef.current);
      starPulseIntervalRef.current = null;
    }
    setActiveSoundingStar(null);

    setOrchestraState('celebrating');
    setPipMotionState('celebrating');

    // Celebratory vocal sigh from uploaded fahhhhh.mp3!
    playFaahSound(1.0);

    setCustomReaction(STAR_COLLECTION_REACTIONS.finale);
    setIsPanicking(true);
    setShowDialogue(true);
    setSrAnnouncement(STAR_COLLECTION_REACTIONS.finale.srText);

    // After celebratory jump and dialogue, glide stars back home
    const returnTimer = setTimeout(() => {
      setOrchestraState('returning');
      setPipMotionState('idle');
      setShowDialogue(false);
      setIsPanicking(false);
      setCustomReaction(null);
      setSrAnnouncement('The stars gently glide back to their bedtime positions. Ready to play again!');

      // Settle back to idle once return flight finishes (~1100ms)
      const resetTimer = setTimeout(() => {
        setCollectedStars([]);
        setOrchestraState('idle');
        clearOrchestraTimers();
      }, 1100);
      orchestraTimersRef.current.push(resetTimer);
    }, 4500);
    orchestraTimersRef.current.push(returnTimer);
  }, [clearOrchestraTimers, clearPipMotionTimer, clearDialogueTimer]);

  /**
   * Skip / Early Finish handler when visitor taps Pip during vocal lullaby
   */
  const handleSkipLullaby = useCallback(() => {
    if (orchestraState === 'performing') {
      stopAllOrchestraAudio();
      triggerFinale();
    }
  }, [orchestraState, triggerFinale]);

  /**
   * Pass 01C.1 & 01C.2: Star Orchestra Collection & Emotional Progression
   */
  const handleStarClick = useCallback(
    (starId) => {
      if (
        orchestraState === 'performing' ||
        orchestraState === 'celebrating' ||
        orchestraState === 'returning'
      ) {
        return;
      }

      if (collectedStars.includes(starId)) {
        return;
      }

      const nextCollected = [...collectedStars, starId];
      setCollectedStars(nextCollected);

      clearPipMotionTimer();
      clearDialogueTimer();

      if (nextCollected.length === 1) {
        // --- 1. FIRST STAR COLLECTED ---
        setOrchestraState('collecting');
        setPipMotionState('surprised');
        playStarSound(0);

        setCustomReaction(STAR_COLLECTION_REACTIONS.star1);
        setIsPanicking(true);
        setShowDialogue(true);
        setSrAnnouncement(STAR_COLLECTION_REACTIONS.star1.srText);

        pipMotionTimerRef.current = setTimeout(() => {
          setPipMotionState('idle');
          pipMotionTimerRef.current = null;
        }, 2200);

        dialogueTimerRef.current = setTimeout(() => {
          setShowDialogue(false);
          setIsPanicking(false);
          dialogueTimerRef.current = null;
        }, 3600);
      } else if (nextCollected.length === 2) {
        // --- 2. SECOND STAR COLLECTED ---
        setOrchestraState('collecting');
        setPipMotionState('curious');
        playStarTwoChime(); // Short complementary two-note chime!

        setCustomReaction(STAR_COLLECTION_REACTIONS.star2);
        setIsPanicking(true);
        setShowDialogue(true);
        setSrAnnouncement(STAR_COLLECTION_REACTIONS.star2.srText);

        pipMotionTimerRef.current = setTimeout(() => {
          setPipMotionState('idle');
          pipMotionTimerRef.current = null;
        }, 2500);

        dialogueTimerRef.current = setTimeout(() => {
          setShowDialogue(false);
          setIsPanicking(false);
          dialogueTimerRef.current = null;
        }, 3600);
      } else if (nextCollected.length === 3) {
        // --- 3. THIRD STAR COLLECTED: BEGIN VOCAL LULLABY PERFORMANCE ---
        setOrchestraState('performing');
        setPipMotionState('listening'); // Remains in 'listening' motion throughout song!
        playStarSound(2);

        setCustomReaction(STAR_COLLECTION_REACTIONS.performing);
        setIsPanicking(true);
        setShowDialogue(true);
        setSrAnnouncement(STAR_COLLECTION_REACTIONS.performing.srText);

        dialogueTimerRef.current = setTimeout(() => {
          setShowDialogue(false);
          setIsPanicking(false);
          dialogueTimerRef.current = null;
        }, 4000);

        // Start rhythmic star glow pulsing interval
        let noteCounter = 0;
        starPulseIntervalRef.current = setInterval(() => {
          noteCounter = (noteCounter % 3) + 1;
          setActiveSoundingStar(noteCounter);
          const pulseOffTimer = setTimeout(() => {
            setActiveSoundingStar(null);
          }, 450);
          orchestraTimersRef.current.push(pulseOffTimer);
        }, 1800);

        let ended = false;
        const onPlaybackEnd = () => {
          if (ended) return;
          ended = true;
          triggerFinale();
        };

        // Play the recorded vocal lullaby (twinkle_vocal_short.mp3)
        playVocalLullaby({ onEnded: onPlaybackEnd }).then(({ duration }) => {
          // Master performance end timer:
          // Synchronizes visual performance to the exact shortened audio duration (~17.45s).
          // If sound is muted during playback or was disabled from the start,
          // this ensures the visual sequence completes at the matching natural musical time.
          const visualDurationMs = Math.round((duration && duration > 0 ? duration : 17.45) * 1000);
          const masterPerformanceTimer = setTimeout(() => {
            onPlaybackEnd();
          }, visualDurationMs);
          orchestraTimersRef.current.push(masterPerformanceTimer);
        });
      }
    },
    [
      collectedStars,
      orchestraState,
      soundOn,
      triggerFinale,
      clearPipMotionTimer,
      clearDialogueTimer,
    ]
  );

  /**
   * Dismiss Dialogue
   */
  const handleDismissDialogue = useCallback(() => {
    if (panicTimerRef.current) {
      clearTimeout(panicTimerRef.current);
      panicTimerRef.current = null;
    }
    clearDialogueTimer();
    setIsPanicking(false);
    setShowDialogue(false);
  }, [clearDialogueTimer]);

  const currentReaction =
    customReaction !== null
      ? customReaction
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
          pipMotionState={pipMotionState}
          onSkipLullaby={handleSkipLullaby}
        />
      </RetroBrowserFrame>
    </div>
  );
}
