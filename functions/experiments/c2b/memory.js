"use strict";
const A=require('../publication/artifact'),{Store}=require('../publication/store'),C=require('./core'),S=require('./service');
function memory(n=2,id='sample'){
 const service=new S.Service({verified:true},id,n,{clock:()=>0}),store=new Store(),commits=[];
 for(const [key,value]of Object.entries({'control/source':{id,epoch:0,seal:'sealed',fixture_hash:service.fixture.hash,fixture_count:n,policy:'c2b_fixture_only'},'control/catalog':{revision:0},'control/day':{utc:'2026-11-24',local:'2026-11-24'},'control/global_catalog':{revision:0,fixtures:[id],policy:'c2b_closed_fixture_catalog'}}))store.inject(key,value);
 service.execute=async(label,call,fault={})=>{const cache=new Map([...store.rows].map(([k,v])=>[k,structuredClone(v.value)]));let result;for(let i=0;i<1024;i++){try{result=C.plan(cache,service.clock(),call);break;}catch(e){if(!(e instanceof C.NeedRead))throw e;cache.set(e.key,undefined);}}if(!result)A.fail('read_budget');if(fault.crash==='before')A.fail('c2b_crash_before');store.run(label,tx=>{for(const [key,op]of result.operations){if(op.kind==='delete')tx.delete(key);else tx[op.kind](key,op.data);}});commits.push({label,operations:result.operations});if(fault.crash==='after')A.fail('result_lost_after_commit');return result.result;};return {service,store,commits};
}
async function finish(s,id){const j=await s.status(id),t={owner:j.owner,epoch:j.epoch};let cursor=j.cursor;while(cursor<j.total_nodes)cursor=(await s.stage(id,t,cursor)).cursor;await s.seal(id,t);return s.activate(id,t);}
module.exports={memory,finish};
