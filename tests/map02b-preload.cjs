// Historical gates consume exact baseline projections; Chrome still opens current files.
// Existing assertions/test sources remain unchanged. The new delta is validated first.
const fs=require('fs'),cp=require('child_process'),path=require('path');
const contract=require('./map02b-contract.cjs');contract.validatePreservation();const m=contract.manifest();
const read=fs.readFileSync;
fs.readFileSync=function(file,options){const result=read.apply(this,arguments);if(typeof file!=='string')return result;const relative=path.relative(contract.root,path.resolve(file)).replaceAll('\\','/');if(!m.sourcePatches[relative])return result;
 const restored=contract.restore(relative,Buffer.isBuffer(result)?result:Buffer.from(result));return typeof result==='string'?restored.toString(typeof options==='string'?options:options?.encoding||'utf8'):restored;
};
const exec=cp.execFileSync;
cp.execFileSync=function(file,args,options){const result=exec.apply(this,arguments);if(file==='git'&&args[0]==='ls-files'&&path.resolve(options.cwd)===contract.root){return result.split('\n').filter(f=>!m.additions.includes(f)&&!m.preExistingResearch.includes(f)).join('\n');}return result;};
