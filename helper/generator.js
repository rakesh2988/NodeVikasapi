
function uniqueString() {
 return Math.random().toString(36).split('').filter( function(value, index, self) { 
        return self.indexOf(value) === index;
   }).join('').substr(2,8);
}

function qrcodeString(qrmoment){
   return Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8) + '_' + qrmoment;
}

module.exports = uniqueString;
module.exports = qrcodeString;