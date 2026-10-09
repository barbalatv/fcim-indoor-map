const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process'),os=require('node:os');
const root=path.resolve(__dirname,'..'),m=require('../DEPLOY-01_CHANGES.json'),integration=require('../MAP-02B_CHANGES.json');
const lf=b=>b.toString('utf8').replaceAll('\r\n','\n'),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function restored(file){let text=lf(fs.readFileSync(path.join(root,file)));for(const p of [...(integration.sourcePatches[file]||[])].reverse()){const added=lf(p.new);assert.equal(text.split(added).length,2,file+' unique approved integration hunk');text=text.replace(added,()=>lf(p.old));}return text;}
test('All accepted source and historical assertions preserved, with only Git line-ending normalization',()=>{
 assert.equal(m.baselineCommit,'e14273370cc419e5acd21b78cd2ea51a3d6d4127');
 assert.deepEqual(Object.keys(integration.sourcePatches).sort(),['README.md','TIMETABLE_CONTRACT.md','index.html']);
 for(const [file,expected] of Object.entries(m.baselineLfSha256))assert.equal(hash(restored(file)),expected,file+' immutable accepted LF bytes');
 const files=execFileSync('git',['ls-files','--cached','--others','--exclude-standard'],{cwd:root,encoding:'utf8'}).trim().split('\n');
 assert.deepEqual([...new Set(files)].sort(),[...Object.keys(integration.baselineFiles),...integration.additions,...m.releaseAdditions].sort(),'exact release file allowlist');
 const html=lf(fs.readFileSync(path.join(root,'index.html'))),old=restored('index.html'),storage=s=>s.slice(s.indexOf('  // ---------- хранилище привязок ----------'),s.indexOf('  // Canonical FIX-01 parser'));
 assert.equal(storage(html),storage(old),'manual storage/import/export remains identical');
});
test('Exact 222 accepted IDs and every qualified F1 mapping remain fixed',()=>{
 const map=require('../map-data.js'),rooms=require('../room-contract.js'),ident=require('../room-identification.js'),catalog=ident.createCatalog(map,rooms.createParser(map,'3'));
 assert.deepEqual(map.floors.map(f=>({level:f.level,ids:f.spaces.map(s=>s.id)})),m.spatialIds);
 assert.equal(map.floors.flatMap(f=>f.spaces).length,222);assert.equal(catalog.mappings.length,15);
 assert.deepEqual(JSON.parse(JSON.stringify(catalog.mappings)),m.roomMappings);
 const resolve=rooms.createResolver(map,rooms.createParser(map,'3'),catalog);
 for(const r of catalog.mappings)assert.deepEqual(resolve({room:r.roomCode,source:'timetable',buildingId:map.id}).spaceIds,r.spaceIds);
 assert.equal(resolve({room:'3-405',source:'timetable',buildingId:map.id}).spaceId,null,'upper floor stays unmapped');
});
test('Publish artifact is an explicit runtime allowlist; no fixtures, evidence or private files',async()=>{
 const {preparePages,scripts}=await import('../scripts/prepare-pages.mjs');const temp=fs.mkdtempSync(path.join(os.tmpdir(),'fcim-pages-')),out=path.join(temp,'site');
 const files=preparePages(root,out);assert.deepEqual(files,['index.html',...scripts,'.nojekyll']);assert.equal(files.length,13);
 assert.deepEqual(fs.readdirSync(out).sort(),files.slice().sort());for(const name of files.filter(f=>f!=='.nojekyll'))assert.deepEqual(fs.readFileSync(path.join(out,name)),fs.readFileSync(path.join(root,name)));
 assert.throws(()=>preparePages(root,out),/new or empty/);assert.throws(()=>preparePages(root,root),/must not contain source/);
 // Remove only the temporary directory created above, never workspace/user paths.
 assert.equal(path.dirname(fs.realpathSync(temp)),fs.realpathSync(os.tmpdir()));assert.ok(path.basename(temp).startsWith('fcim-pages-'));fs.rmSync(temp,{recursive:true});
});
