import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Contact sheets contain the actual captured states, never simulated scene states.
const browser=await puppeteer.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const page=await browser.newPage();
const dir=path.resolve('screenshots/redesign/after');
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.png'));
const panels=[['stage-room',['interactive-stage','lantern-warm-worried','lantern-moon-bright','lantern-starlight-asleep']],['railway',['locomotive-25','locomotive-50','locomotive-75','beacon-angle-1','beacon-angle-2','delivery-receipt']],['controls',['mobile-lantern-controls','mobile-dispatch-controls']]];
fs.mkdirSync('screenshots/redesign/review',{recursive:true});
for(const width of [1440,768,375,320,414]) for(const [panel,suffixes] of panels) {
 const images=files.filter(f=>suffixes.some(s=>f===`${width}-${s}.png`));
 if(!images.length)continue;
 const cssWidth=width>1000?640:width>600?470:width;
 const body=`<!doctype html><style>body{margin:0;padding:20px;background:#eee9df;font:14px system-ui;color:#3d2619}main{display:grid;grid-template-columns:repeat(2,${cssWidth}px);gap:20px}figure{margin:0}img{width:100%;display:block}figcaption{padding:8px 0}</style><h1>${width}px · ${panel}</h1><main>${images.map(f=>`<figure><figcaption>${f}</figcaption><img src="../after/${f}"></figure>`).join('')}</main>`;
 const html=path.resolve(`screenshots/redesign/review/${width}-${panel}.html`);
 fs.writeFileSync(html,body);
 await page.setViewport({width:cssWidth*2+60,height:1000});
 await page.goto(pathToFileURL(html).href,{waitUntil:'load'});
 await page.screenshot({path:`screenshots/redesign/review/${width}-${panel}.png`,fullPage:true});
}
await browser.close();
