// Focused FIX-01 browser regressions. Audit helpers/scenarios adapted from browser-tests.cjs and advanced.cjs.
// No package install: use bundled Playwright and installed Chrome. Override PLAYWRIGHT_MODULE if needed.
const fs = require('fs'), path = require('path'), http = require('http'), assert = require('assert/strict');
const { pathToFileURL } = require('url');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const output = path.resolve(process.argv[3] || path.join(__dirname, 'fix01-results.json'));
const KEY = 'fcim-indoor-map/utm-b3/bindings', RECOVERY = KEY + '/recovery';
const results = [], pageErrors = [];
let browser, context, page, url, accept = true, decisions = [], dialogs = [], current;
const payload = (bindings, extra = {}) => ({format:'fcim-indoor-map/room-bindings', schemaVersion:1, buildingId:'utm-b3', mapSchemaVersion:'1.0.0', mapDataVersion:'2026-10-08.1', bindings, ...extra});
const record = (spaceId = 'B3-F4-N01', roomNumber = '405', extra = {}) => ({spaceId, roomNumber, ...extra});
const stored = bindings => ({schemaVersion:1, buildingId:'utm-b3', mapDataVersion:'2026-10-08.1', bindings});
async function fresh(target = url) {
  if (context) await context.close();
  context = await browser.newContext({viewport:{width:1440,height:900}, acceptDownloads:true});
  page = await context.newPage(); page.setDefaultTimeout(4000); accept = true; decisions = []; dialogs = [];
  page.on('pageerror', e => pageErrors.push({test:current, message:e.message}));
  page.on('dialog', async d => { const choice = decisions.length ? decisions.shift() : accept; dialogs.push({message:d.message(), accepted:choice}); await (choice ? d.accept() : d.dismiss()); });
  await page.goto(target, {waitUntil:'load'});
}
async function getStore() { return page.evaluate(() => FCIM_MAP_APP.getBindings()); }
async function rawStore() { return page.evaluate(k => localStorage.getItem(k), KEY); }
async function floor(n) { await page.locator('#floorNav button').filter({hasText:new RegExp('^'+n+'$')}).click(); }
async function select(id) { await page.locator('[data-id="'+id+'"]').focus(); await page.locator('[data-id="'+id+'"]').press('Enter'); }
async function bind(id, num) {
  await floor(id.match(/-F(\d+)/)[1]); await select(id);
  if (await page.locator('#editToggle').getAttribute('aria-pressed') !== 'true') await page.locator('#editToggle').click();
  await page.locator('#numInput').fill(num); await page.locator('#numInput').press('Enter');
}
async function upload(data) {
  await page.locator('#importFile').setInputFiles({name:'fix01.json',mimeType:'application/json',buffer:Buffer.from(typeof data === 'string' ? data : JSON.stringify(data))});
  await page.waitForTimeout(150); // Same FileReader completion allowance as the independent audit.
}
async function download(selector) {
  const [dl] = await Promise.all([page.waitForEvent('download'), page.locator(selector).click()]);
  return fs.readFileSync(await dl.path(), 'utf8');
}
async function exportData() { return JSON.parse(await download('#exportBtn')); }
async function injectStorage(value) { const raw = typeof value === 'string' ? value : JSON.stringify(value); await page.evaluate(({KEY,raw}) => localStorage.setItem(KEY,raw), {KEY,raw}); await page.reload(); return raw; }
async function search(value) { await page.locator('#searchInput').fill(value); await page.locator('#searchInput').press('Enter'); }
async function unchanged(before, raw) { assert.deepEqual(await getStore(), before); assert.equal(await rawStore(), raw); }
async function test(name, fn) {
  current = name; const start = performance.now(), errorIndex = pageErrors.length;
  try { await fresh(); const evidence = await fn(); assert.equal(pageErrors.length, errorIndex, 'No page errors'); results.push({name,status:'PASS',ms:performance.now()-start,evidence,dialogs}); }
  catch (e) { results.push({name,status:'FAIL',ms:performance.now()-start,error:e.message,dialogs,errors:pageErrors.slice(errorIndex)}); }
  console.log(results.at(-1).status, name);
}
(async () => {
  const server = http.createServer((req,res) => {
    const file = new URL(req.url,'http://localhost').pathname.slice(1) || 'index.html';
    if (file === 'favicon.ico') { res.writeHead(204); return res.end(); }
    if (!['index.html','map-data.js','room-contract.js','schedule-engine.js','schedule-fixture.js','map-semantics.js','room-identification.js','schematic-layout.js'].includes(file)) { res.writeHead(404); return res.end(); }
    res.setHeader('Content-Type',file.endsWith('.js') ? 'text/javascript; charset=utf-8' : 'text/html; charset=utf-8'); res.end(fs.readFileSync(path.join(root,file)));
  });
  await new Promise(r => server.listen(0,'127.0.0.1',r)); url = 'http://127.0.0.1:'+server.address().port+'/index.html';
  try {
    browser = await chromium.launch({channel:'chrome',headless:true}); console.log('Chrome',browser.version());
    for (const id of ['constructor','toString','__proto__']) await test('FIM-02 rejects '+id+' atomically', async () => {
      await bind('B3-F4-N01','405'); const before = await getStore(), raw = await rawStore();
      await upload(payload([record('B3-F4-N02','406'),record(id,'407')])); await unchanged(before,raw);
      assert.match(await page.locator('#panel').innerText(), /отклонено:/); assert.equal((await exportData()).count,1);
      assert.equal(await page.evaluate(() => Object.prototype.auditMarker),undefined);
    });
    await test('FIM-01 transfer preview discloses both IDs and cancellation preserves bytes', async () => {
      await bind('B3-F4-N01','405'); const before = await getStore(), raw = await rawStore(); accept = false;
      await upload(payload([record('B3-F4-N02','405')])); await unchanged(before,raw);
      assert.equal(dialogs.length,1); assert.match(dialogs[0].message,/Перенос.*B3-F4-N01.*B3-F4-N02/);
      assert.match(dialogs[0].message,/переносы: 1; конфликты: 1; отклонено: 0/); return {before,raw};
    });
    await test('FIM-01 confirmed transfer changes exactly the disclosed mapping', async () => {
      await bind('B3-F4-N01','405'); await bind('B3-F6-N01','601');
      await upload(payload([record('B3-F4-N02','405')])); const b = (await getStore()).bindings;
      assert.equal(b['B3-F4-N01'],undefined); assert.equal(b['B3-F4-N02'].roomNumber,'405'); assert.equal(b['B3-F6-N01'].roomNumber,'601');
      assert.match(dialogs.at(-1).message,/Перенос.*B3-F4-N01.*B3-F4-N02/);
    });
    await test('FIM-01 update preview names old and new numbers', async () => {
      await bind('B3-F4-N01','405'); await upload(payload([record('B3-F4-N01','406')]));
      assert.match(dialogs.at(-1).message,/Замена B3-F4-N01: 3-405 → 3-406/); assert.equal((await getStore()).bindings['B3-F4-N01'].roomNumber,'406');
    });
    await test('Cancellation of ordinary additions preserves the entire dataset', async () => {
      await bind('B3-F4-N01','405'); const before = await getStore(), raw = await rawStore(); accept = false;
      await upload(payload([record('B3-F6-N01','601')])); await unchanged(before,raw);
    });
    await test('FIM-01 simultaneous swaps preserve both identities', async () => {
      await bind('B3-F4-N01','405'); await bind('B3-F4-N02','406');
      await upload(payload([record('B3-F4-N01','406'),record('B3-F4-N02','405')])); const b = (await getStore()).bindings;
      assert.equal(b['B3-F4-N01'].roomNumber,'406'); assert.equal(b['B3-F4-N02'].roomNumber,'405'); assert.equal(Object.keys(b).length,2);
    });
    for (const [name,extra] of [['schemaVersion',{schemaVersion:999}],['buildingId',{buildingId:'other'}],['mapSchemaVersion',{mapSchemaVersion:'2.0.0'}],['mapDataVersion',{mapDataVersion:'old'}],['missing schema',{schemaVersion:undefined}],['missing map version',{mapDataVersion:undefined}]]) await test('FIM-04 rejects '+name, async () => {
      await bind('B3-F4-N01','405'); const before = await getStore(), raw = await rawStore(); await upload(payload([record('B3-F4-N02','406')],extra));
      await unchanged(before,raw); assert.equal(dialogs.length,0); assert.match(await page.locator('#toast').innerText(),/Ошибка импорта/);
    });
    const invalid = [
      ['duplicate space',[record(),record('B3-F4-N01','406')]],
      ['identical duplicate',[record(),record()]],
      ['canonical duplicate',[record('B3-F4-N01','3-405A'),record('B3-F4-N02','405a')]],
      ['missing space',[record(undefined,'406',{spaceId:undefined})]],
      ['unknown space',[record('unknown','406')]],
      ['null record',[record(),null]],
      ['array record',[record(),[]]],
      ['hall',[record('B3-F4-HW','499')]],
      ['wrong floorId',[record('B3-F4-N02','406',{floorId:'B3-F6'})]],
      ['wrong floorLevel',[record('B3-F4-N02','406',{floorLevel:6})]],
      ['wrong fullNumber',[record('B3-F4-N02','406',{fullNumber:'3-407'})]],
      ['invalid number',[record('B3-F4-N02','TI-241')]],
      ['number object',[record('B3-F4-N02',{toString:'406'})]],
      ['method object',[record('B3-F4-N02','406',{method:{bad:true}})]],
      ['bad timestamp',[record('B3-F4-N02','406',{updatedAt:'not-a-date'})]],
      ['basement assignment',[record('B3-F4-N02','D01-03')]]
    ];
    for (const [name,records] of invalid) await test('FIM-04 rejects '+name+' without partial commit',async () => {
      await bind('B3-F6-N01','601'); const before = await getStore(), raw = await rawStore();
      await upload(payload([record('B3-F5-N01','501'),...records])); await unchanged(before,raw); assert.equal(dialogs.length,0);
      assert.match(await page.locator('#panel').innerText(),/Предпросмотр импорта/);
    });
    await test('FIM-04 wrong-floor import needs separate confirmation, including supplied override flag',async () => {
      await bind('B3-F4-N01','405'); const before = await getStore(), raw = await rawStore(); decisions = [true,false];
      await upload(payload([record('B3-F4-N02','609',{floorOverride:true})])); await unchanged(before,raw);
      assert.equal(dialogs.length,2); assert.match(dialogs[1].message,/Исключения этажей.*floorOverride/);
      decisions = [true,true]; await upload(payload([record('B3-F4-N02','609')]));
      assert.equal((await getStore()).bindings['B3-F4-N02'].floorOverride,true); await page.reload();
      assert.equal((await getStore()).bindings['B3-F4-N02'].roomNumber,'609');
      const data = await exportData(); assert.equal(data.bindings.find(b=>b.spaceId==='B3-F4-N02').floorOverride,true);
    });
    await test('FIM-04 malformed JSON preserves stored bytes',async () => {
      await bind('B3-F4-N01','405'); const before = await getStore(), raw = await rawStore(); await upload('{bad'); await unchanged(before,raw);
    });
    await test('Failed import write is atomic for memory and persisted data',async () => {
      await bind('B3-F4-N01','405'); const before = await getStore(), raw = await rawStore();
      await page.evaluate(()=>{Storage.prototype.setItem=function(){throw new DOMException('test quota','QuotaExceededError');};});
      await upload(payload([record('B3-F4-N02','405'),record('B3-F6-N01','601')])); await unchanged(before,raw);
      assert.match(await page.locator('#panel').innerText(),/Импорт не применён/);
    });
    for (const [name,value] of [
      ['bindings array',stored([])],['bindings null',stored(null)],['null record',stored({'B3-F4-N01':null})],
      ['array root',[]],['null root',null],['bad JSON','{broken'],['empty raw',''],['invalid key',stored(JSON.parse('{"__proto__":{"spaceId":"__proto__","roomNumber":"405"}}'))],
      ['incompatible version',{...stored({}),mapDataVersion:'old'}],['incompatible building',{...stored({}),buildingId:'other'}]
    ]) await test('FIM-05 '+name+' is quarantined; new assignment survives reload',async () => {
      const raw = await injectStorage(value); assert.deepEqual((await getStore()).bindings,{});
      assert.equal(await rawStore(),raw); assert.equal(await download('#recoveryExport'),raw);
      const backup = JSON.parse(await page.evaluate(k=>localStorage.getItem(k),RECOVERY)); assert.equal(backup.raw,raw);
      await search('405'); await bind('B3-F4-N02','406'); await page.reload();
      assert.equal((await getStore()).bindings['B3-F4-N02'].roomNumber,'406'); assert.ok(await page.locator('#recoveryExport').count());
    });
    await test('FIM-05 valid annotations in a damaged store recover explicitly with identity and timestamp',async () => {
      const b = record('B3-F4-N01','405',{fullNumber:'3-405',floorLevel:4,method:'manual',updatedAt:'2026-10-08T12:00:00.000Z'});
      const raw = await injectStorage(stored({'B3-F4-N01':b,'B3-F4-N02':null}));
      assert.equal(await rawStore(),raw); assert.deepEqual((await getStore()).bindings,{});
      accept=false; await page.locator('#recoveryRestore').click(); assert.equal(await rawStore(),raw);
      accept=true; await page.locator('#recoveryRestore').click(); assert.deepEqual((await getStore()).bindings['B3-F4-N01'],b);
      await page.reload(); assert.deepEqual((await getStore()).bindings['B3-F4-N01'],b);
      const archive = JSON.parse(await download('#recoveryExport')); assert.equal(archive.raw,raw);
    });
    await test('FIM-05 ambiguous duplicate recovery requires user repair and preserves all raw records',async () => {
      const raw = await injectStorage(stored({'B3-F4-N01':record(),'B3-F4-N02':record('B3-F4-N02','405')}));
      await page.locator('#recoveryRestore').click(); assert.equal(await rawStore(),raw); assert.deepEqual((await getStore()).bindings,{});
      assert.match(await page.locator('#toast').innerText(),/Ошибка импорта/); assert.equal(await download('#recoveryExport'),raw);
    });
    await test('FIM-05 legacy orphan annotations remain in the raw recovery archive',async () => {
      const raw = await injectStorage({...stored({'B3-F4-N01':record()}),orphans:{'retired-space':record('retired-space','406')}});
      assert.equal(await rawStore(),raw); assert.equal(await download('#recoveryExport'),raw);
      await page.locator('#recoveryRestore').click();assert.equal((await getStore()).bindings['B3-F4-N01'].roomNumber,'405');
      await page.reload(); assert.equal(JSON.parse(await download('#recoveryExport')).raw,raw);
    });
    await test('FIM-05 legacy wrong-floor annotations require explicit recovery and preserve the annotation',async () => {
      const raw = await injectStorage(stored({'B3-F4-N01':record('B3-F4-N01','609',{updatedAt:'2026-10-08T12:00:00.000Z'})}));
      assert.equal(await rawStore(),raw); decisions=[true,false]; await page.locator('#recoveryRestore').click();assert.equal(await rawStore(),raw);
      decisions=[true,true]; await page.locator('#recoveryRestore').click();assert.equal((await getStore()).bindings['B3-F4-N01'].floorOverride,true);
      await page.reload();assert.equal((await getStore()).bindings['B3-F4-N01'].roomNumber,'609');
    });
    await test('FIM-05 backup failure preserves original storage and reports memory-only manual data',async () => {
      const raw = JSON.stringify(stored([])); await page.evaluate(({KEY,raw})=>localStorage.setItem(KEY,raw),{KEY,raw});
      await context.addInitScript(()=>{Storage.prototype.setItem=function(){throw new DOMException('test quota','QuotaExceededError');};});
      await page.reload(); await bind('B3-F4-N01','405'); assert.equal(await rawStore(),raw);
      assert.match(await page.locator('#panel').innerText(),/Только в памяти/); assert.doesNotMatch(await page.locator('#panel .msg').first().innerText(),/Сохранено/);
      assert.equal((await exportData()).bindings[0].roomNumber,'405'); assert.equal(await download('#recoveryExport'),raw);
    });
    await test('FIM-05 manual storage failure offers export and never claims saved',async () => {
      await page.evaluate(()=>{Storage.prototype.setItem=function(){throw new DOMException('test quota','QuotaExceededError');};});
      await bind('B3-F4-N01','405'); assert.match(await page.locator('#panel').innerText(),/Только в памяти/);
      assert.equal((await exportData()).bindings[0].roomNumber,'405'); assert.equal(await rawStore(),null);
    });
    await test('FIM-09 parser and published patterns agree, including provisional suffixes and basement notation',async () => {
      return page.evaluate(()=>{
        const valid=['405','3-405','405A','3-405A','405я','3-405Я','D01-03','d01-03'];
        const evidence=valid.map(v=>({input:v,parsed:FCIM_MAP_APP.parseRoomInput(v)}));
        for(const {input,parsed:p} of evidence){if(!p.ok)throw Error('Rejected '+input);const pattern=p.basement?FCIM_MAP_DATA.roomNumbering.basementPattern:FCIM_MAP_DATA.roomNumbering.pattern;if(!new RegExp(pattern).test(p.full))throw Error('Pattern mismatch '+input);}
        for(const v of ['405ё','3-405AB','TI-241','2-405','D1-03','405.0','40',''])if(FCIM_MAP_APP.parseRoomInput(v).ok)throw Error('Accepted '+v);
        return evidence;
      });
    });
    await test('FIM-09 manual, storage and import canonicalize the same suffix mapping',async () => {
      await bind('B3-F4-N01','3-405A'); await page.reload(); assert.equal((await getStore()).bindings['B3-F4-N01'].roomNumber,'405a');
      const first=await exportData(); await fresh(); await upload(first); const second=await exportData(); assert.deepEqual(second.bindings,first.bindings);
    });
    await test('Valid manual assignments survive reload and export/import/export preserves canonical mappings',async () => {
      await bind('B3-F4-N01','3-405'); await bind('B3-F6-N01','601'); await page.reload(); const before=await getStore();
      const first=await exportData(); await fresh(); await upload(first); assert.deepEqual((await getStore()).bindings,before.bindings);
      const second=await exportData(); assert.deepEqual(second.bindings,first.bindings); return {first,second};
    });
    await test('Unchanged map selection, floors 2–7, pending floors and search; MAP-01 routing UI absent',async () => {
      for(let n=2;n<=7;n++){await floor(n);assert.equal(await page.locator('#layerSpaces polygon').count(),await page.evaluate(n=>FCIM_MAP_DATA.floors.find(f=>f.level===n).spaces.length,n));}
      await floor('1');assert.equal(await page.locator('#floorNav .active').innerText(),'1');
      await floor('D');assert.equal(await page.locator('#floorNav .active').innerText(),'1');
      await floor(4);await select('B3-F4-N01');assert.equal(await page.locator('[data-id="B3-F4-N01"].sel').count(),1);
      await bind('B3-F4-N01','405');await floor(7);await search('3-405');assert.equal(await page.locator('#floorNav .active').innerText(),'4');
      assert.equal(await page.locator('[data-id="B3-F4-N01"].sel').count(),1);await search('D01-03');assert.match(await page.locator('#panel').innerText(),/подвала/);
      // MAP-01 explicitly retires routing; all FIX-01 integrity assertions stay unchanged.
      assert.equal(await page.locator('#routeToggle,#routeFromHere,#routeToHere,#allowLift,#layerRoute').count(),0);
    });
    await test('Standalone file:// launch retains manual persistence, search and import round trip',async () => {
      await fresh(pathToFileURL(path.join(root,'index.html')).href);await bind('B3-F4-N01','405');await page.reload();await search('405');
      assert.equal(await page.locator('[data-id="B3-F4-N01"].sel').count(),1);const first=await exportData();await fresh(pathToFileURL(path.join(root,'index.html')).href);
      await upload(first);assert.deepEqual((await exportData()).bindings,first.bindings);
    });
  } finally {
    const counts=results.reduce((a,r)=>(a[r.status]=(a[r.status]||0)+1,a),{});
    fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify({root,browser:browser?.version(),counts,results,pageErrors},null,2)+'\n');
    console.log('TOTAL',JSON.stringify(counts),'OUTPUT',output);
    if(context)await context.close();if(browser)await browser.close();await new Promise(r=>server.close(r));
  }
  process.exitCode=results.some(r=>r.status==='FAIL')?1:0;
})().catch(e=>{console.error(e);process.exitCode=2;});
