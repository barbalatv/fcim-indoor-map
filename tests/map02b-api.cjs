const {test}=require('node:test'),assert=require('node:assert/strict');
const api=require('../timetable-api.js');
const response=(body={},status=200)=>Response.json(body,{status});
const normalize=(p,s,c,t)=>({courseYear:c,p,s,fetchedAt:t});
test('API base allows exact HTTPS and local HTTP; rejects credentials, paths and remote plaintext',()=>{
 for(const value of ['https://example.com/path','https://u:p@example.com','https://example.com?secret=x','http://example.com','javascript:alert(1)','not a url'])assert.throws(()=>api.createClient(value,normalize));
 assert.equal(api.baseUrl('https://example.com'),'https://example.com');assert.equal(api.baseUrl('http://127.0.0.1:3000'),'http://127.0.0.1:3000');
});
test('only exact course public GETs use credentials omit; in-flight and TTL avoid duplicate requests',async()=>{
 const calls=[];const client=api.createClient('https://example.com',normalize,{fetch:async(u,o)=>{calls.push({u,o});return response({ok:true});}});
 const [a,b]=await Promise.all([client.load(2),client.load(2)]);assert.equal(a,b);assert.equal(calls.length,2);assert.equal((await client.load(2)).state,'cached');assert.equal(calls.length,2);
 for(const c of calls){assert.equal(new URL(c.u).search,'?course=2');assert.equal(c.o.credentials,'omit');assert.equal(c.o.redirect,'error');assert.equal(c.o.signal instanceof AbortSignal,true);assert.ok(['/api/status','/api/schedule'].includes(new URL(c.u).pathname));}
 await assert.rejects(client.load('2'));await client.load(2,{force:true});assert.equal(calls.length,4);
});
test('expired TTL revalidates and refresh does not alter the server schedule',async()=>{let now=0,calls=0;const client=api.createClient('https://example.com',normalize,{now:()=>now,ttlMs:100,fetch:async()=>{calls++;return response();}});await client.load(1);now=101;assert.equal((await client.load(1)).state,'fresh');assert.equal(calls,4);});
for(const status of [400,503,500])test('HTTP '+status+' unavailable with no accepted snapshot',async()=>{const client=api.createClient('https://example.com',normalize,{fetch:async()=>response({},status)});await assert.rejects(client.load(1),e=>e.code==='http');});
test('bad JSON, content-type, schema and oversized body reject candidates',async()=>{
 for(const fetcher of [async()=>new Response('{bad',{headers:{'content-type':'application/json'}}),async()=>new Response('<html>'),async()=>response({big:'a'.repeat(500)})]){const client=api.createClient('https://example.com',normalize,{fetch:fetcher,maxBytes:100});await assert.rejects(client.load(1));}
 const client=api.createClient('https://example.com',()=>{throw Error('bad schema');},{fetch:async()=>response()});await assert.rejects(client.load(1),e=>e.code==='invalid');
});
test('bounded timeout also covers a fetcher that ignores cancellation',async()=>{const client=api.createClient('https://example.com',normalize,{fetch:()=>new Promise(()=>{}),timeoutMs:15});await assert.rejects(client.load(1),e=>e.code==='timeout');});
test('network/CORS failure and invalid response preserve the last accepted snapshot',async()=>{
 let mode='good';const client=api.createClient('https://example.com',(p,s,c,t)=>{if(mode==='invalid')throw Error('mismatch');return normalize(p,s,c,t);},{fetch:async()=>{if(mode==='network')throw new TypeError('Failed to fetch');return response();}});
 const good=await client.load(1);for(mode of ['network','invalid']){const stale=await client.load(1,{force:true});assert.equal(stale.state,'stale');assert.equal(stale.dataset,good.dataset);assert.ok(stale.error);}
});
test('external cancellation and explicit cancel never overwrite accepted data',async()=>{const client=api.createClient('https://example.com',normalize,{fetch:()=>new Promise(()=>{}),timeoutMs:500});const c=new AbortController(),promise=client.load(1,{signal:c.signal});c.abort();await assert.rejects(promise,e=>e.code==='cancelled');const p=client.load(2);client.cancel();await assert.rejects(p,e=>e.code==='cancelled');});
test('older responses cannot replace a forced newer generation even if fetch ignores AbortSignal',async()=>{
 let delayed=[];const client=api.createClient('https://example.com',normalize,{fetch:()=>new Promise(resolve=>delayed.push(resolve)),timeoutMs:1000});
 const old=client.load(1);const oldRejected=assert.rejects(old,e=>e.code==='cancelled');const latest=client.load(1,{force:true});
 delayed[2](response({version:2}));delayed[3](response({version:2}));assert.equal((await latest).dataset.p.version,2);
 delayed[0](response({version:1}));delayed[1](response({version:1}));await oldRejected;assert.equal((await client.load(1)).dataset.p.version,2);
});
