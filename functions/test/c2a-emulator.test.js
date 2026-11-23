"use strict";
const test=require('node:test'),assert=require('node:assert/strict');
test('C2a actual guarded SDK/HTTP emulator publication and recovery',{skip:process.env.C2A_EMULATOR_TESTS!=='1',timeout:120000},async()=>{const r=await require('../experiments/c2a/rehearsal').run();assert.equal(r.status,'completed');assert.equal(r.cases.length,3);assert.equal(r.production_writes,0);});
