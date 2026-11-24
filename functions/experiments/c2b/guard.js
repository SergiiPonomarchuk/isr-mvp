"use strict";
const {fail}=require('../publication/artifact');
const PROJECT='demo-c2b-integration',HOST='127.0.0.1:8080',PORT=5802,VERSION='c2b-emulator-1';
function target(env=process.env){if(env.C2B_EMULATOR_TESTS!=='1'||env.GCLOUD_PROJECT!==PROJECT||env.FIRESTORE_EMULATOR_HOST!==HOST)fail('c2b_target_refused');}
function fixtureId(s){if(typeof s!=='string'||!/^[-a-z0-9_]{1,40}$/.test(s))fail('fixture_id');return s;}
function physical(fixture,key){
 fixtureId(fixture);const base='issue_drafts/c2b_'+fixture;
 if(key==='control/global_catalog')return 'issue_drafts/c2b_registry/controls/catalog';
 let m;
 if((m=/^private\/jobs\/([-a-zA-Z0-9_:]{1,64})$/.exec(key)))return base+'/publication_builds/'+m[1];
 if((m=/^private\/nodes\/([-a-zA-Z0-9_:]{1,64})\/(n[0-9]{5})$/.exec(key)))return base+'/publication_builds/'+m[1]+'/nodes/'+m[2];
 if((m=/^control\/(source|catalog|day)$/.exec(key)))return base+'/controls/'+m[1];
 if((m=/^private\/(intents|locks|catalog)\/([-a-zA-Z0-9_:]{1,64})$/.exec(key)))return base+'/'+m[1]+'/'+m[2];
 if((m=/^private\/(commands|outcomes)\/([-a-zA-Z0-9_:]{1,64})$/.exec(key)))return base+'/'+m[1]+'/'+m[2];
 if((m=/^private\/outcomeNodes\/([-a-zA-Z0-9_:]{1,64})\/(n[0-9]{5})$/.exec(key)))return base+'/outcomes/'+m[1]+'/nodes/'+m[2];
 if((m=/^private\/titles\/([a-f0-9]{64})$/.exec(key)))return base+'/titles/'+m[1];
 if((m=/^public\/(issues|discussions|publics)\/([-a-zA-Z0-9_:]{1,64})$/.exec(key)))return ({issues:'issues',discussions:'discussions',publics:'microcommunities'})[m[1]]+'/c2b_'+fixture+'_'+m[2];
 if((m=/^public\/(vectors|messages)\/([-a-zA-Z0-9_:]{1,64})$/.exec(key)))return base+'/placeholders/'+m[1]+'_'+m[2];
 if((m=/^public\/events\/([-a-zA-Z0-9_:]{1,128})$/.exec(key)))return base+'/events/'+m[1];
 fail('c2b_path_refused');
}
function allowedPhysical(path){return path==='issue_drafts/c2b_bootstrap'||/^issue_drafts\/c2b_[-a-z0-9_]{1,40}\/(controls|intents|locks|titles|catalog|placeholders|events|commands|outcomes)\/[-a-zA-Z0-9_:]{1,128}$/.test(path)||/^issue_drafts\/c2b_[-a-z0-9_]{1,40}\/(publication_builds|outcomes)\/[-a-zA-Z0-9_:]{1,64}(\/nodes\/n[0-9]{5})?$/.test(path)||/^(issues|discussions|microcommunities)\/c2b_[-a-zA-Z0-9_:]{1,108}$/.test(path);}
function network(){
 const net=require('node:net'),tls=require('node:tls');const original=net.Socket.prototype.connect;
 net.Socket.prototype.connect=function(...args){let a=args[0];if(Array.isArray(a))a=a[0];const port=typeof a==='object'?Number(a.port):Number(a),host=typeof a==='object'?a.host:(typeof args[1]==='string'?args[1]:'localhost');if(host!=='127.0.0.1'||![8080,5800,5802].includes(port))fail('c2b_network_refused');return original.apply(this,args);};
 tls.connect=()=>fail('c2b_network_refused');const fetch=globalThis.fetch;
 globalThis.fetch=(input,options)=>{const u=new URL(typeof input==='string'||input instanceof URL?input:input.url);if(u.protocol!=='http:'||u.hostname!=='127.0.0.1'||![8080,5800,5802].includes(Number(u.port)))fail('c2b_network_refused');return fetch(input,options);};
}
module.exports={PROJECT,HOST,PORT,VERSION,target,fixtureId,physical,allowedPhysical,network};
