"use strict";
// PD-9 mr1 arithmetic only. No I/O; server context validation supplies reviewed inputs.
const ISR = require("./isr");
const EPS = 1e-12;
function number(v, label, min=0, max=Infinity) {
  if (typeof v !== "number" || !Number.isFinite(v) || v<min || v>max) throw new Error(`Invalid ${label}`);
  return v;
}
function id(v) { if (typeof v !== "string" || !v.trim()) throw new Error("Invalid id"); return v; }
function group(v, keys, positive=false) {
  if (!v || Array.isArray(v) || Object.keys(v).length!==keys.length) throw new Error("Invalid weight group");
  let total=0;
  for (const k of keys) { const x=number(v[k],k,0,1); if(positive && (x===0 || x===1)) throw new Error("Aggregation must be positive"); total+=x; }
  if(Math.abs(total-1)>1e-6) throw new Error("Weights must sum to one");
  return v;
}
const DIMS=["D","G","S","X"], AGG=["R","E","C"];
function select(references, floor=.30, gap=.05) {
  number(floor,"floor",0,1); number(gap,"gap",0,1); if(gap===0) throw new Error("Gap must be positive");
  const seen=new Set();
  const ranked=references.map(r=>{ const key=id(r.id); if(seen.has(key)) throw new Error("Duplicate reference"); seen.add(key); return {id:key,score:number(r.score,"similarity",0,1)}; })
    .sort((a,b)=>b.score-a.score || (a.id<b.id?-1:a.id>b.id?1:0));
  const chain=[];
  for(let j=0;j<ranked.length;j++) {
    if(ranked[j].score<floor-EPS || (j && ranked[j-1].score-ranked[j].score>=gap-EPS)) break;
    chain.push(ranked[j]);
  }
  return {ranked,chain,state:!chain.length?"no_match":chain.length>3?"context_review_required":"context_validation_required"};
}
function reviewed(raw, accepted, exclusions={}) {
  const selected=select(raw), chain=new Map(selected.chain.map(x=>[x.id,x.score]));
  if(!accepted.length) throw new Error("Reviewed set is empty");
  const seen=new Set();
  for(const r of accepted) {
    id(r.id); if(seen.has(r.id) || !chain.has(r.id)) throw new Error("Invalid reviewed reference"); seen.add(r.id);
    if(typeof r.evidence!=="string" || !r.evidence.trim()) throw new Error("Context evidence required");
    group(r.relevance,DIMS); group(r.aggregation,AGG,true); number(r.mu,"mu"); number(r.sigma,"sigma"); if(!r.sigma) throw new Error("Sigma must be positive");
  }
  for(const [key] of chain) if(!seen.has(key) && !(typeof exclusions[key]==="string" && exclusions[key].trim())) throw new Error("Exclusion reason required");
  for(const key of Object.keys(exclusions)) if(!chain.has(key) || seen.has(key)) throw new Error("Invalid exclusion");
  const total=accepted.reduce((s,r)=>s+chain.get(r.id),0); if(!(total>0)) throw new Error("No positive reference score");
  const refs=accepted.map(r=>({...r,relevance:{...r.relevance},aggregation:{...r.aggregation},alpha:chain.get(r.id)/total}));
  const relevance=Object.fromEntries(DIMS.map(k=>[k,refs.reduce((s,r)=>s+r.alpha*r.relevance[k],0)]));
  const aggregation=Object.fromEntries(AGG.map(k=>[k,refs.reduce((s,r)=>s+r.alpha*r.aggregation[k],0)]));
  return {refs,relevance,aggregation,mu:Math.max(...refs.map(r=>r.mu)),sigma:Math.max(...refs.map(r=>r.sigma))};
}
function member(model, age, aspects) {
  number(age,"age");
  if(Object.keys(aspects).length!==model.refs.length) throw new Error("Aspect set differs from reviewed references");
  let education=0,experience=0;
  const contributions=Object.fromEntries(DIMS.map(k=>[k,0]));
  for(const r of model.refs) {
    const c=aspects[r.id]; if(!c) throw new Error("Missing aspect result");
    for(const k of DIMS) contributions[k]+=r.alpha*r.relevance[k]*number(c[k],k,0,1);
    education+=r.alpha*number(c.education,"education"); experience+=r.alpha*number(c.experience,"experience");
  }
  const effective=Object.fromEntries(DIMS.map(k=>[k,model.relevance[k]>0?contributions[k]/model.relevance[k]:0]));
  return {R:Object.values(contributions).reduce((a,b)=>a+b,0),E:ISR.expertise(education,experience,age),education_raw:education,experience,contributions,effective};
}
function publicScores(model,members) {
  const seen=new Set();
  const values=members.map(m=>{ id(m.uid); if(seen.has(m.uid)) throw new Error("Duplicate member");seen.add(m.uid);return {uid:m.uid,R:number(m.R,"R",0,1+1e-6),E:number(m.E,"E")}; });
  return ISR.isrForPublic(values,{w_relevance:model.aggregation.R,w_expertise:model.aggregation.E,w_contribution:model.aggregation.C});
}
function directedTies(affectedIds, outgoing, candidate) {
  id(candidate); const result=[]; const seen=new Set();
  for(const h of affectedIds) {
    id(h); if(seen.has(h)) throw new Error("Duplicate affected person");seen.add(h);
    if(!Object.prototype.hasOwnProperty.call(outgoing,h)) throw new Error("Affected relation data unavailable");
    if(h===candidate) continue;
    if(Object.prototype.hasOwnProperty.call(outgoing[h],candidate)) result.push({affectedId:h,tie:number(outgoing[h][candidate],"tie",0,1)});
  }
  return result;
}
// Two-phase membership: the input population must cover direct and related candidates.
function cohorts(model, people, outgoing, threshold=.15) {
  number(threshold,"threshold",0,1);
  const population=new Map(), direct=new Map(), indirect=new Map();
  for(const p of people) {
    id(p.uid); if(population.has(p.uid)) throw new Error("Duplicate person");
    for(const ref of model.refs) if(!p.aspects[ref.id] || p.aspects[ref.id].X!==0) throw new Error("Direct phase requires X=0");
    const score=member(model,p.age,p.aspects);
    const row={uid:p.uid,...score,direct_relevance:score.R,social_addition:0,social_source:null,social_tie:0};
    population.set(p.uid,row);
    if(row.R>=threshold) direct.set(p.uid,{...row,cohort:"A"});
  }
  for(const [source,a] of direct) {
    if(!Object.prototype.hasOwnProperty.call(outgoing,source) || !outgoing[source] || Array.isArray(outgoing[source]) || typeof outgoing[source]!=="object") throw new Error("Affected relation data unavailable");
    for(const [target,value] of Object.entries(outgoing[source])) {
      id(target); const tie=number(value,"tie",0,1);
      if(target===source || direct.has(target)) continue;
      const person=population.get(target);
      if(!person) throw new Error("Related person data unavailable");
      if(!indirect.has(target)) indirect.set(target,{...person,cohort:"B",contributions:{...person.contributions},effective:{...person.effective}});
      const b=indirect.get(target), addition=model.relevance.X*tie;
      // Evaluate each source first: the largest tie may fail while a weaker one passes.
      const eligible=person.direct_relevance+addition<=a.direct_relevance+EPS;
      const better=addition>b.social_addition || (addition===b.social_addition && addition>0 && (b.social_source===null || source<b.social_source));
      if(eligible && better) {
        b.social_addition=addition;b.social_source=source;b.social_tie=tie;
        b.R=person.direct_relevance+addition;
        b.contributions.X=addition;b.effective.X=model.relevance.X>0?addition/model.relevance.X:0;
      }
    }
  }
  return {threshold,A:[...direct.values()],B:[...indirect.values()],members:[...direct.values(),...indirect.values()]};
}
module.exports={select,reviewed,member,publicScores,directedTies,cohorts};
