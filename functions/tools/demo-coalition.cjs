const fs=require('node:fs');
const {execute,guard}=require('../demo-coalition');
(async()=>{
 const input=JSON.parse(fs.readFileSync(0,'utf8'));const host=process.env.FIRESTORE_EMULATOR_HOST;
 guard(input.project&&input.binding?.project===input.project,'Explicit matching project is required.');
 guard(host?/^(127\.0\.0\.1|localhost):\d+$/.test(host):process.argv.includes('--i-know-this-is-live'),'Explicit safe target acknowledgement is required.');
 guard(!host||!process.argv.includes('--i-know-this-is-live'),'Conflicting live/emulator flags.');
 guard(input.binding.target===(host?'emulator:'+host:'live:'+input.project),'Coalition target differs from the execution binding.');
 const admin=require('firebase-admin');admin.initializeApp({projectId:input.project});
 try{console.log(JSON.stringify(await execute(admin.firestore(),input)));}finally{await admin.app().delete();}
})().catch(error=>{console.error(error.code==='COALITION_GUARD'?error.message:'Coalition SDK/transport operation failed; inspect existing inputs before resuming.');process.exitCode=1;});
