const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),os=require('node:os'),{spawnSync}=require('node:child_process');
test('author helper and actual creator UI transactions complete isolated copied flagship', {skip:process.env.D1_COALITION_EMULATOR_TESTS!=='1'}, async()=>{
 assert.equal(process.env.FIRESTORE_EMULATOR_HOST,'127.0.0.1:8187');assert.equal(process.env.GCLOUD_PROJECT,'demo-d1-coalition');
 const admin=require('firebase-admin'),C=require('../demo-coalition'),L=require('../lifecycle');
 const app=admin.initializeApp({projectId:'demo-d1-coalition'},'coalition-test'),db=app.firestore();let temporary;
 try{
  assert.equal((await db.listCollections()).length,0,'Dedicated test target must be empty');
  const copy=process.env.D1_COALITION_COPY_FILE?JSON.parse(fs.readFileSync(process.env.D1_COALITION_COPY_FILE,'utf8')):require('./helpers/coalition-fixture.cjs').fixture(),{binding,state}=copy;
  assert.equal(binding.target,'emulator:127.0.0.1:8187');assert.equal(binding.project,'demo-d1-coalition');
  const originalTime=state.issue.created_at;
  const ts=originalTime.__ts||{seconds:Math.floor(Date.parse(originalTime)/1000),nanoseconds:Number((originalTime.match(/\.(\d+)/)?.[1]||'').padEnd(9,'0'))};state.issue.created_at=new admin.firestore.Timestamp(ts.seconds,ts.nanoseconds);
  const issueRef=db.collection('issues').doc(binding.issue_id),discRef=db.collection('discussions').doc(binding.issue_id),publicRef=db.collection('microcommunities').doc(binding.public_id);
  const batch=db.batch();batch.create(issueRef,state.issue);batch.create(discRef,state.disc);batch.create(publicRef,state.public);
  state.members.forEach(m=>batch.create(db.collection('microcommunity_members').doc('copy_'+m.user_id),{...m,microcommunity_id:binding.public_id}));
  batch.create(db.collection('issues').doc('unrelated'),{status:'archived',marker:'unchanged'});await batch.commit();
  const sourceHash=C.digest(state),request={project:binding.project,binding,operation:'make-plan',option_index:0,apply:false};
  const {plan}=await C.execute(db,request);assert.ok(plan.actors.length<=27);if(process.env.D1_COALITION_COPY_FILE)assert.equal(plan.actors.length,27);
  const invoke=(operation,apply=false)=>C.execute(db,{project:binding.project,binding,plan,operation,apply});
  const before=C.digest([(await issueRef.get()).data(),(await discRef.get()).data()]);
  assert.equal((await invoke('start-support')).summary.writes,0);assert.equal(C.digest([(await issueRef.get()).data(),(await discRef.get()).data()]),before);
  // Stale selected actor input cannot be overwritten; rejection leaves it intact.
  await discRef.update({deadline_votes:{[plan.actors[0]]:'cancel_issue'}});
  await assert.rejects(invoke('start-support',true));assert.equal((await discRef.get()).data().deadline_votes[plan.actors[0]],'cancel_issue');await discRef.update({deadline_votes:{}});
  // Changed membership is caught inside the apply transaction; restore only the test copy.
  const changed=db.collection('microcommunity_members').doc('copy_'+plan.actors[0]),original=(await changed.get()).data().isr_score;
  await changed.update({isr_score:original+.001});await assert.rejects(invoke('start-support',true));await changed.update({isr_score:original});
  temporary=fs.mkdtempSync(path.join(os.tmpdir(),'d1-coalition-cli-'));
  const manifestFile=path.join(temporary,'manifest.json'),planFile=path.join(temporary,'plan.json');
  const manifest={project:binding.project,run_id:binding.run_id,test_fixture:true,presentation_started:true,scenarios:{'D1-01-live':{stage:'complete',phase:'live',issue_id:binding.issue_id,microcommunity_id:binding.public_id,creator:{uid:binding.creator},input:{title:binding.title,description:binding.description},created_at:binding.created_at,content:{options:binding.expected_options}}}};
  const originalManifest=JSON.stringify(manifest);fs.writeFileSync(manifestFile,originalManifest);
  function cli(...args){const result=spawnSync('python',[path.resolve(__dirname,'../../scripts/demo_coalition.py'),'--project',binding.project,'--manifest',manifestFile,'--plan',planFile,...args],{encoding:'utf8',timeout:60000});assert.equal(result.status,0,result.stderr);return JSON.parse(result.stdout);}
  assert.equal(cli('--make-plan','--option-index','0').writes,0);assert.equal(C.digest(JSON.parse(fs.readFileSync(planFile,'utf8')).plan),C.digest(plan));
  const savedPlan=fs.readFileSync(planFile,'utf8');assert.equal(cli('--operation','start-support').writes,0);assert.equal(fs.readFileSync(planFile,'utf8'),savedPlan);
  assert.equal(cli('--operation','start-support','--apply').writes,1);
  // Simulate a lost response by repeating apply against the already committed input map.
  assert.equal((await invoke('start-support',true)).summary.writes,0);
  assert.equal((await issueRef.get()).data().status,'open');assert.equal((await discRef.get()).data().deadline_votes['2'],undefined);
  const source=fs.readFileSync(path.resolve(__dirname,'../../prototype/js/main.js'),'utf8');
  const start=source.indexOf('    function deadlinePhase(disc)'),end=source.indexOf('    function showDeadlineModal()',start);
  assert.ok(start>=0&&end>start);
  // Browser SDK objects share a realm; adapt VM-created plain maps for the host Admin SDK.
  const hostFields=value=>Array.isArray(value)?value.map(hostFields):value&&value.constructor?.name==='Object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,hostFields(v)])):value;
  const browserDb={collection:name=>db.collection(name),runTransaction:callback=>db.runTransaction(async tx=>await callback({get:ref=>tx.get(ref),update:(ref,fields)=>tx.update(ref,hostFields(fields)),set:(ref,fields)=>tx.set(ref,hostFields(fields))}))};
  const context=vm.createContext({kind:'chat',db:browserDb,topicId:binding.issue_id,Lifecycle:L,safeGetStorage:()=>binding.creator,
   firebase:{firestore:{FieldValue:admin.firestore.FieldValue}},Date,console:{log(){},error(){}},setTimeout:fn=>fn(),closeOverlayModal(){},restoreTopicListView(){},alert(message){throw Error(message);}});
  vm.runInContext(source.slice(start,end),context);await context.submitDeadlineVote('start_voting');
  assert.equal((await issueRef.get()).data().status,'in_process');assert.equal((await discRef.get()).data().status,'Voting');
  assert.equal((await invoke('start-support',true)).summary.writes,0);
  assert.equal((await invoke('option-votes')).summary.writes,0);assert.equal(cli('--operation','option-votes','--apply').writes,1);assert.equal((await invoke('option-votes',true)).summary.writes,0);
  let issue=(await issueRef.get()).data();assert.equal(issue.votes['2'],undefined);assert.equal(L.votingOutcome(issue.votes,issue.isr_scores,issue.options.length).result,'cancel');
  // Execute the exact normal option-vote transaction, with the creator's selected radio index.
  const marker=source.indexOf('// Assign vote (fixed voting, no toggle off)'),voteStart=source.lastIndexOf('await db.runTransaction(async (transaction) => {',marker),voteEnd=source.indexOf('\n                  });',marker);
  assert.ok(voteStart>=0&&voteEnd>voteStart);
  context.currentUserId=binding.creator;context.selectedIndex=plan.option_index;context.issueRef=issueRef;
  await vm.runInContext('(async()=>{'+source.slice(voteStart,voteEnd+'\n                  });'.length)+'})()',context);
  issue=(await issueRef.get()).data();assert.equal(L.votingOutcome(issue.votes,issue.isr_scores,issue.options.length).result,'todo');
  assert.equal((await invoke('finish-support')).summary.writes,0);assert.equal(cli('--operation','finish-support','--apply').writes,2);assert.equal((await invoke('finish-support',true)).summary.writes,0);
  assert.equal((await issueRef.get()).data().status,'in_process');assert.equal((await discRef.get()).data().deadline_votes['2'],undefined);
  context.kind='voting';await context.submitDeadlineVote('finish_voting');
  assert.equal((await issueRef.get()).data().status,'approved');assert.equal((await discRef.get()).data().status,'approved');
  await require('../close-voting').tallyApprovedIssue(db,binding.issue_id,admin.firestore.FieldValue);
  issue=(await issueRef.get()).data();assert.equal(issue.winning_option_index,0);assert.equal(issue.tasks.length,3);assert.ok(issue.tasks.every(t=>t.in_charge_uid==='2'));assert.equal(issue.tally.counted.length,plan.actors.length+1);
  assert.equal(issue.created_at.seconds,ts.seconds);assert.equal(issue.created_at.nanoseconds,ts.nanoseconds);assert.equal(issue.title,binding.title);assert.equal(issue.description,binding.description);
  assert.equal(C.digest((await publicRef.get()).data()),C.digest(state.public));
  const memberRows=(await db.collection('microcommunity_members').where('microcommunity_id','==',binding.public_id).get()).docs.map(d=>({user_id:d.data().user_id,isr_score:d.data().isr_score})).sort((a,b)=>String(a.user_id).localeCompare(String(b.user_id)));
  assert.deepEqual(memberRows,[...state.members].sort((a,b)=>String(a.user_id).localeCompare(String(b.user_id))));
  assert.equal((await db.collection('issues').doc('unrelated').get()).data().marker,'unchanged');assert.equal(C.digest(state),sourceHash);
  assert.equal((await invoke('finish-support',true)).summary.writes,0);
  assert.equal(fs.readFileSync(manifestFile,'utf8'),originalManifest);assert.equal(JSON.parse(fs.readFileSync(planFile,'utf8')).receipts.length,3);
 }finally{await app.delete();if(temporary){for(const name of ['manifest.json','plan.json']){const file=path.join(temporary,name);if(fs.existsSync(file))fs.unlinkSync(file);}fs.rmdirSync(temporary);}}
});
