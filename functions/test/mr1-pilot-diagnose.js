"use strict";
// Replay the recorded failure against pure validators/resolvers only. No provider or DB client.
const fs=require('node:fs'),path=require('node:path'),R=require('../context-review');
const {evaluateDemographics}=require('../demographics');
const {resolveIssueLocation,keywordLocationReference}=require('../location');
const root=path.resolve(__dirname,'../..'),folder=path.join(root,'specs/tasks/M3-evaluation/pilot-20261117');
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
async function main(){
 const plan=read('specs/tasks/M3-evaluation/cases.json'),c=plan.cases[0],library=read('functions/data/analyzer_examples.json');
 const raw=JSON.parse(JSON.parse(fs.readFileSync(path.join(folder,'attempt-1-response.json'),'utf8')).text);
 const v=read(c.cache_file).records[c.cache_record].vector;
 const cosine=(a,b)=>a.reduce((n,x,i)=>n+x*b[i],0)/Math.sqrt(a.reduce((n,x)=>n+x*x,0)*b.reduce((n,x)=>n+x*x,0));
 const ranked=library.examples.map(e=>({id:String(e.id),score:Math.max(0,Math.min(1,cosine(v,e.vector)))}));
 let original;
 try{R.validate(raw,c.input,ranked,library);original={accepted:true};}catch(e){original={accepted:false,reason:e.message};}
 const altered=JSON.parse(JSON.stringify(raw));altered.aspects[0].demographics.property_kinds=[];
 const mechanical=R.validate(altered,c.input,ranked,library);
 const criteria=mechanical.aspects['1'].demographics;
 const user={birthDate:'1990-01-01',post:[],skills:[],features:[],socialRelations:[],geography:[{type:'home',place:'osbb 2, h12',geo:[47.59,7.61]},{type:'property',place:'Synthetic separate property',geo:[47.62,7.66]}]};
 const d=evaluateDemographics(user,criteria,2026).score;
 const withoutTopicFilters=evaluateDemographics(user,{...criteria,features:[]},2026).score;
 let lookups=0;const geocode=async()=>{lookups++;throw Error('No network permitted in offline diagnostic');};
 const actual=await resolveIssueLocation({reference:raw.location_reference,geography:user.geography,requested:user.geography[0].geo,requestedSource:'auto',geocode});
 const expectedReference=keywordLocationReference(R.inputText(c.input));
 const expected=await resolveIssueLocation({reference:expectedReference,geography:user.geography,requested:user.geography[0].geo,requestedSource:'auto',geocode});
 const report={version:'m3-pilot-diagnosis-1',case:c.id,actual_recorded_response:true,original_validation:original,enum_only_alteration:{offline_hypothesis_not_provider_result:true,accepted:mechanical.result==='pass',retained_refs:mechanical.model.refs.map(r=>r.id),demographic_features:criteria.features},synthetic_D_fixture:{is_actual_profile:false,topic_features_score:d,without_topic_features_score:withoutTopicFilters,note:'D component only; no final relevance or public exclusion is inferred.'},synthetic_location_fixture:{is_actual_profile:false,model_anchor:raw.location_reference.anchor,canonical_U6_keyword_anchor:expectedReference.anchor,model_resolution_source:actual.source,U6_resolution_source:expected.source,resolved_different_points:JSON.stringify(actual.location)!==JSON.stringify(expected.location),note:'Keyword logic is an offline comparison only; no fallback publication was added.'},provider_calls:0,database_rpcs:0,geocode_calls:lookups};
 if(original.accepted || !report.enum_only_alteration.accepted || d!==0 || withoutTopicFilters!==1 || actual.source!=='property' || expected.source!=='home' || lookups!==0)throw Error('Unexpected regression replay result');
 fs.writeFileSync(path.join(folder,'offline-diagnosis.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report));
}
main().catch(()=>{console.error('Offline recorded-response diagnostic failed; no network request permitted.');process.exitCode=1;});
