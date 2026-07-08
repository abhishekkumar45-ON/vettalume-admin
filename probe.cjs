const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type()==='error') errs.push('CONSOLE.ERROR: ' + m.text().slice(0,200)); });
  await page.goto('http://localhost:8099/', { waitUntil: 'networkidle0' });
  // log in
  await page.type('input[type=password]', 'admin123');
  await page.evaluate(() => { const b=[...document.querySelectorAll('button')].find(x=>/sign in/i.test(x.textContent)); b && b.click(); });
  await new Promise(r=>setTimeout(r,600));
  const m = await page.evaluate(() => {
    const rect = s => { const el=document.querySelector(s); if(!el) return null; const r=el.getBoundingClientRect(); const cs=getComputedStyle(el); return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),display:cs.display,position:cs.position,visibility:cs.visibility,opacity:cs.opacity}; };
    return {
      vw: innerWidth, vh: innerHeight,
      root: rect('#root'), app: rect('.app'), sidebar: rect('.sidebar'), main: rect('.main'), content: rect('.content'), topbar: rect('.topbar'), scrim: rect('.scrim'),
      appGridCols: (()=>{const a=document.querySelector('.app');return a?getComputedStyle(a).gridTemplateColumns:null;})(),
      contentText: (document.querySelector('.content')||{}).textContent?.trim().slice(0,80) || '(none)',
      appChildren: [...(document.querySelector('.app')?.children||[])].map(c=>c.tagName+'.'+(c.className||'')),
    };
  });
  console.log(JSON.stringify(m, null, 2));
  console.log('ERRORS:', errs.length); errs.slice(0,6).forEach(e=>console.log('  '+e));
  await page.screenshot({ path: '/tmp/render.png' });
  await browser.close();
})().catch(e=>{ console.log('PROBE FAILED:', e.message); process.exit(1); });
