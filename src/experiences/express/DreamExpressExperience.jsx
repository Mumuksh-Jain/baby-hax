import React, { useState, useRef, useEffect } from 'react';
import ExperienceShell from '../ExperienceShell';
import DreamTrain from './DreamTrain';
import {
  playDeliveryDispatchSound,
  playDeliveryArrivedSound,
  playStampEarnedSound,
  startTrainJourneyChug,
  stopTrainJourneyChug,
  playTrainWhistleSound,
  playTrainChukSound,
} from '../../utils/soundEngine';
import './DreamExpressExperience.css';

/**
 * DreamExpressExperience Component (Pass 03 Directive - Experience 3)
 * Identity: The Living Dream Express
 * Role: Midnight Postal Conductor | Core Verb: DELIVER
 *
 * Dedicated full-screen panoramic railway adventure with articulated locomotive No. 003,
 * cargo selection, curved sky-rail routes, smooth camera tracking,
 * and destination reactions!
 */
export default function DreamExpressExperience({
  isOpen = false,
  soundEnabled = false,
  onToggleSound,
  onClose,
  onEarnStamp,
  hasStamp = false,
}) {
  const [selectedDest, setSelectedDest] = useState('cloud-cottage');
  const [selectedCargo, setSelectedCargo] = useState('blanket'); // 'blanket' | 'letter' | 'lullaby'
  const [isTraveling, setIsTraveling] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 1
  const [deliveredDest, setDeliveredDest] = useState(null);
  const [deliveryReceipt, setDeliveryReceipt] = useState(null);

  const animRef = useRef(null);
  const stampTimer = useRef(null);
  const previewTimers = useRef([]);
  const clearPreview = () => { previewTimers.current.forEach(clearTimeout); previewTimers.current = []; };
  const pathRefs = useRef({});

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      clearTimeout(stampTimer.current);
      clearPreview();
      stopTrainJourneyChug();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      cancelAnimationFrame(animRef.current);
      clearTimeout(stampTimer.current);
      clearPreview();
      stopTrainJourneyChug();
      setIsTraveling(false);
      setProgress(0);
      setDeliveredDest(null);
      setDeliveryReceipt(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!soundEnabled) {
      clearPreview();
      stopTrainJourneyChug();
    }
  }, [soundEnabled]);

  if (!isOpen) return null;

  const DESTINATIONS = {
    'cloud-cottage': {
      id: 'cloud-cottage',
      name: 'Cloud Cottage',
      platform: 'Platform 1',
      icon: '☁️',
      subtext: 'Fluffy cumulus roof nestled in the high night sky',
      coords: { x: 410, y: 190 },
      duration: 5500,
    },
    'ghost-house': {
      id: 'ghost-house',
      name: 'Sleepy Ghost House',
      platform: 'Platform 2',
      icon: '👻',
      subtext: 'Peaked roof with friendly waving attic ghost',
      coords: { x: 760, y: 360 },
      duration: 6000,
    },
    'moonbeam-tower': {
      id: 'moonbeam-tower',
      name: 'Moonbeam Tower',
      platform: 'Platform 3',
      icon: '🏰',
      subtext: 'High observatory bathed in silvery moonbeams',
      coords: { x: 1050, y: 240 },
      duration: 6800,
    },
  };

  const CARGOS = {
    blanket: {
      id: 'blanket',
      name: 'Cozy Blanket Dream',
      icon: '🛌',
      desc: 'Warm flannel clouds & zero scary dreams',
    },
    letter: {
      id: 'letter',
      name: 'Starlight Letter',
      icon: '✉️',
      desc: 'Written in glowing stardust ink',
    },
    lullaby: {
      id: 'lullaby',
      name: 'Lullaby Parcel',
      icon: '🎵',
      desc: 'Recorded whispers of sweet melodies',
    },
  };

  const handleDispatch = () => {
    if (isTraveling) return;

    setIsTraveling(true);
    setProgress(0);
    setDeliveredDest(null);
    setDeliveryReceipt(null);

    const dest = DESTINATIONS[selectedDest];
    const duration = dest.duration || 6000;

    if (soundEnabled) {
      clearPreview();
      startTrainJourneyChug(duration);
      playTrainWhistleSound();
      playDeliveryDispatchSound();
    }

    const startTime = performance.now();

    const animateTrip = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Smooth cubic ease in-out
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      setProgress(eased);

      if (t < 1) {
        animRef.current = requestAnimationFrame(animateTrip);
      } else {
        setIsTraveling(false);
        setProgress(1);
        stopTrainJourneyChug();
        setDeliveredDest(selectedDest);
        setDeliveryReceipt({
          dest: dest.name,
          cargo: CARGOS[selectedCargo].name,
          cargoIcon: CARGOS[selectedCargo].icon,
          note: `Successfully delivered by Locomotive No. 003. Certified 100% cozy!`,
          time: '11:58 PM · Official Midnight Nursery Stamp',
        });

        if (soundEnabled) {
          playDeliveryArrivedSound();
          stampTimer.current = setTimeout(() => {
            playStampEarnedSound();
          }, 800);
        }

        if (onEarnStamp) onEarnStamp('express');
      }
    };

    animRef.current = requestAnimationFrame(animateTrip);
  };

  // Train Path Coordinates
  const getTrainPositions = () => {
    const DEPOT_LOCO_X = 170;
    const DEPOT_LOCO_Y = 680;
    const DEPOT_CAR_X = 98;
    const DEPOT_CAR_Y = 680;

    const currentDestId = selectedDest;
    const pathElem = pathRefs.current[currentDestId];
    if (!pathElem) {
      return {
        loco: { x: DEPOT_LOCO_X, y: DEPOT_LOCO_Y, angle: 0 },
        carriage: { x: DEPOT_CAR_X, y: DEPOT_CAR_Y, angle: 0 },
      };
    }

    try {
      const totalLen = pathElem.getTotalLength();
      const currentProg = isTraveling ? progress : (deliveredDest ? 1 : 0);
      const locoLen = totalLen * Math.min(1, Math.max(0, currentProg));
      const ptLoco = pathElem.getPointAtLength(locoLen);

      const nextLocoLen = Math.min(totalLen, locoLen + 2);
      const prevLocoLen = Math.max(0, locoLen - 2);
      const ptLocoNext = pathElem.getPointAtLength(nextLocoLen);
      const ptLocoPrev = pathElem.getPointAtLength(prevLocoLen);
      const locoAngle = (Math.atan2(ptLocoNext.y - ptLocoPrev.y, ptLocoNext.x - ptLocoPrev.x) * 180) / Math.PI;

      const CARRIAGE_OFFSET = 72;
      let ptCar, carAngle;

      if (locoLen >= CARRIAGE_OFFSET) {
        const carLen = locoLen - CARRIAGE_OFFSET;
        ptCar = pathElem.getPointAtLength(carLen);
        const nextCarLen = Math.min(totalLen, carLen + 2);
        const prevCarLen = Math.max(0, carLen - 2);
        const ptCarNext = pathElem.getPointAtLength(nextCarLen);
        const ptCarPrev = pathElem.getPointAtLength(prevCarLen);
        carAngle = (Math.atan2(ptCarNext.y - ptCarPrev.y, ptCarNext.x - ptCarPrev.x) * 180) / Math.PI;
      } else {
        const startTangent = pathElem.getPointAtLength(2);
        const pathStart = pathElem.getPointAtLength(0);
        const initialAngle = (Math.atan2(startTangent.y - pathStart.y, startTangent.x - pathStart.x) * 180) / Math.PI;
        const remainingOffset = CARRIAGE_OFFSET - locoLen;
        const rad = (initialAngle * Math.PI) / 180;
        ptCar = {
          x: pathStart.x - remainingOffset * Math.cos(rad),
          y: pathStart.y - remainingOffset * Math.sin(rad),
        };
        carAngle = initialAngle;
      }

      return {
        loco: { x: ptLoco.x, y: ptLoco.y, angle: locoAngle },
        carriage: { x: ptCar.x, y: ptCar.y, angle: carAngle },
      };
    } catch {
      return {
        loco: { x: DEPOT_LOCO_X, y: DEPOT_LOCO_Y, angle: 0 },
        carriage: { x: DEPOT_CAR_X, y: DEPOT_CAR_Y, angle: 0 },
      };
    }
  };

  const trainPos = getTrainPositions();

  // Dynamic Camera Following during travel
  // Camera pans to follow train smoothly
  const getCameraViewBox = () => {
    if (!isTraveling || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return '0 0 1200 792';
    const zoomWidth = 1000;
    const x = Math.max(0, Math.min(1200 - zoomWidth, trainPos.loco.x - zoomWidth / 2));
    return `${x} 0 ${zoomWidth} 792`;
  };

  // Lighthouse searchlight mode
  const getLighthouseMode = () => {
    if (deliveredDest === 'moonbeam-tower') return 'beacon-celebration-mode';
    if (selectedDest === 'moonbeam-tower' && isTraveling && progress > 0.45) {
      return 'beacon-tracking-mode';
    }
    return 'beacon-idle-sweep';
  };

  return (
    <ExperienceShell
      experienceId="express"
      title="The Living Dream Express"
      category="EXP-003 · Miniature Railway World"
      soundEnabled={soundEnabled}
      onToggleSound={onToggleSound}
      onClose={onClose}
    >
      <div className="dream-express-experience-layout">
        {/* Main Panoramic Interactive Railway Stage (75% dominance) */}
        <div className="express-stage-viewport" role="region" aria-label="Panoramic Railway Stage" data-progress={progress.toFixed(3)}>
          {/* Compass / Wayfinder Chip */}
          <div className="express-wayfinder" aria-hidden="true">
            <span className="wayfinder-star">✦</span>
            <span>NURSERY SKYWAY · OFFICIAL CHART</span>
          </div>

          <svg
            viewBox={getCameraViewBox()}
            className="express-svg-canvas"
            preserveAspectRatio="xMidYMid meet"
            role="group"
            aria-label="Dream Express map. Choose a destination, then dispatch your dream."
          >
            <defs>
              <linearGradient id="expSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#111833" />
                <stop offset="35%" stopColor="#1B2B50" />
                <stop offset="70%" stopColor="#304878" />
                <stop offset="100%" stopColor="#E2CFBE" />
              </linearGradient>

              <filter id="expRouteGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="4" floodColor="#F5D88C" floodOpacity="0.85" />
              </filter>

              <linearGradient id="expHeadlampGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#FFFDF9" stopOpacity="0.9" />
                <stop offset="35%" stopColor="#FFF59D" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#FFF59D" stopOpacity="0" />
              </linearGradient>

              <linearGradient id="expLighthouseBeamGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#F5D88C" stopOpacity="0" />
                <stop offset="30%" stopColor="#F5D88C" stopOpacity="0.08" />
                <stop offset="70%" stopColor="#FFF0BD" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#FFF8DC" stopOpacity="0.7" />
              </linearGradient>

              <radialGradient id="expBeaconGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="45%" stopColor="#FFE082" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#D4A843" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Landscape and train share the same SVG coordinates and camera. */}
            <image href="/assets/optimized/production-art/derived/dream_express_world_no_beam.webp" x="0" y="0" width="1200" height="792" preserveAspectRatio="none" />

            {/* Railway Track Paths */}
            {/* Route 1: Depot -> Cloud Cottage */}
            <g className={`exp-rail ${selectedDest === 'cloud-cottage' ? 'is-active' : ''}`}>
              <path d="M 170 680 C 265 650, 210 435, 355 350" fill="none" stroke="#D4A843" strokeWidth="2" strokeDasharray="4 6" opacity="0.3" />
              {selectedDest === 'cloud-cottage' && (
                <g filter="url(#expRouteGlow)">
                  <path d="M 170 680 C 265 650, 210 435, 355 350" fill="none" stroke="#F5D88C" strokeWidth="8" opacity="0.4" />
                  <path d="M 170 680 C 265 650, 210 435, 355 350" fill="none" stroke="#C59B3F" strokeWidth="8" strokeDasharray="3 9" opacity="0.85" />
                  <path d="M 170 680 C 265 650, 210 435, 355 350" fill="none" stroke="#FFFDF9" strokeWidth="2.5" />
                </g>
              )}
              <path ref={(el) => (pathRefs.current['cloud-cottage'] = el)} d="M 170 680 C 265 650, 210 435, 355 350" fill="none" stroke="transparent" />
            </g>

            {/* Route 2: Depot -> Sleepy Ghost House */}
            <g className={`exp-rail ${selectedDest === 'ghost-house' ? 'is-active' : ''}`}>
              <path d="M 170 680 C 340 650, 480 694, 740 660" fill="none" stroke="#D4A843" strokeWidth="2" strokeDasharray="4 6" opacity="0.3" />
              {selectedDest === 'ghost-house' && (
                <g filter="url(#expRouteGlow)">
                  <path d="M 170 680 C 340 650, 480 694, 740 660" fill="none" stroke="#F5D88C" strokeWidth="8" opacity="0.4" />
                  <path d="M 170 680 C 340 650, 480 694, 740 660" fill="none" stroke="#C59B3F" strokeWidth="8" strokeDasharray="3 9" opacity="0.85" />
                  <path d="M 170 680 C 340 650, 480 694, 740 660" fill="none" stroke="#FFFDF9" strokeWidth="2.5" />
                </g>
              )}
              <path ref={(el) => (pathRefs.current['ghost-house'] = el)} d="M 170 680 C 340 650, 480 694, 740 660" fill="none" stroke="transparent" />
            </g>

            {/* Route 3: Depot -> Moonbeam Tower */}
            <g className={`exp-rail ${selectedDest === 'moonbeam-tower' ? 'is-active' : ''}`}>
              <path d="M 170 680 C 320 422, 680 355, 1010 354" fill="none" stroke="#D4A843" strokeWidth="2" strokeDasharray="4 6" opacity="0.3" />
              {selectedDest === 'moonbeam-tower' && (
                <g filter="url(#expRouteGlow)">
                  <path d="M 170 680 C 320 422, 680 355, 1010 354" fill="none" stroke="#F5D88C" strokeWidth="8" opacity="0.4" />
                  <path d="M 170 680 C 320 422, 680 355, 1010 354" fill="none" stroke="#C59B3F" strokeWidth="8" strokeDasharray="3 9" opacity="0.85" />
                  <path d="M 170 680 C 320 422, 680 355, 1010 354" fill="none" stroke="#FFFDF9" strokeWidth="2.5" />
                </g>
              )}
              <path ref={(el) => (pathRefs.current['moonbeam-tower'] = el)} d="M 170 680 C 320 422, 680 355, 1010 354" fill="none" stroke="transparent" />
            </g>

            {/* Landmarks (Waypoints & Arrival Effects matching dream_express_world.png) */}
            {/* Depot Tag (130, 420) */}
            <g transform="translate(170, 710)">
              <rect x="-65" y="-30" width="130" height="22" rx="11" fill="rgba(15, 23, 42, 0.85)" stroke="#F5D88C" strokeWidth="1.5" />
              <text x="0" y="-15" textAnchor="middle" fill="#F5D88C" fontSize="9" fontWeight="bold" fontFamily="monospace">
                ★ DEPOT NO. 003
              </text>
            </g>

            {/* Cloud Cottage Station (410, 170) */}
            <g className={`exp-landmark ${deliveredDest === 'cloud-cottage' ? 'is-delivered' : ''}`} transform="translate(355, 400)">
              <rect x="-65" y="-12" width="130" height="24" rx="12" fill="rgba(15, 23, 42, 0.88)" stroke="#F5D88C" strokeWidth="1.8" />
              <text x="0" y="4" textAnchor="middle" fill="#FAF0CA" fontSize="10" fontWeight="bold" fontFamily="var(--font-display)">
                ☁️ Cloud Cottage {deliveredDest === 'cloud-cottage' && '✓'}
              </text>
              {deliveredDest === 'cloud-cottage' && (
                <circle cx="0" cy="0" r="36" fill="none" stroke="#F5D88C" strokeWidth="2.5" className="arrival-halo" />
              )}
            </g>

            {/* Sleepy Ghost House Station (760, 340) */}
            <g className={`exp-landmark ${deliveredDest === 'ghost-house' ? 'is-delivered' : ''}`} transform="translate(770, 708)">
              <rect x="-75" y="-12" width="150" height="24" rx="12" fill="rgba(15, 23, 42, 0.88)" stroke="#F5D88C" strokeWidth="1.8" />
              <text x="0" y="4" textAnchor="middle" fill="#FAF0CA" fontSize="10" fontWeight="bold" fontFamily="var(--font-display)">
                👻 Sleepy Ghost House {deliveredDest === 'ghost-house' && '✓'}
              </text>
              {deliveredDest === 'ghost-house' && (
                <circle cx="0" cy="0" r="36" fill="none" stroke="#70D6FF" strokeWidth="2.5" className="arrival-halo" />
              )}
            </g>

            {/* Moonbeam Tower Station & Rotating Searchlight (1050, 160) */}
            <g className={`exp-landmark ${deliveredDest === 'moonbeam-tower' ? 'is-delivered' : ''}`} transform="translate(1047, 139)">
              {/* Rotating Searchlight Beam from Lighthouse Lantern Room */}
              <g className={`exp-beam-rotor ${getLighthouseMode()}`}>
                <polygon points="0,0 -480,-140 -480,140" fill="url(#expLighthouseBeamGrad)" />
                <circle cx="0" cy="0" r="16" fill="url(#expBeaconGlow)" />
                <circle cx="0" cy="0" r="6" fill="#FFFFFF" />
              </g>

              <rect x="-75" y="235" width="150" height="24" rx="12" fill="rgba(15, 23, 42, 0.88)" stroke="#F5D88C" strokeWidth="1.8" />
              <text x="0" y="251" textAnchor="middle" fill="#FAF0CA" fontSize="10" fontWeight="bold" fontFamily="var(--font-display)">
                🏰 Moonbeam Tower {deliveredDest === 'moonbeam-tower' && '✓'}
              </text>
              {deliveredDest === 'moonbeam-tower' && (
                <circle cx="0" cy="0" r="36" fill="none" stroke="#FFD166" strokeWidth="2.5" className="arrival-halo" />
              )}
            </g>

            <g className="express-map-targets">
              {[
                ['cloud-cottage',380,230],['ghost-house',785,570],['moonbeam-tower',1047,260],
              ].map(([id,x,y],i) => <g key={id} className={`express-map-destination ${selectedDest===id?'is-selected':''}`} transform={`translate(${x},${y})`} role="button" tabIndex={isTraveling?-1:0} aria-label={`Choose ${DESTINATIONS[id].name}`} aria-pressed={selectedDest===id} aria-disabled={isTraveling} onClick={()=>{if(isTraveling)return;setSelectedDest(id);setDeliveredDest(null);setDeliveryReceipt(null);}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();if(isTraveling)return;setSelectedDest(id);setDeliveredDest(null);setDeliveryReceipt(null);}}}>
                <circle className="express-map-hit" r="100" />
                <g className="express-map-pin" transform="translate(-75,-60)"><circle r="20"/><text textAnchor="middle" y="6">{i+1}</text></g>
              </g>)}
            </g>
            <DreamTrain positions={trainPos} moving={isTraveling} />
          </svg>

          <div className="express-trip-status" role="status">{isTraveling ? `Delivering to ${DESTINATIONS[selectedDest].name} · ${Math.round(progress * 100)}%` : deliveredDest ? 'Dream delivered. Another little goodnight?' : 'Locomotive 003 · Ready for a little night shift'}</div>
          {/* Delivery Receipt Card on Arrival */}
          {deliveryReceipt && (
            <div className="express-delivery-receipt exp-delivery-receipt" role="region" aria-label="Official Postal Receipt">
              <div className="exp-receipt-header">
                <span className="exp-receipt-stamp">
                  {deliveryReceipt.cargoIcon} OFFICIAL MIDNIGHT NURSERY POSTAL RECEIPT
                </span>
                <button
                  type="button"
                  className="exp-receipt-close"
                  onClick={() => setDeliveryReceipt(null)}
                  aria-label="Dismiss receipt"
                >
                  ✕
                </button>
              </div>
              <h3 className="exp-receipt-destination">{deliveryReceipt.dest}</h3>
              <p className="exp-receipt-cargo">
                Delivered Cargo: <strong>{deliveryReceipt.cargo}</strong>
              </p>
              <p className="exp-receipt-note">{deliveryReceipt.note}</p>
              <div className="exp-receipt-footer">
                <span className="exp-receipt-time">{deliveryReceipt.time}</span>
                <span className="exp-receipt-pass">POSTAL CONDUCTOR CERTIFIED ✓</span>
              </div>
            </div>
          )}
        </div>

        {/* Postal Conductor Dispatch Workbench */}
        <aside className="express-control-desk" aria-labelledby="dispatch-desk-title">
          <div className="desk-header">
            <span className="desk-badge">ROLE: POSTAL CONDUCTOR</span>
            <h2 id="dispatch-desk-title" className="desk-title">Dispatch Desk</h2>
            <p className="desk-desc">Route dream cargo to sleepy nursery houses across the skyway.</p>
          </div>

          {/* 1. Destination Selection */}
          <div className="desk-group">
            <label className="desk-label">1. Select Destination</label>
            <div className="destinations-stack" role="group" aria-label="Destinations">
              {Object.values(DESTINATIONS).map((dest) => (
                <button
                  key={dest.id}
                  type="button"
                  className={`dest-select-btn ${selectedDest === dest.id ? 'is-selected' : ''}`}
                  onClick={() => {
                    setSelectedDest(dest.id);
                    setDeliveredDest(null);
                    setDeliveryReceipt(null);
                  }}
                  disabled={isTraveling}
                  aria-pressed={selectedDest === dest.id}
                >
                  <span className="dest-btn-icon">{dest.icon}</span>
                  <div className="dest-btn-info">
                    <span className="dest-btn-name">{dest.name}</span>
                    <span className="dest-btn-sub">{dest.platform}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Cargo Selection */}
          <div className="desk-group">
            <label className="desk-label">2. Select Dream Cargo</label>
            <div className="cargos-stack" role="group" aria-label="Dream Cargos">
              {Object.values(CARGOS).map((cargo) => (
                <button
                  key={cargo.id}
                  type="button"
                  className={`cargo-select-btn ${selectedCargo === cargo.id ? 'is-selected' : ''}`}
                  onClick={() => setSelectedCargo(cargo.id)}
                  disabled={isTraveling}
                  aria-pressed={selectedCargo === cargo.id}
                >
                  <span className="cargo-btn-icon">{cargo.icon}</span>
                  <div className="cargo-btn-info">
                    <span className="cargo-btn-name">{cargo.name}</span>
                    <span className="cargo-btn-sub">{cargo.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Dispatch Action */}
          <div className="desk-dispatch-action">
            <button
              type="button"
              className={`dispatch-train-btn ${isTraveling ? 'is-traveling' : ''}`}
              onClick={handleDispatch}
              disabled={isTraveling}
            >
              <span>{isTraveling ? 'Dream Express in Flight... 🚂' : 'Dispatch Dream Express ➔'}</span>
            </button>
            <button
              type="button"
              className="express-sound-preview-btn"
              disabled={isTraveling}
              onClick={() => {
                if (!soundEnabled) onToggleSound?.();
                clearPreview();
                stopTrainJourneyChug();
                playTrainWhistleSound();
                playTrainChukSound({ isAccented: true });
                previewTimers.current.push(setTimeout(() => playTrainChukSound({ isAccented: false }), 200));
                previewTimers.current.push(setTimeout(() => playTrainChukSound({ isAccented: false }), 380));
                previewTimers.current.push(setTimeout(() => playTrainChukSound({ isAccented: true }), 560));
              }}
              aria-label="Sound locomotive whistle and train chuk chuk chuk chuk"
              title="Test the locomotive whistle and chuk chuk chuk chuk sound"
            >
              <span>🚂 Toot-Toot &amp; Chuk-Chuk Sound</span>
            </button>
            <p className="dispatch-hint">
              {isTraveling
                ? 'Camera tracking locomotive with rhythmic chuk-chuk-chuk along the sky-rail...'
                : 'Locomotive No. 003 is fueled by starlight & ready!'}
            </p>
          </div>
        </aside>
      </div>
    </ExperienceShell>
  );
}
