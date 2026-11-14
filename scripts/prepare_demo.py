"""D1: select P2 creators and generate/store each scenario's content once.

Default is a read-only creator preview. --generate consumes the approved text
budget and stores synthetic content; it never writes Firestore.
"""
from __future__ import annotations
import argparse
import datetime as dt
import json
from pathlib import Path
import sys
import urllib.parse
import urllib.request
from demo_common import ROOT,digest,load_json,save_json,select_creators,target,exclusive
import ai_config
import gemini_api
from seed_demo import USER_FIELDS

SUBJECTS=[(1,'House entrance lock broken','building'),(21,'Pothole on local street','street'),
 (32,'Broken playground equipment','street'),(44,'Elderly day-care / respite services','neighbourhood'),
 (86,'On-site shift scheduling change','workplace'),(82,'Community choir / arts group','neighbourhood'),
 (90,'Open-source project roadmap','global digital'),(98,'Zoning / building permit','district'),
 (51,'Family emergency','city'),(97,'City budget participatory allocation','city')]

def validate_scenario(value):
    def text(s,limit):return isinstance(s,str) and 0<len(s.strip())<=limit
    if not isinstance(value,dict) or not text(value.get('title'),160) or not text(value.get('description'),2500):raise ValueError('Generated title/description invalid')
    messages=value.get('messages');options=value.get('options')
    if not isinstance(messages,list) or not 2<=len(messages)<=4 or not isinstance(options,list) or not 2<=len(options)<=3:raise ValueError('Need 2-4 messages and 2-3 options')
    for m in messages:
        if not isinstance(m,dict) or m.get('author') not in ('creator','member') or not text(m.get('text'),1000):raise ValueError('Invalid generated message')
    for o in options:
        if not isinstance(o,dict) or not all(text(o.get(k),200) for k in ('title','budget','funding_source')):raise ValueError('Invalid generated option')
        if not isinstance(o.get('resources_needed'),list) or not all(text(x,200) for x in o['resources_needed']):raise ValueError('Invalid option resources')
        if not isinstance(o.get('steps'),list) or not 1<=len(o['steps'])<=4 or not all(text(x,250) for x in o['steps']):raise ValueError('Invalid task steps')
    return {k:value[k] for k in ('title','description','messages','options')}

def generate_one(subject,creator,named_place,key):
    _,purpose,scope=subject
    prompt=f'''Write one compact fictional ISR demo issue in English. Subject: {purpose}; scope: {scope}.
The synthetic creator's home/work anchor is {creator['anchor']}. Cities Andim and Bilim are fictional.
For the house-lock subject explicitly say 'At my home building {creator['anchor']}'. For workplace shifts explicitly say 'At my workplace {creator['anchor']}'. Other nondigital local subjects should say they are near the creator's home rather than name a fictional city as a geocoding target. For the street pothole use this real nearby street reference: {named_place if subject[0]==21 else 'not applicable to this subject'}.
Digital issues must clearly concern online software work, independent of residence. Family emergency is fictional and must request practical nonmedical help, without diagnoses or private contact details.
Return JSON only: title, description, messages (2-4 objects with author=creator/member and text), options (2-3 objects with title, budget as a short synthetic amount, funding_source, resources_needed string array, steps string array with 1-4 concrete actions).
No scores, weights, dates, real people, credentials or promises of actual funding. The server derives parameters and resolves responsible profiles/deadlines later.'''
    response=gemini_api.post(f'models/{ai_config.TEXT_MODEL}:generateContent',{'contents':[{'parts':[{'text':prompt}]}],
        'generationConfig':{'temperature':ai_config.TEMPERATURE,'seed':ai_config.SEED,'responseMimeType':'application/json','maxOutputTokens':4000}},key)
    raw=''.join(p.get('text','') for p in response['candidates'][0]['content']['parts'])
    value=validate_scenario(json.loads(raw));value['purpose']=purpose;value['example_id']=subject[0]
    return value,{'model':ai_config.TEXT_MODEL,'prompt_sha256':digest(prompt),'usage':response.get('usageMetadata'),
        'estimated_prompt_tokens':(len(prompt)+3)//4}

def generate_missing(document,path,key,generator=generate_one):
    if document.get('pending_request'):raise ValueError('Interrupted generation needs explicit ledger review before retry')
    for i,subject in enumerate(SUBJECTS,1):
        ident=f'D1-{i:02}'
        if ident in document['scenarios']:continue
        if document['usage']['requests']>=20:raise ValueError('D1 content request ceiling reached')
        document['usage']['requests']+=1
        document['pending_request']=ident;save_json(path,document)
        value,meta=generator(subject,document['creators'][ident],document.get('named_place'),key)
        value=validate_scenario(value)|{'purpose':subject[1],'example_id':subject[0]}
        if any(' '.join(v['title'].split()).lower()==' '.join(value['title'].split()).lower() for v in document['scenarios'].values()):raise ValueError('Generated active scenario titles must be distinct')
        document['scenarios'][ident]=value;document.setdefault('generation',{})[ident]=meta
        document.pop('pending_request',None);save_json(path,document)
    return document

def main(argv=None):
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--project',required=True)
    parser.add_argument('--i-know-this-is-live',action='store_true',dest='live');parser.add_argument('--generate',action='store_true')
    parser.add_argument('--output',default=str(ROOT/'specs/demo/content.json'))
    args=parser.parse_args(argv)
    if args.generate:
        with exclusive(args.output):return run_preparation(args)
    return run_preparation(args)

def run_preparation(args):
    target(args.project,args.live)
    from google.cloud import firestore
    db=firestore.Client(project=args.project)
    if Path(args.output).exists():document=load_json(args.output)
    else:
        creators=select_creators([s.to_dict() for s in db.collection('users').select(USER_FIELDS).stream()],dt.date.today().isoformat())
        document={'version':'d1-content-v1','project':args.project,'creators':creators,'scenarios':{},'usage':{'requests':0,'nominatim_lookups':0}}
    if document.get('project')!=args.project:raise ValueError('Stored content project mismatch')
    if not args.generate:
        print(json.dumps({'creators':{k:v['uid'] for k,v in document['creators'].items()},'stored_scenarios':len(document['scenarios']),'requests':0}));return 0
    if len(document['scenarios'])==10:print('Stored content complete; zero requests.');return 0
    key=gemini_api.load_key()
    if not key:raise ValueError('Set up the key for this worktree before paid content generation')
    if not document.get('named_place'):
        if document['usage']['nominatim_lookups']>=1:raise ValueError('Reverse lookup already attempted; inspect/recover the saved plan before retry')
        document['usage']['nominatim_lookups']+=1;save_json(args.output,document)
        lat,lon=document['creators']['D1-02']['location']
        query=urllib.parse.urlencode({'format':'jsonv2','lat':lat,'lon':lon,'zoom':16,'addressdetails':1})
        req=urllib.request.Request('https://nominatim.openstreetmap.org/reverse?'+query,headers={'User-Agent':'ISR-MVP-D1/1.0 (+https://project-a3d59130-5adf-4677-9e2.web.app)'})
        with urllib.request.urlopen(req,timeout=25) as response:place=json.load(response)
        address=place.get('address',{});road=address.get('road') or address.get('pedestrian')
        if not road:raise ValueError('No nearby named road; review the lookup before generation')
        document['named_place']=', '.join(str(x) for x in (road,address.get('city') or address.get('town'),address.get('country')) if x)
        save_json(args.output,document)
    generate_missing(document,args.output,key)
    print(json.dumps({'stored_scenarios':len(document['scenarios']),'content_requests':document['usage']['requests'],
        'nominatim_lookups':document['usage']['nominatim_lookups']}));return 0

if __name__=='__main__':
    try:sys.exit(main())
    except (ValueError,OSError,gemini_api.GeminiError) as error:
        print('D1 content preparation stopped; stored content and usage ledger retained. '+type(error).__name__,file=sys.stderr);sys.exit(1)
