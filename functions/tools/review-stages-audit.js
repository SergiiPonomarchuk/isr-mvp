"use strict";
// Static fixture generation only: no SDK, credential loader, fetch or database.
const fs=require('node:fs'),path=require('node:path'),S=require('../experiments/review-stages'),R=require('../context-review');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'specs/tasks/M3-evaluation');
const read=name=>JSON.parse(fs.readFileSync(path.join(dir,name),'utf8')),save=(name,v)=>fs.writeFileSync(path.join(dir,name),JSON.stringify(v,null,2)+'\n');
const input=read('cases.json').cases.find(c=>c.id==='compound-lock-software-clarified').input;
const ranked=read('pilot-20261117-two-case/ledger.json').cases['compound-lock-software-clarified'].raw_chain.ranked;
const library=require('../data/analyzer_examples.json');
const decision=S.fixtureDecision(input,{origin:'author_confirmed_fixture',status:'resolved',decision:{field:'clarification',quote:'decide only how to repair the entrance lock at osbb 2, h12.'},scope:'building',scope_evidence:{field:'description',quote:'our apartment entrance lock at osbb 2, h12'},affected_place:{field:'clarification',quote:'osbb 2, h12'},affected_group:null,unresolved_facts:[],contradictions:[]});
const plan=S.plan(input,ranked,library,decision),request=S.prepare(input,ranked,library,decision,plan);
const synthetic={plan_hash:plan.seal,result:'pass',message:'SYNTHETIC fixture, not model output.',questions:[],location_reference:{anchor:'home',place:''},aspects:[{id:'a',text:decision.decision.quote,demographics:{},demographic_evidence:[]}],reviews:Object.fromEntries(plan.compatible_ids.map(id=>[id,id==='1'?'a:a:'+decision.decision.quote:'x:decision:Synthetic different decision.']))};
const merged=S.merge(JSON.stringify(synthetic),input,ranked,library,decision,plan),bytes=v=>Buffer.byteLength(JSON.stringify(v));
const inputBytes=bytes({contents:request.contents,responseJsonSchema:request.config.responseJsonSchema});
save('staged-decision-fixture.json',decision);save('staged-scope-plan.json',plan);save('staged-domain-request.json',request);save('staged-domain-SYNTHETIC.json',synthetic);save('staged-merge-SYNTHETIC.json',merged);
const audit={version:S.VERSION,fixture_only:true,provider_calls:0,embedding_texts:0,raw_chain_count:plan.raw_chain.length,scope_compatible_count:plan.compatible_ids.length,scope_proof_count:Object.keys(plan.scope_proofs).length,merged_coverage:Object.keys(merged.provenance).length,raw_rankings_unchanged:true,request_envelope_bytes:inputBytes,input_guard_fits:inputBytes<=32768,schema_bytes:bytes(request.config.responseJsonSchema),synthetic_domain_output_bytes:bytes(synthetic),merged_artifact_bytes:bytes(merged),hypothetical_one_request_reservation_usd:Math.ceil((inputBytes+1024)*.25+8192*1.5)/1e6,prepared_request_hash:R.hash(request),real_provider_admission:'not tested',semantic_quality:'not tested',automatic_decision_resolution:'not implemented',runtime_integrated:false};
save('staged-review-audit.json',audit);console.log(JSON.stringify(audit));
