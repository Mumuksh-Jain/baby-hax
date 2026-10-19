import React, { useEffect, useRef } from 'react';
import './PipSecretPostcard.css';

/**
 * Pip's Secret Archival Postcard (Pass 02 Master Rescue - Phase 15.2 Easter Egg)
 * Discoverable, accessible secret document unlocked by Pip's Archival Star Wax Seal.
 */
export default function PipSecretPostcard({ isOpen, onClose }) {
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button on open
    const timer = setTimeout(() => {
      if (closeBtnRef.current) {
        closeBtnRef.current.focus();
      }
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
      }
      if (e.key === 'Tab') {
        const controls = [...modalRef.current.querySelectorAll('button, a[href], [tabindex="0"]')].filter(el => el.getClientRects().length);
        const first = controls[0], last = controls.at(-1);
        if (e.shiftKey && (document.activeElement === first || !modalRef.current.contains(document.activeElement))) {e.preventDefault();last?.focus();}
        else if (!e.shiftKey && (document.activeElement === last || !modalRef.current.contains(document.activeElement))) {e.preventDefault();first?.focus();}
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({preventScroll:true});
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="postcard-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="postcard-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="postcard-container" ref={modalRef}>
        {/* Storybook Postage Stamp in Top-Right */}
        <div className="postcard-stamp-wrap" aria-hidden="true">
          <div className="postage-stamp">
            <span className="stamp-icon">★</span>
            <span className="stamp-val">100h</span>
            <span className="stamp-sub">MIDNIGHT</span>
          </div>
          <div className="postmark-circle">
            <span>NURSERY POST</span>
            <span>11:58 PM</span>
          </div>
        </div>

        {/* Postcard Header */}
        <header className="postcard-header">
          <span className="postcard-archival-num">DOC-SECRET-001 · MIDNIGHT NURSERY DECREE</span>
          <h2 id="postcard-title" className="postcard-title">
            Lifetime Bedtime Exemption Pass
          </h2>
          <p className="postcard-subtitle">
            Officially signed by Pip the Skull Baby · Chief Dream Tinkerer
          </p>
        </header>

        {/* Postcard Body with Pip's Official Portrait and Decree */}
        <div className="postcard-content">
          <div className="postcard-portrait-wrap">
            <img
              src="/assets/optimized/pip/pip_portrait.webp"
              alt="Official portrait of Pip the Skull Baby holding a tiny nightlight wrench"
              className="postcard-pip-img"
            />
            <span className="portrait-caption">Chief Tinkerer Pip (Age 1½)</span>
          </div>

          <div className="postcard-decree-text">
            <p className="decree-salutation">“To Whomever Discovered My Archival Star Seal:”</p>
            <p className="decree-body">
              Congratulations! You are officially recognized as a Certified Midnight Co-Conspirator.
              By order of the Midnight Council of Bedside Lamps, Stars, and Friendly Attic Ghosts,
              your bedtime is hereby postponed by precisely <strong>100 dream hours</strong>.
            </p>
            <p className="decree-conditions">
              <strong>Authorized Activities:</strong> Inventing clockwork toys, humming star tunes,
              eating graham crackers under the blanket fort, and testing the Dream Express railway.
            </p>

            <div className="postcard-signature-block">
              <div className="seal-wax-impression" aria-hidden="true">
                <span className="wax-inner">★ PIP ★</span>
              </div>
              <div className="signature-info">
                <span className="sig-handwritten">Pip the Skull Baby</span>
                <span className="sig-title">Master of the Midnight Nursery · haX.baby Track 1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Postcard Actions */}
        <footer className="postcard-footer">
          <button
            ref={closeBtnRef}
            type="button"
            className="postcard-close-btn"
            onClick={onClose}
            aria-label="Tuck secret pass into pocket and close"
          >
            <span>Tuck Pass in Pocket [Close] ➔</span>
          </button>
        </footer>
      </div>
    </div>
  );
}
