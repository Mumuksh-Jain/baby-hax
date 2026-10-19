import React, { useState, useEffect, useRef, useCallback } from 'react';
import { OfficialPip } from '../../components/OfficialArt';
import ExperienceShell from '../ExperienceShell';
import MagicalStarTheater from '../../components/MagicalStarTheater';
import { playStarSound, playStarTwoChime, playStampEarnedSound } from '../../utils/soundEngine';
import './OrchestraExperience.css';

/**
 * OrchestraExperience Component (Pass 03 Directive - Experience 1)
 * Identity: Pip's Star Orchestra
 * Role: Star Conductor | Core Verb: PERFORM
 *
 * Dedicated interactive entrance stage where the visitor conducts 3 stars,
 * launching the full paper-craft animated Star Theater, followed by
 * awarding the "Star Conductor" stamp!
 */
export default function OrchestraExperience({
  isOpen = false,
  soundEnabled = false,
  onToggleSound,
  onClose,
  onEarnStamp,
  hasStamp = false,
}) {
  const [conductionStep, setConductionStep] = useState(0); // 0: initial, 1: 1 star, 2: 2 stars, 3: full theater
  const [isTheaterActive, setIsTheaterActive] = useState(false);
  const [showCelebrationBanner, setShowCelebrationBanner] = useState(false);
  const launchTimer = useRef(null);
  useEffect(() => () => clearTimeout(launchTimer.current), []);
  useEffect(() => {
    if (!isOpen) {
      clearTimeout(launchTimer.current);
      setIsTheaterActive(false);
      setConductionStep(0);
      setShowCelebrationBanner(false);
    }
  }, [isOpen]);

  const handleTheaterComplete = useCallback(() => {
    setIsTheaterActive(false);
    setShowCelebrationBanner(true);
    if (onEarnStamp) onEarnStamp('orchestra');
    if (soundEnabled) playStampEarnedSound();
  }, [onEarnStamp, soundEnabled]);
  const handleTheaterExit = useCallback(() => {
    setIsTheaterActive(false);
    setConductionStep(0);
  }, []);

  if (!isOpen) return null;

  const handleStarClick = (starNum) => {
    if (starNum !== conductionStep + 1) return;

    const nextStep = conductionStep + 1;
    setConductionStep(nextStep);

    if (soundEnabled) {
      if (nextStep === 1) playStarSound(0);
      else if (nextStep === 2) playStarTwoChime();
      else playStarSound(2);
    }

    if (nextStep === 3) {
      if (onEarnStamp) onEarnStamp('orchestra');
      // Launch the full cinematic theater
      launchTimer.current = setTimeout(() => {
        setIsTheaterActive(true);
      }, 500);
    }
  };

  const handleConductAgain = () => {
    setShowCelebrationBanner(false);
    setConductionStep(0);
    setIsTheaterActive(false);
  };

  return (
    <ExperienceShell
      experienceId="orchestra"
      title="Pip's Star Orchestra"
      category="EXP-001 · Interactive Musical Theater"
      soundEnabled={soundEnabled}
      onToggleSound={onToggleSound}
      onClose={onClose}
    >
      <div className="orchestra-experience-content">
        {/* Main Stage: Conductor's Podium */}
        {!isTheaterActive && !showCelebrationBanner && (
          <div className="conductor-podium-stage">
            <div className="conductor-header">
              <span className="conductor-role-badge">ROLE: STAR CONDUCTOR</span>
              <h2 className="conductor-stage-title">Wake the Stars to Begin the Concert</h2>
              <p className="conductor-instructions">
                Tap each sleepy star to tune its instrument and assemble Pip's bedtime band.
              </p>
            </div>

            {/* Stage Canvas with Pip and 3 Interactive Stars */}
            <div className="conductor-sky-stage" role="region" aria-label="Interactive Star Stage">
              {/* Paper Clouds Frame */}
              <div className="podium-cloud-bg" aria-hidden="true"></div>

              {/* Pip on Cloud Podium */}
              <div className="podium-pip-wrap">
                <OfficialPip className="podium-pip-img" />
                <div className="podium-thought-bubble">
                  {conductionStep === 0 && '“Which star wants to sing first?”'}
                  {conductionStep === 1 && '“One little star tuned! Who else?”'}
                  {conductionStep === 2 && '“Two stars in orbit! One more for the melody!”'}
                </div>
              </div>

              {/* Three Interactive Stars */}
              <div className="podium-stars-orbit" role="group" aria-label="Bedtime Stars">
                {/* Star 1 */}
                <button
                  type="button"
                  className={`podium-star star-node-1 star-conduction-btn star-1 ${conductionStep >= 1 ? 'is-tuned' : ''}`}
                  onClick={() => handleStarClick(1)}
                  disabled={conductionStep >= 1}
                  aria-label="Star 1: Tap to wake soprano bell"
                >
                  <img
                    src="/assets/optimized/production-art/sprites/orchestra_star_1.webp"
                    alt="Soprano Star"
                    className="star-sprite-img"
                  />
                  <span className="star-note-chip">{conductionStep >= 1 ? 'Tuned ♫' : 'Wake Me 1'}</span>
                </button>

                {/* Star 2 */}
                <button
                  type="button"
                  className={`podium-star star-node-2 star-conduction-btn star-2 ${conductionStep >= 2 ? 'is-tuned' : ''} ${
                    conductionStep < 1 ? 'is-waiting' : ''
                  }`}
                  onClick={() => handleStarClick(2)}
                  disabled={conductionStep !== 1}
                  aria-label="Star 2: Tap to wake alto chime"
                >
                  <img
                    src="/assets/optimized/production-art/sprites/orchestra_star_2.webp"
                    alt="Alto Star"
                    className="star-sprite-img"
                  />
                  <span className="star-note-chip">{conductionStep >= 2 ? 'Tuned ♫' : 'Wake Me 2'}</span>
                </button>

                {/* Star 3 */}
                <button
                  type="button"
                  className={`podium-star star-node-3 star-conduction-btn star-3 ${conductionStep >= 3 ? 'is-tuned' : ''} ${
                    conductionStep < 2 ? 'is-waiting' : ''
                  }`}
                  onClick={() => handleStarClick(3)}
                  disabled={conductionStep !== 2}
                  aria-label="Star 3: Tap to assemble full choir"
                >
                  <img
                    src="/assets/optimized/production-art/sprites/orchestra_star_3.webp"
                    alt="Choir Star"
                    className="star-sprite-img"
                  />
                  <span className="star-note-chip">{conductionStep >= 3 ? 'Tuned ♫' : 'Wake Me 3'}</span>
                </button>
              </div>

              {/* Conductor Score Progress Pill */}
              <div className="conductor-progress-pill" aria-live="polite">
                <span>ORCHESTRA READY: {conductionStep}/3 STARS</span>
              </div>
            </div>
          </div>
        )}

        {/* Cinematic Animated Film Running */}
        {isTheaterActive && (
          <MagicalStarTheater
            isOpen={true}
            soundEnabled={soundEnabled}
            onToggleSound={onToggleSound}
            onCloseTheater={handleTheaterExit}
            onTheaterComplete={handleTheaterComplete}
          />
        )}

        {/* Celebration / Replay Banner */}
        {showCelebrationBanner && (
          <div className="orchestra-celebration-screen" role="region" aria-label="Concert Finished">
            <div className="celebration-seal-stamp" aria-hidden="true">
              <span className="seal-star">🌟</span>
              <span className="seal-text">STAR CONDUCTOR</span>
            </div>

            <h2 className="celebration-heading">Bravo, Star Conductor!</h2>
            <p className="celebration-message">
              The three little stars sang their complete 20-second bedtime lullaby.
              You have officially earned the <strong>Star Conductor Stamp</strong>!
            </p>

            <div className="celebration-actions">
              <button
                type="button"
                className="celebration-action-btn primary-btn"
                onClick={handleConductAgain}
              >
                <span>Conduct Again ↺</span>
              </button>
              <button
                type="button"
                className="celebration-action-btn secondary-btn"
                onClick={onClose}
              >
                <span>Return to Workshop ➔</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </ExperienceShell>
  );
}
