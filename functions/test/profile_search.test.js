const test=require('node:test');
const assert=require('node:assert/strict');
const {harness,memoryDb}=require('./helpers/profile-search-harness.cjs');
const person=(uid,name='Synthetic Person')=>({uid,displayName:name,firstName:name.split(' ')[0],lastName:name.split(' ').slice(1).join(' '),gender:'Male',birthDate:'2000-01-01',post:[{job:'Builder'}]});
test('numeric profile search survives name filtering and deduplicates document/uid matches',async()=>{
 const app=harness(memoryDb([['1',person(1)]]),{'search-name':' 1 '});
 const cards=await app.search();assert.equal(cards.length,1);assert.match(cards[0].innerHTML,/ID: 1/);
 cards[0].adopt.call(cards[0]);assert.equal(app.stored.userId,'1');assert.equal(app.stored.userName,'Synthetic Person');assert.equal(app.reloads,1);
});
test('string uid can be found when its document id differs',async()=>{
 const cards=await harness(memoryDb([['legacy-record',person('7')]]),{'search-name':'7'}).search();
 assert.equal(cards.length,1);assert.match(cards[0].innerHTML,/ID: 7/);
});
function crowded(){return [...Array.from({length:70},(_,i)=>['a'+String(i).padStart(3,'0'),person(100+i,'Michael A'+String(i).padStart(3,'0'))]),['z-target',person(5,'Michael Sherman')]];}
test('specific full name retrieves a profile beyond fifty common-first-name candidates',async()=>{
 const db=memoryDb(crowded());const cards=await harness(db,{'search-name':'Michael Sherman'}).search();
 assert.equal(cards.length,1);assert.match(cards[0].innerHTML,/ID: 5/);
 assert.ok(db.requests.every(r=>r.cap===50));assert.ok(db.requests.length<=9);
});
test('lowercase multiword search normalizes repeated whitespace',async()=>{
 const cards=await harness(memoryDb(crowded()),{'search-name':'  michael   sherman  '}).search();assert.equal(cards.length,1);assert.match(cards[0].innerHTML,/ID: 5/);
});
test('single surname search retains lastName retrieval',async()=>{
 const cards=await harness(memoryDb(crowded()),{'search-name':'Sherman'}).search();assert.equal(cards.length,1);assert.match(cards[0].innerHTML,/ID: 5/);
});
test('gender, profession and age filters still apply to exact ID results',async()=>{
 for(const extra of [{'search-gender':'Female'},{'search-job':'Doctor'},{'search-age-min':'90'}]){
  const app=harness(memoryDb([['1',person(1)]]),{'search-name':'1',...extra});assert.equal((await app.search()).length,0);assert.match(app.results.innerHTML,/No matching/);
 }
});
test('numeric first token with additional words does not bypass name matching',async()=>{
 assert.equal((await harness(memoryDb([['1',person(1)]]),{'search-name':'1 Smith'}).search()).length,0);
});
test('large exact string ID is not rounded to an unsafe numeric uid',async()=>{
 const id='9007199254740993';const db=memoryDb([[id,person(id)]]);assert.equal((await harness(db,{'search-name':id}).search()).length,1);
 assert.ok(db.requests.every(r=>r.clauses.every(c=>typeof c[2]==='string')));
});
test('unknown exact ID produces the existing empty result',async()=>{
 const app=harness(memoryDb([['1',person(1)]]),{'search-name':'999'});assert.equal((await app.search()).length,0);assert.match(app.results.innerHTML,/No matching/);
});
test('actual login search handler uses masked real emulator queries', {skip:process.env.U11_EMULATOR_TESTS!=='1'},async()=>{
 assert.equal(process.env.FIRESTORE_EMULATOR_HOST,'127.0.0.1:8080');assert.equal(process.env.GCLOUD_PROJECT,'project-a3d59130-5adf-4677-9e2');
 const admin=require('firebase-admin');const app=admin.initializeApp({projectId:process.env.GCLOUD_PROJECT},'u11-readonly');const db=app.firestore();
 const fields=['uid','displayName','firstName','lastName','gender','birthDate','post'];
 function adapt(query){return {where(...args){return adapt(query.where(...args));},limit(n){return adapt(query.limit(n));},get(){return query.select(...fields).get();}};}
 const client={collection(name){assert.equal(name,'users');const collection=db.collection(name);return {...adapt(collection),doc(id){return {async get(){return (await db.getAll(collection.doc(id),{fieldMask:fields}))[0];}};}};}};
 try{
  for(const value of ['1','5','Michael Sherman','michael sherman']){
   const ui=harness(client,{'search-name':value});const cards=await ui.search();assert.ok(cards.some(card=>card.innerHTML.includes('ID: '+(value==='1'?'1':'5'))),'Expected synthetic profile not found');
  }
 }finally{await app.delete();}
});
