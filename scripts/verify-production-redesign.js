import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const out = 'screenshots/redesign/after';
fs.mkdirSync(out,{recursive:true});
const browser = await puppeteer.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--autoplay-policy=no-user-gesture-required']});
const page = await browser.newPage();
const errors=[], checks=[], captures=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',e=>{if(e.type()==='error') errors.push(e.text());});
const sleep = ms=>new Promise(r=>setTimeout(r,ms));
const check=(name,value)=>{assert.ok(value,name); checks.push(name); console.log('PASS '+name);};
const open=async exp=>{await page.goto('http://127.0.0.1:4173/'+(exp?'?experience='+exp:''),{waitUntil:'networkidle0'}); await sleep(180);};
const shot=async(name,selector)=>{
 const filename=`${out}/${name}.png`;
 if(name.includes('full-gallery')) await sleep(1000);
 if(name.includes('delivery-receipt')) await sleep(500);
 if(name.includes('controls')) await sleep(150);
 if (name.includes('-lantern-') && !name.includes('-controls')) {
   await page.$eval('.moonlight-bedroom-chamber',e=>{
     document.activeElement?.blur();
     e.scrollIntoView({behavior:'instant',block:'start'});
   });
   await sleep(120);
   check(name+' scene visible in capture',await page.$eval('.moonlight-bedroom-chamber',e=>{
     const r=e.getBoundingClientRect();return r.top>=0&&r.top<innerHeight/2&&r.bottom<=innerHeight+2;
   }));
 }
 if(selector) await (await page.$(selector)).screenshot({path:filename});
 else await page.screenshot({path:filename});
 captures.push(filename);
};
const range=async(value)=>{
 await page.$eval('#brightness-slider',(el,value)=>{
   Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,value);
   el.dispatchEvent(new Event('input',{bubbles:true}));
   el.dispatchEvent(new Event('change',{bubbles:true}));
 },String(value));
 await page.waitForFunction(value=>document.querySelector('.slider-value-display')?.textContent===value+'%',{},value);
};
const noOverflow=async(name)=>check(name+' no horizontal clipping/overflow',await page.evaluate(()=>{
 const surface=document.querySelector('.experience-shell-body')||document.documentElement;
 return document.documentElement.scrollWidth<=innerWidth && surface.scrollWidth<=surface.clientWidth+1;
}));
try {
 for(const width of [1440,768,375,320,414]) {
  const height=width===1440?1000:width===768?1024:812;
  await page.setViewport({width,height});
  await open();
  await noOverflow(`${width} gallery`);
  check(`${width} three real gallery doors`,(await page.$$('.doorway-launch-btn')).length===3);
  check(`${width} constellation stars reachable`,await page.$eval('.constellation-star',el=>{
   const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
   return hit===el||el.contains(hit);
  }));
  await page.click('.constellation-star');
  check(`${width} constellation chime responds`,!!await page.$('.dreamspace-sparkle-burst'));
  await shot(`${width}-full-gallery`,'#workshop');
  await open('orchestra');
  await noOverflow(`${width} orchestra`);
  check(`${width} header buttons have separate hit targets`,await page.$$eval('.experience-shell-header button',els=>els.every(el=>{
    const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
    return r.width>=44&&r.height>=44&&(hit===el||el.contains(hit));
  })));
  check(`${width} three independent star buttons`,(await page.$$('.podium-star')).length===3);
  const sizes=await page.$$eval('.podium-star .star-sprite-img',els=>els.map(e=>e.getBoundingClientRect().width));
  check(`${width} equal star sizes`,Math.max(...sizes)-Math.min(...sizes)<1);
  await page.focus('.star-conduction-btn.star-1'); await page.keyboard.press('Enter');
  check(`${width} keyboard star collection`,await page.$eval('.conductor-progress-pill',e=>e.textContent.includes('1/3')));
  await shot(`${width}-interactive-stage`);
  await page.focus('.shell-back-btn'); await page.keyboard.down('Shift');await page.keyboard.press('Tab');await page.keyboard.up('Shift');
  check(`${width} dialog focus loop`,await page.evaluate(()=>document.activeElement.matches('.star-conduction-btn.star-2')));
  await page.keyboard.press('Escape');
  check(`${width} Escape clears route`,!page.url().includes('experience='));
  await open('moonlight');
  await noOverflow(`${width} moonlight`);
  await range(15);
  check(`${width} actual worried ghost state`,await page.$eval('.chamber-ghost-bed',e=>e.classList.contains('too-dark')));
  check(`${width} one official lamp`,(await page.$$('.chamber-lantern-img')).length===1);
  check(`${width} no original occupied room plate`,await page.evaluate(()=>![...document.querySelectorAll('image,img')].some(e=>(e.getAttribute('href')||e.getAttribute('src')||'').includes('/backgrounds/moonlight_room'))));
  await shot(`${width}-lantern-warm-worried`);
  await page.click('.desk-pill-btn:nth-child(2)');await range(90);
  await page.$eval('.experience-shell-body',e=>e.scrollTo({top:0,behavior:'instant'}));
  check(`${width} moon mood and squinting ghost`,await page.$eval('.chamber-ghost-bed',e=>e.classList.contains('too-bright')));
  await shot(`${width}-lantern-moon-bright`);
  await page.click('.desk-pill-btn:nth-child(3)');await range(55);
  await page.click('.test-nightlight-btn');
  await page.waitForSelector('.chamber-ghost-bed.asleep');
  await page.$eval('.experience-shell-body',e=>e.scrollTo({top:0,behavior:'instant'}));
  await shot(`${width}-lantern-starlight-asleep`);
  check(`${width} moonlight stamp earned`,await page.evaluate(()=>JSON.parse(localStorage.getItem('pip_stamps_v1')).moonlight));
  if(width<900) {
   await page.$eval('.moonlight-control-desk',e=>e.scrollIntoView({behavior:'instant',block:'start'}));
   await shot(`${width}-mobile-lantern-controls`);
  }
  await open('express');await noOverflow(`${width} express`);
  const angle1=await page.$eval('.exp-beam-rotor',e=>getComputedStyle(e).transform);
  await shot(`${width}-beacon-angle-1`);await sleep(1700);
  const angle2=await page.$eval('.exp-beam-rotor',e=>getComputedStyle(e).transform);
  check(`${width} live rotating lighthouse`,angle1!==angle2);
  await shot(`${width}-beacon-angle-2`);
  await page.click('.dest-select-btn:nth-child(3)');
  await page.click('.cargo-select-btn:nth-child(2)');
  await page.click('.dispatch-train-btn');
  const wheel1=await page.$eval('.train-wheel.is-spinning',e=>getComputedStyle(e).transform);
  await page.waitForFunction(first=>getComputedStyle(document.querySelector('.train-wheel.is-spinning')).transform!==first,{timeout:1200},wheel1);
  const wheel2=await page.$eval('.train-wheel.is-spinning',e=>getComputedStyle(e).transform);
  check(`${width} independent SVG wheels rotate`,wheel1!==wheel2);
  await page.$eval('.experience-shell-body',e=>e.scrollTo({top:0,behavior:'instant'}));
  let lastTransform='';
  for(const percent of [25,50,75]) {
   await page.waitForFunction(p=>Number(document.querySelector('.express-stage-viewport').dataset.progress)>=p/100,{},percent);
   const actual=await page.$eval('.express-stage-viewport',e=>Number(e.dataset.progress));
   check(`${width} ${percent}% captured within 5%`,actual<percent/100+.05);
   const transform=await page.$eval('.exp-loco-group',e=>e.getAttribute('transform'));
   check(`${width} train advances at ${percent}%`,transform!==lastTransform);lastTransform=transform;
   check(`${width} locomotive visible at ${percent}%`,await page.$eval('.exp-loco-group',el=>{
    const r=el.getBoundingClientRect(),stage=el.closest('svg').getBoundingClientRect();
    return r.width>=30&&r.x>=stage.x-1&&r.right<=stage.right+1;
   }));
   await shot(`${width}-locomotive-${percent}`);
  }
  await page.waitForSelector('.express-delivery-receipt',{timeout:10000});
  check(`${width} selected destination receipt`,await page.$eval('.exp-receipt-destination',e=>e.textContent==='Moonbeam Tower'));
  check(`${width} selected cargo receipt`,await page.$eval('.exp-receipt-cargo',e=>e.textContent.includes('Starlight Letter')));
  await shot(`${width}-delivery-receipt`);
  if(width<900) {
   await page.$eval('.express-control-desk',e=>e.scrollIntoView({behavior:'instant',block:'start'}));
   await shot(`${width}-mobile-dispatch-controls`);
  }
 }

 if(process.argv.includes('--screens-only')) {
  check('zero capture browser errors',errors.length===0);
  fs.writeFileSync(`${out}/capture-results.json`,JSON.stringify({checks,captures,errors},null,2));
  console.log(`${checks.length} capture assertions passed.`);
  await browser.close();
  process.exit(0);
 }
 // Audio source instrumentation records real decoded Web Audio playback.
 await page.setViewport({width:1440,height:1000});
 await page.evaluateOnNewDocument(()=>{
  window.__audioEvents=[];
  const original=AudioContext.prototype.createBufferSource;
  AudioContext.prototype.createBufferSource=function(...args){
   const source=original.apply(this,args),start=source.start.bind(source),stop=source.stop.bind(source);
   const id=Math.random();
   source.start=function(...a){window.__audioEvents.push({type:'start',id,duration:source.buffer?.duration,wall:performance.now()});return start(...a);};
   source.stop=function(...a){window.__audioEvents.push({type:'stop',id,wall:performance.now()});return stop(...a);};
   source.addEventListener('ended',()=>window.__audioEvents.push({type:'ended',id,wall:performance.now()}));
   return source;
  };
 });
 await open('orchestra');await page.click('.shell-sound-btn');
 for(const n of [1,2,3]) await page.click(`.star-conduction-btn.star-${n}`);
 await page.waitForSelector('.magical-star-theater');
 for(const scene of ['A','B','C','D']) {
  await page.waitForSelector(`.phase-performing.subscene-${scene}`,{timeout:16000});
  check(`full vocal subtitle scene ${scene}`,await page.$eval('.subtitle-text',e=>e.textContent.length>10));
  await shot(`vocal-scene-${scene}`);
  if(scene==='B') {
   await page.click('.cradle-character-wrap');
   check('Pip tap preserves song and listening reaction',!!await page.$('.phase-performing .pip-tap-listening'));
  }
 }
 await page.waitForSelector('.orchestra-celebration-screen',{timeout:18000});
 const audio=await page.evaluate(()=>window.__audioEvents);
 const vocals=audio.filter(e=>e.type==='start'&&e.duration>19&&e.duration<22);
 check('one real 20-second vocal source for complete sequence',vocals.length===1);
 const vocalEnd=audio.find(e=>e.id===vocals[0].id&&e.type==='ended');
 check('vocal completes naturally',vocalEnd&&vocalEnd.wall-vocals[0].wall>19000);
 await page.click('.celebration-action-btn.primary-btn');
 for(const n of [1,2,3]) await page.click(`.star-conduction-btn.star-${n}`);
 await page.waitForSelector('.magical-star-theater.phase-performing',{timeout:15000});
 check('replay starts a second single vocal source',await page.evaluate(()=>window.__audioEvents.filter(e=>e.type==='start'&&e.duration>19&&e.duration<22).length===2));
 await page.keyboard.press('Escape');
 await page.waitForSelector('.conductor-sky-stage');
 check('cinematic safe exit restores playable stars',(await page.$$('.podium-star:not(:disabled)')).length===1);
 check('exit stops replay audio',await page.evaluate(()=>{
  const starts=window.__audioEvents.filter(e=>e.type==='start'&&e.duration>19&&e.duration<22);
  return window.__audioEvents.some(e=>e.type==='stop'&&e.id===starts.at(-1).id);
 }));

 // Every destination still responds and awards the postal stamp.
 await open('express');
 for(const [index,name] of [[1,'Cloud Cottage'],[2,'Sleepy Ghost House']]) {
  await page.click(`.dest-select-btn:nth-child(${index})`);await page.click('.dispatch-train-btn');
  await page.waitForSelector('.express-delivery-receipt',{timeout:9000});
  check(`${name} delivery still works`,await page.$eval('.exp-receipt-destination',e=>e.textContent)===name);
 }

 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 await page.setViewport({width:320,height:740});await open('orchestra');
 check('reduced motion star animation disabled',await page.$eval('.star-sprite-img',e=>getComputedStyle(e).animationName==='none'));
 for(const n of [1,2,3]) await page.click(`.star-conduction-btn.star-${n}`);
 await page.waitForSelector('.magical-star-theater.phase-performing',{timeout:15000});
 const position1=await page.$eval('.cinematic-star-node',e=>e.style.transform);await sleep(600);
 const position2=await page.$eval('.cinematic-star-node',e=>e.style.transform);
 check('reduced-motion cinematic holds star positions',position1===position2);
 await shot('320-reduced-motion-film');
 await page.keyboard.press('Escape'); await page.waitForSelector('.conductor-sky-stage');
 await open('express');await page.click('.dispatch-train-btn');
 await page.waitForSelector('.express-delivery-receipt',{timeout:9000});
 check('reduced-motion delivery completes',!!await page.$('.express-delivery-receipt'));
 await page.emulateMediaFeatures([]);

 await open();
 await page.click('.archival-seal-trigger-btn');check('hidden postcard still opens',!!await page.$('[role="dialog"]'));
 await page.keyboard.press('Escape');
 await open();await page.click('.tuck-bedtime-cta-btn');
 check('all stamps unlock bedtime ending',!!await page.$('#bedtime-modal-title'));
 await page.click('.bedtime-wake-btn');check('wake restores gallery',!await page.$('#bedtime-modal-title'));
 check('zero browser console errors',errors.length===0);
 fs.writeFileSync(`${out}/qa-results.json`,JSON.stringify({checks,captures,errors,audio},null,2));
 console.log(`${checks.length} assertions passed. ${captures.length} captures saved.`);
} finally { await browser.close(); }
