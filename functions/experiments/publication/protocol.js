"use strict";
const A=require('./artifact');const {fail,hash,size}=A;
const DEFAULTS=Object.freeze({chunk_bytes:8192,chunk_writes:8,total_bytes:1048576,total_nodes:512,total_commits:256,max_ms:600000,lease_ms:1000});
const jobKey=id=>'private/jobs/'+id,nodeKey=(id,n)=>'private/nodes/'+id+'/'+n,intentKey=k=>'private/intents/'+k;
const issueKey=id=>'public/issues/'+id,discKey=id=>'public/discussions/'+id,publicKey=id=>'public/publics/'+id,lockKey=id=>'private/locks/'+id;
function budgets(b){if(!b||Object.keys(b).sort().join()!=Object.keys(DEFAULTS).sort().join()||Object.entries(b).some(([k,v])=>!Number.isSafeInteger(v)||v<1||v>DEFAULTS[k])||b.chunk_writes<2)fail('budget_config');return {...b};}
function identifier(s){if(typeof s!=='string'||!/^[-a-zA-Z0-9_:]{1,64}$/.test(s))fail('identifier');return s;}
function meta(plan){const {nodes,...m}=plan;return m;}
class Protocol{
 constructor(store,clock){this.s=store;this.clock=clock;if(store.rows.size===0){store.inject('control/source',{id:'synthetic-source',epoch:0,seal:'sealed'});store.inject('control/catalog',{revision:0});store.inject('control/day',{utc:'2026-11-18',local:'2026-11-18'});}}
 job(id){const j=this.s.get(jobKey(id));if(!j)fail('job_missing');return j;}
 guard(j,t,states=['building']){if(!j||j.version!==1)fail('job_version');if(!states.includes(j.state))fail('job_state');if(!t||t.owner!==j.owner||t.epoch!==j.lease_epoch)fail('stale_owner');if(this.clock.now>=j.lease_until||this.clock.now>=j.deadline)fail('lease_expired');}
 charge(j){j.work++;if(j.work>j.budget.total_commits)fail('work_budget');}
 begin(spec,plan,owner,b=DEFAULTS,fault={}){
  for(const k of ['id','operation_key','issue_id','input_hash'])identifier(spec[k]);identifier(owner);if(!['create','join'].includes(spec.kind)||spec.kind==='join'&&!/^\d+$/.test(spec.uid))fail('operation_kind');b=budgets(b);
  if(plan.node_count>b.total_nodes||size(spec)>2048)fail('plan_budget');if(plan.nodes.length!==plan.node_count||plan.nodes.some((n,i)=>n.id!=='n'+String(i).padStart(5,'0'))||size(meta(plan))>1024)fail('plan_budget');const proposed=A.validate(plan,id=>plan.nodes.find(n=>n.id===id));let preflight=null;if(spec.kind==='join'){preflight=this.readPublished(spec.issue_id);const prior=preflight.records.filter(r=>r.kind==='member');if(prior.some(r=>r.data.user_id===spec.uid))return {already_member:true,receipt:preflight.token};const next=proposed.filter(r=>r.kind==='member'),expected=[...prior.map(r=>r.data.user_id),spec.uid].sort();if(hash(next.map(r=>r.data.user_id).sort())!==hash(expected))fail('join_member_set');const mutable=new Set(['normalized_relevance','normalized_experience','normalized_contribution','contribution_source','isr_score','calculated_at']);const frozen=o=>Object.fromEntries(Object.entries(o).filter(([k])=>!mutable.has(k)));for(const old of prior){const found=next.find(r=>r.data.user_id===old.data.user_id);if(!found||hash(frozen(found.data))!==hash(frozen(old.data)))fail('join_frozen_member');}}
  const binding=hash([spec,meta(plan),b]);return this.s.run('begin',tx=>{
   const old=tx.get(intentKey(spec.operation_key));if(old){if(old.binding!==binding)fail('operation_changed');return {job_id:old.job_id,receipt:old.receipt||null,coalesced:true};}
   let base=null;if(spec.kind==='join'){base=tx.get(issueKey(spec.issue_id));if(!base||base.phase!=='chat')fail('not_chat');if(base.build_id!==preflight.token.build_id)fail('base_stale');const prior=tx.get(lockKey(spec.issue_id));if(prior){const other=tx.get(jobKey(prior.job_id));if(other&&['building','ready'].includes(other.state)&&this.clock.now<other.lease_until)fail('join_busy');if(other&&['building','ready'].includes(other.state)){tx.set(jobKey(other.id),{...other,state:'aborted',aborted_at:this.clock.now});}}}
   const source=tx.get('control/source'),catalog=tx.get('control/catalog'),day=tx.get('control/day');
   if(!source||source.seal!=='sealed'||!Number.isSafeInteger(source.epoch)||!Number.isSafeInteger(catalog?.revision)||!day?.utc||!day?.local)fail('source_unavailable');
   const j={version:1,id:spec.id,spec:{...spec},binding,artifact:meta(plan),budget:b,owner,lease_epoch:1,lease_until:this.clock.now+b.lease_ms,deadline:this.clock.now+b.max_ms,state:'building',cursor:0,work:1,staged_bytes:0,source,catalog,day,base:base?{build_id:base.build_id,epoch:base.epoch,phase_revision:base.phase_revision}:null,ever_published:false};
   tx.create(jobKey(j.id),j);tx.create(intentKey(spec.operation_key),{job_id:j.id,binding});if(base)tx.set(lockKey(spec.issue_id),{job_id:j.id});return {job_id:j.id,owner,epoch:1,cursor:0};
  },fault);
 }
 takeover(id,owner,fault={}){identifier(owner);return this.s.run('takeover',tx=>{const j=tx.get(jobKey(id));if(!j||!['building','ready'].includes(j.state)||this.clock.now<j.lease_until||this.clock.now>=j.deadline)fail('takeover_refused');this.charge(j);j.owner=owner;j.lease_epoch++;j.lease_until=Math.min(j.deadline,this.clock.now+j.budget.lease_ms);tx.set(jobKey(id),j);return {job_id:id,owner,epoch:j.lease_epoch,cursor:j.cursor};},fault);}
 renew(id,t){return this.s.run('renew',tx=>{const j=tx.get(jobKey(id));this.guard(j,t,['building','ready']);this.charge(j);j.lease_until=Math.min(j.deadline,this.clock.now+j.budget.lease_ms);tx.set(jobKey(id),j);return j.lease_until;});}
 stage(id,t,plan,offset,fault={}){
  const before=this.job(id);const bound={bytes:before.budget.chunk_bytes,writes:before.budget.chunk_writes};
  return this.s.run('stage',tx=>{const j=tx.get(jobKey(id));this.guard(j,t);if(plan.nodes.length!==j.artifact.node_count||plan.nodes.some((n,i)=>n.id!=='n'+String(i).padStart(5,'0'))||hash(meta(plan))!==hash(j.artifact)||!Number.isInteger(offset)||offset<0||offset>j.cursor)fail('checkpoint');
   if(offset<j.cursor){for(let i=offset;i<j.cursor;i++){const n=this.s.get(nodeKey(id,plan.nodes[i].id));if(!n||hash(n)!==hash(plan.nodes[i]))fail('replay_corruption');}return {cursor:j.cursor,replayed:true};}
   if(offset===plan.node_count)return {cursor:offset,replayed:true};
   let selected=[],next=null;for(let end=offset+1;end<=plan.node_count&&end-offset<j.budget.chunk_writes;end++){
    const candidates=plan.nodes.slice(offset,end),candidate={...j,cursor:end,work:j.work+1};let stable=false;
    for(let n=0;n<12;n++){const ops=[...candidates.map(v=>[nodeKey(id,v.id),{op:'create',value:v}]),[jobKey(id),{op:'set',value:candidate}]];const spent=j.staged_bytes+256+size(ops)+128*(ops.length+1);if(spent===candidate.staged_bytes){stable=true;break;}candidate.staged_bytes=spent;}
    if(!stable)fail('budget_accounting');if(candidate.staged_bytes-j.staged_bytes>j.budget.chunk_bytes)break;selected=candidates;next=candidate;
   }
   if(!next)fail('transaction_budget');if(next.staged_bytes>j.budget.total_bytes)fail('byte_budget');if(next.work>j.budget.total_commits)fail('work_budget');
   for(const n of selected){if(hash([n.id,n.body])!==n.hash)fail('node_hash');tx.create(nodeKey(id,n.id),n);}tx.set(jobKey(id),next);return {cursor:next.cursor,replayed:false};
  },{...fault,bounds:bound});
 }
 seal(id,t,fault={}){
  const before=this.job(id);this.guard(before,t);if(before.cursor!==before.artifact.node_count)fail('incomplete');const records=A.validate(before.artifact,n=>this.s.get(nodeKey(id,n)));
  const members=records.filter(r=>r.kind==='member');if(!members.length)fail('member_directory');const ids=members.map(r=>r.data.user_id);if(new Set(ids).size!==ids.length||members.some(r=>!/^\d+$/.test(r.data.user_id)||r.key!=='member:'+r.data.user_id)||records.filter(r=>r.key==='replay:result'&&r.kind==='replay').length!==1)fail('member_directory');
  const replay=records.find(r=>r.kind==='replay'&&r.key==='replay:result').data;if(replay.success!==true||replay.members_count!==members.length||!Array.isArray(replay.members)||replay.members.length!==members.length||replay.members.some((m,i)=>m.uid!==members[i].data.user_id||m.name!==members[i].data.displayName))fail('replay_directory');
  return this.s.run('seal',tx=>{const j=tx.get(jobKey(id));this.guard(j,t);if(j.cursor!==before.cursor||j.binding!==before.binding)fail('checkpoint');this.charge(j);tx.set(jobKey(id),{...j,state:'ready',member_count:members.length,uid_hash:hash(ids),validated_root:j.artifact.root_hash});return {members:members.length,root:j.artifact.root_hash};},fault);
 }
 activate(id,t,fault={}){
  return this.s.run('activate',tx=>{const j=tx.get(jobKey(id)),intent=tx.get(intentKey(j.spec.operation_key));if(intent.receipt)return {...intent.receipt,replayed:true};this.guard(j,t,['ready']);this.charge(j);
   if(j.validated_root!==j.artifact.root_hash)fail('seal');const source=tx.get('control/source'),catalog=tx.get('control/catalog'),day=tx.get('control/day');if(!source||!catalog||!day)fail('authority_missing');if(hash(source)!==hash(j.source))fail('source_stale');if(hash(catalog)!==hash(j.catalog))fail('catalog_stale');if(hash(day)!==hash(j.day))fail('day_stale');
   const key=issueKey(j.spec.issue_id),current=tx.get(key);let epoch=1;
   if(j.spec.kind==='join'){
    const lock=tx.get(lockKey(j.spec.issue_id));if(!lock||lock.job_id!==id)fail('lock_lost');if(!current||current.phase!=='chat'||current.build_id!==j.base.build_id||current.epoch!==j.base.epoch||current.phase_revision!==j.base.phase_revision)fail('base_stale');epoch=current.epoch+1;
   }else if(current)fail('issue_exists');
   const titlePath='private/titles/'+hash(j.spec.title_key||'synthetic-title'),title=tx.get(titlePath);if(j.spec.kind==='create'&&title&&(title.key!==(j.spec.title_key||'synthetic-title')||title.issue_id!==j.spec.issue_id))fail('title_conflict');
   const token={build_id:id,manifest_hash:j.artifact.root_hash,epoch,member_count:j.member_count};
   if(j.spec.kind==='create'){
    const root={...token,phase:'chat',phase_revision:0,options:[],messages:0};tx.create(key,root);tx.create(discKey(j.spec.issue_id),root);tx.create(publicKey(j.spec.issue_id),token);tx.create('public/vectors/'+j.spec.issue_id,{fixture_only:true});tx.create('public/messages/'+j.spec.issue_id,{fixture_only:true});tx.set(titlePath,{key:j.spec.title_key||'synthetic-title',issue_id:j.spec.issue_id});
   }else{
    const old=tx.get(jobKey(current.build_id));if(!old?.ever_published)fail('base_stale');tx.set(jobKey(current.build_id),{...old,state:'superseded'});const disc=tx.get(discKey(j.spec.issue_id)),pub=tx.get(publicKey(j.spec.issue_id));if(disc.build_id!==current.build_id||pub.build_id!==current.build_id)fail('root_mismatch');tx.set(key,{...current,...token});tx.set(discKey(j.spec.issue_id),{...disc,...token});tx.set(publicKey(j.spec.issue_id),{...pub,...token});tx.create('public/events/'+j.spec.issue_id+':'+j.spec.uid,{uid:j.spec.uid,build_id:id});tx.set(lockKey(j.spec.issue_id),{job_id:null});
   }
   const receipt={version:1,issue_id:j.spec.issue_id,...token};tx.set(intentKey(j.spec.operation_key),{...intent,receipt});tx.set('private/catalog/'+j.spec.issue_id,token);tx.set('control/catalog',{revision:catalog.revision+1});tx.set(jobKey(id),{...j,state:'active',ever_published:true,receipt});return {...receipt,replayed:false};
  },{...fault,bounds:{bytes:16384,writes:16}});
 }
 readPublished(issueId,buildId){const root=this.s.get(issueKey(issueId));if(!root)fail('unpublished');const j=this.job(buildId||root.build_id);if(j.spec.issue_id!==issueId||!j.ever_published||!j.receipt||j.receipt.build_id!==j.id||j.receipt.manifest_hash!==j.artifact.root_hash)fail('unpublished');if(!buildId&&(root.manifest_hash!==j.receipt.manifest_hash||root.epoch!==j.receipt.epoch||root.member_count!==j.receipt.member_count))fail('root_mismatch');return {token:j.receipt,records:A.validate(j.artifact,n=>this.s.get(nodeKey(j.id,n)))};}
 replay(operationKey){const intent=this.s.get(intentKey(operationKey));if(!intent?.receipt)fail('pending');return this.readPublished(intent.receipt.issue_id,intent.receipt.build_id).records.find(r=>r.key==='replay:result').data;}
 phase(issueId,phase,fault={}){if(!['chat','voting','archived'].includes(phase))fail('phase');return this.s.run('phase',tx=>{const key=issueKey(issueId),r=tx.get(key),d=tx.get(discKey(issueId)),c=tx.get('control/catalog');if(!r)fail('unpublished');tx.set(key,{...r,phase,phase_revision:r.phase_revision+1});tx.set(discKey(issueId),{...d,phase,phase_revision:r.phase_revision+1});tx.set('control/catalog',{revision:c.revision+1});},fault);}
 abort(id,fault={}){return this.s.run('abort',tx=>{const j=tx.get(jobKey(id));if(j.ever_published||!['building','ready','aborted'].includes(j.state))fail('abort_refused');if(j.state==='aborted')return;tx.set(jobKey(id),{...j,state:'aborted',aborted_at:this.clock.now});},fault);}
 cleanup(id,max=3,fault={}){if(!Number.isInteger(max)||max<1||max>8)fail('cleanup_budget');return this.s.run('cleanup',tx=>{const j=tx.get(jobKey(id));if(j?.state==='deleted')return {done:true,deleted:0};if(j.ever_published||!['aborted','deleting'].includes(j.state)||this.clock.now-j.aborted_at<7*86400000)fail('cleanup_refused');const start=j.delete_cursor||0,end=Math.min(j.cursor,start+max);for(let i=start;i<end;i++)tx.delete(nodeKey(id,'n'+String(i).padStart(5,'0')));const done=end===j.cursor;tx.set(jobKey(id),done?{version:1,id,state:'deleted',ever_published:false,deleted_at:this.clock.now}:{...j,state:'deleting',delete_cursor:end});return {done,deleted:end-start};},{...fault,bounds:{writes:max+1,bytes:16384}});}
}
module.exports={Protocol,DEFAULTS,jobKey,nodeKey,issueKey,discKey,publicKey,intentKey};
