// Explicit reversible integration delta over the accepted UI-01-FIX-B checkout.
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto'),{execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..'),hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function manifest(){return JSON.parse(fs.readFileSync(path.join(root,'MAP-02B_CHANGES.json'),'utf8'));}
function restore(file,bytes){const m=manifest();if(!m.sourcePatches[file])return bytes;let text=bytes.toString('utf8');for(const p of [...m.sourcePatches[file]].reverse()){assert.equal(text.split(p.new).length,2,file+' unique approved MAP-02B hunk');text=text.replace(p.new,()=>p.old);}const result=Buffer.from(text);assert.equal(hash(result),m.baselineFiles[file],file+' exact pre-MAP-02B bytes');return result;}
function validatePreservation(){
 const m=manifest();assert.equal(m.baselineCommit,'e14273370cc419e5acd21b78cd2ea51a3d6d4127');assert.deepEqual(Object.keys(m.sourcePatches).sort(),['README.md','TIMETABLE_CONTRACT.md','index.html']);
 for(const [file,expected] of Object.entries(m.baselineFiles)){const current=fs.readFileSync(path.join(root,file));assert.equal(hash(restore(file,current)),expected,file+' baseline bytes protected/reversed');}
 const files=execFileSync('git',['ls-files','--cached','--others','--exclude-standard'],{cwd:root,encoding:'utf8'}).trim().split('\n');assert.deepEqual(files.sort(),[...Object.keys(m.baselineFiles),...m.additions].sort(),'strict integration write allowlist');
 const map=require('../map-data.js');const ids=map.floors.flatMap(f=>f.spaces.map(s=>s.id));assert.equal(ids.length,222);assert.equal(new Set(ids).size,222);
 const before=restore('index.html',fs.readFileSync(path.join(root,'index.html'))).toString(),after=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const storage=s=>s.slice(s.indexOf('  // ---------- хранилище привязок ----------'),s.indexOf('  // Canonical FIX-01 parser'));
 assert.equal(storage(after),storage(before),'FIX-01 storage/import/export exact block');
 for(const file of ['map-data.js','schematic-layout.js','room-identification.js','room-contract.js','schedule-engine.js','schedule-fixture.js','map-semantics.js'])assert.equal(hash(fs.readFileSync(path.join(root,file))),m.baselineFiles[file],file+' immutable protected source');
 return {baselineCommit:m.baselineCommit,baselineFiles:Object.keys(m.baselineFiles).length,protectedFiles:Object.keys(m.baselineFiles).length-3,changedFiles:Object.keys(m.sourcePatches),additions:m.additions,spatialIds:ids.length};
}
module.exports={restore,validatePreservation,manifest,root};
if(require.main===module){console.log('PASS MAP-02B preservation',JSON.stringify(validatePreservation()));}
