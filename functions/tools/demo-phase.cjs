// Invoked by seed_demo.py with JSON on stdin. No key or profile records are read here.
const fs=require('node:fs');
const admin=require('firebase-admin');
const {prepareTopic}=require('../demo-phase');
(async()=>{
 const input=JSON.parse(fs.readFileSync(0,'utf8'));
 const emulator=process.env.FIRESTORE_EMULATOR_HOST;
 const live=process.argv.includes('--i-know-this-is-live');
 if(emulator&&!/^(127\.0\.0\.1|localhost):\d+$/.test(emulator))throw Error('Emulator must be loopback');
 if(emulator&&live)throw Error('Conflicting emulator/live mode');
 if(!emulator&&!live)throw Error('Refusing a live phase write without explicit acknowledgement');
 if(!input.project)throw Error('Explicit project required');
 admin.initializeApp({projectId:input.project});
 const handler=input.operation==='activate-standby'?require('../demo-standby').activateStandby:prepareTopic;
 const result=await handler(admin.firestore(),input,admin.firestore.FieldValue);
 console.log(JSON.stringify(result));await admin.app().delete();
})().catch(error=>{console.error(error.code||error.message);process.exitCode=1;});
