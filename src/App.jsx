import React, { useState, useRef, useEffect, useCallback } from 'react';
import RetroBrowserFrame from './components/RetroBrowserFrame';
import HeroSection from './components/HeroSection';
import './App.css';

/**
 * App Root Component
 * haX.baby Hackathon submission — Track 1: Pip the Skull Baby
 * Pass 01: Responsive Introductory Hero Experience
 */
export default function App() {
  const [isPanicking, setIsPanicking] = useState(false);
  const [showDialogue, setShowDialogue] = useState(false);
  const panicTimerRef = useRef(null);

  // Accessible live announcement message
  const [srAnnouncement, setSrAnnouncement] = useState('');

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (panicTimerRef.current) {
        clearTimeout(panicTimerRef.current);
      }
    };
  }, []);

  /**
   * Primary interaction handler: 'Psst, Pip?'
   * Clicking or keyboard activating:
   * 1. Makes Pip's frame gently react
   * 2. Reveals animated dialogue bubble: "Shhh! I'm trying to put a WEBSITE to sleep!"
   * 3. Changes bedtime status briefly to: "PIP IS PANICKING (politely)"
   * 4. Allows replay at any time without getting stuck
   */
  const handlePsst = useCallback(() => {
    // Clear any pending timeout cleanly
    if (panicTimerRef.current) {
      clearTimeout(panicTimerRef.current);
      panicTimerRef.current = null;
    }

    // Reset momentarily to re-trigger animations if replayed
    setIsPanicking(false);
    setShowDialogue(false);

    requestAnimationFrame(() => {
      setIsPanicking(true);
      setShowDialogue(true);
      setSrAnnouncement('Pip says: Shhh! I’m trying to put a WEBSITE to sleep! Bedtime status changed to Pip is panicking politely.');

      // Polite panic stays active for 4.5s before gently returning to wide awake
      panicTimerRef.current = setTimeout(() => {
        setIsPanicking(false);
        setShowDialogue(false);
        setSrAnnouncement('Bedtime status returned to: Bedtime status wide awake.');
        panicTimerRef.current = null;
      }, 4500);
    });
  }, []);

  const handleDismissDialogue = useCallback(() => {
    if (panicTimerRef.current) {
      clearTimeout(panicTimerRef.current);
      panicTimerRef.current = null;
    }
    setIsPanicking(false);
    setShowDialogue(false);
  }, []);

  return (
    <div className="app-shell">
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
      <RetroBrowserFrame>
        <HeroSection
          isPanicking={isPanicking}
          showDialogue={showDialogue}
          onPsst={handlePsst}
          onDismissDialogue={handleDismissDialogue}
        />
      </RetroBrowserFrame>
    </div>
  );
}
