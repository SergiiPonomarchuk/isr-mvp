"use strict";
// Offline preparation only: never loads a credential or invokes the runner.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {prepare:basePrepare,RESERVE}=require('./two-stage-pilot-plan'),S=require('../staged-context');
const ROOT=path.resolve(__dirname,'../..'),DIR='specs/tasks/M3-evaluation/';
function prepare(root=ROOT){
 const base=basePrepare(root),read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
 const source=DIR+'pilot-20261117-two-stage-runtime/ledger.json',ledger=read(source);
 if(ledger.status!=='stopped_no_retry'||ledger.records.length!==4||ledger.records.some(a=>a.http_attempts!==1||a.reserved_micros!==RESERVE))throw new Error('Historical receipt differs');
 const historical={...base.historical,reviews:base.historical.reviews+ledger.records.length,http_attempts:base.historical.http_attempts+ledger.records.reduce((n,a)=>n+a.http_attempts,0),reserved_micros:base.historical.reserved_micros+ledger.records.reduce((n,a)=>n+a.reserved_micros,0)};
 const files=['functions/tools/one-case-retest-plan.js',source,DIR+'pilot-20261117-two-stage-runtime/artifact-hashes.json',DIR+'two-stage-runtime-approval.json'];
 const pins={...base.pins,...Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex')]))};
 return {...base,version:'one-case-quotation-retest-1',approved:false,prompt_version:S.PROMPT_VERSION,limits:{...base.limits,calls:2,usdMicros:270000},cases:[base.cases.find(c=>c.id==='compound-lock-software-clarified')],historical,max_new_reservation_micros:RESERVE*2,max_cumulative_reviews:historical.reviews+2,max_cumulative_http_attempts:historical.http_attempts+2,max_cumulative_reservation_micros:historical.reserved_micros+RESERVE*2,pins};
}
module.exports={prepare};
if(require.main===module){if(process.argv.includes('--apply'))throw new Error('Offline only; new allowance and private loader approval required');const p=prepare(),{library,...manifest}=p;fs.writeFileSync(path.join(ROOT,DIR+'one-case-quotation-retest-plan.json'),JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify({approved:false,provider_calls:0,cases:p.cases.map(c=>c.id),max_text_http_attempts:2,additional_cap_usd:.27,max_new_reservation_usd:p.max_new_reservation_micros/1e6,cumulative_reserved_usd:p.max_cumulative_reservation_micros/1e6}));}
