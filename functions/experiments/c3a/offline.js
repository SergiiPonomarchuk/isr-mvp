"use strict";
const {fail}=require('./disk');
function install(){const refuse=()=>fail('offline_network_refused');require('../../tools/capacity/no-network');require('node:tls').connect=refuse;for(const name of ['lookup','resolve','resolve4','resolve6','reverse']){require('node:dns')[name]=refuse;if(require('node:dns').promises[name])require('node:dns').promises[name]=refuse;}require('node:dgram').createSocket=refuse;}
module.exports={install};
