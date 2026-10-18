import React from 'react';

function Wheel({ x, y, r, moving }) {
  return <g transform={`translate(${x} ${y})`}>
    <g className={moving ? 'train-wheel is-spinning' : 'train-wheel'}>
      <circle r={r} fill="var(--color-stage)" stroke="var(--color-room-trim)" strokeWidth="2.5"/>
      <path d={`M${-r + 2} 0H${r - 2}M0 ${-r + 2}V${r - 2}`} stroke="var(--color-soft-gold)" strokeWidth="1.5"/>
      <circle r="3" fill="var(--color-soft-gold)"/>
    </g>
  </g>;
}

// The independent SVG locomotive from the earlier working experience, with
// each wheel now rotating about its own axle rather than the entire wheel row.
export default function DreamTrain({ positions, moving }) {
  const { loco, carriage } = positions;
  return <>
    <g className="exp-carriage-group" transform={`translate(${carriage.x} ${carriage.y}) rotate(${carriage.angle})`}>
      <path d="M26 -4H47" stroke="var(--color-room-trim)" strokeWidth="4"/>
      <rect x="-36" y="-10" width="72" height="15" rx="2" fill="var(--color-room-wood)"/>
      <rect x="-34" y="-46" width="68" height="36" rx="4" fill="var(--color-berry-deep)" stroke="var(--color-room-trim)" strokeWidth="2"/>
      <path d="M-37 -47H37" stroke="var(--color-soft-gold)" strokeWidth="7" strokeLinecap="round"/>
      <rect x="-24" y="-36" width="48" height="18" rx="3" fill="var(--color-bg-cream)"/>
      <path d="M-24 -35L0 -23L24 -35" fill="none" stroke="var(--color-berry)" strokeWidth="2"/>
      <Wheel x={-22} y={6} r={10} moving={moving}/><Wheel x={22} y={6} r={10} moving={moving}/>
    </g>
    <g className="exp-train-group exp-loco-group" transform={`translate(${loco.x} ${loco.y}) rotate(${loco.angle})`}>
      <path d="M70 -22L205 -53V12Z" fill="url(#expHeadlampGrad)" opacity={moving ? .8 : .35}/>
      <rect x="-46" y="-9" width="108" height="16" rx="3" fill="var(--color-room-wood)" stroke="var(--color-room-trim)" strokeWidth="2"/>
      <path d="M61 4L78 12H61Z" fill="var(--color-room-trim)"/>
      <rect x="-12" y="-39" width="70" height="32" rx="8" fill="var(--color-berry)" stroke="var(--color-soft-gold)" strokeWidth="2"/>
      <path d="M8 -38V-8M33 -38V-8" stroke="var(--color-soft-gold)" strokeWidth="3"/>
      <rect x="50" y="-39" width="14" height="32" rx="4" fill="var(--color-stage)" stroke="var(--color-room-trim)" strokeWidth="2"/>
      <rect x="40" y="-62" width="14" height="23" rx="3" fill="var(--color-stage)" stroke="var(--color-room-trim)" strokeWidth="2"/>
      <path d="M38 -61H56" stroke="var(--color-soft-gold)" strokeWidth="4"/>
      <rect x="-44" y="-53" width="36" height="45" rx="4" fill="var(--color-berry-deep)" stroke="var(--color-soft-gold)" strokeWidth="2"/>
      <rect x="-39" y="-46" width="24" height="22" rx="3" fill="var(--color-soft-gold)"/>
      <path d="M-26 -45V-24M-49 -55H-4" stroke="var(--color-room-trim)" strokeWidth="4" strokeLinecap="round"/>
      <text x="-26" y="-12" textAnchor="middle" fill="var(--color-paper-light)" fontSize="8" fontFamily="var(--font-mono)">003</text>
      <circle cx="69" cy="-23" r="7" fill="var(--color-paper-light)" stroke="var(--color-room-trim)" strokeWidth="3"/>
      <Wheel x={-26} y={8} r={14} moving={moving}/><Wheel x={8} y={8} r={14} moving={moving}/><Wheel x={45} y={11} r={9} moving={moving}/>
      <path className={moving ? 'train-piston is-moving' : 'train-piston'} d="M-26 8H8" stroke="var(--color-paper-light)" strokeWidth="3" strokeLinecap="round"/>
      {moving && <g className="exp-steam-puffs"><circle className="exp-puff ep1" cx="48" cy="-68" r="5"/><circle className="exp-puff ep2" cx="42" cy="-80" r="8"/><circle className="exp-puff ep3" cx="34" cy="-96" r="12"/></g>}
    </g>
  </>;
}
