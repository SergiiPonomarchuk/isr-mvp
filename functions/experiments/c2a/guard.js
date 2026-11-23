"use strict";
const {fail}=require('../publication/artifact');
const PROJECT='demo-c2a-publication',HOST='127.0.0.1:8190',PORT=8192,VERSION='c2a-publication-1';
function target(env=process.env){if(env.C2A_EMULATOR_TESTS!=='1'||env.GCLOUD_PROJECT!==PROJECT||env.FIRESTORE_EMULATOR_HOST!==HOST)fail('c2a_target_refused');}
function fixtureId(s){if(typeof s!=='string'||!/^[-a-z0-9_]{1,40}$/.test(s))fail('fixture_id');return s;}
function physical(fixture,key){
 fixtureId(fixture);const base='issue_drafts/c2a_'+fixture;
 let m;
 if((m=/^private\/jobs\/([-a-zA-Z0-9_:]{1,64})$/.exec(key)))return base+'/publication_builds/'+m[1];
 if((m=/^private\/nodes\/([-a-zA-Z0-9_:]{1,64})\/(n[0-9]{5})$/.exec(key)))return base+'/publication_builds/'+m[1]+'/nodes/'+m[2];
 if((m=/^control\/(source|catalog|day)$/.exec(key)))return base+'/controls/'+m[1];
 if((m=/^private\/(intents|locks|catalog)\/([-a-zA-Z0-9_:]{1,64})$/.exec(key)))return base+'/'+m[1]+'/'+m[2];
 if((m=/^private\/titles\/([a-f0-9]{64})$/.exec(key)))return base+'/titles/'+m[1];
 if((m=/^public\/(issues|discussions|publics)\/([-a-zA-Z0-9_:]{1,64})$/.exec(key)))return ({issues:'issues',discussions:'discussions',publics:'microcommunities'})[m[1]]+'/c2a_'+fixture+'_'+m[2];
 if((m=/^public\/(vectors|messages)\/([-a-zA-Z0-9_:]{1,64})$/.exec(key)))return base+'/placeholders/'+m[1]+'_'+m[2];
 if((m=/^public\/events\/([-a-zA-Z0-9_:]{1,128})$/.exec(key)))return base+'/events/'+m[1];
 fail('c2a_path_refused');
}
function allowedPhysical(path){return path==='issue_drafts/c2a_bootstrap'||/^issue_drafts\/c2a_[-a-z0-9_]{1,40}\/(controls|intents|locks|titles|catalog|placeholders|events)\/[-a-zA-Z0-9_:]{1,128}$/.test(path)||/^issue_drafts\/c2a_[-a-z0-9_]{1,40}\/publication_builds\/[-a-zA-Z0-9_:]{1,64}(\/nodes\/n[0-9]{5})?$/.test(path)||/^(issues|discussions|microcommunities)\/c2a_[-a-zA-Z0-9_:]{1,108}$/.test(path);}
function network(){
 const net=require('node:net'),tls=require('node:tls');const original=net.Socket.prototype.connect;
 net.Socket.prototype.connect=function(...args){let a=args[0];if(Array.isArray(a))a=a[0];const port=typeof a==='object'?Number(a.port):Number(a),host=typeof a==='object'?a.host:(typeof args[1]==='string'?args[1]:'localhost');if(host!=='127.0.0.1'||![8190,8192].includes(port))fail('c2a_network_refused');return original.apply(this,args);};
 tls.connect=()=>fail('c2a_network_refused');const fetch=globalThis.fetch;
 globalThis.fetch=(input,options)=>{const u=new URL(typeof input==='string'||input instanceof URL?input:input.url);if(u.protocol!=='http:'||u.hostname!=='127.0.0.1'||![8190,8192].includes(Number(u.port)))fail('c2a_network_refused');return fetch(input,options);};
}
module.exports={PROJECT,HOST,PORT,VERSION,target,fixtureId,physical,allowedPhysical,network};
