import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const browser=await puppeteer.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const page=await browser.newPage();
const results=[];
for(const width of [1440,768,375,320,414]) {
 await page.setViewport({width,height:width===1440?1000:width===768?1024:812});
 await page.goto('http://127.0.0.1:4173/?experience=moonlight',{waitUntil:'networkidle0'});
 for(const [mood,brightness,state,file] of [[1,15,'too-dark','warm-worried'],[2,90,'too-bright','moon-bright'],[3,55,'asleep','starlight-asleep']]) {
  await page.click(`.desk-pill-btn:nth-child(${mood})`);
  await page.$eval('#brightness-slider',(el,value)=>{
   Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,value);
   el.dispatchEvent(new Event('input',{bubbles:true}));
  },String(brightness));
  if(state==='asleep') {
   await page.click('.test-nightlight-btn');
   await page.waitForSelector('.chamber-ghost-bed.asleep');
   await new Promise(r=>setTimeout(r,200));
  }
  assert.ok(await page.$(`.chamber-ghost-bed.${state}`));
  await page.$eval('.moonlight-bedroom-chamber',el=>{
   document.activeElement?.blur();
   el.scrollIntoView({behavior:'instant',block:'start'});
  });
  await new Promise(r=>setTimeout(r,200));
  const info=await page.$eval('.moonlight-bedroom-chamber',e=>{
   const r=e.getBoundingClientRect();
   return {top:r.top,bottom:r.bottom,viewport:innerHeight,scroll:e.closest('.experience-shell-body').scrollTop};
  });
  assert.ok(info.top>=0&&info.top<info.viewport/2&&info.bottom<=info.viewport+2,JSON.stringify(info));
  await page.screenshot({path:`screenshots/redesign/after/${width}-lantern-${file}.png`});
  results.push({width,brightness,mood,state,...info});
  console.log('PASS actual room visible: '+width+' '+file);
 }
}
fs.writeFileSync('screenshots/redesign/after/room-capture-results.json',JSON.stringify(results,null,2));
await browser.close();
