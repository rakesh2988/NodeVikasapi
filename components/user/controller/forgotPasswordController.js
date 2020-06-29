const con = require('../../../config/database');
const response = require('../../../utils/response');
const sendMailer = require('../../../helper/smtp');
const moment = require('moment');
const md5 = require('md5');
process.env.isLogin = false;

module.exports.forgotPassword = (req,res)=>{

    var params = req.body;
    console.log("==== print params =====>>>>>====",params)
    con.connect(function (err) {
        con.query('SELECT * FROM ev_to_signup WHERE email = ? AND role = 2',[params.email], (err, data) => {
            if (err) {
             response.internalError(500,"Internal error",res);
            }
            if(data.length == 0){
              response.notFound(404,"Incorrect Email",res);
            }
            if(data.length > 0){
                if(data[0].status == "1" ){
                    var generated_password =  Math.random().toString(36).split('').filter( function(value, index, self) { 
                        return self.indexOf(value) === index;
                   }).join('').substr(2,8);
                    params.password = md5(generated_password);
                    params.user_slug = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + '_' +moment(new Date()).unix()*1000;
                    var queryVerify = 'UPDATE ev_to_signup  SET password=? WHERE email = ?';
                    con.query(queryVerify,[params.password,params.email],(err, data) => {
                     if(err){
                      response.internalError(500,"Something went wrong",res); 
                     }else{
                        var data ={
                            subject:'Login password',
                            message:"your change password. Do not share with any one.",
                            text: generated_password,
                            url: "http://52.14.185.147/login?user_slug="+params.user_slug ,
                            type: "verify" 
                        }
                        sendMailer.send(params.email,data,data.type,(callback)=>{
                            if(callback == "false"){
                              console.log(err);
                            }else{
                                response.success(200,"Password changed successfully",data,res);
                            }
                        }) 
                     }
                    })

                }
                if(data[0].status == "2"){
                 response.userStatus(201,"Account is not active",res);
                }
            }
        });
    })

}