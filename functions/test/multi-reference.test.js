const test=require("node:test");
const assert=require("node:assert/strict");
const M=require("../multi-reference");
const raw=[{id:"a",score:.57},{id:"b",score:.55}];
const ref=(id,other={})=>({id,evidence:"Actual context span",relevance:{D:.5,G:.2,S:.2,X:.1},aggregation:{R:.6,E:.2,C:.2},mu:40,sigma:30,...other});
const c=(other={})=>({D:1,G:.2,S:.4,X:0,education:0,experience:0,...other});
test("selection is untruncated; exact gap/floor and ties are stable",()=>{
 assert.equal(M.select([.57,.53,.49,.45].map((score,i)=>({id:String(i),score}))).state,"context_review_required");
 assert.equal(M.select([{id:"a",score:.35},{id:"b",score:.3}]).chain.length,1);
 assert.equal(M.select([{id:"b",score:.3},{id:"a",score:.3}]).chain[0].id,"a");
 assert.equal(M.select([{id:"a",score:.299}]).state,"no_match");
 assert.throws(()=>M.select([{id:"a",score:NaN}]));
 assert.throws(()=>M.select([{id:"a",score:.5},{id:"a",score:.5}]));
});
test("reviewed subset reweights over J and requires reasons; no three-reference cap",()=>{
 assert.throws(()=>M.reviewed(raw,[ref("a")]));
 const model=M.reviewed(raw,[ref("a")],{b:"Different actual affected place"});
 assert.equal(model.refs[0].alpha,1);
 assert.throws(()=>M.reviewed(raw,[ref("z")]));
 const many=["a","b","c","d"].map(id=>({id,score:.5}));
 assert.equal(M.reviewed(many,many.map(x=>ref(x.id))).refs.length,4);
});
test("strict schema refuses malformed weights and invented values",()=>{
 assert.throws(()=>M.reviewed(raw,[ref("a",{relevance:{D:.5,G:.5,S:.5,X:.5}}),ref("b")]));
 assert.throws(()=>M.reviewed(raw,[ref("a",{sigma:0}),ref("b")]));
 assert.throws(()=>M.reviewed(raw,[ref("a",{evidence:""}),ref("b")]));
 const model=M.reviewed(raw,[ref("a"),ref("b")]);
 assert.throws(()=>M.member(model,30,{a:c(),b:c({education:"2"})}));
 assert.throws(()=>M.member(model,-1,{a:c(),b:c()}));
});
test("paired demographic contribution reconstructs effective display; age floor applies once",()=>{
 const r=[{id:"a",score:.5},{id:"b",score:.5}];
 const model=M.reviewed(r,[ref("a"),ref("b",{relevance:{D:.1,G:.6,S:.2,X:.1},mu:20,sigma:50})]);
 const v=M.member(model,30,{a:c({education:0}),b:c({D:0,education:2})});
 assert.equal(v.contributions.D,.25);
 assert.equal(v.E,1);
 assert.ok(Math.abs(v.R-Object.keys(v.effective).reduce((s,k)=>s+model.relevance[k]*v.effective[k],0))<1e-12);
 assert.equal(model.mu,40);assert.equal(model.sigma,50);
});
test("zero-weight effective component is zero and empty evidence is explicit",()=>{
 const model=M.reviewed([{id:"a",score:.5}],[ref("a",{relevance:{D:0,G:.8,S:.2,X:0}})]);
 const v=M.member(model,15,{a:c()});assert.equal(v.effective.D,0);assert.equal(v.E,.5);
 assert.throws(()=>M.member(model,15,{}));
});
test("public normalization is canonical and uses one population",()=>{
 const model=M.reviewed(raw,[ref("a"),ref("b")]);
 const rows=M.publicScores(model,[{uid:"1",R:.2,E:1},{uid:"2",R:.4,E:3}]);
 assert.ok(Math.abs(rows.reduce((s,r)=>s+r.isr,0)-2)<1e-12);
 const zeros=M.publicScores(model,[{uid:"1",R:0,E:0},{uid:"2",R:0,E:0}]);
 assert.ok(zeros.every(x=>Math.abs(x.isr-1)<1e-12));
 assert.throws(()=>M.publicScores(model,[{uid:"1",R:2,E:1}]));
});
test("X inputs preserve source identity, direction and weaker ties for the pending limit rule",()=>{
 const edges={a:{x:.3},b:{x:.6},x:{y:1},z:{a:1}};
 assert.deepEqual(M.directedTies(["a","b"],edges,"x"),[{affectedId:"a",tie:.3},{affectedId:"b",tie:.6}]);
 assert.deepEqual(M.directedTies(["a","b"],edges,"y"),[]);
 assert.deepEqual(M.directedTies(["a","b"],edges,"z"),[]);
 assert.deepEqual(M.directedTies(["a"],{a:{a:1}},"a"),[]);
 assert.throws(()=>M.directedTies(["missing"],edges,"x"));
 assert.throws(()=>M.directedTies(["a"],{a:{x:Infinity}},"x"));
});

test("accepted sum tolerance does not clip the small derived R excess",()=>{
 const model=M.reviewed([{id:"a",score:.5}],[ref("a",{relevance:{D:.5,G:.2,S:.2,X:.1000001}})]);
 const row=M.member(model,30,{a:c({D:1,G:1,S:1,X:1})});
 assert.ok(row.R>1 && row.R<1+1e-6);
 assert.ok(Number.isFinite(M.publicScores(model,[{uid:"a",R:row.R,E:row.E}])[0].isr));
});
