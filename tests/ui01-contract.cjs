// Exact UI-01 reversal before historical ROOM/GEO/FIX gates; never replaces assertions.
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto'),{execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..'),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function baselineBytes(file,bytes=fs.readFileSync(path.join(root,file))){
 bytes=require('./ui01-fix-a-contract.cjs').restoreUI01(file,bytes);
 const m=require('../UI-01_CHANGES.json'),meta=m.baselineFiles[file];assert.ok(meta,file+' UI-01 baseline');
 let text=bytes.toString('utf8').replaceAll('\r\n','\n');
 for(const p of [...(m.sourcePatches[file]||[])].reverse()){assert.equal(text.split(p.new).length,2,file+' unique UI-01 hunk');text=text.replace(p.new,()=>p.old);}
 assert.equal(text.split('\n').length-1,meta.lineEndings.reduce((n,r)=>n+r.count,0),file+' recorded line count');
 let index=0,left=meta.lineEndings[0]?.count||0;
 const restored=Buffer.from(text.replace(/\n/g,()=>{while(!left){index++;left=meta.lineEndings[index].count;}left--;return meta.lineEndings[index].eol;}));
 assert.equal(hash(restored),meta.sha256,file+' exact pre-UI-01 bytes');return restored;
}
function validatePreservation(){
 const m=require('../UI-01_CHANGES.json');assert.equal(m.baselineCommit,'8b0a24aec70d51178291a0fd14d1860467e5b607');
 assert.deepEqual(Object.keys(m.sourcePatches).sort(),['README.md','index.html','tests/fix01.cjs','tests/map01-browser.cjs','tests/geo01-browser.cjs','tests/geo01-fix-b-browser.cjs','tests/geo02-browser.cjs','tests/room01-browser.cjs','tests/room01b-browser.cjs','tests/room01c-browser.cjs','tests/room01c-contract.cjs'].sort());
 assert.deepEqual(Object.keys(m.newFiles).sort(),['schematic-layout.js','tests/ui01-contract.cjs','tests/ui01-data.cjs','tests/ui01-browser.cjs','tests/ui01-source-pixels.cjs'].sort());
 const tracked=execFileSync('git',['ls-tree','-r','--name-only',m.baselineCommit],{cwd:root,encoding:'utf8'}).trim().split('\n');assert.deepEqual(Object.keys(m.baselineFiles).sort(),tracked.sort());
 for(const file of tracked){const b=baselineBytes(file),git=execFileSync('git',['show',m.baselineCommit+':'+file],{cwd:root,maxBuffer:3e6});assert.equal(b.toString().replaceAll('\r\n','\n'),git.toString().replaceAll('\r\n','\n'),file+' immutable Git content');assert.equal(hash(git),m.baselineFiles[file].gitSha256);}
 for(const [file,h] of Object.entries(m.newFiles))assert.equal(hash(Buffer.from(require('./ui01-fix-a-contract.cjs').restoreUI01(file,fs.readFileSync(path.join(root,file))).toString('utf8').replaceAll('\r\n','\n'))),h,file+' recorded UI-01 source');
 for(const file of ['map-data.js','room-identification.js','map-semantics.js','room-contract.js','schedule-engine.js','schedule-fixture.js'])assert.equal(hash(fs.readFileSync(path.join(root,file))),m.baselineFiles[file].sha256,file+' byte protected');
 return {baselineCommit:m.baselineCommit,protectedFiles:tracked.length,sourceChanges:Object.keys(m.sourcePatches)};
}
module.exports={baselineBytes,validatePreservation};
