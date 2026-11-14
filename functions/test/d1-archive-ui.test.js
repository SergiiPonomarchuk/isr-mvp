const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const L=require('../lifecycle');
const source=fs.readFileSync(path.join(__dirname,'../../prototype/js/main.js'),'utf8');
const helper=source.slice(source.indexOf('  function showArchivedTopic('),source.indexOf('  async function renderTopicDetail('));
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
