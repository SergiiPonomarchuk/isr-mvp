const test=require('node:test'),assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const path=require('node:path');
test('D1 archived seed, retry recovery, canonical phases and hidden standby', {skip:process.env.D1_EMULATOR_TESTS!=='1',timeout:240000}, async()=>{
 assert.equal(process.env.FIRESTORE_EMULATOR_HOST,'127.0.0.1:8285');assert.equal(process.env.GCLOUD_PROJECT,'demo-d1');
 const AI=require('../ai-config'),helper=require('../ai-helper'),crypto=require('node:crypto');
 const v=Array(768).fill(0);v[0]=1;let checks=0;
 helper.embedIssue=async(title,description)=>({ok:true,vector:v,model:AI.EMBED_MODEL,dims:768,task_type:AI.TASK_TYPE_ISSUE,
  template_version:AI.EMBED_TEMPLATE_VERSION,text_sha256:crypto.createHash('sha256').update(`${title}. ${description}`).digest('hex')});
 helper.checkIssueParams=async()=>{checks++;return {params:{weights:{w_D:0,w_G:1,w_S:0,w_X:0},
  geographic_parameters:{mu_distance_meters:40,sigma_decay_meters:20},aggregation_weights:{w_relevance:0.7,w_expertise:0.1,w_contribution:0.2},
  demographics:{employmentStatus:'any',familyStatus:'any'},classification:{scope_type:'building'},location_reference:{anchor:'home',place:''}},
  meta:{ai_source:'fixture',model:AI.TEXT_MODEL,prompt_version:'d1-fixture',examples_used:[]}}};
 const handlers=require('../index'),admin=require('firebase-admin'),db=admin.firestore();
 assert.equal((await db.listCollections()).length,0,'requires fresh disposable emulator');
 let batch=db.batch();
 for(let uid=1;uid<=105;uid++){
  const cluster=(uid-1)%10;
  batch.set(db.collection('users').doc(String(uid)),{uid,displayName:`Synthetic ${uid}`,birthDate:uid%2?'1990-01-01':'2005-01-01',
   skills:[{id:'edu',type:'education',educationLevel:uid%2?'Bachelor':'Vocational Training'},{id:'work',type:'work experience',time:uid%7+1}],
   geography:[{type:'home',building:`osbb ${cluster+1}, h1`,geo:[47.59+cluster*0.003,7.61]}],post:[],features:[],socialRelations:[]});
  batch.set(db.collection('user_vectors').doc(String(uid)),{uid,profile_vector:v,experience_vectors:{edu:v,work:v},
   embedding_model:AI.EMBED_MODEL,embedding_dims:768,embedding_template:AI.EMBED_TEMPLATE_VERSION});
 }
 batch.set(db.collection('discussions').doc('legacy-only'),{status:'discussion',ends:'2020-01-01',topic:'Historical topic',created_at:'2020-01-01',participants:['1']});
 batch.set(db.collection('discussions').doc('legacy-only').collection('messages').doc('duplicate-a'),{text:'Preserved duplicate'});
 batch.set(db.collection('discussions').doc('legacy-only').collection('messages').doc('duplicate-b'),{text:'Preserved duplicate'});
 batch.set(db.collection('issues').doc('legacy-vote'),{status:'in_process',ends:'2020-01-01'});
 batch.set(db.collection('discussions').doc('legacy-vote'),{status:'Voting',ends:'2020-01-01',created_at:'2020-01-01'});
 await batch.commit();
 const express=require('express'),app=express();app.use(express.json());
 for(const name of ['checkIssue','createIssue','joinIssue'])app.post('/'+name,handlers[name]);
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 const base='http://127.0.0.1:'+server.address().port;
 async function python(){
  const command=spawn('python',[path.join(__dirname,'../../tests/d1_driver_fixture.py'),base],{env:process.env});
  let stdout='',stderr='';command.stdout.on('data',b=>stdout+=b);command.stderr.on('data',b=>stderr+=b);
  const code=await new Promise(r=>command.on('exit',r));assert.equal(code,0,stdout+'\n'+stderr);return stdout;
 }
 try{
  const output=await python();assert.match(output,/D1_DRIVER_VERIFIED/);assert.equal(checks,11,'ten seed Checks plus one explicit normal flagship; lost Create spends no extra Check');
  assert.equal((await db.collection('discussions').doc('legacy-only').get()).data().status,'archived');
  assert.equal((await db.collection('discussions').doc('legacy-only').collection('messages').get()).size,2);
  const {closeExpiredTopics}=require('../deadlines');
  const deadline=await closeExpiredTopics(db,admin.firestore.FieldValue,'2026-11-14');assert.equal(deadline.changes.length,0);
  const Similar=require('../similar-issues');
  const standby=(await db.collection('issues').where('demo_scenario','==','D1-01').get()).docs[0];
  const query={...standby.data(),vector:v};
  const found=await Similar.findSimilar(db,query,'1');assert.ok(!found.matches.some(m=>m.issue_id===standby.id));
  const {joinIssue}=require('../join-issue');
  await assert.rejects(joinIssue(db,{issueId:standby.id,submitterId:'2'},admin.firestore.FieldValue.serverTimestamp()),/discussion/);
  const {tallyApprovedIssue}=require('../close-voting');
  const old=(await standby.ref.get()).updateTime;
  assert.equal((await tallyApprovedIssue(db,standby.id,admin.firestore.FieldValue)).changed,false);
  assert.ok((await standby.ref.get()).updateTime.isEqual(old));
  const {activateStandby}=require('../demo-standby');
  async function post(name,body){const response=await fetch(base+'/'+name,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:response.status,data:await response.json()};}
  const input={title:query.title,description:query.description,location:[query.location.latitude,query.location.longitude],submitterId:'1'};
  const firstCheck=await post('checkIssue',input);assert.equal(firstCheck.data.similar_issues.length,0);
  const normal=await post('createIssue',{...input,draftId:firstCheck.data.draftId});assert.equal(normal.status,200);
  await assert.rejects(activateStandby(db,{issueId:standby.id,runId:'fixture-run'},admin.firestore.FieldValue),/active matching/);
  async function archive(id){const write=db.batch();write.update(db.collection('issues').doc(id),{status:'archived'});write.update(db.collection('discussions').doc(id),{status:'archived'});await write.commit();}
  await archive(normal.data.issue_id);
  const raceCheck=await post('checkIssue',input);
  const race=await Promise.allSettled([post('createIssue',{...input,draftId:raceCheck.data.draftId}),activateStandby(db,{issueId:standby.id,runId:'fixture-run'},admin.firestore.FieldValue)]);
  const createWon=race[0].status==='fulfilled'&&race[0].value.status===200;
  const activateWon=race[1].status==='fulfilled';assert.notEqual(createWon,activateWon,'one canonical creation/promotion must win');
  const copies=await db.collection('issues').where('title','==',input.title).get();
  assert.equal(copies.docs.filter(d=>d.data().status!=='archived').length,1);
  if(createWon){await archive(race[0].value.data.issue_id);assert.equal((await activateStandby(db,{issueId:standby.id,runId:'fixture-run'},admin.firestore.FieldValue)).changed,true);}

  assert.equal((await activateStandby(db,{issueId:standby.id,runId:'fixture-run'},admin.firestore.FieldValue)).changed,false);
  const nowFound=await Similar.findSimilar(db,query,'1');assert.ok(nowFound.title_conflicts.includes(standby.id));
  const chat=(await db.collection('issues').where('demo_scenario','==','D1-02').get()).docs[0];
  const registered=chat.data().created_at;
  assert.equal((await db.collection('discussions').doc(chat.id).get()).data().description,chat.data().description);
  await db.collection('discussions').doc(chat.id).update({description:admin.firestore.FieldValue.delete(),category:admin.firestore.FieldValue.delete()});
  const expire=db.batch();expire.update(chat.ref,{ends:'2020-01-01'});expire.update(db.collection('discussions').doc(chat.id),{ends:'2020-01-01'});await expire.commit();
  await closeExpiredTopics(db,admin.firestore.FieldValue,'2026-11-14');
  const moved=(await chat.ref.get()).data();assert.equal(moved.status,'in_process');assert.ok(moved.created_at.isEqual(registered));
  assert.equal(moved.description,chat.data().description);

 }finally{await new Promise(r=>server.close(r));await admin.app().delete();}
});
