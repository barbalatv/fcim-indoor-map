// Actual Chrome + bounded local HTTP. API data is recorded real-response replay;
// error/uncertainty/XSS cases are explicitly synthetic fault injection.
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict'),{pathToFileURL}=require('url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.argv[2]||path.join(root,'map02b-evidence'));
fs.mkdirSync(out,{recursive:true});const results=[],runtimeErrors=[],consoleErrors=[];let browser,context,page,mode='good',delay=0;
const payload=(course,route)=>structuredClone(require('./fixtures/map02b/course'+course+'-'+route+'.json'));
const listen=server=>new Promise(resolve=>server.listen(0,'127.0.0.1',()=>resolve('http://127.0.0.1:'+server.address().port)));
const mapServer=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost'),file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream');res.end(fs.readFileSync(file));
});
let mapOrigin;
const apiServer=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost'),course=Number(url.searchParams.get('course')),route=url.pathname.slice(5);
 const currentMode=mode;
 if(currentMode==='network'){res.destroy();return;}
 if(currentMode!=='cors')res.setHeader('Access-Control-Allow-Origin',mapOrigin);res.setHeader('Vary','Origin');res.setHeader('Content-Type','application/json');
 if(![1,2].includes(course)||!['schedule','status'].includes(route)){res.writeHead(400);res.end('{}');return;}
 setTimeout(()=>{
  if(currentMode==='failure'||currentMode==='partial'&&course===2){res.writeHead(503);res.end('{"error":"isolated replay unavailable"}');return;}
  const data=payload(course,route);
  if(currentMode==='malicious'&&route==='schedule'){const l=data.lessons[0];l.subject='<img src=x onerror="window.pwned=1">';l.teacher='<script>window.pwned=1</script>';l.room='101';l.week_parity='both';l.uncertain=false;l.subgroup=null;}
  if(currentMode==='unknown'&&route==='schedule'){data.lessons[0].week_parity='unknown';data.lessons[0].room='101';}
  res.end(JSON.stringify(data));
 },delay+(course===2?80:0));
});
async function fresh(viewport={width:1440,height:900},options={}){
 if(context)await context.close();context=await browser.newContext({viewport,isMobile:viewport.width<900,hasTouch:viewport.width<900});page=await context.newPage();page.setDefaultTimeout(8000);
 page.on('pageerror',e=>runtimeErrors.push(e.message));page.on('console',m=>{if(m.type()==='error')consoleErrors.push({mode,text:m.text()});});
 if(!options.file)await page.addInitScript(apiBaseUrl=>{window.FCIM_TIMETABLE_CONFIG={apiBaseUrl};document.addEventListener('DOMContentLoaded',()=>{const label=document.createElement('div');label.textContent='REPLAY · записанные public GET FCIM · локальная проверка';label.style='position:fixed;top:0;left:0;z-index:99;background:#fff2bf;padding:2px 6px;font-size:10px;pointer-events:none';document.body.append(label);});},apiOrigin);
 await page.goto(options.file?pathToFileURL(path.join(root,'index.html')).href+'#floor=1':mapOrigin+'/#floor=1');
 if(!options.file&&mode==='good')await page.waitForFunction(()=>FCIM_MAP_APP.getScheduleState().group.startsWith('SI-'));
}
async function time(date,value){await page.locator('#scheduleDate').fill(date);await page.locator('#scheduleDate').dispatchEvent('change');await page.locator('#scheduleTime').fill(value);await page.locator('#scheduleTime').dispatchEvent('change');}
async function group(value){await page.locator('#groupSelect').selectOption(value);}
async function shot(name){await page.screenshot({path:path.join(out,name+'.png'),fullPage:false});}
async function test(name,fn){try{const evidence=await fn();results.push({name,status:'PASS',evidence});}catch(e){results.push({name,status:'FAIL',error:e.stack});}console.log(results.at(-1).status,name);}
let apiOrigin;
(async()=>{try{
 mapOrigin=await listen(mapServer);apiOrigin=await listen(apiServer);browser=await chromium.launch({channel:'chrome',headless:true});
 for(const viewport of [{width:1440,height:900},{width:390,height:844},{width:320,height:740}]){
  await test('Replay live mode '+viewport.width+'x'+viewport.height+': validated groups, real mapped 101 and full composite selection',async()=>{
   mode='good';await fresh(viewport);await group('IA-261');await time('2026-10-05','10:00');
   const s=await page.evaluate(()=>FCIM_MAP_APP.getScheduleState());assert.equal(s.source,'real');assert.equal(s.courseYear,1);assert.equal(s.evaluation.groupActive.length,1);assert.deepEqual(await page.evaluate(()=>FCIM_MAP_APP.getLogicalSelection().spaceIds),['B3-F1-S12','B3-F1-S13']);
   assert.equal(await page.locator('#groupSelect option').count(),41);assert.match(await page.locator('#liveQualification').innerText(),/запланированные занятия, а не фактическое присутствие/);
   assert.equal(await page.locator('[data-room-fill="3-101"]').evaluate(e=>getComputedStyle(e).fill),'rgb(167, 231, 206)');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.locator('#scheduleControls').scrollIntoViewIfNeeded();await shot('replay-course1-mapped-'+viewport.width);
   return {course:1,group:'IA-261',date:s.date,time:s.time,eventId:s.evaluation.groupActive[0].sourceLessonId,groups:s.evaluation.groupActive[0].groups};
  });
  await test('Replay course 2 '+viewport.width+': real groups and real mapped shared lesson',async()=>{
   await page.locator('#courseSelect').selectOption('2');await page.waitForFunction(()=>FCIM_MAP_APP.getScheduleState().courseYear===2&&document.querySelector('#groupSelect').options.length===26);
   await group('FAF-251');await time('2026-10-05','13:40');assert.equal((await page.evaluate(()=>FCIM_MAP_APP.getScheduleState())).evaluation.groupActive.length,1);
   assert.deepEqual(await page.evaluate(()=>FCIM_MAP_APP.getLogicalSelection().spaceIds),['B3-F1-S12','B3-F1-S13']);await shot('replay-course2-'+viewport.width);
  });
  await test('Replay All Classes '+viewport.width+': both courses and each shared event only once',async()=>{
   await page.locator('#allMode').click();await page.waitForFunction(()=>document.querySelector('#sourceStatus').textContent.includes('Курс 1')&&document.querySelector('#sourceStatus').textContent.includes('Курс 2'));
   const s=await page.evaluate(()=>FCIM_MAP_APP.getScheduleState());assert.ok(s.evaluation.active.some(e=>e.courseYear===1));assert.ok(s.evaluation.active.some(e=>e.courseYear===2));assert.equal(new Set(s.evaluation.active.map(e=>e.id)).size,s.evaluation.active.length);
   const room=s.occupancy.find(r=>r.roomCode==='3-101');assert.equal(room.lessons.filter(e=>e.courseYear===2&&e.groups.includes('FAF-251')).length,1);assert.match(await page.locator('#scheduleSummary').innerText(),/FAF-251, FAF-252, FAF-253/);await shot('replay-all-'+viewport.width);
  });
  await test('Keyboard and '+(viewport.width<900?'touch':'pointer')+' preserve map controls '+viewport.width,async()=>{
   await page.locator('#sourceSelect').focus();await page.locator('#sourceSelect').press('d');await page.locator('#sourceSelect').selectOption('demo');
   assert.equal((await page.evaluate(()=>FCIM_MAP_APP.getScheduleState())).source,'demo');await page.locator('#searchInput').fill('103');await page.locator('#searchInput').press('Enter');assert.deepEqual(await page.evaluate(()=>FCIM_MAP_APP.getLogicalSelection().spaceIds),['B3-F1-S10','B3-F1-S11']);
   const target=page.locator('[data-id="B3-F1-S10"]');await target.focus();await target.press('Enter');if(viewport.width<900){const box=await target.boundingBox();await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);}assert.deepEqual(await page.evaluate(()=>FCIM_MAP_APP.getLogicalSelection().spaceIds),['B3-F1-S10','B3-F1-S11']);await shot('demo-'+viewport.width);
  });
 }
 await test('Replay unmapped real room remains in panel without fake polygon',async()=>{mode='good';await fresh();await group('SI-261');await time('2026-10-05','08:15');assert.match(await page.locator('#scheduleSummary').innerText(),/Аудитория пока не сопоставлена с картой/);assert.equal(await page.locator('.scheduled-mine').count(),0);await shot('replay-unmapped');});
 await test('Rapid 1→2→1 switching cannot replace selected course with stale response',async()=>{delay=180;await fresh();await page.locator('#courseSelect').selectOption('2');await page.locator('#courseSelect').selectOption('1');await page.waitForTimeout(500);const s=await page.evaluate(()=>FCIM_MAP_APP.getScheduleState());assert.equal(s.courseYear,1);assert.equal(await page.locator('#groupSelect option').count(),41);assert.ok(s.evaluation.groupActive.every(l=>l.courseYear===1));await shot('replay-course-switching');delay=0;});
 await test('Failed refresh retains validated last-known-good data with stale qualification',async()=>{await fresh();await group('IA-261');await time('2026-10-05','10:00');mode='failure';await page.locator('#refreshTimetable').click();await page.waitForFunction(()=>document.querySelector('#scheduleSummary').textContent.includes('последний проверенный снимок'));assert.equal((await page.evaluate(()=>FCIM_MAP_APP.getScheduleState())).evaluation.groupActive.length,1);await shot('stale-validated-snapshot');});
 await test('No accepted data + API 503 stays real/unavailable, with explicit demo alternative',async()=>{mode='failure';await fresh();await page.waitForFunction(()=>document.querySelector('#scheduleSummary').textContent.includes('(503)'));assert.equal((await page.evaluate(()=>FCIM_MAP_APP.getScheduleState())).source,'real');assert.equal(await page.locator('.scheduled-mine').count(),0);assert.equal(await page.locator('#groupSelect option').count(),0);await shot('api-failure');});
 await test('Actual browser CORS denial stays unavailable and gives no synthetic fallback',async()=>{mode='cors';await fresh();await page.waitForFunction(()=>document.querySelector('#scheduleSummary').textContent.includes('сеть или CORS'));assert.equal((await page.evaluate(()=>FCIM_MAP_APP.getScheduleState())).source,'real');assert.equal(await page.locator('#groupSelect option').count(),0);await shot('cors-denied');});
 await test('Actual browser network failure stays unavailable with no invented groups or highlight',async()=>{mode='network';await fresh();await page.waitForFunction(()=>document.querySelector('#scheduleSummary').textContent.includes('сеть или CORS'));assert.equal(await page.locator('#groupSelect option').count(),0);assert.equal(await page.locator('.scheduled-mine,.scheduled-other').count(),0);assert.equal((await page.evaluate(()=>FCIM_MAP_APP.getScheduleState())).source,'real');await shot('network-unavailable');});
 await test('Partial All Classes discloses course 2 outage while retaining course 1',async()=>{mode='partial';await fresh();await page.waitForFunction(()=>document.querySelector('#groupSelect').options.length===41);await page.locator('#allMode').click();await page.waitForFunction(()=>document.querySelector('#scheduleSummary').textContent.includes('Частичное покрытие')&&document.querySelector('#scheduleSummary').textContent.includes('503'));await shot('partial-coverage');});
 await test('Synthetic unknown parity record remains visible with no confident highlight',async()=>{mode='unknown';await fresh();await page.waitForFunction(()=>document.querySelector('#groupSelect').options.length===41);await time('2026-10-05','08:15');assert.match(await page.locator('#scheduleSummary').innerText(),/Чётность занятия неизвестна/);assert.equal(await page.locator('.scheduled-mine').count(),0);await shot('synthetic-unknown-parity');});
 await test('Synthetic malicious text uses text DOM and cannot execute or create HTML',async()=>{mode='malicious';await fresh();await page.waitForFunction(()=>document.querySelector('#groupSelect').options.length===41);await time('2026-10-05','08:15');assert.match(await page.locator('#scheduleSummary').innerText(),/<img src=x/);assert.equal(await page.locator('#scheduleSummary img,#scheduleSummary script,#panel img').count(),0);assert.equal(await page.evaluate(()=>window.pwned),undefined);});
 await test('Live API, course changes and demo cannot mutate an existing FIX-01 manual record',async()=>{
  mode='good';await fresh();const raw=await page.evaluate(()=>{const raw=JSON.stringify({schemaVersion:1,buildingId:FCIM_MAP_DATA.id,mapDataVersion:FCIM_MAP_DATA.dataVersion,bindings:{'B3-F4-N01':{spaceId:'B3-F4-N01',floorLevel:4,roomNumber:'405',fullNumber:'3-405',method:'manual',updatedAt:'2026-10-09T20:00:00Z'}}});localStorage.setItem('fcim-indoor-map/utm-b3/bindings',raw);return raw;});
  await page.reload();await page.waitForFunction(()=>document.querySelector('#groupSelect').options.length===41);await page.locator('#courseSelect').selectOption('2');await page.waitForFunction(()=>document.querySelector('#groupSelect').options.length===26);await page.locator('#allMode').click();await page.locator('#sourceSelect').selectOption('demo');
  assert.equal(await page.evaluate(()=>localStorage.getItem('fcim-indoor-map/utm-b3/bindings')),raw);assert.equal((await page.evaluate(()=>FCIM_MAP_APP.getBindings())).bindings['B3-F4-N01'].verification,undefined);
 });
 await test('file:// demo is offline and live mode clearly requires HTTP(S)',async()=>{mode='good';await fresh({width:1440,height:900},{file:true});assert.equal((await page.evaluate(()=>FCIM_MAP_APP.getScheduleState())).source,'demo');assert.deepEqual(await page.evaluate(()=>FCIM_SCHEDULE_FIXTURE),require('../schedule-fixture.js'));await shot('file-demo-preserved');await page.locator('#sourceSelect').selectOption('real');assert.match(await page.locator('#scheduleSummary').innerText(),/требует HTTP\(S\) origin/);assert.equal(await page.locator('#groupSelect option').count(),0);});
 await test('Before capture and zero runtime errors; expected failure console diagnostics identified',async()=>{const p=await browser.newPage({viewport:{width:1440,height:900}});await p.goto(pathToFileURL(path.join(process.argv[3]||root,'index.html')).href+'#floor=1');await p.screenshot({path:path.join(out,'before-demo-desktop.png')});await p.close();assert.deepEqual(runtimeErrors,[]);assert.ok(consoleErrors.every(e=>['cors','failure','partial','network'].includes(e.mode)),JSON.stringify(consoleErrors));return {runtimeErrors,expectedConsoleErrors:consoleErrors.length};});
}finally{
 const counts=results.reduce((a,r)=>(a[r.status]=(a[r.status]||0)+1,a),{});fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({basis:'Actual browser; recorded real JSON replay; synthetic error/uncertainty/XSS injection',counts,results,runtimeErrors,consoleErrors,browser:browser?.version()},null,2)+'\n');console.log('TOTAL',JSON.stringify(counts));if(context)await context.close();if(browser)await browser.close();mapServer.close();apiServer.close();
}process.exitCode=results.some(r=>r.status==='FAIL')?1:0;})().catch(e=>{console.error(e);process.exitCode=2;});
