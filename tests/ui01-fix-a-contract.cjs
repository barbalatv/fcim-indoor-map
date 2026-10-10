// Restore only recorded FIX-A hunks before invoking the original UI-01 gates.
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto'),{execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..'),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const changed=['index.html','schematic-layout.js','tests/ui01-contract.cjs','tests/ui01-data.cjs','tests/ui01-browser.cjs'];
function restoreUI01(file,bytes){
 bytes=require('./ui01-fix-b-contract.cjs').restoreFixA(file,bytes);
 const m=require('../UI-01-FIX-A_CHANGES.json'),patches=m.sourcePatches[file];if(!patches)return bytes;
 let text=bytes.toString('utf8').replaceAll('\r\n','\n');
 for(const p of [...patches].reverse()){assert.equal(text.split(p.new).length,2,file+' unique FIX-A hunk');text=text.replace(p.new,()=>p.old);}
 const endings=m.baselineFiles[file].lineEndings;assert.equal(text.split('\n').length-1,endings.reduce((n,r)=>n+r.count,0),file+' FIX-A recorded line count');
 let index=0,left=endings[0]?.count||0;
 const restored=Buffer.from(text.replace(/\n/g,()=>{while(!left){index++;left=endings[index].count;}left--;return endings[index].eol;}));
 assert.equal(hash(restored),m.baselineFiles[file].sha256,file+' exact completed UI-01 bytes');return restored;
}
function baselineBytes(file,bytes=fs.readFileSync(path.join(root,file))){
 const m=require('../UI-01-FIX-A_CHANGES.json');assert.ok(m.baselineFiles[file],file+' captured UI-01 baseline');
 const b=restoreUI01(file,bytes);assert.equal(hash(b),m.baselineFiles[file].sha256,file+' byte-identical UI-01 baseline');return b;
}
function validatePreservation(){
 const m=require('../UI-01-FIX-A_CHANGES.json');assert.equal(m.baselineCommit,'8b0a24aec70d51178291a0fd14d1860467e5b607');
 assert.equal(m.baselineBranch,'codex/ui-01-minimalist-floorplan');assert.equal(Object.keys(m.baselineFiles).length,57);
 assert.deepEqual(Object.keys(m.sourcePatches).sort(),changed.slice().sort());
 const additions=['UI-01-FIX-A_CHANGES.json','UI-01-FIX-A_REPORT.md','tests/ui01-fix-a-contract.cjs','tests/ui01-fix-a-data.cjs','tests/ui01-fix-a-browser.cjs'];
 const files=require('./ui01-fix-b-contract.cjs').baselineFileList();
 assert.deepEqual(files.sort(),[...Object.keys(m.baselineFiles),...additions].sort(),'no unrelated writes or deletions');
 for(const file of Object.keys(m.baselineFiles))baselineBytes(file);
 for(const [file,h] of Object.entries(m.currentSources))assert.equal(hash(Buffer.from(require('./ui01-fix-b-contract.cjs').restoreFixA(file,fs.readFileSync(path.join(root,file))).toString('utf8').replaceAll('\r\n','\n'))),h,file+' recorded FIX-A source');
 return {baselineFiles:57,changedFiles:changed,protectedUnchangedFiles:52};
}
module.exports={restoreUI01,baselineBytes,validatePreservation};
