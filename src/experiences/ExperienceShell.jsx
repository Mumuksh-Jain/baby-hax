import React, { useEffect, useRef } from 'react';
import './ExperienceShell.css';

/**
 * ExperienceShell
 * Full-screen modal shell for Pip's three dedicated interactive invention experiences.
 * Provides accessible keyboard handling (Escape), sound toggle, title header,
 * and focus restoration.
 */
export default function ExperienceShell({
  experienceId,
  title,
  category,
  badgeText = 'OFFICIAL INVENTION',
  soundEnabled = false,
  onToggleSound,
  onClose,
  children,
}) {
  const containerRef = useRef(null);
  const backBtnRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Focus the Back button when mounted for accessibility
    const timer = setTimeout(() => {
      if (backBtnRef.current) {
        backBtnRef.current.focus();
      }
    }, 60);

    const handleKeyDown = (e) => {
      // The nested cinematic owns its own Escape and focus while visible.
      if (document.querySelector('.magical-star-theater.theater-active')) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Tab') {
        const items = [...containerRef.current.querySelectorAll('button:not(:disabled), input, a[href], [tabindex="0"]')].filter(el => el.getClientRects().length);
        const index = items.indexOf(document.activeElement);
        if (e.shiftKey && index <= 0) { e.preventDefault(); items.at(-1)?.focus(); }
        else if (!e.shiftKey && (index === items.length - 1 || index === -1)) { e.preventDefault(); items[0]?.focus(); }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [onClose]);

  return (
    <div
      className={`experience-overlay experience-${experienceId}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exp-shell-title"
      ref={containerRef}
    >
      <div className="experience-shell-container">
        {/* Experience Header Bar */}
        <header className="experience-shell-header">
          <div className="shell-header-left">
            <button
              ref={backBtnRef}
              type="button"
              className="shell-back-btn"
              onClick={onClose}
              aria-label="Back to Invention Workshop"
            >
              <span className="back-arrow" aria-hidden="true">⬅</span>
              <span className="shell-back-full">Back to Workshop</span>
              <span className="shell-back-short" aria-hidden="true">Workshop</span>
            </button>

            <div className="shell-title-group">
              <span className="shell-category-chip">{category}</span>
              <h1 id="exp-shell-title" className="shell-experience-title">
                {title}
              </h1>
            </div>
          </div>

          <div className="shell-header-right">
            {/* Sound Toggle Button */}
            <button
              type="button"
              className={`shell-sound-btn ${soundEnabled ? 'is-on' : 'is-muted'}`}
              onClick={onToggleSound}
              aria-label={`Sound is currently ${soundEnabled ? 'ON' : 'OFF'}. Click to toggle.`}
            >
              <span className="sound-icon" aria-hidden="true">
                {soundEnabled ? '🔊' : '🔈'}
              </span>
              <span className="sound-label">
                Sound: <strong>{soundEnabled ? 'ON' : 'OFF'}</strong>
              </span>
            </button>

            {/* Quick Close Button */}
            <button
              type="button"
              className="shell-close-btn"
              onClick={onClose}
              aria-label="Close experience"
              title="Close experience (Esc)"
            >
              ✕
            </button>
          </div>
        </header>

        {/* Experience Body */}
        <main className="experience-shell-body">
          {children}
        </main>
      </div>
    </div>
  );
}
