const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawnSync}=require('node:child_process');
test('D1 optional emulator ledger persists reservations and prevents excess network dispatch',()=>{
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),'d1-budget-')),file=path.join(folder,'ledger.json');
 const preload=path.join(__dirname,'../tools/d1-network-budget.cjs');
 const sdk=require.resolve('@google/genai');
 fs.writeFileSync(file,JSON.stringify({limits:{text:1,embedding:1,nominatim:1},used:{text:0,embedding:0,nominatim:0},requests:[]}));
 try{
  const script=`global.fetch=async()=>new Response(JSON.stringify({candidates:[{content:{parts:[{text:'ok'}],role:'model'}}]}),{status:200,headers:{'Content-Type':'application/json'}});require(${JSON.stringify(preload)});(async()=>{const {GoogleGenAI}=require(${JSON.stringify(sdk)});const client=new GoogleGenAI({apiKey:'fixture-not-a-real-key'});const response=await client.models.generateContent({model:'fixture',contents:'fixture'});if(response.text!=='ok')throw Error('SDK response mismatch');try{await fetch('https://generativelanguage.googleapis.com/v1beta/models/fixture:generateContent');process.exitCode=2}catch(e){if(!e.message.includes('ceiling'))throw e}})().catch(()=>process.exitCode=3);`;
  const result=spawnSync(process.execPath,['-e',script],{env:{...process.env,FIRESTORE_EMULATOR_HOST:'127.0.0.1:8285',D1_NETWORK_LEDGER:file},encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);const state=JSON.parse(fs.readFileSync(file));
  assert.equal(state.used.text,1);assert.equal(state.requests.length,1);assert.equal(state.used.embedding,0);
  assert.equal(fs.existsSync(file+'.lock'),false);
  const refused=spawnSync(process.execPath,['-e',`require(${JSON.stringify(preload)})`],{env:{...process.env,FIRESTORE_EMULATOR_HOST:'',D1_NETWORK_LEDGER:file},encoding:'utf8'});
  assert.notEqual(refused.status,0);
 }finally{assert.equal(path.dirname(path.resolve(folder)),path.resolve(os.tmpdir()));fs.rmSync(folder,{recursive:true,force:true});}
});
