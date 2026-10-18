import React from 'react';
import './StampTray.css';

/**
 * StampTray Component
 * Displays the visitor's earned invention stamps:
 * 1. Star Conductor (Star Orchestra)
 * 2. Moonlight Engineer (Moonlight Lab)
 * 3. Postal Conductor (The Dream Express)
 */
export default function StampTray({ stamps = {}, onTuckBedtimeClick }) {
  const STAMP_DEFINITIONS = [
    {
      id: 'orchestra',
      title: 'Star Conductor',
      icon: '🌟',
      subtitle: 'Harmonized 3 Stars',
      color: '#D4A843',
    },
    {
      id: 'moonlight',
      title: 'Moonlight Engineer',
      icon: '💡',
      subtitle: 'Comforted Bedtime Ghost',
      color: '#B85075',
    },
    {
      id: 'express',
      title: 'Postal Conductor',
      icon: '🚂',
      subtitle: 'Delivered Midnight Dream',
      color: '#466B9B',
    },
  ];

  const earnedCount = Object.values(stamps).filter(Boolean).length;
  const isAllEarned = earnedCount === 3;

  return (
    <div className="stamp-tray-card" role="region" aria-label="Invention Completion Stamp Collection">
      <div className="stamp-tray-header">
        <div className="stamp-tray-title-wrap">
          <span className="tray-pin" aria-hidden="true">📌</span>
          <span className="tray-title">PIP'S DREAM ENGINEER PASSPORT</span>
        </div>
        <span className="stamp-progress-badge">
          {earnedCount}/3 STAMPS EARNED {isAllEarned && '· ALL COMPLETE! ★'}
        </span>
      </div>

      <div className="stamps-grid">
        {STAMP_DEFINITIONS.map((def) => {
          const isEarned = !!stamps[def.id];
          return (
            <div
              key={def.id}
              className={`stamp-seal-badge ${isEarned ? 'is-earned' : 'is-unearned'}`}
              title={isEarned ? `Earned: ${def.title}` : `Complete ${def.title} to earn stamp`}
            >
              <div className="stamp-circle" style={{ borderColor: isEarned ? def.color : 'rgba(92, 64, 51, 0.25)' }}>
                <span className="stamp-seal-icon" aria-hidden="true">
                  {isEarned ? def.icon : '○'}
                </span>
                <span className="stamp-seal-status">
                  {isEarned ? 'VERIFIED' : 'LOCKED'}
                </span>
              </div>
              <div className="stamp-text-info">
                <span className="stamp-name">{def.title}</span>
                <span className="stamp-desc">{def.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* When all 3 stamps are collected, show the bedtime prompt */}
      {isAllEarned && onTuckBedtimeClick && (
        <div className="stamp-tray-bedtime-cta">
          <p className="bedtime-cta-text">
            “You explored every invention I made tonight! Maybe... I can finally sleep now?”
          </p>
          <button
            type="button"
            className="tuck-bedtime-btn tuck-bedtime-cta-btn"
            onClick={onTuckBedtimeClick}
            aria-label="Tuck the website in for bed"
          >
            <span className="btn-moon-icon" aria-hidden="true">🌙</span>
            <span>Tuck the Website In [Bedtime Payoff] ➔</span>
          </button>
        </div>
      )}
    </div>
  );
}
