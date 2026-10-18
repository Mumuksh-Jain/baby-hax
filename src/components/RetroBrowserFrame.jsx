import React from 'react';
import './RetroBrowserFrame.css';

/**
 * RetroBrowserFrame Component
 * Encapsulates the personal website in an early-2000s scrapbook browser frame.
 */
export default function RetroBrowserFrame({ children }) {
  return (
    <div className="retro-browser-container">
      {/* Scrapbook Paper Tabs sticking out at the top */}
      <div className="browser-tabs-strip" aria-hidden="true">
        <div className="paper-tab active-tab">
          <span className="tab-icon">★</span>
          <span className="tab-text">pip_bedroom.htm</span>
          <span className="tab-pin"></span>
        </div>
        <div className="paper-tab idle-tab">
          <span className="tab-icon">☁</span>
          <span className="tab-text">midnight_nursery.log</span>
        </div>
        <div className="paper-tab idle-tab hide-mobile">
          <span className="tab-icon">🌙</span>
          <span className="tab-text">dream_blueprints.txt</span>
        </div>
      </div>

      {/* Main Browser Window Frame */}
      <div className="retro-browser-window">
        {/* Title Bar & Window Controls */}
        <header className="browser-topbar">
          <div className="window-dots" aria-hidden="true">
            <span className="dot dot-close" title="Close sleepy window">×</span>
            <span className="dot dot-min" title="Minimize to nap">–</span>
            <span className="dot dot-max" title="Full dream screen">+</span>
          </div>

          <div className="window-title-chip">
            <span className="moon-twinkle">🌙</span>
            <span className="title-text">Midnight Nursery Web Viewer v1.0</span>
          </div>

          <div className="topbar-status-badge hide-mobile" aria-hidden="true">
            <span className="blinking-star">✦</span>
            <span>BEDTIME PROTOCOL ACTIVE</span>
          </div>
        </header>

        {/* Address / Location Bar */}
        <div className="browser-address-bar">
          <div className="nav-arrows" aria-hidden="true">
            <span className="nav-arrow" title="Back">‹</span>
            <span className="nav-arrow" title="Forward">›</span>
            <span className="nav-arrow nav-home" title="Nursery Home">⌂</span>
          </div>

          <div className="url-field">
            <span className="url-protocol-badge">
              <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                <path d="M8 1a4 4 0 0 0-4 4v2H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-1V5a4 4 0 0 0-4-4zm-2 4a2 2 0 1 1 4 0v2H6V5z" />
              </svg>
              <span>NURSERY-SSL</span>
            </span>
            <span className="url-text">
              hax.baby/midnight-nursery/pip-no-001.htm
            </span>
          </div>

          <div className="browser-clock" aria-hidden="true">
            <span>23:59 PM</span>
          </div>
        </div>

        {/* Browser Content Area */}
        <main className="browser-viewport" id="main-content">
          {children}
        </main>

        {/* Vintage Browser Status Bar */}
        <footer className="browser-statusbar" aria-hidden="true">
          <div className="statusbar-left">
            <span className="status-indicator-dot"></span>
            <span>Document: Done (3 stars loaded, 0 yawns detected)</span>
          </div>
          <div className="statusbar-right">
            <span>Midnight Nursery Intranet · Room 01</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
