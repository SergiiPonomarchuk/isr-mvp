const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
process.env.FIRESTORE_EMULATOR_HOST='127.0.0.1:8189';process.env.GCLOUD_PROJECT='demo-mr1';process.env.GEMINI_API_KEY='';
const requireFrom=require('node:module').createRequire(root+'/functions/index.js');
const AI=requireFrom('./ai-config'),helper=requireFrom('./ai-helper'),R=requireFrom('./context-review');
const v=Array(768).fill(0);v[0]=1;
const lib={embedding_model:AI.EMBED_MODEL,examples:[{id:'1',title:'Synthetic building repair',vector:v,params:{classification:{scope_type:'building',issue_category:'building.security.locks'},relevance_weights:{w_demographic:0,w_geographic:0,w_semantic:.8,w_social:.2},aggregation_weights:{w_relevance:.6,w_expertise:.2,w_contribution:.2},geographic_parameters:{mu_distance_meters:40,sigma_distance_meters:30},expertise_domain_parameters:{CBC_adjustment_factor:1,expertise_domain:'locksmith.security'},resources_needed:[]}}]};
helper._setExamplesForTests(lib);
helper.embedIssue=async(title,description)=>({ok:true,vector:v,model:AI.EMBED_MODEL,dims:768,task_type:AI.TASK_TYPE_ISSUE,template_version:AI.EMBED_TEMPLATE_VERSION,text_sha256:require('crypto').createHash('sha256').update(AI.issueText(title,description)).digest('hex')});
helper.embedTexts=async texts=>texts.map(()=>v);
helper.reviewContext=async(input,ranked,library)=>{const raw=input.clarification?{result:'pass',message:'One clear building repair.',scope:'building',location_reference:{anchor:'home',place:''},accepted:[{id:'1',aspect_id:'a',evidence:input.description}],excluded:{},aspects:[{id:'a',text:input.description,demographics:{}}]}:{result:'needs_clarification',message:'Please identify the affected entrance.',questions:['Which building and entrance need repair?']};return {result:R.validate(raw,input,ranked,library),raw,meta:{ai_source:'model',model:'MOCK (no provider calls)',prompt_version:R.VERSION,examples_used:['1']}};};
const handlers=requireFrom('./index'),express=requireFrom('express'),app=express();app.use(express.json());
for(const name of ['checkIssue','createIssue','joinIssue'])app.post('/'+name,handlers[name]);
app.get('/firebase-config.js',(req,res)=>res.type('js').send(`window.firebaseConfig={apiKey:'demo-only',projectId:'demo-mr1',authDomain:'demo-mr1.local'};sessionStorage.setItem('userId','1');sessionStorage.setItem('userName','Synthetic 1');`));
app.get('/js/main.js',(req,res)=>res.type('js').send(fs.readFileSync(root+'/prototype/js/main.js','utf8').replace("useEmulator('127.0.0.1', 8080)","useEmulator('127.0.0.1', 8189)").replaceAll('http://127.0.0.1:5001/project-a3d59130-5adf-4677-9e2/us-central1','http://127.0.0.1:5189')));
app.get(['/','/main.html'],(req,res)=>{let html=fs.readFileSync(root+'/prototype/index.html','utf8').replace(/<!-- Google Tag Manager -->[\s\S]*?<!-- End Google Tag Manager -->/,'').replace(/<!-- Google Tag Manager \(noscript\) -->[\s\S]*?<!-- End Google Tag Manager \(noscript\) -->/,'');html=html.replace('</body>',`<div id="mr1-target" style="position:fixed;bottom:0;left:0;right:0;background:#d8f4dd;z-index:999999;text-align:center"></div><script>
const targetBanner=document.getElementById('mr1-target');
function verifiedMr1Target(){return location.hostname==='127.0.0.1' && new URLSearchParams(location.search).get('emulator')==='1' && firebase.firestore()._delegate._settings.host==='127.0.0.1:8189';}
targetBanner.textContent=verifiedMr1Target()?'LOCAL MR1 TEST | Emulator verified | Synthetic data | Mock AI':'STOP: emulator target is unverified';
document.addEventListener('click',e=>{if(!verifiedMr1Target()){e.preventDefault();e.stopImmediatePropagation();}},true);
</script></body>`);res.type('html').send(html);});
app.use(express.static(root+'/prototype'));app.listen(5189,'127.0.0.1',()=>console.log('Synthetic mr1 browser preview http://127.0.0.1:5189/main.html?emulator=1; no external provider calls.'));
