const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
function harness(db,values={}) {
  const fields=Object.fromEntries(['search-name','search-gender','search-job','search-age-min','search-age-max'].map(id=>[id,{value:values[id]||''}]));
  const button={addEventListener(_event,callback){this.click=callback;}};
  const results={children:[],set innerHTML(value){this.html=value;this.children=[];},get innerHTML(){return this.html;},appendChild(card){this.children.push(card);}};
  const stored={};let reloads=0;
  const document={getElementById(id){return fields[id]||(id==='search-profiles-btn'?button:id==='search-results'?results:null);},
    createElement(){return {querySelector(){return {addEventListener(_event,callback){this.owner.adopt=callback;},owner:this};},
      getAttribute(key){const name=key==='data-uid'?'data-uid':'data-name';return this.innerHTML.match(new RegExp(name+'="([^"]*)"'))?.[1];}};}};
  const file=process.env.U11_SOURCE_FILE||path.resolve(__dirname,'../../..','prototype/js/main.js');
  const source=fs.readFileSync(file,'utf8');const start=source.indexOf('function initLoginPage()');
  const end=source.indexOf('\nfunction initValuesVectorModal()',start);
  if(start<0||end<0)throw Error('Login handler boundaries changed');
  const context={document,firebase:{firestore:()=>db},safeGetStorage:()=>null,
    safeSetStorage:(key,value)=>stored[key]=value,window:{location:{reload(){reloads++;}}},console};
  vm.runInNewContext(source.slice(start,end)+'\ninitLoginPage();',context);
  return {async search(){await button.click();return results.children;},results,stored,get reloads(){return reloads;}};
}
function memoryDb(records){
  const docs=records.map(([id,data])=>({id,data:()=>data,exists:true}));
  const requests=[];
  function query(clauses=[],cap=Infinity){return {
    where(field,op,value){return query([...clauses,[field,op,value]],cap);},
    limit(value){return query(clauses,value);},
    async get(){requests.push({clauses,cap});let result=docs.filter(d=>clauses.every(([field,op,value])=>{
      const actual=d.data()[field];if(actual===undefined)return false;
      return op==='=='?actual===value:op==='>='?actual>=value:actual<=value;
    }));
      const ordered=clauses.find(c=>c[1]!== '==')?.[0];
      result.sort((a,b)=>{const av=ordered?a.data()[ordered]:a.id,bv=ordered?b.data()[ordered]:b.id;return av<bv?-1:av>bv?1:a.id.localeCompare(b.id);});
      result=result.slice(0,cap);return {docs:result,empty:!result.length,forEach:fn=>result.forEach(fn)};}
  };}
  return {requests,collection(name){if(name!=='users')throw Error('Unexpected collection');return {...query(),doc(id){return {async get(){return docs.find(d=>d.id===id)||{id,exists:false};}};}};}};
}
module.exports={harness,memoryDb};
