// Compare against the pre-edit copy recorded for FIX-01, never regenerate the model.
const fs = require('fs'), path = require('path'), assert = require('assert/strict'), crypto = require('crypto');
const original = path.resolve(process.argv[2] || (() => { throw Error('Usage: node tests/preserve-map.cjs <original-directory> [result.json]'); })());
const root = path.resolve(__dirname,'..');
const before = require(path.join(original,'map-data.js')), after = require(path.join(root,'map-data.js'));
assert.equal(before.roomNumbering.pattern,'^3-\\d{3}$');
assert.equal(after.roomNumbering.pattern,'^3-\\d{3}[a-zа-я]?$');
const restored = structuredClone(after); restored.roomNumbering.pattern = before.roomNumbering.pattern;
assert.deepEqual(restored,before,'Every model value except roomNumbering.pattern is unchanged');
const beforeText = fs.readFileSync(path.join(original,'map-data.js'),'utf8');
const afterText = fs.readFileSync(path.join(root,'map-data.js'),'utf8');
assert.equal(afterText.replace('^3-\\\\d{3}[a-zа-я]?$', '^3-\\\\d{3}$'),beforeText,'Exactly one metadata edit in map-data.js');
const routeSection = text => text.slice(text.indexOf('  // ---------- маршрутизация'),text.indexOf('  // ---------- уведомления'));
assert.equal(routeSection(fs.readFileSync(path.join(root,'index.html'),'utf8')),routeSection(fs.readFileSync(path.join(original,'index.html'),'utf8')),'Routing implementation unchanged');
const result = {
  status:'PASS',spaces:after.floors.reduce((n,f)=>n+f.spaces.length,0),
  unchanged:'All IDs, geometry, coordinates, doors, floor attributes, nodes, edges, staircase/elevator connections and verification labels; routing implementation byte-identical',
  onlyModelChange:'roomNumbering.pattern: compatible provisional suffix policy',
  hashes:Object.fromEntries(['index.html','map-data.js','README.md'].map(name=>[name,{before:crypto.createHash('sha256').update(fs.readFileSync(path.join(original,name))).digest('hex'),after:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex')}]))
};
console.log(JSON.stringify(result,null,2));
if(process.argv[3])fs.writeFileSync(process.argv[3],JSON.stringify(result,null,2)+'\n');
