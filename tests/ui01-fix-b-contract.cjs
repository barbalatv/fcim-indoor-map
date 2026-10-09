// Exact FIX-B reversal before the existing FIX-A/UI-01/ROOM/GEO/FIX gates.
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto'),{execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..'),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const changed=['index.html','schematic-layout.js','tests/ui01-data.cjs','tests/ui01-browser.cjs','tests/ui01-fix-a-data.cjs','tests/ui01-fix-a-browser.cjs','tests/ui01-fix-a-contract.cjs'];
const additions=['UI-01-FIX-B_CHANGES.json','UI-01-FIX-B_REPORT.md','tests/ui01-fix-b-contract.cjs','tests/ui01-fix-b-data.cjs','tests/ui01-fix-b-browser.cjs'];
function restoreFixA(file,bytes){
 const m=require('../UI-01-FIX-B_CHANGES.json'),patches=m.sourcePatches[file];if(!patches)return bytes;
 let text=bytes.toString('utf8').replaceAll('\r\n','\n');
 for(const p of [...patches].reverse()){assert.equal(text.split(p.new).length,2,file+' unique FIX-B hunk');text=text.replace(p.new,()=>p.old);}
 const endings=m.baselineFiles[file].lineEndings;assert.equal(text.split('\n').length-1,endings.reduce((n,r)=>n+r.count,0),file+' FIX-B recorded line count');
 let index=0,left=endings[0]?.count||0;
 const restored=Buffer.from(text.replace(/\n/g,()=>{while(!left){index++;left=endings[index].count;}left--;return endings[index].eol;}));
 assert.equal(hash(restored),m.baselineFiles[file].sha256,file+' exact accepted FIX-A bytes');return restored;
}
function baselineBytes(file,bytes=fs.readFileSync(path.join(root,file))){
 const m=require('../UI-01-FIX-B_CHANGES.json');assert.ok(m.baselineFiles[file],file+' captured FIX-A baseline');
 const b=restoreFixA(file,bytes);assert.equal(hash(b),m.baselineFiles[file].sha256,file+' byte-identical FIX-A baseline');return b;
}
function baselineFileList(){
 const m=require('../UI-01-FIX-B_CHANGES.json'),files=execFileSync('git',['ls-files','--cached','--others','--exclude-standard'],{cwd:root,encoding:'utf8'}).trim().split('\n');
 assert.deepEqual(files.sort(),[...Object.keys(m.baselineFiles),...additions].sort(),'no unrelated writes or deletions');
 return Object.keys(m.baselineFiles);
}
function validatePreservation(){
 const m=require('../UI-01-FIX-B_CHANGES.json');assert.equal(m.baselineCommit,'8b0a24aec70d51178291a0fd14d1860467e5b607');assert.equal(m.baselineBranch,'codex/ui-01-fix-a-horizontal-grid');assert.equal(Object.keys(m.baselineFiles).length,62);
 assert.deepEqual(Object.keys(m.sourcePatches).sort(),changed.slice().sort());baselineFileList();
 for(const file of Object.keys(m.baselineFiles))baselineBytes(file);
 for(const [file,h] of Object.entries(m.currentSources))assert.equal(hash(Buffer.from(fs.readFileSync(path.join(root,file),'utf8').replaceAll('\r\n','\n'))),h,file+' recorded FIX-B source');
 return {baselineFiles:62,changedFiles:changed,protectedUnchangedFiles:55};
}
module.exports={restoreFixA,baselineBytes,baselineFileList,validatePreservation};
