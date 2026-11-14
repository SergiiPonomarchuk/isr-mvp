const L=require('../../lifecycle');
function fixture(){
 const binding={project:'demo-d1-coalition',target:'emulator:127.0.0.1:8187',run_id:'d1-test',issue_id:'flagship',public_id:'public',creator:'2',title:'Repair lock',description:'Synthetic fixture',created_at:'2026-11-14T10:00:00.123456Z',expected_options:[
  {title:'Emergency Locksmith Service',budget:'150 credits',funding_source:'Fund',resources_needed:['Locksmith'],steps:['Contact service','Authorize call','Test keys']},
  {title:'DIY Temporary Repair',budget:'30 credits',funding_source:'Cash',resources_needed:['Tools'],steps:['Lubricate','Realign','Test']}
 ]};
 const members=Array.from({length:100},(_,i)=>({user_id:String(i+2),isr_score:1}));
 const weights=Object.fromEntries(members.map(m=>[m.user_id,m.isr_score]));
 const options=binding.expected_options.map(o=>({...o,author_uid:'2',author_name:'Synthetic Creator',description:o.steps.map(step=>({step,in_charge_uid:'2',in_charge_name:'Synthetic Creator'}))}));
 const issue={title:binding.title,description:binding.description,submitter_id:'2',created_at:binding.created_at,category:'General',status:'open',ends:'2099-12-31',isr_scores:weights,votes:{}};
 const disc={topic:binding.title,description:binding.description,creator_uid:'2',status:'discussion',ends:issue.ends,isr_scores:weights,participants:Object.keys(weights),options_v2:options,deadline_votes:{},message_count:2};
 return {binding,state:{issue,disc,public:{issue_id:binding.issue_id,member_count:members.length},members}};
}
// Adjust to require at most 27 other actors without fabricating any helper weights.
function weightedFixture(){
 const f=fixture();f.state.members.forEach((m,i)=>m.isr_score=i>0&&i<=27?1.13:i===0?1:(100-1-27*1.13)/72);
 const weights=Object.fromEntries(f.state.members.map(m=>[m.user_id,m.isr_score]));f.state.issue.isr_scores={...weights};f.state.disc.isr_scores={...weights};return f;
}
function startVoting(state){
 const ends='2099-12-30',fields=L.votingIssueFields(state.disc,ends,'2026-11-14T12:00:00Z');
 for(const k of ['created_at','title','description','category'])delete fields[k];
 Object.assign(state.issue,fields);Object.assign(state.disc,{status:'Voting',ends,deadline_votes:{}});
}
module.exports={fixture:weightedFixture,startVoting};
