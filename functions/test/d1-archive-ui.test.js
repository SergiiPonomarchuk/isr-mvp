const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const L=require('../lifecycle');
const source=fs.readFileSync(path.join(__dirname,'../../prototype/js/main.js'),'utf8');
const helper=source.slice(source.indexOf('  function showArchivedTopic('),source.indexOf('  async function renderTopicDetail('));

test('D1 discussion displays canonical issue distances/domain without replacing thread state',()=>{
 const start=source.indexOf('  function discussionParameters('),end=source.indexOf('  function showArchivedTopic(',start);
 const disc={topic:'thread',status:'discussion',options_v2:[{id:'kept'}],location:{latitude:1},mu_distance_meters:100};
 const issue={title:'issue',status:'open',mu_distance_meters:40,sigma_decay_meters:30,expertise_domain:'locksmith.security',location:{latitude:47}};
 const result=vm.runInNewContext(source.slice(start,end)+';discussionParameters(disc,issue)',{disc,issue});
 assert.equal(result.mu_distance_meters,40);assert.equal(result.sigma_decay_meters,30);assert.equal(result.expertise_domain,'locksmith.security');
 assert.equal(result.location,issue.location);assert.equal(result.options_v2,disc.options_v2);assert.equal(result.status,'discussion');assert.equal(disc.mu_distance_meters,100);
 assert.equal(vm.runInNewContext(source.slice(start,end)+';discussionParameters(disc,null)',{disc}).mu_distance_meters,100);
});
test('D1 ordinary topic entry refuses either archived root and stale cached entry',()=>{
 for(const [disc,issue,cached,blocked] of [[null,{status:'archived'},false,true],[{status:'archived'},null,false,true],
  [{status:'discussion'},{status:'open'},true,true],[{status:'discussion'},{status:'open'},false,false]]){
  const modal={innerHTML:'active content',getAttribute:()=> 'topic'};
  const result=vm.runInNewContext(helper+';showArchivedTopic(disc,issue)',{Lifecycle:L,modalBody:modal,window:{isTopicArchived:()=>cached},disc,issue});
  assert.equal(result,blocked);if(blocked)assert.match(modal.innerHTML,/archived/);else assert.equal(modal.innerHTML,'active content');
 }
});

test('D1 chat cache excludes other phases and restores a promoted topic without reload',()=>{
 const start=source.indexOf('  function visibleChatDocs('),end=source.indexOf('  let chatSortMode',start);
 const renderer=source.slice(start,end);
 const make=(id,status,previous_status)=>({id,data:()=>({status,previous_status})});
 const docs=[make('chat','discussion'),make('voting','Voting'),make('todo','approved'),make('standby','discussion'),make('canceled','inactive','discussion')];
 const archived=new Set(['standby']);const issues=new Map([['chat',make('chat','open')],['voting',make('voting','in_process')],['todo',make('todo','approved')],['standby',make('standby','archived')]]);
 const context={allDiscussionDocs:docs,relevantDiscussionIds:new Set(docs.map(d=>d.id)),memberIssueDocs:issues,Lifecycle:L,window:{isTopicArchived:id=>archived.has(id)}};
 assert.deepEqual([...vm.runInNewContext(renderer+';visibleChatDocs()',context)].map(d=>d.id),['chat','canceled']);
 archived.clear();issues.set('standby',make('standby','open'));
 assert.deepEqual([...vm.runInNewContext(renderer+';visibleChatDocs()',context)].map(d=>d.id),['chat','standby','canceled']);
});
