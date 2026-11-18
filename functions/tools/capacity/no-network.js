"use strict";
// Executable fuse for this offline child only; never imported by application runtime.
const refuse=()=>{throw new Error('Offline capacity audit forbids network access');};
require('node:net').Socket.prototype.connect=refuse;
for(const name of ['lookup','resolve','resolve4','resolve6'])require('node:dns')[name]=refuse;
for(const protocol of ['node:http','node:https'])for(const name of ['request','get'])require(protocol)[name]=refuse;
if(globalThis.fetch)globalThis.fetch=refuse;
