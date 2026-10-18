import React, { useState } from 'react';
import NurseryLogPanel from './NurseryLogPanel';
import DreamBlueprintPanel from './DreamBlueprintPanel';
import './RetroBrowserFrame.css';

/**
 * RetroBrowserFrame Component
 * Encapsulates the personal website in an early-2000s scrapbook browser frame.
 * Includes interactive paper tabs, functional sound switch, and responsive URL bar.
 */
export default function RetroBrowserFrame({
  activeTab = 'bedroom',
  onSelectTab,
  soundEnabled = false,
  onToggleSound,
  isNightlight = false,
  children,
}) {
  const [windowEasterEgg, setWindowEasterEgg] = useState(null);

  const triggerWindowDot = (message) => {
    setWindowEasterEgg(message);
    setTimeout(() => {
      setWindowEasterEgg(null);
    }, 2800);
  };

  const getUrlPath = () => {
    switch (activeTab) {
      case 'log':
        return 'hax.baby/midnight-nursery/midnight_nursery.log';
      case 'blueprint':
        return 'hax.baby/midnight-nursery/dream_blueprints.txt';
      case 'bedroom':
      default:
        return 'hax.baby/midnight-nursery/pip-no-001.htm';
    }
  };

  return (
    <div
      className={`retro-browser-container ${isNightlight ? 'theme-nightlight' : 'theme-nursery'}`}
      data-theme={isNightlight ? 'nightlight' : 'nursery'}
    >
      {/* Easter Egg Window Toast */}
      {windowEasterEgg && (
        <div className="window-toast" role="status" aria-live="polite">
          <span className="toast-icon">★</span>
          <span>{windowEasterEgg}</span>
        </div>
      )}

      {/* Accessible Scrapbook Paper Tabs Strip */}
      <nav className="browser-tabs-strip" role="tablist" aria-label="Nursery Document Tabs">
        <button
          type="button"
          role="tab"
          id="tab-bedroom"
          aria-selected={activeTab === 'bedroom'}
          aria-controls="panel-bedroom"
          className={`paper-tab ${activeTab === 'bedroom' ? 'active-tab' : 'idle-tab'}`}
          onClick={() => onSelectTab('bedroom')}
        >
          <span className="tab-icon" aria-hidden="true">★</span>
          <span className="tab-text-full">pip_bedroom.htm</span>
          <span className="tab-text-short">Bedroom</span>
          {activeTab === 'bedroom' && <span className="tab-pin" aria-hidden="true"></span>}
        </button>

        <button
          type="button"
          role="tab"
          id="tab-log"
          aria-selected={activeTab === 'log'}
          aria-controls="panel-log"
          className={`paper-tab ${activeTab === 'log' ? 'active-tab' : 'idle-tab'}`}
          onClick={() => onSelectTab('log')}
        >
          <span className="tab-icon" aria-hidden="true">📋</span>
          <span className="tab-text-full">midnight_nursery.log</span>
          <span className="tab-text-short">Logs</span>
          {activeTab === 'log' && <span className="tab-pin" aria-hidden="true"></span>}
        </button>

        <button
          type="button"
          role="tab"
          id="tab-blueprint"
          aria-selected={activeTab === 'blueprint'}
          aria-controls="panel-blueprint"
          className={`paper-tab ${activeTab === 'blueprint' ? 'active-tab' : 'idle-tab'}`}
          onClick={() => onSelectTab('blueprint')}
        >
          <span className="tab-icon" aria-hidden="true">📐</span>
          <span className="tab-text-full">dream_blueprints.txt</span>
          <span className="tab-text-short">Blueprints</span>
          {activeTab === 'blueprint' && <span className="tab-pin" aria-hidden="true"></span>}
        </button>
      </nav>

      {/* Main Browser Window Frame */}
      <div className="retro-browser-window">
        {/* Title Bar & Window Controls */}
        <header className="browser-topbar">
          <div className="window-dots" role="group" aria-label="Window actions">
            <button
              type="button"
              className="dot dot-close"
              title="Close website (Website refuses to close)"
              aria-label="Try to close website"
              onClick={() => triggerWindowDot("Cannot close: Website is wide awake and clinging to the window sill!")}
            >
              ×
            </button>
            <button
              type="button"
              className="dot dot-min"
              title="Minimize to nap (Website giggles)"
              aria-label="Try to minimize window"
              onClick={() => triggerWindowDot("Pip says: 'No naps yet! We haven't tucked in the footer!'")}
            >
              –
            </button>
            <button
              type="button"
              className="dot dot-max"
              title="Maximize bedtime imagination"
              aria-label="Maximize window"
              onClick={() => triggerWindowDot("Bedtime imagination maximized to 100%!")}
            >
              +
            </button>
          </div>

          <div className="window-title-chip">
            <span className="moon-twinkle" aria-hidden="true">🌙</span>
            <span className="title-text">Midnight Nursery Web Viewer v1.0</span>
          </div>

          <div className="topbar-right-controls">
            {/* Functional Audio Switch */}
            <button
              type="button"
              className={`sound-toggle-btn ${soundEnabled ? 'is-enabled' : 'is-muted'}`}
              onClick={onToggleSound}
              aria-pressed={soundEnabled}
              aria-label={`Sound effects are currently ${soundEnabled ? 'ON' : 'OFF'}. Click to toggle sound.`}
              title={soundEnabled ? 'Mute sound effects' : 'Enable gentle sound effects'}
            >
              <span className="sound-icon" aria-hidden="true">
                {soundEnabled ? '🔊' : '🔈'}
              </span>
              <span className="sound-text">
                Sound: <strong>{soundEnabled ? 'ON' : 'OFF'}</strong>
              </span>
            </button>

            <div className="topbar-status-badge hide-mobile" aria-hidden="true">
              <span className="blinking-star">✦</span>
              <span>{isNightlight ? 'NIGHTLIGHT MODE' : 'BEDTIME ACTIVE'}</span>
            </div>
          </div>
        </header>

        {/* Address / Location Bar */}
        <div className="browser-address-bar">
          <div className="nav-arrows" aria-hidden="true">
            <button
              type="button"
              className="nav-arrow"
              title="Back to bedroom"
              aria-label="Back to bedroom"
              disabled={activeTab === 'bedroom'}
              onClick={() => onSelectTab('bedroom')}
            >
              ‹
            </button>
            <button
              type="button"
              className="nav-arrow"
              title="Forward to blueprints"
              aria-label="Forward"
              disabled={activeTab === 'blueprint'}
              onClick={() => onSelectTab(activeTab === 'bedroom' ? 'log' : 'blueprint')}
            >
              ›
            </button>
            <button
              type="button"
              className="nav-arrow nav-home"
              title="Return to bedroom home"
              aria-label="Bedroom home"
              onClick={() => onSelectTab('bedroom')}
            >
              ⌂
            </button>
          </div>

          <div className="url-field">
            <span className="url-protocol-badge">
              <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                <path d="M8 1a4 4 0 0 0-4 4v2H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-1V5a4 4 0 0 0-4-4zm-2 4a2 2 0 1 1 4 0v2H6V5z" />
              </svg>
              <span>NURSERY-SSL</span>
            </span>
            <span className="url-text" id="browser-url-text">
              {getUrlPath()}
            </span>
          </div>

          <div className="browser-clock" aria-hidden="true" title="Midnight nursery time">
            <span>{isNightlight ? '00:15 AM' : '23:59 PM'}</span>
          </div>
        </div>

        {/* Browser Content Area with Tab Routing */}
        <main className="browser-viewport" id="main-content">
          {activeTab === 'bedroom' && (
            <div id="panel-bedroom" role="tabpanel" aria-labelledby="tab-bedroom">
              {children}
            </div>
          )}

          {activeTab === 'log' && (
            <div id="panel-log" role="tabpanel" aria-labelledby="tab-log">
              <NurseryLogPanel onClose={() => onSelectTab('bedroom')} />
            </div>
          )}

          {activeTab === 'blueprint' && (
            <div id="panel-blueprint" role="tabpanel" aria-labelledby="tab-blueprint">
              <DreamBlueprintPanel onClose={() => onSelectTab('bedroom')} />
            </div>
          )}
        </main>

        {/* Vintage Browser Status Bar */}
        <footer className="browser-statusbar" aria-hidden="true">
          <div className="statusbar-left">
            <span className={`status-indicator-dot ${isNightlight ? 'night-dot' : 'awake-dot'}`}></span>
            <span>
              {activeTab === 'bedroom'
                ? isNightlight
                  ? 'Document: Done (cozy nightlight active · Pip is yawning)'
                  : 'Document: Done (3 stars loaded, 0 yawns detected)'
                : activeTab === 'log'
                ? 'Document: Displaying nursery incident dispatch #001'
                : 'Document: Displaying architectural dream schematics'}
            </span>
          </div>
          <div className="statusbar-right">
            <span>Midnight Nursery Intranet · Room 01</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
