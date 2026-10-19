import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const out='screenshots/rubric',checks=[],errors=[];
const b=await puppeteer.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-unsafe-swiftshader']});
const p=await b.newPage();p.on('pageerror',e=>errors.push(e.message));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const check=(n,v)=>{assert.ok(v,n);checks.push(n);console.log('PASS '+n)};
const click=async s=>{await p.$eval(s,e=>e.scrollIntoView({behavior:'instant',block:'center'}));await p.click(s);};
const shot=async(n,s)=>{await p.$eval(s,e=>e.scrollIntoView({behavior:'instant',block:'center'}));await sleep(250);await p.screenshot({path:`${out}/${n}.png`});};
try{
await p.setViewport({width:1440,height:1000});await p.goto('http://127.0.0.1:4173');
await p.evaluate(()=>{localStorage.setItem('pip_chat_v1','{"bad":true}');localStorage.setItem('pip_visitor_v1','null')});await p.reload();await p.waitForSelector('#visitor-name');check('Malformed stored chat does not crash page',true);
await click('#visitor-name');await p.type('#visitor-name','Luna');await click('.club-name-row button');check('Nickname persisted',await p.evaluate(()=>JSON.parse(localStorage.getItem('pip_visitor_v1')).name==='Luna'));
await p.evaluate(()=>sessionStorage.removeItem('pip_visit_counted'));await p.reload();await p.waitForSelector('#club-title');check('Returning personalized greeting',await p.$eval('.club-header',e=>e.textContent.includes('Welcome back, Luna')));
await click('#club-tab-chat');await click('.club-prompts button');check('Contextual joke response',await p.$eval('.club-messages',e=>e.textContent.includes('eclipse')));
await click('.club-model-invite button');await p.waitForSelector('.club-canvas canvas');await sleep(500);await click('[aria-label="Turn Pip right"]');check('3D turn responds',await p.$eval('.club-model-hint',e=>e.textContent.includes('turning')));await shot('1440-model-turned','.club-model');await click('.club-model-tools button:nth-child(2)');check('3D wave responds',await p.$eval('.club-model-hint',e=>e.textContent.includes('hello')));
await click('.club-game-controls button');for(let i=1;i<=6;i++){await p.focus(`[aria-label="Catch dream ${i}"]`);await p.keyboard.press('Enter');}check('Keyboard game completes six dreams',await p.$eval('.club-game-score',e=>e.textContent.includes('All six')));await click('.club-game-controls button');check('Replay resets game',await p.$eval('.dreamcatcher-pocket',e=>e.getAttribute('aria-label').startsWith('0')));await shot('1440-game-active','.dreamcatcher');
await click('.journey-chapters button:nth-child(3)');check('Manual route reaches destination',await p.$eval('#journey-progress',e=>e.value==='100'));await p.focus('#journey-progress');await p.keyboard.press('Home');check('Keyboard route control',await p.$eval('#journey-progress',e=>e.value==='0'));await click('.scroll-journey .club-text-button');await p.$eval('.scroll-journey',e=>window.scrollTo({top:e.offsetTop+300,behavior:'instant'}));await sleep(150);check('Scroll moves train',await p.$eval('#journey-progress',e=>Number(e.value)>0));
await p.focus('.story-flipbook');let title=await p.$eval('.chapter-title',e=>e.textContent);await p.keyboard.press('ArrowRight');check('Story keyboard turns page',await p.$eval('.chapter-title',(e,title)=>e.textContent!==title,title));
await click('.archival-seal-trigger-btn');await sleep(100);check('Secret dialog opened',!!await p.$('.postcard-backdrop'));await p.keyboard.down('Shift');await p.keyboard.press('Tab');await p.keyboard.up('Shift');check('Secret focus trapped',await p.evaluate(()=>document.querySelector('.postcard-container').contains(document.activeElement)));await p.keyboard.press('Escape');check('Secret closes and restores focus',await p.evaluate(()=>document.activeElement.matches('.archival-seal-trigger-btn')));
await p.$eval('.club-wishes',e=>e.scrollIntoView({behavior:'instant'}));await p.waitForFunction(()=>document.querySelector('.club-connection').textContent.includes('Connected'));
const context=await b.createBrowserContext(),other=await context.newPage();await other.goto('http://127.0.0.1:4173');await other.$eval('#after-hours',e=>e.scrollIntoView({behavior:'instant'}));await other.waitForSelector('.club-wishes');
const wish='A shared test wish '+Date.now();await p.type('[name="wish-message"]',wish);await click('.club-wish-form button');await other.waitForFunction(w=>document.querySelector('.club-wish-wall')?.textContent.includes(w),{},wish);check('Wish broadcasts to independent browser session',true);await context.close();await shot('1440-live-guestbook','.club-wishes');
for(const width of [1440,768,375,320]){await p.setViewport({width,height:1000});await sleep(200);check(width+' no page overflow',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));for(const [name,selector]of [['hero','.hero-section'],['club','.club-model'],['game','.dreamcatcher'],['guestbook','.club-wishes'],['journey','.scroll-journey']])await shot(`${width}-${name}`,selector);}
await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);check('Reduced-motion game stars static',await p.$eval('.dreamcatcher-star',e=>getComputedStyle(e).animationName==='none'));
check('No runtime errors',errors.length===0);
}finally{await b.close();fs.writeFileSync(`${out}/rubric-results.json`,JSON.stringify({checks,errors},null,2));}

