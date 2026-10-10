// Render the unchanged source model in a fixed style. UI-01 appearance is tested separately.
const fs=require('fs'),path=require('path');
async function sourcePixels(browser,source,level,box='-30 -45 1100 285'){
 const mod={exports:{}};Function('module',fs.readFileSync(path.join(source,'map-data.js'),'utf8'))(mod);
 const f=mod.exports.floors.find(f=>f.level===level),g=f.geometry;
 const polygon=(p,fill)=>'<polygon points="'+p.map(a=>a.join(',')).join(' ')+'" fill="'+fill+'" stroke="#38434f" stroke-width="1.6"/>';
 let markup=polygon(g.outline,'#fff')+polygon(g.corridor,'#eee');
 f.spaces.forEach(s=>markup+=polygon(s.polygon,'#dce8dc'));
 g.verticals.forEach(v=>{markup+=polygon(v.polygon,'#d4dee3');if(v.innerShaft)markup+=polygon(v.innerShaft,'#b7cddd');const art=v.stairDrawing||v.visualStair;if(art){markup+=polygon(art.landing,'#abc');art.flights.forEach(p=>markup+=polygon(p,'#abc'));}});
 g.features.forEach(ft=>{if(ft.polygon)markup+=polygon(ft.polygon,'#ddd');if(ft.line)markup+='<polyline points="'+ft.line.map(a=>a.join(',')).join(' ')+'" fill="none" stroke="#123"/>';});
 g.doors.forEach(d=>markup+='<circle cx="'+d.x+'" cy="'+d.y+'" r="1" fill="#123"/>');
 const p=await browser.newPage({viewport:{width:2000,height:620}});await p.setContent('<body style="margin:0"><svg xmlns="http://www.w3.org/2000/svg" width="2000" height="615" viewBox="'+box+'">'+markup+'</svg></body>');
 const png=await p.locator('svg').screenshot();await p.close();return png;
}
module.exports={sourcePixels};
