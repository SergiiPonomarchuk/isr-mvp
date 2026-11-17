"use strict";
// Isolated one-call experiment; the legacy pilot schema/budget guard is unchanged.
const fs=require('node:fs'),path=require('node:path');
const S=require('../experiments/review-stages'),R=require('../context-review');
const {save,sha,providerError}=require('./mr1-pilot-budget');
const ROOT=path.resolve(__dirname,'../..'),DIR='specs/tasks/M3-evaluation/';
const APPROVAL=DIR+'staged-check-approval.json',FOLDER=DIR+'pilot-20261117-staged-check';
const fail=message=>{throw new Error(message);};
function preflight(root,approval){
 if(approval.version!=='staged-review-check-approval-1'||approval.max_cumulative_reviews!==23||approval.cumulative_cost_ceiling_usd!==.5||approval.new_embedding_texts!==0||approval.automatic_retries!==0)fail('Prototype approval differs');
 const verify=()=>{for(const [file,hash]of Object.entries(approval.pins))if(sha(fs.readFileSync(path.join(root,file)))!==hash)fail('Prototype source or receipt changed');};verify();
 const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
 const input=read(DIR+'cases.json').cases.find(c=>c.id==='compound-lock-software-clarified').input;
 const ranked=read(DIR+'pilot-20261117-two-case/ledger.json').cases['compound-lock-software-clarified'].raw_chain.ranked;
 const library=read('functions/data/analyzer_examples.json'),decision=read(DIR+'staged-decision-fixture.json'),partition=read(DIR+'staged-scope-plan.json');
 const request=S.prepare(input,ranked,library,decision,partition);
 if(R.hash(request)!==approval.request_sha256||R.hash(request)!==R.hash(read(DIR+'staged-domain-request.json'))||partition.compatible_ids.length!==19||partition.raw_chain.length!==100)fail('Prepared request differs');
 const base={reviews:0,embeddingTexts:0,embeddingPosts:0,reserved_usd_micros:0,transport_attempts:0},tokens={};let cost=0;
 if(new Set(approval.receipts).size!==approval.receipts.length)fail('Duplicate receipt');
 for(const file of approval.receipts){
  if(!approval.pins[file])fail('Unpinned receipt');const ledger=read(file);
  if(!['stopped_no_retry','completed_pending_semantic_review','validated_pending_semantic_review'].includes(ledger.status))fail('Unfinished parent');
  for(const a of ledger.attempts){if(a.http_attempts!==1||!Number.isSafeInteger(a.reserved_usd_micros)||a.reserved_usd_micros<0)fail('Invalid parent attempt');base.reviews+=a.kind==='review'?1:0;base.embeddingTexts+=a.embedding_texts;base.embeddingPosts+=a.kind==='embedding'?1:0;base.reserved_usd_micros+=a.reserved_usd_micros;base.transport_attempts+=a.http_attempts;for(const[k,v]of Object.entries(a.usage||{}))tokens[k]=(tokens[k]||0)+v;cost+=a.reported_cost_usd_micros||0;}
 }
 if(base.reviews!==22||base.embeddingTexts!==14||base.embeddingPosts!==14||base.reserved_usd_micros!==351880||base.transport_attempts!==36)fail('Prior totals differ');
 const bytes=Buffer.byteLength(JSON.stringify({contents:request.contents,responseJsonSchema:request.config.responseJsonSchema}));
 const reserve=Math.ceil((bytes+1024)*.25+8192*1.5);
 if(bytes>32768||base.reserved_usd_micros+reserve>500000)fail('Input/cost allowance exceeded');
 return {verify,input,ranked,library,decision,partition,request,base,tokens,cost,reserve};
}
async function run({root=ROOT,folder,approval,apiKey,fetchFn=globalThis.fetch}){
 const c=preflight(root,approval);fs.mkdirSync(folder,{recursive:true});
 const file=path.join(folder,'ledger.json');if(fs.existsSync(file))fail('Prototype receipt exists; never repeat');
 const lockFile=path.join(folder,'pilot.lock'),lock=fs.openSync(lockFile,'wx');
 const data={version:'staged-review-check-ledger-1',authorization:approval,pins:approval.pins,base:c.base,status:'reserved',attempts:[{id:1,kind:'review',embedding_texts:0,http_attempts:0,reserved_usd_micros:c.reserve,request_sha256:R.hash(c.request),schema_sha256:R.hash(c.request.config.responseJsonSchema),status:'reserved'}]};
 const a=data.attempts[0];save(file,data);save(path.join(folder,'attempt-1-request.json'),c.request);
 let sends=0,gotResponse=false;
 try{
  const {GoogleGenAI}=require('@google/genai');
  const transport=async(input,init)=>{
   c.verify();const req=new Request(input,init),url=new URL(req.url);
   if(sends||req.method!=='POST'||url.origin!=='https://generativelanguage.googleapis.com'||url.pathname!=='/v1beta/models/gemini-3.1-flash-lite:generateContent'||url.search)fail('Unapproved or repeated prototype HTTP request');
   const body=await req.clone().json();
   if(Object.keys(body).some(k=>!['contents','generationConfig'].includes(k))||R.hash(body.generationConfig)!==R.hash(c.request.config)||body.contents?.length!==1||body.contents[0].parts?.length!==1||Object.keys(body.contents[0].parts[0]).length!==1||body.contents[0].parts[0].text!==c.request.contents)fail('SDK prototype body differs');
   sends++;a.http_attempts=1;a.status='sending';save(file,data);
   const response=await fetchFn(new Request(req,{redirect:'error'}));
   if(!response.ok){a.provider_error=await providerError(response,apiKey);save(path.join(folder,'attempt-1-provider-error.json'),a.provider_error);save(file,data);}
   return response;
  };
  const client=new GoogleGenAI({apiKey,httpOptions:{retryOptions:{attempts:1},timeout:120000,fetch:transport}});
  const response=await client.models.generateContent(c.request);
  gotResponse=true;a.status='succeeded';a.usage={};
  for(const[k,v]of Object.entries(response.usageMetadata||{}))if(typeof v==='number'&&Number.isFinite(v)&&v>=0)a.usage[k]=v;
  a.finish_reason=response.candidates?.[0]?.finishReason||null;
  if(a.usage.promptTokenCount!=null){const output=Math.max((a.usage.candidatesTokenCount||0)+(a.usage.thoughtsTokenCount||0),(a.usage.totalTokenCount||0)-a.usage.promptTokenCount);a.reported_cost_usd_micros=Math.ceil(a.usage.promptTokenCount*.25+output*1.5);}
  save(path.join(folder,'attempt-1-response.json'),{text:response.text||'',usage:a.usage,finish_reason:a.finish_reason,model_version:response.modelVersion||null});save(file,data);
  if(a.reported_cost_usd_micros>c.reserve)fail('Reported usage exceeded reservation');
  if(a.finish_reason==='MAX_TOKENS')fail('Prototype output reached token limit');
  const result=S.merge(response.text||'',c.input,c.ranked,c.library,c.decision,c.partition);
  // The decision remains an author-confirmed fixture; these domain verdicts are
  // actual model output, not the synthetic domain rows used by offline tests.
  result.fixture_only=false;result.experiment_only=true;result.domain_origin='real_model';
  for(const p of Object.values(result.provenance))if(p.origin==='domain_fixture'){p.origin='domain_model';p.model=response.modelVersion||c.request.model;p.request_sha256=R.hash(c.request);}

  save(path.join(folder,'validated-review.json'),result);data.status='validated_pending_semantic_review';
 }catch(error){data.status='stopped_no_retry';data.stop_reason=a.provider_error?'Provider rejected prototype request':!gotResponse?'Prototype provider or transport failed; no retry':String(error.message||'Prototype failed').split(apiKey||'\0').join('[credential redacted]').replace(/https?:\/\/\S+/g,'[URL redacted]').slice(0,300);}
 finally{
  data.finished_at=new Date().toISOString();save(file,data);
  const tokens={...c.tokens};for(const[k,v]of Object.entries(a.usage||{}))tokens[k]=(tokens[k]||0)+v;
  save(path.join(folder,'summary.json'),{status:data.status,stop_reason:data.stop_reason||null,totals:{...c.base,reviews:23,reserved_usd_micros:c.base.reserved_usd_micros+c.reserve,transport_attempts:c.base.transport_attempts+a.http_attempts},conservative_reserved_usd:(c.base.reserved_usd_micros+c.reserve)/1e6,reported_token_totals:tokens,reported_cost_usd:(c.cost+(a.reported_cost_usd_micros||0))/1e6,usage_complete:false,new_embedding_texts:0,firestore_rpcs:0,production_writes:0,deployment_ready:false});
  fs.closeSync(lock);fs.unlinkSync(lockFile);
 }
 return JSON.parse(fs.readFileSync(path.join(folder,'summary.json'),'utf8'));
}
async function cli(){
 const approval=JSON.parse(fs.readFileSync(path.join(ROOT,APPROVAL),'utf8'));preflight(ROOT,approval);
 if(!process.argv.includes('--apply')){console.log(JSON.stringify({dry_run:true,domain_candidates:19,raw_candidates:100,provider_calls:0}));return;}
 if(process.env.M3_PILOT_AUTHORIZATION_SHA256!==sha(fs.readFileSync(path.join(ROOT,APPROVAL)))||!process.env.GEMINI_API_KEY)fail('Approved private launcher missing');
 const result=await run({folder:path.join(ROOT,FOLDER),approval,apiKey:process.env.GEMINI_API_KEY});console.log(JSON.stringify(result));
 if(result.status==='stopped_no_retry')process.exitCode=1;
}
module.exports={preflight,run};
if(require.main===module)cli().catch(()=>{console.error('Prototype check refused; no retry or credential output.');process.exitCode=1;});
