// Local D1 review harness only; not a deployed function or production hosting file.
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
assert.equal(process.env.FIRESTORE_EMULATOR_HOST,'127.0.0.1:8080');
const project=process.env.GCLOUD_PROJECT;if(!project)throw Error('Explicit emulator project required');
const admin=require('firebase-admin');admin.initializeApp({projectId:project});const db=admin.firestore();
const root=path.resolve(__dirname,'../..'),web=path.join(root,'prototype');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,'specs/demo',name),'utf8'));
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const script=value=>JSON.stringify(value).replace(/</g,'\\u003c');
async function response(req,res){
 const url=new URL(req.url,'http://127.0.0.1:5002');
 res.setHeader('Cache-Control','no-store');
 if(url.pathname==='/firebase-config.js'){res.setHeader('Content-Type','text/javascript');res.end('window.firebaseConfig='+JSON.stringify({apiKey:'demo-d1-local-only',projectId:project,appId:'demo-d1-local-only'})+';');return;}
 if(url.pathname==='/d1-guide'){
  const content=read('content.json'),manifest=read('manifest.json');
  const flagship=manifest.scenarios['D1-01-live']||manifest.scenarios['D1-01'];
  const members=await db.collection('microcommunity_members').where('microcommunity_id','==',flagship.microcommunity_id).select('user_id','isr_score').get();
  const chosen=new Set(members.docs.map(d=>String(d.data().user_id)));
  const people=await db.collection('users').select('uid','displayName').get();
  const outsiders=people.docs.map(d=>d.data()).filter(u=>/^\d+$/.test(String(u.uid))&&!chosen.has(String(u.uid))).sort((a,b)=>Number(a.uid)-Number(b.uid));
  const outsider=outsiders[0];
  const weighted=members.docs.map(d=>({uid:String(d.data().user_id),weight:Number(d.data().isr_score)||0})).filter(m=>m.weight>0).sort((a,b)=>b.weight-a.weight||a.uid.localeCompare(b.uid));
  const pool=weighted.reduce((sum,m)=>sum+m.weight,0);let support=0;const coalition=[];
  for(const member of weighted){if(support>=pool*0.30)break;coalition.push(member);support+=member.weight;}
  const coalitionHtml=coalition.map(m=>`<a href="/main.html?emulator=1&preview_profile=${encodeURIComponent(m.uid)}" target="_blank">ID ${escape(m.uid)} (ISR ${m.weight.toFixed(3)})</a>`).join('');
  const cards=Object.entries(content.scenarios).map(([key,c])=>`<article><h2>${escape(key)}: ${escape(c.purpose)}</h2>
   <p>Creator ID ${escape(content.creators[key].uid)}; ${escape(content.creators[key].anchor)}</p>
   <p><b>Title</b></p><textarea readonly rows="2">${escape(c.title)}</textarea>
   <p><b>Description</b></p><textarea readonly rows="4">${escape(c.description)}</textarea>
   <h3>Options for the presenter</h3>${c.options.map(o=>`<p><b>${escape(o.title)}</b> — ${escape(o.budget)}; funding: ${escape(o.funding_source)}; resources: ${escape(o.resources_needed.join(', '))}</p><ol>${o.steps.map(s=>`<li>${escape(s)}</li>`).join('')}</ol>`).join('')}</article>`).join('');
  res.setHeader('Content-Type','text/html; charset=utf-8');res.end(`<!doctype html><html><head><meta charset="utf-8"><title>D1 local presenter guide</title><style>body{font:17px system-ui;max-width:920px;margin:30px auto;padding:20px}article{border-top:1px solid #bbb;padding:20px 0}textarea{width:100%;font:16px system-ui}a{display:inline-block;margin:8px}</style></head><body><h1>D1 local presenter guide</h1><p>Synthetic data; Contribution placeholder; demographic gate. Automatic formation has an initial 100-member cap; explicit discussion Join may exceed it.</p><a href="/main.html?emulator=1&preview_profile=${encodeURIComponent(content.creators['D1-01'].uid)}" target="_blank">Open as flagship creator</a>${outsider?`<a href="/main.html?emulator=1&preview_profile=${encodeURIComponent(outsider.uid)}" target="_blank">Open as nonmember ${escape(outsider.displayName)} (ID ${escape(outsider.uid)})</a>`:''}<h2>Current flagship management coalition</h2><p>Reload this guide after the normal flagship is recorded. These synthetic members collectively hold at least 30% of its current ISR pool. Use the same chosen action for each member.</p>${coalitionHtml}<p>The standby is hidden until explicitly activated. The normal flagship must be created through Check/Create.</p>${cards}</body></html>`);return;
 }
 let relative=decodeURIComponent(url.pathname).replace(/^\/+/,'');
 if(!relative||relative==='main.html')relative='index.html';
 const file=path.resolve(web,relative);
 if(!file.startsWith(web+path.sep)){res.writeHead(403);res.end();return;}
 let body=fs.readFileSync(file);
 if(relative==='index.html'){
  const content=read('content.json'),manifest=read('manifest.json');
  let creator=content.creators['D1-01'];
  const selected=url.searchParams.get('preview_profile');
  if(selected&&/^\d+$/.test(selected)){
   // DocumentRef.get with a field mask avoids loading unrelated profile fields.
   const [actual]=await db.getAll(db.collection('users').doc(selected),{fieldMask:['displayName']});
   if(actual.exists)creator={uid:selected,name:actual.data().displayName||'Synthetic '+selected};
  }
  let html=body.toString('utf8');
  html=html.replace(/<!-- Google Tag Manager -->[\s\S]*?<!-- End Google Tag Manager -->/g,'').replace(/<!-- Google Tag Manager \(noscript\) -->[\s\S]*?<!-- End Google Tag Manager \(noscript\) -->/g,'');
  const setup=`<script>sessionStorage.setItem('useFirestoreEmulator','1');if(sessionStorage.getItem('d1DemoRunId')!==${script(manifest.run_id)}||new URLSearchParams(location.search).has('preview_profile')){sessionStorage.setItem('userId',${script(creator.uid)});sessionStorage.setItem('userName',${script(creator.name)});sessionStorage.setItem('d1DemoRunId',${script(manifest.run_id)});}const clean=new URL(location.href);clean.searchParams.delete('preview_profile');history.replaceState(null,'',clean);</script>`;
  html=html.replace('<script src="js/main.js"></script>',setup+'<script src="js/main.js"></script>');
  html=html.replace('</body>',`<script>const safe=firebase.app().options.projectId===${script(project)}&&firebase.firestore()._delegate._settings.host==='127.0.0.1:8080';const banner=document.createElement('div');banner.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:999999;padding:9px;background:'+(safe?'#daf4df':'#fdd')+';color:#142318;text-align:center;font:14px sans-serif';banner.textContent=safe?'LOCAL D1 TEST | Emulator verified | Synthetic data':'STOP: Emulator safety check failed';if(safe)document.body.appendChild(banner);else document.body.replaceChildren(banner);</script></body>`);
  body=Buffer.from(html);
 }
 const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'};
 res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(body);
}
http.createServer((req,res)=>response(req,res).catch(()=>{res.statusCode=503;res.end('Local D1 content/seed is not ready. Return after preparation.');})).listen(5002,'127.0.0.1',()=>console.log('D1 review ready: http://127.0.0.1:5002/d1-guide'));
