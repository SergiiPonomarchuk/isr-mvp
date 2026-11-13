const test = require('node:test');
const assert = require('node:assert/strict');
test('U10 real Check/Create/Join transactions on isolated Firestore', {skip:process.env.U10_EMULATOR_TESTS!=='1',timeout:180000}, async () => {
  assert.equal(process.env.FIRESTORE_EMULATOR_HOST,'127.0.0.1:8185');
  assert.equal(process.env.GCLOUD_PROJECT,'demo-u10');
  const express=require('express');
  const AI=require('../ai-config'), crypto=require('node:crypto');
  const helper=require('../ai-helper');
  const v=Array(768).fill(0);v[0]=1;
  helper.embedIssue=async (title,desc)=>({ok:true,vector:v,model:AI.EMBED_MODEL,dims:768,task_type:AI.TASK_TYPE_ISSUE,template_version:AI.EMBED_TEMPLATE_VERSION,text_sha256:crypto.createHash('sha256').update(`${title}. ${desc}`).digest('hex')});
  helper.checkIssueParams=async()=>({params:{weights:{w_D:0,w_G:1,w_S:0,w_X:0},
    geographic_parameters:{mu_distance_meters:40,sigma_decay_meters:30},
    aggregation_weights:{w_relevance:0.7,w_expertise:0.1,w_contribution:0.2},
    demographics:{employmentStatus:'any',familyStatus:'any'},classification:{scope_type:'building'},
    location_reference:{anchor:'home',place:''}},meta:{ai_source:'model',model:AI.TEXT_MODEL,prompt_version:'fixture',examples_used:[]}});
  const handlers=require('../index');
  const admin=require('firebase-admin'),db=admin.firestore();
  assert.equal((await db.listCollections()).length,0,'start with a new disposable emulator');
  const batch=db.batch();
  for(let uid=1;uid<=105;uid++){
    batch.set(db.collection('users').doc(String(uid)),{uid,displayName:`Synthetic ${uid}`,birthDate:'1990-01-01',skills:[],post:[],socialRelations:[],features:[],geography:[{type:'home',geo:[47.590114,7.611201]}]});
    batch.set(db.collection('user_vectors').doc(String(uid)),{uid,profile_vector:v,experience_vectors:{},embedding_model:AI.EMBED_MODEL,embedding_dims:768,embedding_template:AI.EMBED_TEMPLATE_VERSION});
  }
  await batch.commit();
  const app=express();app.use(express.json());
  for(const name of ['checkIssue','createIssue','joinIssue'])app.post('/'+name,handlers[name]);
  const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
  const url='http://127.0.0.1:'+server.address().port;
  async function call(name,body){const r=await fetch(url+'/'+name,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:r.status,data:await r.json()};}
  const body={title:'Repair the entrance lock at osbb 1, h5',description:'The entrance lock at osbb 1, h5 is broken and needs repairing.',location:[47.590114,7.611201],submitterId:'1'};
  try{
    const checked=await call('checkIssue',body);assert.equal(checked.status,200,JSON.stringify(checked.data));assert.equal(checked.data.similar_issues.length,0);
    const createBody={...body,draftId:checked.data.draftId};
    const created=await call('createIssue',createBody);assert.equal(created.status,200,JSON.stringify(created.data));assert.equal(created.data.members_count,100);
    const repeated=await call('createIssue',createBody);assert.equal(repeated.data.issue_id,created.data.issue_id);
    const chosen=new Set(created.data.members.map(m=>String(m.uid)));
    const outside=Array.from({length:105},(_,i)=>String(i+1)).filter(id=>!chosen.has(id));
    const other={...body,submitterId:outside[0]};
    const duplicate=await call('checkIssue',other);assert.equal(duplicate.data.similar_issues.length,1);assert.equal(duplicate.data.similar_issues[0].already_member,false);
    const refused=await call('createIssue',{...other,draftId:duplicate.data.draftId});assert.equal(refused.status,409);
    const join=await call('joinIssue',{issueId:created.data.issue_id,submitterId:outside[0]});assert.equal(join.status,200,JSON.stringify(join.data));assert.equal(join.data.members_count,101);
    const joins=await Promise.all([call('joinIssue',{issueId:created.data.issue_id,submitterId:outside[1]}),call('joinIssue',{issueId:created.data.issue_id,submitterId:outside[1]})]);
    assert.ok(joins.every(r=>r.status===200));
    assert.equal((await db.collection('membership_events').get()).size,2);
    const issue=(await db.collection('issues').doc(created.data.issue_id).get()).data();
    const disc=(await db.collection('discussions').doc(created.data.issue_id).get()).data();
    assert.equal(disc.participants.length,102);assert.equal(Object.keys(issue.isr_scores).length,102);assert.deepEqual(issue.isr_scores,disc.isr_scores);
    const members=await db.collection('microcommunity_members').where('microcommunity_id','==',created.data.microcommunity_id).get();
    const ISR=require('../isr');const rows=members.docs.map(s=>s.data());
    const scores=ISR.isrForPublic(rows.map(m=>({uid:String(m.user_id),R:m.relevance_score,E:m.expertise_score})),issue);
    rows.forEach((m,i)=>assert.equal(m.isr_score,Math.round(scores[i].isr*1000)/1000));
    const memberCheck=await call('checkIssue',other);assert.equal(memberCheck.data.similar_issues[0].already_member,true);
    const blocked=await call('createIssue',{...other,draftId:memberCheck.data.draftId,duplicate_review:{reason:'Different entrance',matches:memberCheck.data.similar_issues}});
    assert.equal(blocked.status,409,'explanation cannot override an active title conflict');
    const separate={...other,title:'Repair the rear entrance lock at osbb 1, h5'};
    const separateCheck=await call('checkIssue',separate);
    const reason={reason:'This is a separate repair for the rear entrance',matches:separateCheck.data.similar_issues};
    const second=await call('createIssue',{...separate,draftId:separateCheck.data.draftId,duplicate_review:reason});assert.equal(second.status,200,JSON.stringify(second.data));
    const stale=await call('createIssue',{...other,draftId:duplicate.data.draftId,duplicate_review:reason});assert.equal(stale.status,409,'newly created issue must be reviewed');
    // Two independent drafts race to register the same newly affected building.
    const fresh={...body,location_source:'creator',title:'Repair entrance lock at osbb 1 h99',description:'The entrance lock at osbb 1 h99 is broken.',location:[47.592114,7.611201]};
    const drafts=await Promise.all([call('checkIssue',fresh),call('checkIssue',fresh)]);
    assert.ok(drafts.every(r=>r.status===200 && r.data.similar_issues.length===0));
    const racing=await Promise.all(drafts.map(r=>call('createIssue',{...fresh,draftId:r.data.draftId})));
    assert.deepEqual(racing.map(r=>r.status).sort(),[200,409],JSON.stringify(racing));
    // Inject a failure after staging every transactional write; none may persist.
    const isolated={...fresh,title:'Repair entrance lock at osbb 1 h98',description:'The lock at osbb 1 h98 is broken.',location:[47.594114,7.611201]};
    const faultDraft=await call('checkIssue',isolated);
    const before=(await db.collection('issues').get()).size;
    const original=db.runTransaction.bind(db);
    db.runTransaction=callback=>original(async tx=>{await callback(tx);throw new Error('Injected transaction failure');});
    try {
      const failed=await call('createIssue',{...isolated,draftId:faultDraft.data.draftId});
      assert.equal(failed.status,500);
    } finally {db.runTransaction=original;}
    assert.equal((await db.collection('issues').get()).size,before);
    assert.equal((await db.collection('issue_drafts').doc(faultDraft.data.draftId).get()).data().creation_result,undefined);
    const recovered=await call('createIssue',{...isolated,draftId:faultDraft.data.draftId});
    assert.equal(recovered.status,200,JSON.stringify(recovered.data));
    await db.collection('issues').doc(created.data.issue_id).update({status:'in_process'});
    const voting=await call('joinIssue',{issueId:created.data.issue_id,submitterId:outside[2]});assert.equal(voting.status,409);
    await db.collection('issues').doc(created.data.issue_id).update({status:'completed'});
    await db.collection('discussions').doc(created.data.issue_id).update({status:'approved'});
    const reuse=await call('checkIssue',body);
    assert.equal(reuse.data.title_conflicts.length,0,'closed title may be reused');
    const reused=await call('createIssue',{...body,draftId:reuse.data.draftId,duplicate_review:{reason:'A later occurrence',matches:reuse.data.similar_issues}});
    assert.equal(reused.status,200,JSON.stringify(reused.data));
    const invalid=await call('joinIssue',{issueId:created.data.issue_id,submitterId:'unknown'});assert.equal(invalid.status,400);
    console.log('U10 verified real HTTP entry points, 102-member public, concurrent idempotent joins, canonical maps, duplicate recheck and creation replay');
  } finally {await new Promise(r=>server.close(r));await admin.app().delete();}
});
