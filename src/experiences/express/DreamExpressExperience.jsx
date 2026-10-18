import React, { useState, useRef, useEffect } from 'react';
import ExperienceShell from '../ExperienceShell';
import {
  playDeliveryDispatchSound,
  playDeliveryArrivedSound,
  playStampEarnedSound,
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
  const pathRefs = useRef({});

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

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

    if (soundEnabled) playDeliveryDispatchSound();

    const dest = DESTINATIONS[selectedDest];
    const duration = dest.duration || 6000;
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
          setTimeout(() => {
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
    const DEPOT_LOCO_X = 140;
    const DEPOT_LOCO_Y = 420;
    const DEPOT_CAR_X = 68;
    const DEPOT_CAR_Y = 420;

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
    if (!isTraveling) return '0 0 1200 520';
    // Center camera near train position with bounding
    const centerX = Math.max(450, Math.min(750, trainPos.loco.x));
    const startX = centerX - 450;
    return `${startX} 0 900 520`;
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
        <div className="express-stage-viewport" role="region" aria-label="Panoramic Railway Stage">
          {/* Compass / Wayfinder Chip */}
          <div className="express-wayfinder" aria-hidden="true">
            <span className="wayfinder-star">✦</span>
            <span>NURSERY SKYWAY · OFFICIAL CHART</span>
          </div>

          <svg
            viewBox={getCameraViewBox()}
            className="express-svg-canvas"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
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
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
                <stop offset="30%" stopColor="#E0ECFF" stopOpacity="0.55" />
                <stop offset="70%" stopColor="#9AB8F5" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#8CA8F5" stopOpacity="0" />
              </linearGradient>

              <radialGradient id="expBeaconGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="45%" stopColor="#FFE082" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#D4A843" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Layer 1: Sky */}
            <rect width="1200" height="520" fill="url(#expSkyGrad)" />

            {/* Layer 2: Celestial Moon & Stars */}
            <g transform="translate(100, 75)">
              <path d="M 0 -24 A 28 28 0 0 0 24 16 A 24 24 0 0 1 -2 0 A 24 24 0 0 1 0 -24 Z" fill="#FFF3C4" />
            </g>
            <g fill="#F5D88C" opacity="0.75">
              <circle cx="180" cy="55" r="2" />
              <circle cx="270" cy="35" r="1.5" />
              <circle cx="340" cy="85" r="2.5" />
              <circle cx="480" cy="40" r="1.5" />
              <circle cx="560" cy="70" r="2" />
              <circle cx="680" cy="30" r="2" />
              <circle cx="860" cy="45" r="2.5" />
              <circle cx="1020" cy="40" r="2" />
            </g>

            {/* Layer 3: Distant Paper Hills */}
            <path
              d="M 0 520 L 0 380 Q 220 290 460 340 Q 740 280 1020 330 Q 1120 350 1200 370 L 1200 520 Z"
              fill="#26375E"
              opacity="0.6"
            />
            <path
              d="M 0 520 L 0 410 Q 280 340 580 380 Q 860 330 1200 400 L 1200 520 Z"
              fill="#3A5380"
              opacity="0.7"
            />

            {/* Layer 4: Wooden Trestle Piers */}
            <g stroke="#7A5638" strokeWidth="2.5" opacity="0.5">
              <line x1="210" y1="420" x2="210" y2="470" />
              <line x1="260" y1="360" x2="260" y2="470" />
              <line x1="310" y1="300" x2="310" y2="470" />
              <line x1="380" y1="425" x2="380" y2="480" />
              <line x1="590" y1="420" x2="590" y2="480" />
              <line x1="680" y1="315" x2="680" y2="480" />
              <line x1="840" y1="300" x2="840" y2="480" />
            </g>

            {/* Railway Track Paths */}
            {/* Route 1: Depot -> Cloud Cottage */}
            <g className={`exp-rail ${selectedDest === 'cloud-cottage' ? 'is-active' : ''}`}>
              <path d="M 130 420 C 210 420, 260 280, 365 230" fill="none" stroke="#D4A843" strokeWidth="2" strokeDasharray="4 6" opacity="0.3" />
              {selectedDest === 'cloud-cottage' && (
                <g filter="url(#expRouteGlow)">
                  <path d="M 130 420 C 210 420, 260 280, 365 230" fill="none" stroke="#F5D88C" strokeWidth="8" opacity="0.4" />
                  <path d="M 130 420 C 210 420, 260 280, 365 230" fill="none" stroke="#C59B3F" strokeWidth="8" strokeDasharray="3 9" opacity="0.85" />
                  <path d="M 130 420 C 210 420, 260 280, 365 230" fill="none" stroke="#FFFDF9" strokeWidth="2.5" />
                </g>
              )}
              <path ref={(el) => (pathRefs.current['cloud-cottage'] = el)} d="M 130 420 C 210 420, 260 280, 365 230" fill="none" stroke="transparent" />
            </g>

            {/* Route 2: Depot -> Sleepy Ghost House */}
            <g className={`exp-rail ${selectedDest === 'ghost-house' ? 'is-active' : ''}`}>
              <path d="M 130 420 C 280 420, 480 440, 705 390" fill="none" stroke="#D4A843" strokeWidth="2" strokeDasharray="4 6" opacity="0.3" />
              {selectedDest === 'ghost-house' && (
                <g filter="url(#expRouteGlow)">
                  <path d="M 130 420 C 280 420, 480 440, 705 390" fill="none" stroke="#F5D88C" strokeWidth="8" opacity="0.4" />
                  <path d="M 130 420 C 280 420, 480 440, 705 390" fill="none" stroke="#C59B3F" strokeWidth="8" strokeDasharray="3 9" opacity="0.85" />
                  <path d="M 130 420 C 280 420, 480 440, 705 390" fill="none" stroke="#FFFDF9" strokeWidth="2.5" />
                </g>
              )}
              <path ref={(el) => (pathRefs.current['ghost-house'] = el)} d="M 130 420 C 280 420, 480 440, 705 390" fill="none" stroke="transparent" />
            </g>

            {/* Route 3: Depot -> Moonbeam Tower */}
            <g className={`exp-rail ${selectedDest === 'moonbeam-tower' ? 'is-active' : ''}`}>
              <path d="M 130 420 C 350 420, 680 270, 985 320" fill="none" stroke="#D4A843" strokeWidth="2" strokeDasharray="4 6" opacity="0.3" />
              {selectedDest === 'moonbeam-tower' && (
                <g filter="url(#expRouteGlow)">
                  <path d="M 130 420 C 350 420, 680 270, 985 320" fill="none" stroke="#F5D88C" strokeWidth="8" opacity="0.4" />
                  <path d="M 130 420 C 350 420, 680 270, 985 320" fill="none" stroke="#C59B3F" strokeWidth="8" strokeDasharray="3 9" opacity="0.85" />
                  <path d="M 130 420 C 350 420, 680 270, 985 320" fill="none" stroke="#FFFDF9" strokeWidth="2.5" />
                </g>
              )}
              <path ref={(el) => (pathRefs.current['moonbeam-tower'] = el)} d="M 130 420 C 350 420, 680 270, 985 320" fill="none" stroke="transparent" />
            </g>

            {/* Landmarks */}
            {/* Depot at (130, 420) */}
            <g transform="translate(130, 420)">
              <rect x="-85" y="0" width="115" height="14" rx="2" fill="#5C4033" stroke="#422C20" strokeWidth="2" />
              <rect x="-70" y="-32" width="45" height="14" rx="2" fill="#FFFDF8" stroke="#5C4033" strokeWidth="1" />
              <text x="-48" y="-22" textAnchor="middle" fill="#5C4033" fontSize="7" fontWeight="bold" fontFamily="monospace">
                DEPOT 003
              </text>
            </g>

            {/* Cloud Cottage (410, 190) */}
            <g className={`exp-landmark ${deliveredDest === 'cloud-cottage' ? 'is-delivered' : ''}`} transform="translate(410, 190)">
              <ellipse cx="0" cy="35" rx="110" ry="32" fill="#CBDDF2" />
              <circle cx="-55" cy="20" r="38" fill="#E8F1FC" />
              <circle cx="55" cy="20" r="38" fill="#E8F1FC" />
              <circle cx="0" cy="10" r="48" fill="#FFFDF8" />
              <rect x="-40" y="-35" width="80" height="52" rx="4" fill="#FFFDF9" stroke="#5C4033" strokeWidth="2.5" />
              <polygon points="-52,-32 0,-75 52,-32" fill="#8C3B56" stroke="#5C4033" strokeWidth="2.5" />
              <rect x="-24" y="-20" width="22" height="24" rx="3" fill={deliveredDest === 'cloud-cottage' ? '#FFF59D' : '#FFE885'} stroke="#5C4033" strokeWidth="1.5" />
              <g transform="translate(0, -96)">
                <rect x="-65" y="-14" width="130" height="24" rx="12" fill="#FFFDF8" stroke="#5C4033" strokeWidth="1.8" />
                <text x="0" y="3" textAnchor="middle" fill="#5C4033" fontSize="10" fontWeight="bold" fontFamily="var(--font-display)">
                  ☁️ Cloud Cottage
                </text>
              </g>
            </g>

            {/* Sleepy Ghost House (760, 360) */}
            <g className={`exp-landmark ${deliveredDest === 'ghost-house' ? 'is-delivered' : ''}`} transform="translate(760, 360)">
              <rect x="-45" y="-38" width="90" height="74" rx="4" fill="#3A324D" stroke="#251E38" strokeWidth="2.5" />
              <polygon points="-58,-35 0,-95 58,-35" fill="#6C597E" stroke="#251E38" strokeWidth="2.5" />
              <circle cx="0" cy="-58" r="16" fill="#251E38" stroke="#FFE58F" strokeWidth="2" />

              {/* Ghost with waving arm */}
              <g className={`exp-ghost ${deliveredDest === 'ghost-house' ? 'is-waving' : ''}`} transform="translate(0, -56)">
                <path d="M -9 6 C -9 -8, 9 -8, 9 6 C 6 12, 3 9, 0 12 C -3 9, -6 12, -9 6 Z" fill="#FFFDF8" stroke="#5C4033" strokeWidth="1.2" />
                <circle cx="-3" cy="1" r="1.2" fill="#5C4033" />
                <circle cx="3" cy="1" r="1.2" fill="#5C4033" />
                <path className="exp-ghost-arm" d="M 6 3 Q 12 0 14 -6" fill="none" stroke="#FFFDF8" strokeWidth="2.5" strokeLinecap="round" />
              </g>

              <g transform="translate(0, -114)">
                <rect x="-75" y="-14" width="150" height="24" rx="12" fill="#FFFDF8" stroke="#5C4033" strokeWidth="1.8" />
                <text x="0" y="3" textAnchor="middle" fill="#5C4033" fontSize="10" fontWeight="bold" fontFamily="var(--font-display)">
                  👻 Sleepy Ghost House
                </text>
              </g>
            </g>

            {/* Moonbeam Tower (1050, 240) */}
            <g className={`exp-landmark ${deliveredDest === 'moonbeam-tower' ? 'is-delivered' : ''}`} transform="translate(1050, 240)">
              <polygon points="-35,0 -22,-110 22,-110 35,0" fill="#E8DEC8" stroke="#5C4033" strokeWidth="2.5" />
              <rect x="-28" y="-114" width="56" height="8" rx="2" fill="#D4A843" stroke="#5C4033" strokeWidth="1.5" />
              <rect x="-18" y="-136" width="36" height="22" rx="3" fill="#FFFDF8" stroke="#5C4033" strokeWidth="2" />

              {/* Rotating Anime Searchlight Beam */}
              <g className={`exp-beam-rotor ${getLighthouseMode()}`} transform="translate(0, -125)">
                <polygon points="0,0 -480,-140 -480,140" fill="url(#expLighthouseBeamGrad)" />
                <circle cx="0" cy="0" r="16" fill="url(#expBeaconGlow)" />
                <circle cx="0" cy="0" r="6" fill="#FFFFFF" />
              </g>

              <g transform="translate(0, -196)">
                <rect x="-75" y="-14" width="150" height="24" rx="12" fill="#FFFDF8" stroke="#5C4033" strokeWidth="1.8" />
                <text x="0" y="3" textAnchor="middle" fill="#5C4033" fontSize="10" fontWeight="bold" fontFamily="var(--font-display)">
                  🏰 Moonbeam Tower
                </text>
              </g>
            </g>

            {/* Foreground Cloud Framing */}
            <path d="M 0 520 L 0 475 Q 320 435 600 460 Q 900 435 1200 470 L 1200 520 Z" fill="#FAF4EC" opacity="0.9" />

            {/* Articulated Train No. 003 */}
            {/* Postal Carriage */}
            <g
              className="exp-carriage-group"
              transform={`translate(${trainPos.carriage.x}, ${trainPos.carriage.y}) rotate(${trainPos.carriage.angle})`}
            >
              <line x1="26" y1="-4" x2="42" y2="-4" stroke="#5C4033" strokeWidth="4" />
              <rect x="-36" y="-8" width="72" height="14" rx="2" fill="#422C20" stroke="#2B1E17" strokeWidth="1.5" />
              <rect x="-34" y="-36" width="68" height="28" rx="4" fill="#A34063" stroke="#5C4033" strokeWidth="2" />
              <rect x="-36" y="-42" width="72" height="8" rx="3" fill="#FFFDF9" stroke="#5C4033" strokeWidth="1.5" />
              <rect x="-24" y="-28" width="22" height="14" rx="2" fill="#FFE885" stroke="#5C4033" strokeWidth="1.2" />
              <rect x="-20" y="-24" width="14" height="8" rx="1" fill="#D4A843" />
              {/* Carriage Wheels (Spin only while moving) */}
              <g className={`exp-wheels ${isTraveling ? 'is-spinning' : ''}`}>
                <circle cx="-20" cy="6" r="9" fill="#2B1E17" stroke="#D4A843" strokeWidth="2" />
                <line x1="-20" y1="-3" x2="-20" y2="15" stroke="#D4A843" strokeWidth="1.2" />
                <circle cx="16" cy="6" r="9" fill="#2B1E17" stroke="#D4A843" strokeWidth="2" />
                <line x1="16" y1="-3" x2="16" y2="15" stroke="#D4A843" strokeWidth="1.2" />
              </g>
            </g>

            {/* Locomotive */}
            <g
              className="exp-loco-group"
              transform={`translate(${trainPos.loco.x}, ${trainPos.loco.y}) rotate(${trainPos.loco.angle})`}
            >
              <polygon points="70,-22 220,-50 220,6" fill="url(#expHeadlampGrad)" opacity={isTraveling ? 0.9 : 0.45} />
              <rect x="-46" y="-8" width="108" height="16" rx="3" fill="#422C20" stroke="#2B1E17" strokeWidth="1.5" />
              <polygon points="62,8 78,8 62,-6" fill="#D4A843" stroke="#5C4033" strokeWidth="1.5" />
              <rect x="-12" y="-38" width="70" height="32" rx="6" fill="#A34063" stroke="#5C4033" strokeWidth="2" />
              <line x1="8" y1="-38" x2="8" y2="-6" stroke="#F5D88C" strokeWidth="2.5" />
              <line x1="32" y1="-38" x2="32" y2="-6" stroke="#F5D88C" strokeWidth="2.5" />
              <rect x="50" y="-38" width="14" height="32" rx="4" fill="#2B1E17" stroke="#5C4033" strokeWidth="1.5" />
              <circle cx="57" cy="-22" r="5" fill="#D4A843" stroke="#5C4033" strokeWidth="1" />
              <rect x="42" y="-56" width="12" height="18" rx="2" fill="#2B1E17" stroke="#5C4033" strokeWidth="1.5" />
              <rect x="-44" y="-50" width="36" height="44" rx="4" fill="#FFFDF9" stroke="#5C4033" strokeWidth="2" />
              <rect x="-38" y="-44" width="24" height="20" rx="3" fill="#FFE885" stroke="#5C4033" strokeWidth="1.2" />
              <rect x="58" y="-30" width="14" height="14" rx="2" fill="#D4A843" stroke="#5C4033" strokeWidth="1.5" />
              <circle cx="70" cy="-23" r="5" fill="#FFF" />

              {/* Locomotive Wheels (Spin ONLY during travel) */}
              <g className={`exp-wheels ${isTraveling ? 'is-spinning' : ''}`}>
                <circle cx="-25" cy="8" r="14" fill="#2B1E17" stroke="#D4A843" strokeWidth="2.5" />
                <line x1="-25" y1="-6" x2="-25" y2="22" stroke="#D4A843" strokeWidth="1.5" />
                <circle cx="8" cy="8" r="14" fill="#2B1E17" stroke="#D4A843" strokeWidth="2.5" />
                <line x1="8" y1="-6" x2="8" y2="22" stroke="#D4A843" strokeWidth="1.5" />
                <circle cx="45" cy="11" r="9" fill="#2B1E17" stroke="#D4A843" strokeWidth="2" />
                <line x1="45" y1="2" x2="45" y2="20" stroke="#D4A843" strokeWidth="1.2" />
              </g>

              {/* Connecting Rod */}
              <line
                x1="-25"
                y1="8"
                x2="8"
                y2="8"
                className={`exp-rod ${isTraveling ? 'is-piston' : ''}`}
                stroke="#FAF1E2"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Chimney Steam Puffs */}
              {isTraveling && (
                <g className="exp-steam-puffs" aria-hidden="true">
                  <circle className="exp-puff ep1" cx="48" cy="-68" r="5" fill="#FFFFFF" opacity="0.9" />
                  <circle className="exp-puff ep2" cx="42" cy="-80" r="8" fill="#FFFDF8" opacity="0.75" />
                  <circle className="exp-puff ep3" cx="34" cy="-96" r="12" fill="#F0F4FC" opacity="0.55" />
                </g>
              )}
            </g>
          </svg>

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
            <p className="dispatch-hint">
              {isTraveling
                ? 'Camera tracking locomotive along magical sky-rail...'
                : 'Locomotive No. 003 is fueled by starlight & ready!'}
            </p>
          </div>
        </aside>
      </div>
    </ExperienceShell>
  );
}
