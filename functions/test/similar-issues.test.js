const test = require('node:test');
const assert = require('node:assert/strict');
const M = require('../similar-issues');
const AI = require('../ai-config');
const crypto = require('node:crypto');
const base = { title: 'Repair the entrance lock at osbb 1, h5', description: 'The lock is broken.',
  location: [47.590114, 7.611201], classification: {scope_type: 'building'}, mu_distance_meters: 40, status: 'open' };
const entries = issue => [{id:'one',issue,discussion:{participants:['1']}}];
test('U10 calibrated text/context duplicate cases', () => {
  for (const [title, description, location, expected] of [
    [base.title, base.description, base.location, true],
    ['Fix the faulty entry lock at osbb 1 h5', 'Same damaged lock', base.location, true],
    ['Replace our broken building entrance lock', 'osbb 1, h5', base.location, true],
    ['Repair the entrance lock at osbb 1, h6', '', base.location, false],
    ['Repair the entrance lock at osbb 2, h5', '', base.location, false],
    ['Repair the entrance intercom at osbb 1, h5', '', base.location, false],
    [base.title, '', [47.59,7.62], true],
    ['Repair entrance lock in 2027', '', base.location, false]
  ]) {
    const existing = title.endsWith('2027') ? {...base, title:'Repair entrance lock in 2026'} : base;
    const result=M.rankMatches({...base,title,description,location},entries(existing),'2','2026-11-13');
    assert.equal(result.matches.length>0,expected,title);
  }
});
test('U10 semantic path is versioned and checks place and lifecycle', () => {
  const v=Array(768).fill(0);v[0]=1;
  const embedding={model:AI.EMBED_MODEL,dims:768,template_version:AI.EMBED_TEMPLATE_VERSION,task_type:AI.TASK_TYPE_ISSUE,
    text_sha256:crypto.createHash('sha256').update(M.issueText(base)).digest('hex'),vector:v};
  const query={...base,title:'Access mechanism malfunction',vector:v};
  const entry={id:'one',issue:base,discussion:{participants:['1']},embedding};
  assert.equal(M.rankMatches(query,[entry],'1','2026-11-13').matches[0].already_member,true);
  assert.equal(M.rankMatches({...query,location:[48,8]},[entry],'2','2026-11-13').matches.length,0);
  assert.equal(M.rankMatches(query,[{...entry,issue:{...base,status:'approved'}}],'2','2026-11-13').matches.length,0);
  const old=M.rankMatches(base,entries({...base,ends:'2026-11-12'}),'2','2026-11-13');
  assert.equal(old.matches.length,0);
  const voting=M.rankMatches(base,[{...entry,issue:{...base,status:'in_process'}}],'2','2026-11-13');
  assert.equal(voting.matches[0].join_allowed,false);
});
test('U10 a new match requires renewed explicit review', () => {
  const result=M.rankMatches({...base,title:'Fix faulty entry lock at osbb 1 h5'},entries(base),'2','2026-11-13');
  assert.throws(()=>M.requireReview(result,null),/Review/);
  const review={reason:'The back door is a separate repair',matches:result.matches};
  assert.equal(M.requireReview(result,review).reason,review.reason);
  assert.throws(()=>M.requireReview({...result,matches:[...result.matches,{issue_id:'later',version:'new'}]},review),/Review/);
});

test('U10 recorded model calibration preserves contextual distinctions', () => {
 const f=require('./u10-calibration.json');
 assert.equal(M.SEMANTIC_THRESHOLD,f.semantic_threshold);
 const issue={...base,title:f.titles[0],description:''};
 const embedding={model:f.model,dims:f.dims,template_version:AI.EMBED_TEMPLATE_VERSION,task_type:f.task_type,
 text_sha256:crypto.createHash('sha256').update(M.issueText(issue)).digest('hex'),vector:f.vectors[0]};
 const entry={id:'one',issue,discussion:{},embedding};
 for(let i=1;i<f.titles.length;i++){
   const query={...issue,title:f.titles[i],vector:f.vectors[i]};
   const result=M.rankMatches(query,[entry],'2','2026-11-13');
   assert.equal(result.matches.length>0,i<4,f.titles[i]);
 }
});


test('U10 titles are unique across active issues regardless of place or shortlist', () => {
  const rows=Array.from({length:8},(_,i)=>({id:String(i),issue:{...base,location:[48+i/100,8]},discussion:{}}));
  const query={...base,title:'  REPAIR   the entrance lock at osbb 1, h5  '};
  const result=M.rankMatches(query,rows,'2','2026-11-13');
  assert.equal(result.matches.length,5);
  assert.equal(result.title_conflicts.length,8);
  assert.throws(()=>M.requireReview(result,{reason:'Different city',matches:result.matches}),/already uses this title/);
  for(const issue of [{...base,status:'completed'},{...base,ends:'2026-11-12'}]){
    const reusable=M.rankMatches(query,entries(issue),'2','2026-11-13');
    assert.equal(reusable.title_conflicts.length,0);
    assert.equal(M.requireReview(reusable,null),null);
  }
  assert.notEqual(M.titleKey('Repair lock!'),M.titleKey('Repair lock'));
});
