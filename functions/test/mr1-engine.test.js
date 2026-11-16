const test=require('node:test'),assert=require('node:assert/strict'),Engine=require('../mr1-engine'),M=require('../multi-reference'),AI=require('../ai-config'),ISR=require('../isr');
const v=(i)=>Array.from({length:768},(_,j)=>j===i?1:0);
function fixture(){
 const raw=[{id:'a',score:.57},{id:'b',score:.55}],base={evidence:'Actual affected context',aggregation:{R:.6,E:.2,C:.2},mu:40,sigma:30,cbc_adjustment:1};
 const model=M.reviewed(raw,[{...base,id:'a',aspect_id:'repair',relevance:{D:.6,G:.1,S:.2,X:.1}},{...base,id:'b',aspect_id:'access',mu:100,sigma:50,relevance:{D:.1,G:.3,S:.5,X:.1}}]);
 const user={uid:7,birthDate:'2011-11-16',skills:[{id:'e',type:'education',educationLevel:'Bachelor'},{id:'w',type:'work experience',time:2}],geography:[{type:'home',geo:[47.59,7.61]}],features:['renter'],post:[],socialRelations:[]};
 const vectors={embedding_model:AI.EMBED_MODEL,embedding_dims:768,embedding_template:AI.EMBED_TEMPLATE_VERSION,profile_vector:v(0),experience_vectors:{e:v(0),w:v(1)}};
 const bundle={model,scope:'building',aspects:{repair:{vector:v(0),demographics:{features:['renter']}},access:{vector:v(1),demographics:{features:['driver']}}}};
 return {user,vectors,bundle};
}
test('adapter pairs actual D/S/skill vectors with each reference then applies one age floor',()=>{
 const {user,vectors,bundle}=fixture(),p=Engine.evaluate(user,vectors,bundle,[47.59,7.61],'2026-11-16T12:00:00Z');
 assert.deepEqual([p.aspects.a.D,p.aspects.b.D,p.aspects.a.S,p.aspects.b.S],[1,0,1,0]);assert.equal(p.aspects.a.G,1);assert.equal(bundle.model.mu,100);assert.equal(bundle.model.sigma,50);
 const alpha=.57/1.12,beta=.55/1.12,edu=ISR.educationParams('Bachelor')[1];const score=M.member(bundle.model,p.age,p.aspects);
 assert.ok(Math.abs(score.R-(alpha*(.6+.1+.2)+beta*.3))<1e-12);assert.ok(Math.abs(score.E-(Math.max(.5,alpha*edu)+beta*2))<1e-12);
});
test('missing skill vectors and invalid dates cannot silently lower member expertise',()=>{const f=fixture();delete f.vectors.experience_vectors.e;assert.throws(()=>Engine.evaluate(f.user,f.vectors,f.bundle,[47.59,7.61],'2026-11-16'));f.user.birthDate='unknown';assert.throws(()=>Engine.evaluate(f.user,f.vectors,f.bundle,[47.59,7.61],'2026-11-16'));});
test('eligible family zero ties survive while unsupported untyped links are counted',()=>{const diagnostics={ignored_untyped_links:0};const links=Engine.eligibleLinks({socialRelations:[{relative:1,type:'cousin'},{relative:2,type:'colleague'},{relative:3,type:'colleague',tie:.4}]},diagnostics);assert.deepEqual(links,{'1':0,'3':.4});assert.equal(diagnostics.ignored_untyped_links,1);});
