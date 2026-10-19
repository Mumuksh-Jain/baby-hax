import React, { useState, useRef } from 'react';
import './PipOriginStory.css';

/**
 * Pip's Interactive Origin Story (Pass 02 Master Rescue - Phase 15.1)
 * A 3-scene canonical storybook flipbook detailing how Pip the Skull Baby
 * became the Midnight Nursery's Junior Dream Engineer.
 */
export default function PipOriginStory() {
  const [currentScene, setCurrentScene] = useState(0);
  const touchStart = useRef(null);

  const SCENES = [
    {
      id: 'restless-nursery',
      chapter: 'CHAPTER I',
      title: 'The Restless Nursery',
      badge: 'SCENE 01 · 11:30 PM',
      illustration: (
        <svg viewBox="0 0 320 220" className="scene-svg" aria-hidden="true">
          {/* Deep Navy Nursery Room */}
          <rect width="320" height="220" rx="12" fill="#172343" />
          {/* Arched Nursery Window with Moon & Stars */}
          <path d="M 190 30 Q 235 5 280 30 L 280 130 L 190 130 Z" fill="#253A68" stroke="#F5D88C" strokeWidth="2" />
          <line x1="235" y1="12" x2="235" y2="130" stroke="#F5D88C" strokeWidth="1.5" />
          <line x1="190" y1="80" x2="280" y2="80" stroke="#F5D88C" strokeWidth="1.5" />
          {/* Crescent Moon outside window */}
          <path d="M 230 40 A 14 14 0 0 0 250 54 A 12 12 0 0 1 230 40 Z" fill="#F5D88C" />
          <circle cx="210" cy="55" r="1.5" fill="#FFF" />
          <circle cx="265" cy="45" r="1.5" fill="#FFF" />
          {/* Nursery Wooden Floor */}
          <rect x="0" y="180" width="320" height="40" fill="#422C20" />
          <line x1="0" y1="180" x2="320" y2="180" stroke="#5C4033" strokeWidth="3" />
          {/* Bedpost & Blanket Fort */}
          <rect x="25" y="110" width="10" height="70" rx="2" fill="#8C5835" />
          <rect x="145" y="110" width="10" height="70" rx="2" fill="#8C5835" />
          <rect x="20" y="140" width="140" height="40" rx="6" fill="#FCE8EC" />
          {/* Pip Awake with Glowing Skull Head and Nightlight Wrench */}
          <g transform="translate(65, 125)">
            <ellipse cx="25" cy="22" rx="18" ry="16" fill="#FFFDF8" stroke="#5C4033" strokeWidth="2" />
            <circle cx="19" cy="20" r="3" fill="#5C4033" />
            <circle cx="31" cy="20" r="3" fill="#5C4033" />
            <circle cx="25" cy="28" r="1.5" fill="#5C4033" />
            {/* Blushing cheeks */}
            <circle cx="15" cy="24" r="2.5" fill="#F5C0C0" opacity="0.8" />
            <circle cx="35" cy="24" r="2.5" fill="#F5C0C0" opacity="0.8" />
            {/* Striped onesie */}
            <path d="M 12 36 Q 25 32 38 36 L 42 52 Q 25 56 8 52 Z" fill="#A34063" />
            <line x1="10" y1="42" x2="40" y2="42" stroke="#FFF" strokeWidth="2" />
            <line x1="9" y1="48" x2="41" y2="48" stroke="#FFF" strokeWidth="2" />
            {/* Tiny whirring starlight gears in head */}
            <circle cx="25" cy="10" r="4" fill="none" stroke="#F5D88C" strokeWidth="1.5" strokeDasharray="2 2" />
          </g>
          {/* Whirring idea sparks */}
          <text x="120" y="110" fill="#F5D88C" fontSize="14" fontFamily="monospace">✦ ⚙ ✧</text>
        </svg>
      ),
      text: "When the nursery lights click off, ordinary babies close their eyes. But Pip's tiny skull head is full of whirring ideas and starry gears. The dark isn't scary—it's just waiting for someone to build something wonderful.",
    },
    {
      id: 'junior-engineer',
      chapter: 'CHAPTER II',
      title: 'The Junior Dream Engineer',
      badge: 'SCENE 02 · 12:15 AM',
      illustration: (
        <svg viewBox="0 0 320 220" className="scene-svg" aria-hidden="true">
          {/* Workshop Bench Setting */}
          <rect width="320" height="220" rx="12" fill="#202A44" />
          {/* Blueprint Grid Paper on Desk */}
          <rect x="30" y="40" width="260" height="150" rx="8" fill="#1C355E" stroke="#5885C7" strokeWidth="1.5" />
          <path d="M 30 75 L 290 75 M 30 110 L 290 110 M 30 145 L 290 145" stroke="#2B4D82" strokeWidth="1" strokeDasharray="3 3" />
          <path d="M 95 40 L 95 190 M 160 40 L 160 190 M 225 40 L 225 190" stroke="#2B4D82" strokeWidth="1" strokeDasharray="3 3" />
          {/* Blueprint Inventions: Star Box, Lantern, Express */}
          {/* 1. Star Box Sketch */}
          <rect x="45" y="85" width="45" height="35" rx="3" fill="#D4A843" opacity="0.85" />
          <circle cx="67" cy="102" r="8" fill="#FFF8DC" />
          <text x="50" y="135" fill="#F5D88C" fontSize="8" fontFamily="monospace">EXP-001</text>
          {/* 2. Dream Lantern Sketch */}
          <ellipse cx="160" cy="98" rx="15" ry="22" fill="#FFC857" opacity="0.85" />
          <circle cx="160" cy="98" r="7" fill="#FFF" />
          <text x="144" y="135" fill="#F5D88C" fontSize="8" fontFamily="monospace">EXP-002</text>
          {/* 3. Train Blueprint */}
          <rect x="220" y="88" width="50" height="26" rx="4" fill="#A34063" opacity="0.85" />
          <circle cx="232" cy="116" r="6" fill="#D4A843" />
          <circle cx="258" cy="116" r="6" fill="#D4A843" />
          <text x="232" y="135" fill="#F5D88C" fontSize="8" fontFamily="monospace">EXP-003</text>
          {/* Pip Inspecting with Tiny Magnifying Glass */}
          <circle cx="160" cy="170" r="16" fill="#FFFDF8" stroke="#5C4033" strokeWidth="2" />
          <circle cx="154" cy="168" r="2.5" fill="#5C4033" />
          <circle cx="166" cy="168" r="2.5" fill="#5C4033" />
          <circle cx="180" cy="165" r="9" fill="none" stroke="#D4A843" strokeWidth="2.5" />
          <line x1="187" y1="172" x2="198" y2="183" stroke="#D4A843" strokeWidth="3" />
        </svg>
      ),
      text: "Armed with brass clockwork, spun starlight, and runaway cloud fluff, Pip built tools to fix midnight: a music box that sings sleeping stars to sleep, a lantern that keeps monster rumors away, and a sky-train delivering dreams.",
    },
    {
      id: 'babys-first-website',
      chapter: 'CHAPTER III',
      title: "Baby's First Website",
      badge: 'SCENE 03 · 1:45 AM',
      illustration: (
        <svg viewBox="0 0 320 220" className="scene-svg" aria-hidden="true">
          {/* Glowing CRT Monitor Environment */}
          <rect width="320" height="220" rx="12" fill="#151C30" />
          {/* Vintage CRT Computer Monitor */}
          <rect x="50" y="25" width="220" height="145" rx="14" fill="#E8DEC8" stroke="#5C4033" strokeWidth="3" />
          <rect x="65" y="38" width="190" height="118" rx="8" fill="#0C1424" stroke="#466B9B" strokeWidth="2" />
          {/* CRT Screen Scanlines & Browser Window */}
          <rect x="75" y="46" width="170" height="16" rx="3" fill="#A34063" />
          <circle cx="84" cy="54" r="3" fill="#F5C0C0" />
          <circle cx="94" cy="54" r="3" fill="#F5D88C" />
          <circle cx="104" cy="54" r="3" fill="#8CE8A0" />
          <text x="115" y="58" fill="#FFF" fontSize="8" fontFamily="monospace">pip-bedtime.html</text>
          {/* Browser Inner Page with Constellation */}
          <rect x="75" y="66" width="170" height="80" rx="2" fill="#FFF8F1" />
          <text x="85" y="84" fill="#A34063" fontSize="10" fontWeight="bold" fontFamily="sans-serif">Pip's Website Won't Go to Bed!</text>
          <text x="85" y="98" fill="#5C4033" fontSize="7" fontFamily="sans-serif">★ Star Orchestra · Moonlight Lab · Dream Express</text>
          <rect x="85" y="106" width="60" height="14" rx="3" fill="#D4A843" />
          <text x="92" y="116" fill="#5C4033" fontSize="6.5" fontWeight="bold" fontFamily="monospace">&lt;baby-hax/&gt;</text>
          {/* CRT Stand & Keyboard */}
          <rect x="135" y="170" width="50" height="15" fill="#D4C8B0" stroke="#5C4033" strokeWidth="2" />
          <rect x="80" y="185" width="160" height="22" rx="4" fill="#FAF1E2" stroke="#5C4033" strokeWidth="2" />
          {/* Floppy Disk */}
          <rect x="250" y="182" width="24" height="24" rx="2" fill="#466B9B" stroke="#5C4033" strokeWidth="1.5" />
        </svg>
      ),
      text: "Pip stayed up past bedtime to code this very website—a nursery workshop for sleepy dreamers everywhere. Because as long as there are stars to teach and trains to dispatch, going to bed can wait just five more minutes.",
    },
  ];

  const handleNext = () => {
    setCurrentScene((prev) => (prev + 1) % SCENES.length);
  };

  const handlePrev = () => {
    setCurrentScene((prev) => (prev - 1 + SCENES.length) % SCENES.length);
  };

  const scene = SCENES[currentScene];

  return (
    <section
      id="origin-story"
      className="pip-origin-story-section"
      aria-labelledby="origin-story-title"
    >
      <header className="origin-story-header">
        <div className="story-chip-badge">
          <span className="chip-icon" aria-hidden="true">📖</span>
          <span className="chip-text">CANONICAL ORIGIN TALE · 3 SCENES</span>
        </div>

        <h2 id="origin-story-title" className="origin-heading">
          Why Pip Won’t Go to Bed
        </h2>

        <p className="origin-subheading">
          The official story of how a tiny toddler skull baby became the Midnight Nursery’s Junior Dream Engineer.
        </p>
      </header>

      {/* Storybook Flipbook Container */}
      <div className="story-flipbook" role="region" aria-label="Storybook Flipbook. Use left and right arrows or swipe to turn pages." aria-keyshortcuts="ArrowLeft ArrowRight" tabIndex={0} onKeyDown={e => { if(e.key === "ArrowRight") {e.preventDefault();handleNext();} if(e.key === "ArrowLeft") {e.preventDefault();handlePrev();} }} onTouchStart={e => {touchStart.current = [e.touches[0].clientX,e.touches[0].clientY];}} onTouchEnd={e => {if(!touchStart.current)return;const dx=e.changedTouches[0].clientX-touchStart.current[0],dy=e.changedTouches[0].clientY-touchStart.current[1];if(Math.abs(dx)>50 && Math.abs(dx)>Math.abs(dy)*1.5) {if(e.cancelable)e.preventDefault();if(dx<0)handleNext();else handlePrev();}touchStart.current=null;}}>
        {/* Storybook Spine & Top Bookmark */}
        <div className="flipbook-bookmark" aria-hidden="true">
          <span className="ribbon-tail"></span>
        </div>

        {/* Active Scene Card */}
        <article key={scene.id} className="scene-page-spread" aria-live="polite">
          {/* Scene Illustration Canvas */}
          <button type="button" className="scene-visual-pane" onClick={handleNext} >
            {scene.illustration}
            <span className="scene-time-tag">{scene.badge}</span>
            <span className="scene-turn-hint" aria-hidden="true">TAP TO TURN ↗</span>
          </button>

          {/* Scene Narrative Text */}
          <div className="scene-text-pane">
            <div className="chapter-meta">
              <span className="chapter-num">{scene.chapter}</span>
              <span className="chapter-title">{scene.title}</span>
            </div>

            <p className="scene-prose">{scene.text}</p>

            {/* Scene Footer & Page Turn Controls */}
            <div className="scene-controls">
              <div className="scene-dots-indicator" role="group" aria-label={`Page ${currentScene + 1} of 3`}>
                {SCENES.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`scene-dot-btn ${idx === currentScene ? 'is-active' : ''}`}
                    onClick={() => setCurrentScene(idx)}
                    aria-label={`Go to ${s.chapter}: ${s.title}`}
                  />
                ))}
              </div>

              <div className="scene-nav-buttons">
                <button
                  type="button"
                  className="scene-nav-btn prev-btn"
                  onClick={handlePrev}
                  aria-label="Prev story chapter"
                >
                  <span>⬅ Prev</span>
                </button>
                <button
                  type="button"
                  className="scene-nav-btn next-btn"
                  onClick={handleNext}
                  aria-label={currentScene === SCENES.length - 1 ? "Start Over: first story chapter" : "Turn Page to the next story chapter"}
                >
                  <span>{currentScene === SCENES.length - 1 ? 'Start Over ↺' : 'Turn Page ➔'}</span>
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
