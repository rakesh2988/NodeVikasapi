const con = require('../../../config/database');
const moment = require('moment');
const path = require('path');
const response = require('../../../utils/response');


module.exports.userPayment = (req,res)=>
{
    var params = req.body;
    //need to decrease the count of qunatity and increse to sale count
    //This query run  after payment of user 
    var EventData = new Promise((resolve,reject)=>{
        con.connect(function (err) {
            var query = 'SELECT quantity,sale FROM ev_to_ticket WHERE event_id = ?';
            con.query(query,[params.event_id],(err, data) => {
                if(err){
                    reject(err);
                }else{
                    resolve(data);
                }
    
            })
        })

    })

    var updateEvent = (event)=>{
        return new Promise((resolve,reject)=>{
            let quantity_value = 0;
            let sale_value = 0;
            quantity_value = event[0].quantity - params.quantity;
            sale_value = event[0].sale + params.quantity;
            con.connect(function (err) {
                var query = 'UPDATE ev_to_ticket SET quantity = ?, sale = ? WHERE event_id = ?';
                con.query(query,[quantity_value,sale_value,params.event_id],(err, data) => {
                    if(err){
                        reject(err);
                    }else{
                        resolve(event);
                    }
                })
            })
        })   
    }


    EventData.then((event)=>{
        if(event.length > 0){
            return updateEvent(event);
        }
    }).then((data)=>{
      console.log("===== after the promise is completed====",data);
    }).catch((err)=>{
        response.internalError(500,"Error in catch statement of promises",res);
    })
    
}


// var rootCas = require('ssl-root-cas/latest').create();
// rootCas.addFile(__dirname + '/certificates_prod/key.pem').addFile(__dirname + '/certificates_prod/cert-musika.pem');
// require('https').globalAgent.options.ca = rootCas;

// module.exports.azulPayment = (request,response)=>
// {

//     $data = request.body;

//     var fs = require('fs');
//     var https = require('https');
//     var jsonData = 
//     {
//         "Channel":"EC",
//         "Store":"39038540035",
//         "CardNumber":$data.CardNumber,
//         "Expiration":$data.Expiration,
//         "CVC":$data.CVC,
//         "PosInputMode":"E-Commerce",
//         "TrxType":"Sale",
//         "Amount":$data.Amount,
//         "Itbis":$data.Itbis,
//         "CurrencyPosCode":"$",
//         "Payments":"1",
//         "Plan":"0",
//         "AcquirerRefData":"0",
//         "ForceNo3DS": "0",
//         "DataVaultToken": "",
//         "SaveToDataVault": "0",
//         "RRN":null,
//         "CustomerServicePhone":"",
//         "OrderNumber":$data.OrderNumber,
//         "ECommerceUrl":"https://appserver.musikaapp.com"
//     };

//     var options = 
//     {
//         hostname: 'pruebas.azul.com.do',
//         port: 443,
//         path: '/webservices/JSON/Default.aspx',
//         method: 'POST',
//         headers: {'Content-Type':'application/json',"Auth1":"musika","Auth2":"musika"},
//         json:true,
//         key: fs.readFileSync('certificates_prod/key.pem'),
//         cert: fs.readFileSync('certificates_prod/cert-musika.pem')
//         //rejectUnauthorized: false
//     };
    

//     var req = https.request(options, function(res) 
//     {
//         console.log(res);
//         res.on('data', function(data) 
//         {
//              console.log("response " + data);
//             // var d=JSON.parse(data);
//             // console.log(d.ThreeDSChallenge.MD);
//              return response.status(200).json(JSON.parse(data));
//         });
//     });
 
//     req.on('error', function(err)
//     {
//         console.log(err);
//         return response.status(400).json({error:'Something went wrong'});
//     }); 
    
//     req.write(JSON.stringify(jsonData));
//     req.end();


    
// }
// module.exports.azulPaymentD = (request,response)=>
// {
//     $data = request.body;

//     var fs = require('fs');
//     var https = require('https');

//     var jsonData = 
//     {
//         "Channel":"EC",
//         "Store":"39038540035",
//         "AzulOrderId":$data.AzulOrderId,
//         "PaRes":$data.PaRes,
//         "MD":$data.MD
//     };

//     var options = 
//     {
//         hostname: 'pruebas.azul.com.do',
//         port: 443,
//         path: '/WebServices/JSON/default.aspx?processthreedschallenge',
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', "Auth1": "musika", "Auth2": "musika" },
//         json:true,
//         key: fs.readFileSync('certificates_prod/key.pem'),
//         cert: fs.readFileSync('certificates_prod/cert-musika.pem')//,
//         //rejectUnauthorized: false
//     };
    

//     var req = https.request(options, function(res) 
//     {
//         console.log(res);
//         res.on('data', function(data) 
//         {
//              console.log("response " + data)
//              return response.status(200).json(JSON.parse(data));
//         });
//     });
 
//     req.on('error', function(err)
//     {
//         console.log(err);
//         return response.status(400).json({error:'Something went wrong'});
//     }); 
    
//     req.write(JSON.stringify(jsonData));
//     req.end();

    
// }
