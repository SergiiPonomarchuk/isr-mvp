"use strict";
// New scoring uses education category only. Legacy multipliers are frozen replay inputs.
const VERSION="mr1-cbc-table-1", LEGACY_VERSION="mr1-context-review-1";
const supported=v=>v===VERSION || v===LEGACY_VERSION;
function adjustment(bundle,ref){
 if(!bundle || !supported(bundle.version))throw new Error("Unsupported scoring version");
 if(bundle.version===VERSION){
  if(["cbc_adjustment","CBC_adjustment_factor","cbc_adjustment_factor","cbc"].some(k=>Object.prototype.hasOwnProperty.call(ref,k)))throw new Error("CBC is fixed by education category");
  return 1;
 }
 const a=ref.cbc_adjustment;
 if(typeof a!=="number" || !Number.isFinite(a) || a<=0)throw new Error("Invalid frozen CBC adjustment");
 return a;
}
function validate(bundle){
 if(!bundle || !supported(bundle.version) || !Array.isArray(bundle.model?.refs))throw new Error("Unsupported scoring version");
 for(const ref of bundle.model.refs)adjustment(bundle,ref);
}
module.exports={VERSION,LEGACY_VERSION,supported,adjustment,validate};
