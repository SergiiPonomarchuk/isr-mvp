"use strict";
// Explicit version dispatch only. No SDK, provider, experimental startup or secret import.
const VERSION='c2b-emulator-1';
function format(value){if(value?.publication_version===undefined){if(value?.prototype_version!==undefined||value?.build_id!==undefined||value?.active_generation_id!==undefined||value?.manifest_hash!==undefined)throw Object.assign(new Error('publication_adapter_required'),{code:'publication_adapter_required'});return 'legacy';}if(value.publication_version!==VERSION)throw Object.assign(new Error('publication_format'),{code:'publication_format'});return VERSION;}
function legacyOnly(value){if(format(value)!=='legacy')throw Object.assign(new Error('publication_adapter_required'),{code:'publication_adapter_required'});return value;}
async function approved(value,{legacy,publication}){if(format(value)==='legacy')return legacy();if(!publication?.outcomeReceipt)throw Object.assign(new Error('publication_adapter_required'),{code:'publication_adapter_required'});return publication.outcomeReceipt();}
async function deadline(value,{legacy,publication,today,operation_id}){if(format(value)==='legacy')return legacy();if(!publication?.runDeadline)throw Object.assign(new Error('publication_adapter_required'),{code:'publication_adapter_required'});return publication.runDeadline(today,operation_id);}
module.exports={VERSION,format,legacyOnly,approved,deadline};
