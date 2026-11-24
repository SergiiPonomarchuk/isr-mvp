"use strict";
const F=require('../publication/fixture');
function fixture(n){return F.fixture(n).map(r=>r.kind==='context'?{...r,data:{...r.data,version:'fixture-supplied-v1',summary:'A supplied synthetic building lock issue.',public_values_vector:Array(145).fill(50)}}:r.kind!=='member'?r:{...r,data:{...r.data,relevance_score:r.data.direct_relevance,expertise_score:1,normalized_relevance:1,normalized_experience:1,contribution_score:1,scoring_version:'fixture-supplied-v1'}});}
module.exports={...F,fixture};
