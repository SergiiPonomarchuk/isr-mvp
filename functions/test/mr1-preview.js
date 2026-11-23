const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
process.env.FIRESTORE_EMULATOR_HOST='127.0.0.1:8189';process.env.GCLOUD_PROJECT='demo-mr1-preview';process.env.GEMINI_API_KEY='';
const requireFrom=require('node:module').createRequire(root+'/functions/index.js');
const AI=requireFrom('./ai-config'),helper=requireFrom('./ai-helper'),R=requireFrom('./context-review');
const v=Array(768).fill(0);v[0]=1;
const lib={embedding_model:AI.EMBED_MODEL,examples:[{id:'1',title:'Synthetic building repair',vector:v,params:{classification:{scope_type:'building',issue_category:'building.security.locks'},relevance_weights:{w_demographic:0,w_geographic:0,w_semantic:.8,w_social:.2},aggregation_weights:{w_relevance:.6,w_expertise:.2,w_contribution:.2},geographic_parameters:{mu_distance_meters:40,sigma_distance_meters:30},expertise_domain_parameters:{expertise_domain:'locksmith.security'},resources_needed:[]}}]};
helper._setExamplesForTests(lib);
helper.embedIssue=async(title,description)=>({ok:true,vector:v,model:AI.EMBED_MODEL,dims:768,task_type:AI.TASK_TYPE_ISSUE,template_version:AI.EMBED_TEMPLATE_VERSION,text_sha256:require('crypto').createHash('sha256').update(AI.issueText(title,description)).digest('hex')});
helper.embedTexts=async texts=>texts.map(()=>v);
require('./staged-fixture').install(helper,input=>({result:input.description==='Repair our building entrance and change city taxes.'&&!input.clarification?'needs_clarification':'pass',message:'Synthetic fixture: choose the one decision to address.'}));
// No external HTTP request is permitted from this mock preview process.
const originalFetch=global.fetch;
global.fetch=(url,...args)=>{const host=new URL(String(url)).hostname;if(host!=='127.0.0.1'&&host!=='localhost')throw new Error('External HTTP disabled in mock preview');return originalFetch(url,...args);};
const handlers=requireFrom('./index'),express=requireFrom('express'),app=express();app.use(express.json());
for(const name of ['checkIssue','createIssue','joinIssue'])app.post('/'+name,handlers[name]);
app.get('/staged-guide',(req,res)=>res.type('html').send(`<h1>Local staged Analyzer review</h1><p>Synthetic data and scripted fake SDK responses. No paid calls or live changes.</p><ol><li><a href='/main.html?emulator=1'>Open the local app</a>. The bottom banner must say Emulator verified.</li><li>Open Chat, then Start new issue topic. Title: Local entrance repair rehearsal. Description: Repair our building entrance and change city taxes.</li><li>Press Check. The scripted response asks which decision to address.</li><li>In the clarification box enter: Only repair our building entrance lock. Press Check again.</li><li>Expect one building decision, home location, a member preview and enabled Create. Create is safe here; open the new issue and its members list.</li></ol><p>Judge the flow and displayed facts. This preview does not establish real-model quality.</p>`));
app.get('/firebase-config.js',(req,res)=>res.type('js').send(`window.firebaseConfig={apiKey:'demo-only',projectId:'demo-mr1-preview',authDomain:'demo-mr1-preview.local'};sessionStorage.setItem('userId','1');sessionStorage.setItem('userName','Synthetic 1');`));
app.get('/js/main.js',(req,res)=>res.type('js').send(fs.readFileSync(root+'/prototype/js/main.js','utf8').replace("useEmulator('127.0.0.1', 8080)","useEmulator('127.0.0.1', 8189)").replaceAll('http://127.0.0.1:5001/project-a3d59130-5adf-4677-9e2/us-central1','http://127.0.0.1:5190')));
app.get(['/','/main.html'],(req,res)=>{let html=fs.readFileSync(root+'/prototype/index.html','utf8').replace(/<!-- Google Tag Manager -->[\s\S]*?<!-- End Google Tag Manager -->/,'').replace(/<!-- Google Tag Manager \(noscript\) -->[\s\S]*?<!-- End Google Tag Manager \(noscript\) -->/,'');html=html.replace('</body>',`<div id="mr1-target" style="position:fixed;bottom:0;left:0;right:0;background:#d8f4dd;z-index:999999;text-align:center"></div><script>
const targetBanner=document.getElementById('mr1-target');
function verifiedMr1Target(){return location.hostname==='127.0.0.1' && new URLSearchParams(location.search).get('emulator')==='1' && firebase.firestore()._delegate._settings.host==='127.0.0.1:8189';}
targetBanner.textContent=verifiedMr1Target()?'LOCAL STAGED ANALYZER TEST | Emulator verified | Synthetic data | Mock AI':'STOP: emulator target is unverified';
document.addEventListener('click',e=>{if(!verifiedMr1Target()){e.preventDefault();e.stopImmediatePropagation();}},true);
</script></body>`);res.type('html').send(html);});
app.use(express.static(root+'/prototype'));app.listen(5190,'127.0.0.1',()=>console.log('Synthetic mr1 browser preview http://127.0.0.1:5190/main.html?emulator=1; no external provider calls.'));
