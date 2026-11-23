const test=require('node:test'),assert=require('node:assert/strict'),{aggregateValues}=require('../public-values');
test('additive Values metadata does not change relevance-weighted public Values',()=>{
 const value=n=>({domains:Array(10).fill(n),items:{d1:[n,null]},conflict_resolution:Array(36).fill(n),contextual_shifts:Object.fromEntries(['work','family','private','crisis'].map(k=>[k,Array(10).fill(n)]))});
 const input=[{relevance:.2,taxonomy:value(20)},{relevance:.8,taxonomy:value(80)}],before=aggregateValues(input);
 const enriched=input.map(x=>({...x,taxonomy:{...x.taxonomy,meta:{version:'1.0',overall_grounding:23.3,gl_cs:Object.fromEntries(Array.from({length:10},(_,i)=>['d'+(i+1),{grounding:20+i,confidence:60}]))}}}));
 assert.equal(before.domains[0],68);assert.deepEqual(aggregateValues(enriched),before);assert.ok(!Object.hasOwn(before,'meta'));
});
