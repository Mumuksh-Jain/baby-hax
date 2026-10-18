import puppeteer from 'puppeteer-core';
const browser=await puppeteer.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const page=await browser.newPage();
for(const width of [1440,768,375,320,414]) {
 await page.setViewport({width,height:width===1440?1000:width===768?1024:812});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle0'});
 await page.$eval('#workshop',e=>e.scrollIntoView({behavior:'instant'}));
 await new Promise(r=>setTimeout(r,200));
 await (await page.$('#workshop')).screenshot({path:`screenshots/redesign/after/${width}-full-gallery.png`});
}
await browser.close();
