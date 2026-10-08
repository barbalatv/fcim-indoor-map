// MAP-01 preservation gate against the verified FIX-01 pre-edit snapshot.
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const original=path.resolve(process.argv[2]||(()=>{throw Error('Provide pre-MAP-01 directory');})());
const geo=require('./geo01-contract.cjs'),current=require('../map-data.js');
// The exact GEO allowlist must pass before projecting to the fixed pre-FIX-A model.
// Historical MAP-01 checks below remain strict, including source-byte and FIX-01 checks.
geo.validatePreservation();
const map=geo.preFixAModel(current),before=require(path.join(original,'map-data.js')),results=[];
function test(name,fn){try{const evidence=fn();results.push({name,status:'PASS',evidence});}catch(e){results.push({name,status:'FAIL',error:e.stack});}console.log(results.at(-1).status,name);}
const clean=p=>p.filter((point,i)=>i===0||point[0]!==p[i-1][0]||point[1]!==p[i-1][1]);
const area=p=>Math.abs(p.reduce((sum,a,i)=>{const b=p[(i+1)%p.length];return sum+a[0]*b[1]-b[0]*a[1]},0))/2;
test('Only enumerated GEO-002/GEO-003 changes against fixed pre-FIX-A commit',()=>geo.validatePreservation());
test('Exactly 194 original space identities, order and floors are preserved',()=>{assert.equal(map.floors.reduce((n,f)=>n+f.spaces.length,0),194);assert.deepEqual(map.floors.map(f=>[f.id,f.spaces.map(s=>s.id)]),before.floors.map(f=>[f.id,f.spaces.map(s=>s.id)]));assert.deepEqual(map.floors.map(f=>f.level),[2,3,4,5,6,7]);assert.deepEqual(map.plannedFloors,before.plannedFloors);});
test('Full model equals baseline after only removing consecutive duplicate points',()=>{const expected=structuredClone(before);expected.floors.forEach(f=>f.spaces.forEach(s=>s.polygon=clean(s.polygon)));assert.deepEqual(map,expected);});
test('Exactly four existing polygons lose one redundant vertex each; areas unchanged',()=>{const changed=[];map.floors.forEach((f,i)=>f.spaces.forEach((s,j)=>{const old=before.floors[i].spaces[j];assert.equal(area(s.polygon),area(old.polygon));if(s.polygon.length!==old.polygon.length){assert.equal(s.polygon.length,old.polygon.length-1);changed.push(s.id);}}));assert.deepEqual(changed,['B3-F2-N08','B3-F3-N08','B3-F4-N08','B3-F5-N07']);return changed;});
test('Pre-FIX-A source contains precisely four MAP-01 point removals and no regenerated JSON',()=>{const old=fs.readFileSync(path.join(original,'map-data.js'),'utf8').replaceAll('\r\n','\n'),now=geo.baselineText('map-data.js');assert.equal(old.split('[504.0,0],[504.0,0]').length-1,4);assert.equal(now,old.replaceAll('[504.0,0],[504.0,0]','[504.0,0]'));});
test('All polygons are finite, nonzero, with no zero-length edges or proper self-intersections',()=>{
  const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  let count=0;
  function check(poly){count++;assert.ok(poly.length>=3);poly.forEach(p=>assert.ok(p.length===2&&p.every(Number.isFinite)));assert.ok(area(poly)>0);poly.forEach((p,i)=>assert.notDeepEqual(p,poly[(i+1)%poly.length]));
    for(let i=0;i<poly.length;i++)for(let j=i+1;j<poly.length;j++){if(j===i+1||(i===0&&j===poly.length-1))continue;const a=poly[i],b=poly[(i+1)%poly.length],c=poly[j],d=poly[(j+1)%poly.length];assert.ok(!(cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0),'Proper self intersection');}
  }
  map.floors.forEach(f=>{check(f.geometry.outline);check(f.geometry.corridor);f.spaces.forEach(s=>check(s.polygon));f.geometry.verticals.forEach(v=>{check(v.polygon);if(v.innerShaft)check(v.innerShaft)});f.geometry.features.forEach(ft=>{if(ft.polygon)check(ft.polygon);if(ft.flights)ft.flights.forEach(check)});});return {polygons:count};
});
test('Archival navigation graph is wholly unchanged',()=>{assert.deepEqual(map.floors.map(f=>f.navigation),before.floors.map(f=>f.navigation));assert.deepEqual(map.verticalLinks,before.verticalLinks);return {nodes:map.floors.reduce((n,f)=>n+f.navigation.nodes.length,0),edges:map.floors.reduce((n,f)=>n+f.navigation.edges.length,0),verticalLinks:map.verticalLinks.length};});
test('Bindings metadata, all room numbers, doors and structural landmarks are unchanged',()=>{assert.deepEqual(map.roomNumbering,before.roomNumbering);assert.deepEqual(map.confirmedRoomNumbers,before.confirmedRoomNumbers);assert.deepEqual(map.knownButUnlocated,before.knownButUnlocated);map.floors.forEach((f,i)=>{assert.deepEqual(f.geometry,before.floors[i].geometry);assert.ok(f.spaces.every(s=>s.roomNumber===null));});});
test('FIX-01 validation/storage code is unchanged; parser is an exact body extraction',()=>{
  const old=fs.readFileSync(path.join(original,'index.html'),'utf8').replaceAll('\r\n','\n'),now=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8').replaceAll('\r\n','\n'),parser=fs.readFileSync(path.join(__dirname,'../room-contract.js'),'utf8');
  const start='  // ---------- хранилище привязок ----------';assert.equal(now.slice(now.indexOf(start),now.indexOf('  // Canonical FIX-01 parser')),old.slice(old.indexOf(start),old.indexOf('  // ---------- разбор номеров ----------')));
  const normalize=s=>s.replace(/^[ \t]+/gm,'').trim();assert.equal(normalize(parser.match(/return function parseRoomInput\(raw\) \{([\s\S]*?)\n    \};/)[1]),normalize(old.match(/function parseRoomInput\(raw\) \{([\s\S]*?)\n  \}/)[1]));
});
test('FIX-01 test edits preserve every integrity assertion; only obsolete route clause changes',()=>{const old=fs.readFileSync(path.join(original,'tests/fix01.cjs'),'utf8'),now=fs.readFileSync(path.join(__dirname,'fix01.cjs'),'utf8');const adapted=old.replace("['index.html','map-data.js']","['index.html','map-data.js','room-contract.js','schedule-engine.js','schedule-fixture.js','map-semantics.js']").replace('Unchanged map selection, floors 2–7, pending floors, search and ordinary experimental route','Unchanged map selection, floors 2–7, pending floors and search; MAP-01 routing UI absent').replace("      await page.locator('#routeToggle').click();await floor(4);await select('B3-F4-N01');await select('B3-F4-S16');assert.ok(await page.locator('#layerRoute polyline.route').count());","      // MAP-01 explicitly retires routing; all FIX-01 integrity assertions stay unchanged.\n      assert.equal(await page.locator('#routeToggle,#routeFromHere,#routeToHere,#allowLift,#layerRoute').count(),0);");assert.equal(now.replaceAll('\r\n','\n'),adapted.replaceAll('\r\n','\n'));});
const counts=results.reduce((a,r)=>(a[r.status]=(a[r.status]||0)+1,a),{});
const hashes=Object.fromEntries(['index.html','map-data.js','room-contract.js','schedule-engine.js','schedule-fixture.js','map-semantics.js','tests/fix01.cjs','tests/map01-data.cjs','tests/map01-preserve.cjs'].map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,'..',file))).digest('hex')]));
if(process.argv[3])fs.writeFileSync(process.argv[3],JSON.stringify({counts,results,hashes},null,2)+'\n');console.log('TOTAL',JSON.stringify(counts));process.exitCode=counts.FAIL?1:0;
