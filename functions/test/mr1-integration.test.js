const test=require("node:test"),assert=require("node:assert/strict");
test("mr1 actual Check/Create/Join on isolated Firestore",{skip:process.env.MR1_EMULATOR_TESTS!=="1",timeout:180000},async()=>{
 assert.equal(process.env.FIRESTORE_EMULATOR_HOST,"127.0.0.1:8189");assert.equal(process.env.GCLOUD_PROJECT,"demo-mr1");
 process.env.GEMINI_API_KEY="";
 const AI=require("../ai-config"),helper=require("../ai-helper"),Review=require("../context-review"),crypto=require("crypto");
 const V=(c=1)=>{const v=Array(768).fill(0);v[0]=c;v[1]=Math.sqrt(1-c*c);return v;};
 const lib={embedding_model:AI.EMBED_MODEL,embedding_dims:768,examples:[1,2,3,4].map(id=>({id,title:"Reference "+id,vector:V(),params:{classification:{scope_type:"building",issue_category:"building.security.locks"},relevance_weights:{w_demographic:0,w_geographic:0,w_semantic:.8,w_social:.2},aggregation_weights:{w_relevance:.6,w_expertise:.2,w_contribution:.2},geographic_parameters:{mu_distance_meters:40,sigma_distance_meters:30},expertise_domain_parameters:{CBC_adjustment_factor:1,expertise_domain:"locksmith.security"},resources_needed:[]}}))};
 helper._setExamplesForTests(lib);
 let reviews=0,embeddings=0,mode="pass";
 helper.embedIssue=async(title,description)=>{embeddings++;return {ok:true,vector:V(),model:AI.EMBED_MODEL,dims:768,task_type:AI.TASK_TYPE_ISSUE,template_version:AI.EMBED_TEMPLATE_VERSION,text_sha256:crypto.createHash('sha256').update(`${title}. ${description}`).digest('hex')};};
 helper.embedTexts=async texts=>{embeddings+=texts.length;return texts.map(()=>V());};
 helper.reviewContext=async(input,ranked,library)=>{reviews++;const raw=mode==="clarify"?{result:"needs_clarification",message:"Which place?",questions:["Which entrance needs repair?"]}:{result:"pass",message:"A clear building repair.",scope:"building",location_reference:{anchor:"home",place:""},accepted:[{id:"1",aspect_id:"a",evidence:input.description}],excluded:{"2":"Different actual context","3":"Different decision","4":"Different scope"},aspects:[{id:"a",text:input.description,demographics:{},demographic_evidence:[]}]};return {result:Review.validate(raw,input,ranked,library),raw,meta:{ai_source:"model",model:AI.TEXT_MODEL,prompt_version:Review.PROMPT_VERSION,schema_sha256:Review.schemaHash(),examples_used:[1,2,3,4]}};};
 const handlers=require("../index"),admin=require("firebase-admin"),db=admin.firestore(),express=require("express"),app=express();app.use(express.json());
 assert.equal((await db.listCollections()).length,0,"needs a fresh disposable database");
 const batch=db.batch();
 for(let n=1;n<=111;n++){
  const links=n===105?[{relative:106,type:"child",tie:.5},{relative:107,type:"child",tie:.35},{relative:108,type:"cousin",tie:null}]:n===1?[{relative:109,type:"spouse",tie:.2},{relative:105,type:"spouse",tie:1}]:n===109?[{relative:111,type:"spouse",tie:1}]:[];
  batch.set(db.collection("users").doc(String(n)),{uid:n,displayName:`Synthetic ${n}`,birthDate:"1990-01-01",skills:[],post:[],features:[],...(n===1?{values_taxonomy:{domains:[0]}}:n===109?{values_taxonomy:{domains:[100]}}:{}),socialRelations:links,geography:[{type:"home",geo:[47.59,7.61]}]});
  const cosine=n<=104?1:n===105?.1875:[106,107].includes(n)?.1:0;
  batch.set(db.collection("user_vectors").doc(String(n)),{profile_vector:V(cosine),experience_vectors:{},embedding_model:AI.EMBED_MODEL,embedding_dims:768,embedding_template:AI.EMBED_TEMPLATE_VERSION});
 }
 await batch.commit();
 for(const name of ["checkIssue","createIssue","joinIssue"])app.post('/'+name,handlers[name]);
 const server=app.listen(0,"127.0.0.1");await new Promise(r=>server.once('listening',r));const url='http://127.0.0.1:'+server.address().port;
 const call=async(name,body)=>{const response=await fetch(url+'/'+name,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});return {status:response.status,data:await response.json()};};
 const body={title:"Repair our entrance lock",description:"The entrance lock at our building is broken. Residents need a repair.",location:[47.59,7.61],submitterId:"1",clarification:""};
 try{
  mode="clarify";const bad=await call("checkIssue",body);assert.equal(bad.data.success,false);assert.equal((await db.collection("issue_drafts").get()).size,0);
  mode="pass";const checked=await call("checkIssue",body);assert.equal(checked.status,200,JSON.stringify(checked.data));assert.deepEqual(checked.data.cohort_counts,{A:105,B:4});assert.equal(checked.data.public_members_count,109);
  assert.equal(checked.data.members[0].score,.8);assert.equal(checked.data.public_values_taxonomy.domains[0],5,"aggregate includes members outside the display preview");
  assert.equal(typeof checked.data.viewer_member.isr_score,"number");
  const make={...body,draftId:checked.data.draftId};
  const draftRef=db.collection("issue_drafts").doc(checked.data.draftId),draft=(await draftRef.get()).data();
  assert.equal(draft.ai.prompt_version,Review.PROMPT_VERSION);assert.equal(draft.ai.schema_sha256,Review.schemaHash());assert.deepEqual(draft.mr1_model.aspects.a.demographic_evidence,[]);
  await draftRef.update({"ai.prompt_version":Review.VERSION});assert.equal((await call("createIssue",make)).status,409);assert.equal((await db.collection("issues").get()).size,0);await draftRef.update({"ai.prompt_version":Review.PROMPT_VERSION});

  for(const edit of [{location:[47.7,7.7]},{title:"changed title"}])assert.equal((await call("createIssue",{...make,...edit})).status,409);
  const stale=await call("createIssue",{...make,clarification:"changed"});assert.equal(stale.status,409);assert.equal((await db.collection("issues").get()).size,0);
  const counts=[reviews,embeddings];const concurrent=await Promise.all([call("createIssue",make),call("createIssue",make)]);assert.equal(concurrent[0].data.issue_id,concurrent[1].data.issue_id);const created=concurrent[0];assert.equal(created.status,200,JSON.stringify(created.data));assert.equal(created.data.members_count,109);assert.equal((await db.collection("microcommunities").doc(created.data.microcommunity_id).get()).data().values_taxonomy.domains[0],5);assert.deepEqual([reviews,embeddings],counts);
  await draftRef.update({"ai.prompt_version":Review.VERSION});
  const replay=await call("createIssue",make);assert.equal(replay.data.issue_id,created.data.issue_id);assert.equal((await db.collection("issues").get()).size,1);
  const member=(id)=>db.collection("microcommunity_members").doc(`${created.data.microcommunity_id}_${id}`).get();
  assert.equal((await member(106)).data().social_addition,0);assert.equal((await member(106)).data().cohort,"B");assert.ok(Math.abs((await member(107)).data().social_addition-.07)<1e-12);assert.equal((await member(108)).data().relevance_score,0);assert.equal((await member(111)).exists,false);assert.equal((await member(105)).data().X_score,0);
  const joins=await Promise.all([call("joinIssue",{issueId:created.data.issue_id,submitterId:"110"}),call("joinIssue",{issueId:created.data.issue_id,submitterId:"110"})]);assert.ok(joins.every(r=>r.status===200));const joined=joins.find(r=>!r.data.already_member);assert.equal(joined.status,200,JSON.stringify(joined.data));assert.equal(joined.data.members_count,110);
  const repeated=await call("joinIssue",{issueId:created.data.issue_id,submitterId:"110"});assert.equal(repeated.data.already_member,true);
  const issue=(await db.collection("issues").doc(created.data.issue_id).get()).data(),disc=(await db.collection("discussions").doc(created.data.issue_id).get()).data();assert.equal(Object.keys(issue.isr_scores).length,110);assert.deepEqual(issue.isr_scores,disc.isr_scores);
  const rows=(await db.collection("microcommunity_members").where("microcommunity_id","==",created.data.microcommunity_id).get()).docs.map(d=>d.data());const core=require("../isr");const normalized=core.isrForPublic(rows.map(m=>({uid:m.user_id,R:m.relevance_score,E:m.expertise_score})),issue);rows.forEach((m,i)=>assert.equal(m.isr_score,Math.round(normalized[i].isr*1000)/1000));
  const {spawnSync}=require("node:child_process"),path=require("node:path");
  const audit=()=>{const r=spawnSync("python",[path.resolve(__dirname,"../../scripts/mr1_check.py"),"--project","demo-mr1","--issue-id",created.data.issue_id],{encoding:"utf8"});assert.equal(r.status,0,r.stdout+ r.stderr);return JSON.parse(r.stdout);};
  assert.deepEqual(audit().problems,[]);
  const first=(await member(1)).data();await (await member(1)).ref.update({expertise_score:first.expertise_score+1});
  const corrupt=spawnSync("python",[path.resolve(__dirname,"../../scripts/mr1_check.py"),"--project","demo-mr1","--issue-id",created.data.issue_id],{encoding:"utf8"});assert.equal(corrupt.status,1,corrupt.stderr);assert.ok(JSON.parse(corrupt.stdout).problems.includes("1:expertise_score"));await (await member(1)).ref.update({expertise_score:first.expertise_score});
  // Version errors fail before publication, while legacy unversioned issues keep legacy Join.
  const root=db.collection("issues").doc(created.data.issue_id);
  await root.update({scoring_version:"unsupported"});assert.equal((await call("joinIssue",{issueId:root.id,submitterId:"111"})).status,409);await root.update({scoring_version:Review.VERSION});
  const legacyId="legacy-join",legacy={...issue,issue_id:legacyId,ends:"2099-12-31"};delete legacy.scoring_version;delete legacy.mr1_model;delete legacy.mr1_model_hash;
  const legacyBatch=db.batch();legacyBatch.set(db.collection("issues").doc(legacyId),legacy);legacyBatch.set(db.collection("discussions").doc(legacyId),{...disc,ends:"2099-12-31"});legacyBatch.set(db.collection("microcommunities").doc(legacyId),{issue_id:legacyId,member_count:1});legacyBatch.set(db.collection("microcommunity_members").doc(legacyId+"_1"),{...first,microcommunity_id:legacyId});legacyBatch.set(db.collection("issue_vectors").doc(legacyId),(await db.collection("issue_vectors").doc(root.id).get()).data());await legacyBatch.commit();
  const oldJoin=await call("joinIssue",{issueId:legacyId,submitterId:"111"});assert.equal(oldJoin.status,200,JSON.stringify(oldJoin.data));assert.equal((await db.collection("microcommunity_members").doc(legacyId+"_111").get()).data().expertise_source,"issue_vector");
  const legacyDraft={title:body.title,description:body.description,submitter_id:"1",location:body.location,params:{},creation_result:{success:true,issue_id:legacyId,members_count:2}};
  await db.collection("issue_drafts").doc("legacy-complete").set(legacyDraft);const oldCounts=[reviews,embeddings];assert.equal((await call("createIssue",{...body,draftId:"legacy-complete"})).data.issue_id,legacyId);assert.deepEqual([reviews,embeddings],oldCounts);
  delete legacyDraft.creation_result;await db.collection("issue_drafts").doc("legacy-unfinished").set(legacyDraft);assert.equal((await call("createIssue",{...body,draftId:"legacy-unfinished"})).status,409);
  const next=await call("checkIssue",{...body,title:"A distinct building repair"});assert.equal(next.status,200);await db.collection("users").doc("111").update({displayName:"Changed synthetic profile"});const changed=await call("createIssue",{...body,title:"A distinct building repair",draftId:next.data.draftId});assert.equal(changed.status,409);
  const capacity=require("../mr1-service").capacity;assert.throws(()=>capacity(db,[[db.collection("issues").doc("oversize"),{text:"x".repeat(1048576)}]]),e=>e.status===413);
  assert.throws(()=>capacity(db,Array.from({length:20},(_,i)=>[db.collection("issues").doc("large"+i),{text:"x".repeat(600000)}])),e=>e.status===413);
  assert.equal((await db.collection("issues").doc("oversize").get()).exists,false);
 } finally {await new Promise(r=>server.close(r));await db.terminate();}
});
