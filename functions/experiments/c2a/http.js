"use strict";
const http=require('node:http'),A=require('../publication/artifact'),G=require('./guard');
const ARGUMENTS={start:['id','kind','uid','owner'],status:['id'],stage:['id','owner','epoch','offset'],seal:['id','owner','epoch'],activate:['id','owner','epoch'],renew:['id','owner','epoch'],takeover:['id','owner'],page:['cursor','page_size'],replay:['operation_key'],phase:['value'],abort:['id'],cleanup:['id','max']};
async function dispatch(services,body){
 if(!body||Object.keys(body).sort().join()!=='args,command,fixture_id,version'||body.version!==G.VERSION||!Object.hasOwn(ARGUMENTS,body.command)||!body.args||Array.isArray(body.args)||typeof body.args!=='object'||Object.keys(body.args).some(k=>!ARGUMENTS[body.command].includes(k)))A.fail('c2a_request_shape');
 const service=services.get(body.fixture_id);if(!service)A.fail('fixture_unknown');const a=body.args,t={job_id:a.id,owner:a.owner,epoch:a.epoch};let value;
 switch(body.command){
  case 'start':value=await service.start(a);return {version:G.VERSION,success:!!(value.receipt||value.already_member),pending:!(value.receipt||value.already_member),...value};
  case 'status':value=await service.status(a.id);return {version:G.VERSION,pending:['building','ready'].includes(value.state),...value};
  case 'stage':value=await service.stage(a.id,t,a.offset);break;
  case 'seal':value=await service.seal(a.id,t);break;
  case 'activate':value=await service.activate(a.id,t);return {version:G.VERSION,success:true,receipt:value};
  case 'renew':value=await service.renew(a.id,t);break;
  case 'takeover':value=await service.takeover(a.id,a.owner);break;
  case 'page':return {success:true,...await service.page(a)};
  case 'replay':return {version:G.VERSION,success:true,encoded_result:A.pack(await service.replay(a.operation_key))};
  case 'phase':await service.phase(a.value);return {version:G.VERSION,success:true};
  case 'abort':await service.abort(a.id);return {version:G.VERSION,success:true};
  case 'cleanup':value=await service.cleanup(a.id,a.max);break;
 }
 return {version:G.VERSION,success:true,result:value};
}
async function serve(services){
 G.target();if(!(services instanceof Map)||services.size<1||services.size>32)A.fail('fixture_registry');let requests=0;const drops=new Map();
 const server=http.createServer(async(req,res)=>{
  try{
   if(req.socket.remoteAddress!=='127.0.0.1'||req.method!=='POST'||req.url!=='/c2a'||++requests>2048)A.fail('c2a_http_refused');
   const buffers=[];let size=0;for await(const part of req){size+=part.length;if(size>65536)A.fail('request_byte_budget');buffers.push(part);}
   let body;try{body=JSON.parse(Buffer.concat(buffers).toString('utf8'));}catch{A.fail('c2a_json');}
   const result=await dispatch(services,body);
   // Trusted fault injection is configured only in-process, never via JSON.
   if(drops.get(body.command)){drops.set(body.command,drops.get(body.command)-1);res.destroy();return;}
   const text=JSON.stringify(result);if(Buffer.byteLength(text)>65536)A.fail('response_byte_budget');res.writeHead(200,{'content-type':'application/json'});res.end(text);
  }catch(e){const code=typeof e.code==='string'&&/^[a-z][a-z0-9_]{0,63}$/.test(e.code)?e.code:'operation_failed';res.writeHead(['unpublished','job_missing'].includes(code)?404:code.startsWith('c2a_request')?400:409,{'content-type':'application/json'});res.end(JSON.stringify({version:G.VERSION,success:false,error:code}));}
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(G.PORT,'127.0.0.1',resolve);});
 return {url:'http://127.0.0.1:'+G.PORT+'/c2a',dropOnce:command=>drops.set(command,1),close:()=>new Promise(resolve=>{server.closeAllConnections();server.close(resolve);})};
}
module.exports={ARGUMENTS,dispatch,serve};
