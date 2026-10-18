import React, { useEffect, useRef } from 'react';
import { playStarSound } from '../utils/soundEngine';
import './RetroAchievementPopup.css';

/**
 * RetroAchievementPopup Component
 * Displays the early-web surprise popup at the end of the Star Theater performance:
 * - Window: "Pip's First Website.exe"
 * - Heading: "Achievement Unlocked!"
 * - Body: "You turned three ordinary stars into Pip's very first concert."
 * - Action: "Certified Star Conductor ★"
 */
export default function RetroAchievementPopup({ isOpen = false, onClose }) {
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      confirmBtnRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    playStarSound(0);
    onClose();
  };

  return (
    <div
      className="retro-popup-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-achievement-title"
    >
      <div className="retro-achievement-window">
        {/* Header Bar */}
        <div className="popup-header-bar">
          <div className="popup-title-group">
            <span className="popup-star-icon" aria-hidden="true">☆</span>
            <span className="popup-title-text">Pip&apos;s First Website.exe</span>
          </div>
          <button
            type="button"
            className="popup-close-x"
            onClick={onClose}
            aria-label="Close achievement popup"
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Content Body */}
        <div className="popup-body-content">
          <div className="popup-achievement-heading">
            <span className="popup-popper-icon" aria-hidden="true">🎉</span>
            <h3 id="popup-achievement-title" className="popup-achievement-title">
              Achievement Unlocked!
            </h3>
          </div>

          <p className="popup-achievement-desc">
            You turned three ordinary stars into Pip&apos;s very first concert.
          </p>

          <button
            type="button"
            ref={confirmBtnRef}
            className="popup-conductor-btn"
            onClick={handleConfirm}
          >
            Certified Star Conductor ★
          </button>
        </div>
      </div>
    </div>
  );
}
