import React, { useState, useEffect, useRef } from 'react';
import RoomSet from './RoomSet';
import { OfficialLantern } from '../../components/OfficialArt';
import ExperienceShell from '../ExperienceShell';
import {
  playLanternSwitchSound,
  playGhostSnoreSound,
  playStampEarnedSound,
} from '../../utils/soundEngine';
import './MoonlightExperience.css';

/**
 * MoonlightExperience Component (Pass 03 Directive - Experience 2)
 * Identity: The Moonlight Lab
 * Role: Little Nightlight Engineer | Core Verb: CREATE
 *
 * Dedicated interactive lighting studio where the visitor engineers bedtime
 * illumination using color, brightness slider, and star projections,
 * comforting a friendly bedroom ghost to sleep!
 */
export default function MoonlightExperience({
  isOpen = false,
  soundEnabled = false,
  onToggleSound,
  onClose,
  onEarnStamp,
  hasStamp = false,
}) {
  const [lightColor, setLightColor] = useState('warm'); // 'warm' | 'sleepy' | 'starlight'
  const [brightness, setBrightness] = useState(45); // 0 to 100
  const [starPattern, setStarPattern] = useState('twinkle'); // 'still' | 'twinkle' | 'constellation'
  const [isTesting, setIsTesting] = useState(false);
  const [testOutcome, setTestOutcome] = useState(null); // null | 'too-dark' | 'too-bright' | 'cozy-sleep'
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    if (!isOpen) {
      timers.current.forEach(clearTimeout);
      setIsTesting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Determine Ghost Emotional Feedback
  const getGhostMood = () => {
    if (testOutcome === 'cozy-sleep') return 'asleep';
    if (brightness < 22) return 'too-dark';
    if (brightness > 78) return 'too-bright';
    if (brightness >= 35 && brightness <= 65) return 'sleepy';
    return 'comfortable';
  };

  const ghostMood = getGhostMood();

  const cancelTest = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setIsTesting(false);
    setTestOutcome(null);
  };

  const handleColorChange = (color) => {
    cancelTest();
    setLightColor(color);
    setTestOutcome(null);
    if (soundEnabled) playLanternSwitchSound(color);
  };

  const handleBrightnessChange = (e) => {
    cancelTest();
    setBrightness(parseInt(e.target.value, 10));
    setTestOutcome(null);
  };

  const handlePatternChange = (pat) => {
    cancelTest();
    setStarPattern(pat);
    setTestOutcome(null);
  };

  const handleTestNightlight = () => {
    setIsTesting(true);

    timers.current.push(setTimeout(() => {
      setIsTesting(false);
      if (brightness < 25) {
        setTestOutcome('too-dark');
      } else if (brightness > 75) {
        setTestOutcome('too-bright');
      } else {
        // Just right! Ghost falls asleep peacefully
        setTestOutcome('cozy-sleep');
        if (soundEnabled) {
          playGhostSnoreSound();
          timers.current.push(setTimeout(() => {
            playStampEarnedSound();
          }, 800));
        }
        if (onEarnStamp) onEarnStamp('moonlight');
      }
    }, 900));
  };

  return (
    <ExperienceShell
      experienceId="moonlight"
      title="The Moonlight Lab"
      category="EXP-002 · Interactive Lighting Studio"
      soundEnabled={soundEnabled}
      onToggleSound={onToggleSound}
      onClose={onClose}
    >
      <div className={`moonlight-lab-workspace color-${lightColor}`}>
        {/* Left Column (68% width): Miniature Nursery Bedroom Scene */}
        <section
          className="moonlight-bedroom-chamber"
          style={{
            '--room-brightness': `${brightness / 100}`,
          }}
          aria-label="Nightlight Illumination Preview Chamber"
        >
          <RoomSet />
          <div className="room-ambient-shade" aria-hidden="true" />
          <div className="room-moonwash" aria-hidden="true" />
          <div className="room-lamplight" aria-hidden="true" />
          <div className="room-scene-caption">Pip's bedside studio <span>One little light. A whole room of dreams.</span></div>
          {/* Ceiling & Wall Star Pattern Projections */}
          <div className={`star-projection-layer pattern-${starPattern}`} aria-hidden="true">
            <span className="proj-star ps-1">✦</span>
            <span className="proj-star ps-2">★</span>
            <span className="proj-star ps-3">✧</span>
            <span className="proj-star ps-4">✦</span>
            <span className="proj-star ps-5">★</span>
            {starPattern === 'constellation' && (
              <svg className="proj-constellation-lines" viewBox="0 0 300 150">
                <line x1="40" y1="30" x2="110" y2="70" stroke="#FFF8DC" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="110" y1="70" x2="190" y2="40" stroke="#FFF8DC" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="190" y1="40" x2="260" y2="80" stroke="#FFF8DC" strokeWidth="1" strokeDasharray="3 3" />
              </svg>
            )}
          </div>

          {/* Arched Window with Midnight Sky */}
          <div className="chamber-window" aria-hidden="true">
            <div className="window-moon"></div>
            <div className="window-stars">
              <span>✦</span>
              <span>✧</span>
            </div>
          </div>

          {/* Bedroom Wall Shelf with Pip's Little Tools */}
          <div className="chamber-shelf" aria-hidden="true">
            <span className="shelf-tool tool-wrench">🔧</span>
            <span className="shelf-tool tool-starjar">✨</span>
            <span className="shelf-tool tool-notes">📜</span>
          </div>

          {/* Friendly Bedroom Ghost on Fluffy Bed */}
          <div className={`chamber-ghost-bed ${ghostMood}`} role="region" aria-label="Bedside Ghost">
            <div className="bed-mattress">
              <div className="bed-pillow"></div>
              <div className="bed-blanket"></div>

              {/* Illustrated Friendly Ghost Character */}
              <div className="chamber-ghost">
                <svg viewBox="0 0 80 80" className="ghost-svg" aria-hidden="true">
                  <path
                    d="M18 53C16 47 19 42 20 38C20 15 60 15 60 38C61 46 65 48 62 54C60 59 55 58 52 55C49 63 42 61 40 57C35 63 28 61 27 56C24 60 17 59 18 53Z"
                    fill="#FFFDF8"
                    stroke="#5C4033"
                    strokeWidth="1.5"
                  />
                  {/* Blushing Cheeks */}
                  <circle cx="30" cy="44" r="3.5" fill="#F5C0C0" opacity="0.8" />
                  <circle cx="50" cy="44" r="3.5" fill="#F5C0C0" opacity="0.8" />

                  {/* Dynamic Eyes based on mood */}
                  {ghostMood === 'asleep' || ghostMood === 'sleepy' ? (
                    // Closed sleepy crescent eyes
                    <g stroke="#5C4033" strokeWidth="2" fill="none">
                      <path d="M 28 39 Q 33 43 38 39" />
                      <path d="M 44 39 Q 49 43 54 39" />
                    </g>
                  ) : ghostMood === 'too-bright' ? (
                    // Squinting eyes
                    <g stroke="#5C4033" strokeWidth="2.5" fill="none">
                      <path d="M 28 38 L 36 38" />
                      <path d="M 46 38 L 54 38" />
                    </g>
                  ) : (
                    // Open curious eyes
                    <g fill="#5C4033">
                      <circle cx="33" cy="38" r="3.5" />
                      <circle cx="49" cy="38" r="3.5" />
                    </g>
                  )}
                  {ghostMood === 'too-dark' ? <ellipse cx="41" cy="51" rx="3" ry="4" fill="#5C4033" /> : <path d="M36 50Q41 55 46 50" stroke="#5C4033" strokeWidth="2" fill="none" strokeLinecap="round" />}
                </svg>

                {/* Floating Sleep Zzz particles */}
                {ghostMood === 'asleep' && (
                  <div className="ghost-zzz-particles" aria-hidden="true">
                    <span className="zzz-1">z</span>
                    <span className="zzz-2">z</span>
                    <span className="zzz-3">Z</span>
                  </div>
                )}
              </div>
            </div>

            {/* Ghost Speech Bubble */}
            <div className="ghost-speech-bubble" aria-live="polite">
              {ghostMood === 'too-dark' && '“Too dark! I can’t find my bedtime blanket! 👻”'}
              {ghostMood === 'too-bright' && '“Eep! It’s brighter than breakfast! 🙈”'}
              {ghostMood === 'comfortable' && '“Mmm, warming up... getting cozier! ☁️”'}
              {ghostMood === 'sleepy' && '“A little softer... I can feel a yawn coming.”'}
              {ghostMood === 'asleep' && '“Zzz... perfect starlight... goodnight Pip... 🌙”'}
            </div>
          </div>

          {/* Wooden Bedside Table with Official Lantern Artwork */}
          <div className="chamber-bedside-table">
            {/* Official Lantern sitting physically on table */}
            <button type="button" className="chamber-lantern-wrap" aria-label={`Lantern glow: ${lightColor}. Tap to change color.`} onClick={() => handleColorChange({warm:'sleepy',sleepy:'starlight',starlight:'warm'}[lightColor])}>
              <OfficialLantern className="chamber-lantern-img" />
              {/* Dynamic Glow Halo modulated by brightness & color */}
              <div
                className="chamber-lantern-halo"
                style={{
                  opacity: Math.max(0.2, brightness / 100),
                  transform: `scale(${0.7 + (brightness / 100) * 0.6})`,
                }}
              ></div>
              <span className="lantern-touch-hint">Tap to change the glow</span>
            </button>
            <div className="table-top"></div>
            <div className="table-legs"></div>
          </div>

          {/* Delighted Pip reaction when comfortable/asleep */}
          {testOutcome === 'cozy-sleep' && (
            <div className="pip-lab-reward-badge" aria-live="polite">
              <span className="reward-icon">★</span>
              <div className="reward-text">
                <strong>Moonlight Engineer Certified!</strong>
                <span>You created the perfect bedside lighting frequency.</span>
              </div>
            </div>
          )}
        </section>

        {/* Right Column (32% width): Tactile Nightlight Control Workbench */}
        <aside className="moonlight-control-desk" aria-labelledby="workbench-title">
          <div className="desk-header">
            <span className="desk-badge">ROLE: NIGHTLIGHT ENGINEER</span>
            <h2 id="workbench-title" className="desk-title">Bedside Switchboard</h2>
            <p className="desk-desc">Tinker with magical filters to help the ghost fall asleep.</p>
          </div>

          {/* Control A: Color Filter Presets */}
          <div className="desk-control-group">
            <label className="control-group-label">1. Lighting Mood Filter</label>
            <div className="mood-buttons-trio" role="group" aria-label="Color Moods">
              <button
                type="button"
                className={`desk-pill-btn ${lightColor === 'warm' ? 'is-active' : ''}`}
                onClick={() => handleColorChange('warm')}
                aria-pressed={lightColor === 'warm'}
              >
                <span>🕯️ Warm &amp; Cozy</span>
              </button>
              <button
                type="button"
                className={`desk-pill-btn ${lightColor === 'sleepy' ? 'is-active' : ''}`}
                onClick={() => handleColorChange('sleepy')}
                aria-pressed={lightColor === 'sleepy'}
              >
                <span>🌙 Sleepy Moon</span>
              </button>
              <button
                type="button"
                className={`desk-pill-btn ${lightColor === 'starlight' ? 'is-active' : ''}`}
                onClick={() => handleColorChange('starlight')}
                aria-pressed={lightColor === 'starlight'}
              >
                <span>✨ Little Starlight</span>
              </button>
            </div>
          </div>

          {/* Control B: Brightness Slider */}
          <div className="desk-control-group">
            <div className="slider-header-row">
              <label htmlFor="brightness-slider" className="control-group-label">
                2. Lantern Brightness
              </label>
              <span className="slider-value-display">{brightness}%</span>
            </div>
            <input
              id="brightness-slider"
              type="range"
              min="5"
              max="100"
              value={brightness}
              onChange={handleBrightnessChange}
              className="bedside-range-slider"
              aria-label="Lantern brightness level"
            />
            <div className="slider-ticks" aria-hidden="true">
              <span>Dim</span>
              <span>Cozy Range (35-65%)</span>
              <span>Bright</span>
            </div>
          </div>

          {/* Control C: Star Projection Pattern */}
          <div className="desk-control-group">
            <label className="control-group-label">3. Ceiling Projection</label>
            <div className="pattern-buttons-trio" role="group" aria-label="Star Patterns">
              <button
                type="button"
                className={`pattern-btn ${starPattern === 'still' ? 'is-active' : ''}`}
                onClick={() => handlePatternChange('still')}
                aria-pressed={starPattern === 'still'}
              >
                <span>★ Still Stars</span>
              </button>
              <button
                type="button"
                className={`pattern-btn ${starPattern === 'twinkle' ? 'is-active' : ''}`}
                onClick={() => handlePatternChange('twinkle')}
                aria-pressed={starPattern === 'twinkle'}
              >
                <span>✧ Slow Twinkle</span>
              </button>
              <button
                type="button"
                className={`pattern-btn ${starPattern === 'constellation' ? 'is-active' : ''}`}
                onClick={() => handlePatternChange('constellation')}
                aria-pressed={starPattern === 'constellation'}
              >
                <span>✦ Constellation</span>
              </button>
            </div>
          </div>

          {/* Primary Action Button: Test My Nightlight */}
          <div className="desk-test-action-wrap">
            <button
              type="button"
              className={`test-nightlight-btn ${isTesting ? 'is-testing' : ''}`}
              onClick={handleTestNightlight}
              disabled={isTesting}
            >
              <span>{isTesting ? 'Adjusting Bedtime Glow... 🧪' : 'Test My Nightlight ➔'}</span>
            </button>
            <p className="test-hint">Pip says: “Aim for 35–65% brightness to soothe the ghost!”</p>
          </div>
        </aside>
      </div>
    </ExperienceShell>
  );
}
