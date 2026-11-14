// Optional Node preload for the D1 emulator only. Not imported by production functions.
// Persist request reservations before network dispatch; never record headers/body/query strings.
const fs=require('node:fs');
const ledger=process.env.D1_NETWORK_LEDGER;
if(ledger){
 if(!/^(127\.0\.0\.1|localhost):\d+$/.test(process.env.FIRESTORE_EMULATOR_HOST||''))throw Error('D1 network ledger is emulator-only');
 const original=global.fetch;
 function reserve(kind){
  const lock=ledger+'.lock';let descriptor;
  try{descriptor=fs.openSync(lock,'wx');}catch(_){throw Error('D1 usage ledger busy; retry only after inspecting it');}
  try{
   const data=JSON.parse(fs.readFileSync(ledger,'utf8'));
   if(!Number.isInteger(data.limits[kind])||!Number.isInteger(data.used[kind]))throw Error('Invalid D1 request ledger');
   if(data.used[kind]>=data.limits[kind])throw Error('D1 '+kind+' request ceiling reached');
   data.used[kind]++;data.requests.push({kind,at:new Date().toISOString()});
   const temp=ledger+'.tmp';const output=fs.openSync(temp,'w');
   try{fs.writeFileSync(output,JSON.stringify(data,null,2));fs.fsyncSync(output);}finally{fs.closeSync(output);}
   fs.renameSync(temp,ledger);
  }finally{fs.closeSync(descriptor);fs.unlinkSync(lock);}
 }
 global.fetch=async function(input,init){
  const url=new URL(typeof input==='string'||input instanceof URL?input:input.url);
  let kind=null;
  if(url.hostname==='nominatim.openstreetmap.org')kind='nominatim';
  if(url.hostname==='generativelanguage.googleapis.com'){
   if(url.pathname.toLowerCase().includes('embedcontent'))kind='embedding';
   else if(url.pathname.includes('generateContent'))kind='text';
  }
  if(kind)reserve(kind);
  return original.call(this,input,init);
 };
}
