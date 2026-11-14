const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../demo-coalition'),L=require('../lifecycle');
const {fixture,startVoting}=require('./helpers/coalition-fixture.cjs');
const apply=(state,result)=>{for(const [key,fields] of Object.entries(result.changes))Object.assign(state[key==='disc'?'disc':'issue'],fields);};
function preparedVoting(){const f=fixture(),plan=C.makePlan(f.binding,f.state);apply(f.state,C.decide(plan,f.binding,f.state,'start-support'));startVoting(f.state);return {...f,plan};}
test('bounded coalition leaves creator decisive and has no creator actor',()=>{
 const {binding,state}=fixture(),p=C.makePlan(binding,state);assert.ok(p.actors.length<=27);assert.ok(!p.actors.includes('2'));assert.ok(p.synthetic_weight/p.pool<.3);assert.ok(p.combined_weight/p.pool>=.3);
});
test('start support preserves unrelated input, writes only its map and is idempotent',()=>{
 const {binding,state}=fixture(),p=C.makePlan(binding,state);state.disc.deadline_votes={'100':'plus_1_week'};
 const before=structuredClone(state);const r=C.decide(p,binding,state,'start-support');assert.deepEqual(Object.keys(r.changes),['disc']);assert.deepEqual(Object.keys(r.changes.disc),['deadline_votes']);assert.equal(r.changes.disc.deadline_votes['100'],'plus_1_week');assert.deepEqual(state,before);
 apply(state,r);assert.deepEqual(C.decide(p,binding,state,'start-support').changes,{});assert.equal(state.issue.status,'open');assert.equal(state.disc.deadline_votes['2'],undefined);
});
test('membership, cached weight, options, responsibilities, registration and plan drift refuse writes',()=>{
 for(const change of [f=>f.state.members[0].isr_score+=.01,f=>f.state.disc.isr_scores['2']+=.1,f=>f.state.disc.options_v2[0].budget='changed',f=>f.state.disc.options_v2[0].description[0].in_charge_uid='3',f=>f.state.issue.created_at='2026-11-14T10:00:00.123457Z',f=>f.plan.actors.pop(),f=>f.binding.target='live:other']){
  const f=fixture();f.plan=C.makePlan(f.binding,f.state);change(f);assert.throws(()=>C.decide(f.plan,f.binding,f.state,'start-support'));
 }
});
test('selected actor conflicts and premature creator support are not overwritten',()=>{
 for(const creator of [false,true]){const f=fixture(),p=C.makePlan(f.binding,f.state);f.state.disc.deadline_votes[creator?'2':p.actors[0]]=creator?'start_voting':'cancel_issue';const before=structuredClone(f.state);assert.throws(()=>C.decide(p,f.binding,f.state,'start-support'));assert.deepEqual(f.state,before);}
});
test('wrong phase, archived, expired and inconsistent target pairs are refused',()=>{
 const f=fixture(),p=C.makePlan(f.binding,f.state);assert.throws(()=>C.decide(p,f.binding,f.state,'finish-support'));
 for(const change of [s=>s.issue.status='archived',s=>s.disc.ends='2000-01-01',s=>s.disc.status='Voting']){const g=fixture();change(g.state);assert.throws(()=>C.decide(p,g.binding,g.state,'start-support'));}
});
test('option preparation remains below quorum and creator completes canonical winner',()=>{
 const f=preparedVoting();const r=C.decide(f.plan,f.binding,f.state,'option-votes');assert.deepEqual(Object.keys(r.changes),['issue']);apply(f.state,r);
 assert.equal(L.votingOutcome(f.state.issue.votes,f.state.issue.isr_scores,2).result,'cancel');assert.equal(f.state.issue.votes['2'],undefined);assert.deepEqual(C.decide(f.plan,f.binding,f.state,'option-votes').changes,{});
 f.state.issue.votes['2']=0;assert.equal(L.votingOutcome(f.state.issue.votes,f.state.issue.isr_scores,2).result,'todo');assert.equal(C.decide(f.plan,f.binding,f.state,'option-votes').status,'already_prepared');
});
test('Finish support needs creator vote and updates both management copies without phase transition',()=>{
 const f=preparedVoting();assert.throws(()=>C.decide(f.plan,f.binding,f.state,'finish-support'));apply(f.state,C.decide(f.plan,f.binding,f.state,'option-votes'));f.state.issue.votes['2']=0;
 const r=C.decide(f.plan,f.binding,f.state,'finish-support');assert.deepEqual(Object.keys(r.changes).sort(),['disc','issue']);apply(f.state,r);assert.deepEqual(f.state.issue.deadline_votes,f.state.disc.deadline_votes);assert.equal(f.state.issue.status,'in_process');assert.equal(f.state.disc.deadline_votes['2'],undefined);assert.deepEqual(C.decide(f.plan,f.binding,f.state,'finish-support').changes,{});
 const context={phase:'voting',status:'Voting',isrByUid:f.state.issue.isr_scores,optionCount:2,votingResult:'todo',votes:f.state.disc.deadline_votes};assert.equal(L.managementOutcome(context).action,null);assert.equal(L.managementOutcome({...context,votes:{...context.votes,'2':'finish_voting'}}).action,'finish_voting');
});
test('earlier-stage operation after valid phase advancement is read-only',()=>{
 const f=preparedVoting();assert.equal(C.decide(f.plan,f.binding,f.state,'start-support').status,'phase_advanced_no_write');assert.deepEqual(C.decide(f.plan,f.binding,f.state,'start-support').changes,{});
});
test('different creator vote and inconsistent management copies stop Finish preparation',()=>{
 const f=preparedVoting();apply(f.state,C.decide(f.plan,f.binding,f.state,'option-votes'));f.state.issue.votes['2']=1;assert.throws(()=>C.decide(f.plan,f.binding,f.state,'finish-support'));f.state.issue.votes['2']=0;f.state.issue.deadline_votes={'100':'plus_1_week'};assert.throws(()=>C.decide(f.plan,f.binding,f.state,'finish-support'));
});
test('registration timestamps preserve sub-millisecond changes',()=>{
 const f=fixture(),p=C.makePlan(f.binding,f.state);f.state.issue.created_at={seconds:Date.parse('2026-11-14T10:00:00Z')/1000,nanoseconds:123456000};assert.equal(C.makePlan(f.binding,f.state).basis.registration,p.basis.registration);f.state.issue.created_at.nanoseconds++;assert.throws(()=>C.decide(p,f.binding,f.state,'start-support'));
});
