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
} from './utils/soundEngine';
import './App.css';

/**
 * 5 Distinct, Funny, Canonical Pip Bedtime Reactions
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
 * App Root Component
 * haX.baby Hackathon submission — Track 1: Pip the Skull Baby
 * Pass 01B: Bring Pip's Existing Hero to Life
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

  // Live accessibility announcements
  const [srAnnouncement, setSrAnnouncement] = useState('');

  const panicTimerRef = useRef(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (panicTimerRef.current) {
        clearTimeout(panicTimerRef.current);
      }
    };
  }, []);

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
  const handleSelectTab = useCallback((tabId) => {
    playTabSound();
    setActiveTab(tabId);
    setSrAnnouncement(`Switched to tab: ${tabId === 'bedroom' ? 'Pip Bedroom' : tabId === 'log' ? 'Midnight Nursery Log' : 'Dream Blueprints'}`);
  }, []);

  /**
   * Interactive Moon Toggle (Nightlight Mode)
   */
  const handleToggleMoon = useCallback(() => {
    setIsNightlight((prev) => {
      const next = !prev;
      playMoonSound(next);
      setSrAnnouncement(next ? 'Cozy bedtime nightlight turned ON.' : 'Switched back to warm nursery daytime.');
      return next;
    });
  }, []);

  /**
   * Primary Interaction: 'Psst, Pip?'
   * Triggers signature reaction 0 (panicking politely), preserving Pass 01 behavior.
   */
  const handlePsst = useCallback(() => {
    if (panicTimerRef.current) {
      clearTimeout(panicTimerRef.current);
      panicTimerRef.current = null;
    }

    playPsstSound();
    playPanicSound();

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
  }, []);

  /**
   * Direct Pip Poke Interaction
   * Cycles sequentially through all 5 funny personality reactions.
   */
  const handlePokePip = useCallback(() => {
    if (panicTimerRef.current) {
      clearTimeout(panicTimerRef.current);
      panicTimerRef.current = null;
    }

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
  }, []);

  /**
   * Interactive Star Clicks
   */
  const handleStarClick = useCallback((starId) => {
    playStarSound(starId);
    setSrAnnouncement(`Tickled star #${starId}. It chimed a soft music box note.`);
  }, []);

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
  }, []);

  const currentReaction = PIP_REACTIONS[reactionIndex];

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
        />
      </RetroBrowserFrame>
    </div>
  );
}
