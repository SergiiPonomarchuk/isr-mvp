const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
test('D1 CLI bridge supplies only inherited known secret, with no file/cloud fallback', () => {
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'d1-bridge-'));
 try {
  fs.mkdirSync(path.join(root,'bin'));fs.mkdirSync(path.join(root,'emulator'));
  fs.writeFileSync(path.join(root,'emulator/functionsEmulator.js'),'exports.FunctionsEmulator=class {resolveSecretEnvs(){throw Error("cloud access forbidden")}};');
  const entry=path.join(root,'bin/firebase.js');
  fs.writeFileSync(entry,`const assert=require('node:assert/strict');const {FunctionsEmulator}=require('../emulator/functionsEmulator');(async()=>{const e=new FunctionsEmulator();assert.deepEqual(await e.resolveSecretEnvs({secretEnv:[{key:'GEMINI_API_KEY'}]}),{GEMINI_API_KEY:'dummy-only'});await assert.rejects(e.resolveSecretEnvs({secretEnv:[{key:'OTHER'}]}),/unexpected/);delete process.env.GEMINI_API_KEY;await assert.rejects(e.resolveSecretEnvs({secretEnv:[{key:'GEMINI_API_KEY'}]}),/unavailable/);console.log('passed')})().catch(()=>process.exit(1));`);
  const env={...process.env,D1_FIREBASE_CLI_ENTRY:entry,FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080',GEMINI_API_KEY:'dummy-only'};
  const preload=path.resolve(__dirname,'../tools/d1-secret-env.cjs');
  const result=spawnSync(process.execPath,['--require',preload,entry],{env,encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);assert.equal(result.stdout.trim(),'passed');
  const unsafe=spawnSync(process.execPath,['--require',preload,entry],{env:{...env,FIRESTORE_EMULATOR_HOST:'remote:8080'},encoding:'utf8'});
  assert.notEqual(unsafe.status,0);assert.match(unsafe.stderr,/emulator-only/);
 } finally {fs.rmSync(root,{recursive:true,force:true});}
});
