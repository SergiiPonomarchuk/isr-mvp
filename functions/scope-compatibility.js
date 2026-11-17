"use strict";
const {SCOPES}=require("./context-schema"); const RULE="equal-or-unit-building-1"; function compatible(a,b){if(!SCOPES.includes(a)||!SCOPES.includes(b))throw new Error("Unknown scope");return a===b || a==="unit"&&b==="building" || a==="building"&&b==="unit";} module.exports={compatible,RULE};
