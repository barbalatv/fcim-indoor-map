// Exact, reviewable GEO-002/GEO-003 source allowlist against a fixed pre-FIX-A commit.
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {execFileSync}=require('child_process'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),manifest=require('./geo01-changes.json');
function baselineBytes(file){return execFileSync('git',['show',manifest.baselineCommit+':'+file],{cwd:root,maxBuffer:2e6});}
function baselineText(file){return baselineBytes(file).toString('utf8').replaceAll('\r\n','\n');}
function baselineModel(){const module={exports:{}};new Function('module',baselineText('map-data.js'))(module);return module.exports;}
function preFixAModel(current){
  const restored=structuredClone(current),old=baselineModel();
  const f=restored.floors.find(f=>f.level===3),b=old.floors.find(f=>f.level===3);
  for(const id of ['B3-F3-S01','B3-F3-S02','B3-F3-S03']){
    const s=f.spaces.find(s=>s.id===id),previous=b.spaces.find(s=>s.id===id);
    for(const key of ['polygon','labelPoint','notes'])s[key]=structuredClone(previous[key]);
  }
  for(const id of ['B3-F3-S01-D1','B3-F3-S02-D1','B3-F3-S03-D1']){
    const d=f.geometry.doors.find(d=>d.id===id),previous=b.geometry.doors.find(d=>d.id===id);
    for(const key of ['x','y','verification','access','notes','connectionVerification']){
      if(Object.hasOwn(previous,key))d[key]=previous[key];else delete d[key];
    }
  }
  delete restored.floors.find(f=>f.level===7).geometry.verticals.find(v=>v.id==='B3-F7-STW').visualStair;
  assert.deepEqual(restored,old,'Only explicitly enumerated model fields can differ');
  return restored;
}
function validatePreservation(){
  for(const file of ['map-data.js','index.html']){
    assert.equal(crypto.createHash('sha256').update(baselineBytes(file)).digest('hex'),manifest.baselineHashes[file],file+' fixed baseline hash');
    let expected=baselineText(file);
    for(const patch of manifest.sourcePatches[file]){
      if(patch.old){assert.equal(expected.split(patch.old).length,2,'Unique approved source hunk');expected=expected.replace(patch.old,patch.new);}
      else throw Error('Insertion must include baseline context');
    }
    assert.equal(fs.readFileSync(path.join(root,file),'utf8').replaceAll('\r\n','\n'),expected,file+' only approved source hunks');
  }
  for(const file of ['room-contract.js','schedule-engine.js','schedule-fixture.js','map-semantics.js','tests/fix01.cjs','tests/map01-data.cjs','tests/map01-browser.cjs','tests/preserve-map.cjs','README.md','TIMETABLE_CONTRACT.md','MAP-01_REPORT.md','FIX-01_REPORT.md'])
    assert.equal(fs.readFileSync(path.join(root,file),'utf8').replaceAll('\r\n','\n'),baselineText(file),file+' protected bytes');
  return {baselineCommit:manifest.baselineCommit,sourceHunks:Object.fromEntries(Object.entries(manifest.sourcePatches).map(([f,p])=>[f,p.length]))};
}
module.exports={baselineModel,baselineText,preFixAModel,validatePreservation};
