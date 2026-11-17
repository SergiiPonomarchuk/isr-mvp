"use strict";
require('./no-network');
const fs=require('node:fs'),assert=require('node:assert/strict');
const {capture}=require('./capture'),{build}=require('./envelopes'),Wire=require('./wire');
async function audit(config,onProgress=()=>{}){
 const started=performance.now(),peak={rss:0,heap:0,external:0},sample=()=>{const m=process.memoryUsage();peak.rss=Math.max(peak.rss,m.rss);peak.heap=Math.max(peak.heap,m.heapUsed);peak.external=Math.max(peak.external,m.external);};sample();
 const template=await capture(config);sample();const envelope=build(config,template);sample();
 const result={config,status:'running',fixture:'synthetic repeated score shapes, not actual profiles or whole-population performance',real_provider_calls:0,database_rpcs:0,codec_scope:'offline experiment only',evidence_slots:envelope.evidence_slots,cohorts:envelope.counts,replay:envelope.replay,operations:{},peak};
 function measure(kind,compact){const counter=new Wire.Counter(),legacy=new Wire.Counter();let seen=0,ops=[];for(const op of envelope[kind](compact)){counter.add(op);if(!op.path.endsWith('__u10_creation_registry'))legacy.add({kind:'create',path:op.path,data:op.post,post:op.post});if(config.members<=100)ops.push(op);if(++seen%32===0)sample();}sample();const measured=counter.result();if(ops.length)assert.equal(measured.wire_bytes,Wire.full(ops));return {...measured,full_image_estimate_bytes:legacy.bytes,within_full_image_request_guard:legacy.bytes<=10*1024*1024-32768,stream_full_byte_parity:ops.length>0?true:'validated separately on small fixtures',round_trip:compact?true:'not encoded'};}
 const check=[];for(const op of envelope.check()){const n=new Wire.Counter();n.add(op);check.push({path:op.path,...n.result()});}result.operations.check={independent_requests:check};onProgress(result);
 for(const compact of [false,true])for(const kind of ['create','join']){result.operations[kind+(compact?'_compact':'_current')]=measure(kind,compact);result.elapsed_seconds=(performance.now()-started)/1000;sample();onProgress(result);}
 if(config.members===4&&!config.mixed){for(const kind of ['check','create','join'])assert.equal(Wire.full([...envelope[kind](false)]),Wire.full(template.operations[kind]));result.handler_shape_byte_parity=true;}
 result.status='completed';result.elapsed_seconds=(performance.now()-started)/1000;sample();onProgress(result);return result;
}
module.exports={audit};
if(require.main===module){const config=JSON.parse(process.argv[2]),progress=process.argv[3];const save=data=>{if(progress){fs.writeFileSync(progress+'.tmp',JSON.stringify(data));fs.renameSync(progress+'.tmp',progress);}};audit(config,save).then(r=>console.log(JSON.stringify(r))).catch(e=>{const r={status:'fixture_refused',config,error:String(e.message).slice(0,400),real_provider_calls:0,database_rpcs:0};save(r);console.log(JSON.stringify(r));process.exitCode=1;});}
