const test=require('node:test'),assert=require('node:assert/strict');
test('staged Check service: source decisions, U6 anchors and provenance storage envelopes',{skip:process.env.MR1_EMULATOR_TESTS!=='1',timeout:120000},async()=>{
 assert.equal(process.env.FIRESTORE_EMULATOR_HOST,'127.0.0.1:8189');process.env.GEMINI_API_KEY='';
 const {Firestore}=require('@google-cloud/firestore'),db=new Firestore({projectId:'demo-mr1-staged'}),AI=require('../ai-config'),helper=require('../ai-helper'),Service=require('../mr1-service'),R=require('../context-review'),S=require('../staged-context');
 assert.equal((await db.listCollections()).length,0,'fresh disposable staged project required');
 const v=Array(768).fill(0);v[0]=1;
 const library={embedding_model:AI.EMBED_MODEL,examples:['building','unit','street_segment'].map((scope,i)=>({id:String(i+1),title:'Synthetic '+scope,vector:v,params:{classification:{scope_type:scope,issue_category:'building.security.locks'},relevance_weights:{w_demographic:0,w_geographic:0,w_semantic:1,w_social:0},aggregation_weights:{w_relevance:.6,w_expertise:.2,w_contribution:.2},geographic_parameters:{mu_distance_meters:40,sigma_distance_meters:30},expertise_domain_parameters:{CBC_adjustment_factor:1,expertise_domain:'locksmith.security'},resources_needed:[]}}))};
 helper._setExamplesForTests(library);let selectionTexts=[],geocodes=0,options={},logs=[],workDraft;
 helper.embedIssue=async(title,description)=>({ok:true,vector:v,model:AI.EMBED_MODEL,dims:768,task_type:AI.TASK_TYPE_ISSUE,template_version:AI.EMBED_TEMPLATE_VERSION,text_sha256:R.hash(AI.issueText(title,description))});
 helper.embedTexts=async texts=>{selectionTexts.push(...texts);return texts.map(()=>v);};require('./staged-fixture').install(helper,()=>options);
 const profile={uid:1,displayName:'Synthetic staged user',birthDate:'1990-01-01',skills:[],post:[],features:[],socialRelations:[],geography:[{type:'home',geo:[47.59,7.61]},{type:'work',geo:[47.6,7.62]},{type:'property',geo:[47.61,7.63]}]};
 await db.collection('users').doc('1').set(profile);await db.collection('user_vectors').doc('1').set({profile_vector:v,experience_vectors:{},embedding_model:AI.EMBED_MODEL,embedding_dims:768,embedding_template:AI.EMBED_TEMPLATE_VERSION});
 const geocode=async()=>{geocodes++;return {status:'found',point:[47.62,7.64]};};
 const log=async a=>{logs.push(require('../analyzer-log').buildAnalyzerLog(a));return 'synthetic-log-'+logs.length;};
 const body={title:'Staged synthetic repair',description:'Our building entrance lock needs a repair.',clarification:'',submitterId:'1',location:[47.5,7.5]};
 try{
  for(const [description,anchor,place,scope,point]of [['Our building entrance lock needs a repair.','home','','building',[47.59,7.61]],['Our office needs better ventilation.','work','','building',[47.6,7.62]],['My garage needs a repair.','property','','unit',[47.61,7.63]],['Repair lighting on Oak Street.','named_place','Oak Street','street_segment',[47.62,7.64]],['I need help repairing my apartment door.','home','','unit',[47.59,7.61]]]){
   options={anchor,place,scope};const b={...body,description,title:'Staged '+anchor+' repair'};const checked=await Service.check(db,b,helper,geocode,log);assert.equal(checked.success,true);assert.deepEqual(checked.location,point);const draft=(await db.collection('issue_drafts').doc(checked.draftId).get()).data();if(anchor==='work')workDraft={body:b,draft,id:checked.draftId};assert.equal(draft.mr1_model.scope,scope);assert.equal(draft.mr1_model.staged_context.receipts.length,2);assert.equal(logs.at(-1).request_count,2);S.verifyBundle(draft.mr1_model,require('../params').readTextInputs(b));
   // Envelope includes full staged source, receipts and provenance, never drops it.
   Service.capacity(db,[[db.collection('issues').doc('plain'),{payload:'x'.repeat(1040000)}]]);
   assert.throws(()=>Service.capacity(db,[[db.collection('issues').doc('too-large'),{payload:'x'.repeat(1040000),mr1_model:draft.mr1_model}]]),e=>e.status===413);
  }
  assert.equal(geocodes,1);
  options={anchor:'home'};const pin=await Service.check(db,{...body,location:[47.7,7.7],location_source:'creator'},helper,geocode,log);assert.deepEqual(pin.location,[47.7,7.7]);assert.deepEqual(pin.location_suggested.location,[47.59,7.61]);
  for(const description of ['Fix our entrance and change city taxes.','Please solve this unclear problem.']){options={result:'needs_clarification'};const before=(await db.collection('issue_drafts').get()).size,checked=await Service.check(db,{...body,description},helper,geocode,log);assert.equal(checked.success,false);assert.equal(checked.members,undefined);assert.equal(logs.at(-1).request_count,1);assert.equal((await db.collection('issue_drafts').get()).size,before);}
  options={};const clarified={...body,description:'Fix our entrance and change city taxes.',clarification:'Only repair our building entrance lock.'};const checked=await Service.check(db,clarified,helper,geocode,log);assert.equal(checked.success,true);assert.ok(selectionTexts.includes(AI.issueText(clarified.title,clarified.description)+'\nContext: '+clarified.clarification));const draft=(await db.collection('issue_drafts').doc(checked.draftId).get()).data();assert.equal(draft.mr1_model.aspects.a.text,clarified.clarification);assert.equal(draft.mr1_model.staged_context.decision.original_input.description,clarified.description);
  assert.equal((await db.collection('issues').get()).size,0);
  // Browser Create sends the resolved automatic point, not the original pin.
  const published=await Service.create(db,{...workDraft.body,location:[47.6,7.62],draftId:workDraft.id},workDraft.draft);
  assert.equal(published.success,true);assert.equal((await db.collection('issues').get()).size,1);
  const draftCount=(await db.collection('issue_drafts').get()).size,priorLogs=logs.length;
  helper.embedTexts=async()=>{throw new Error('Synthetic vector failure');};options={};
  await assert.rejects(Service.check(db,body,helper,geocode,log),/Synthetic vector failure/);
  assert.equal(logs.length,priorLogs+1);assert.equal(logs.at(-1).request_count,2);assert.equal((await db.collection('issue_drafts').get()).size,draftCount);assert.equal((await db.collection('issues').doc('too-large').get()).exists,false);
 }finally{helper._setClientForTests(null);await db.terminate();}
});
