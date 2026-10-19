import React, { useEffect, useRef, useState } from 'react';
import { playStarSound } from '../../utils/soundEngine';

export default function DreamCatcher({ soundEnabled }) {
  const [playing,setPlaying]=useState(false),[caught,setCaught]=useState([]),[flashlight,setFlashlight]=useState(true),[round,setRound]=useState(0),[best,setBest]=useState(()=>{try{return Number(localStorage.getItem('pip_catcher_best'))||0;}catch{return 0;}});
  const [lastCatch,setLastCatch]=useState(null);
  const field=useRef(null),start=useRef(0),catchTimer=useRef(null),hiddenAt=useRef(null);
  const [seconds,setSeconds]=useState(null);
  const reveal = (x,y)=>{field.current?.style.setProperty('--lamp-x',`${x}%`);field.current?.style.setProperty('--lamp-y',`${y}%`);};
  const catchDream = i => {if(!playing||caught.includes(i))return;const next=[...caught,i];setCaught(next);setLastCatch(i);clearTimeout(catchTimer.current);catchTimer.current=setTimeout(()=>setLastCatch(null),700);if(soundEnabled)playStarSound(i%3);if(next.length===6){const elapsed=Math.max(1,Math.round((performance.now()-start.current)/1000));setSeconds(elapsed);setPlaying(false);if(!best||elapsed<best){setBest(elapsed);try{localStorage.setItem('pip_catcher_best',String(elapsed));}catch{}}}};
  const begin=()=>{hiddenAt.current=null;clearTimeout(catchTimer.current);setCaught([]);setPlaying(true);setSeconds(null);setLastCatch(null);setRound(r=>r+1);start.current=performance.now();};
  useEffect(()=>{if(!playing)return;const check=()=>{if(document.hidden)hiddenAt.current=performance.now();else if(hiddenAt.current){start.current+=performance.now()-hiddenAt.current;hiddenAt.current=null;}};document.addEventListener('visibilitychange',check);return()=>document.removeEventListener('visibilitychange',check);},[playing]);
  useEffect(()=>()=>clearTimeout(catchTimer.current),[]);
  return <section className="dreamcatcher" aria-labelledby="catcher-title"><div className="dreamcatcher-copy"><span className="club-kicker">A SMALL JOB BEFORE BED</span><h3 id="catcher-title">Catch the dreams<br/>that got away.</h3><p>Sweep your nightlight across the sky. Find six little stars and tuck them back into Pip’s pocket.</p><div className="club-game-controls"><button onClick={begin}>{playing?'Start again':caught.length===6?'Play again':'Catch some dreams'}</button><button aria-pressed={flashlight} onClick={()=>setFlashlight(v=>!v)}>Nightlight {flashlight?'on':'off'}</button></div><div className="dreamcatcher-pocket" role="img" aria-label={`${caught.length} of 6 dreams caught`}>{[0,1,2,3,4,5].map(i=><span key={i} className={i<caught.length?'is-filled':''} aria-hidden="true">✦</span>)}</div><p className="club-game-score" role="status">{caught.length===6?`All six tucked in. ${seconds} seconds. Sweet dreams!`:playing?`${caught.length} of 6 dreams tucked in`:'Mouse, touch, or Tab + Enter. No time limit.'}</p>{best>0&&<p className="club-small">Your quickest night shift: {best}s</p>}</div>
    <div className={`dreamcatcher-field ${flashlight?'has-nightlight':''} ${playing?'is-playing':''}`} ref={field} onPointerMove={e=>{const r=e.currentTarget.getBoundingClientRect();reveal((e.clientX-r.left)/r.width*100,(e.clientY-r.top)/r.height*100);}} onPointerDown={e=>{const r=e.currentTarget.getBoundingClientRect();reveal((e.clientX-r.left)/r.width*100,(e.clientY-r.top)/r.height*100);}}>
      <div className="dreamcatcher-moon" aria-hidden="true">☾</div><div className="dreamcatcher-land" aria-hidden="true"><span/><span/><span/></div>
      {[0,1,2,3,4,5].map(i=><button key={`${round}-${i}`} className={`dreamcatcher-star ${caught.includes(i)?'is-caught':''}`} style={{'--star-x':`${[16,43,75,28,62,84][i]}%`,'--star-y':`${[28,17,29,65,70,61][i]}%`,'--delay':`${i*-.8}s`}} aria-label={`Catch dream ${i+1}`} disabled={!playing||caught.includes(i)} onFocus={e=>{const r=field.current.getBoundingClientRect(),b=e.currentTarget.getBoundingClientRect();reveal((b.x+b.width/2-r.x)/r.width*100,(b.y+b.height/2-r.y)/r.height*100);}} onClick={()=>catchDream(i)}>✦</button>)}
      <div className="dreamcatcher-darkness" aria-hidden="true"/>
      {lastCatch!==null&&<span className="dreamcatcher-catch-burst" style={{'--burst-x':`${[16,43,75,28,62,84][lastCatch]}%`,'--burst-y':`${[28,17,29,65,70,61][lastCatch]}%`}} aria-hidden="true">✧ +1</span>}
      {!playing&&caught.length!==6&&<span className="dreamcatcher-invitation">Six dreams. One little nightlight.</span>}{caught.length===6&&<span className="dreamcatcher-invitation">All safe, all sleepy. Thank you. ♡</span>}
    </div>
  </section>;
}
