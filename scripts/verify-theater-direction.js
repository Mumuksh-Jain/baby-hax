import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { theaterStarPoses } from '../src/components/theaterMotion.js';
const out='screenshots/theater-direction';fs.mkdirSync(out,{recursive:true});
const checks=[],errors=[],captures=[];
const check=(name,value)=>{assert.ok(value,name);checks.push(name);console.log('PASS',name);};
for(const width of [320,375,768,1440]){
 const height=width<600?610:800;
 for(const time of [4.6,7.5,8.8,14.5,19,24,30]){const a=theaterStarPoses(time-.001,width,height),b=theaterStarPoses(time+.001,width,height);check(`${width} choreography continuous at ${time}s`,a.every((p,i)=>Math.hypot(p.x-b[i].x,p.y-b[i].y)<7));}
 for(let t=0;t<36;t+=.25)check(`${width} safe trajectory ${t}`,theaterStarPoses(t,width,height).every(p=>Number.isFinite(p.x+p.y+p.scale)&&p.x>=38&&p.x<=width-38&&p.y>=60&&p.y<=height-45));
}
const browser=await puppeteer.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--autoplay-policy=no-user-gesture-required']});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
try{
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.evaluateOnNewDocument(()=>{window.__sounds=[];const original=AudioContext.prototype.createBufferSource;AudioContext.prototype.createBufferSource=function(){const source=original.call(this),start=source.start,stop=source.stop;source.start=function(...args){window.__sounds.push({event:'start',duration:this.buffer?.duration,time:performance.now()});return start.apply(this,args);};source.stop=function(...args){window.__sounds.push({event:'stop',duration:this.buffer?.duration,time:performance.now()});return stop.apply(this,args);};source.addEventListener('ended',()=>window.__sounds.push({event:'ended',duration:source.buffer?.duration,time:performance.now()}));return source;};});
 for(const width of [1440,768,375,320]){
  await page.setViewport({width,height:width===1440?1000:width===768?1024:812});
  await page.goto('http://127.0.0.1:4173/?experience=orchestra',{waitUntil:'domcontentloaded'});
  await page.waitForSelector('.star-conduction-btn');await page.click('.shell-sound-btn');
  for(const n of [1,2,3])await page.click(`.star-conduction-btn.star-${n}`);
  await page.waitForSelector('.magical-star-theater.phase-curtain');const began=Date.now();
  for(const [sec,name]of [[1,'arrival'],[3.3,'wish'],[6,'spiral'],[8.7,'listen'],[12,'wonder'],[16.8,'question'],[21.5,'village'],[27,'diamond'],[32,'finale']]){
   await sleep(Math.max(0,sec*1000-(Date.now()-began)));
   const filename=`${out}/${width}-${name}.png`;await page.screenshot({path:filename});captures.push(filename);
   check(`${width} ${name} caption controls reachable`,await page.$eval('.theater-caption-tools button',el=>{const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight&&(hit===el||el.contains(hit));}));
  }
  await page.waitForSelector('.orchestra-celebration-screen',{timeout:10000});
  const events=await page.evaluate(()=>window.__sounds);fs.writeFileSync(`${out}/${width}-audio-events.json`,JSON.stringify(events,null,2));
  check(`${width} one full lullaby`,events.filter(e=>e.event==='start'&&e.duration>19&&e.duration<21).length===1);
  check(`${width} five spoken narration cues`,events.filter(e=>e.event==='start'&&e.duration>1.5&&e.duration<3.5).length===5);
  const vocal=events.find(e=>e.event==='start'&&e.duration>19&&e.duration<21);
  check(`${width} narration never overlaps singing`,events.filter(e=>e.event==='start'&&e.duration>1.5&&e.duration<3.5).every(e=>e.time+e.duration*1000<=vocal.time+80||e.time>=vocal.time+19950));
 }
 check('No runtime errors',errors.length===0);
}finally{await browser.close();fs.writeFileSync(`${out}/results.json`,JSON.stringify({checks,errors,captures},null,2));}
