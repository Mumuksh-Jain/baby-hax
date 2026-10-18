import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
const browser = await puppeteer.launch({executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless:true});
const page = await browser.newPage();
await page.setViewport({width:1440,height:1000});
const version=process.argv[2] || 'before';
fs.mkdirSync(`screenshots/redesign/${version}`,{recursive:true});
for (const scene of ['gallery','orchestra','moonlight','express']) {
 await page.goto('http://127.0.0.1:4173/'+(scene==='gallery'?'':'?experience='+scene),{waitUntil:'networkidle0'});
 if(scene==='gallery') {
   await page.$eval('#workshop',e=>e.scrollIntoView({behavior:'instant'}));
   await new Promise(r=>setTimeout(r,500));
 }
 await page.screenshot({path:`screenshots/redesign/${version}/${scene}.png`});
}
await browser.close();
