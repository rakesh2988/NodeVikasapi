const con = require('../../../config/database');
const response = require('../../../utils/response');
const sendMailer = require('../../../helper/smtp');
const moment = require('moment');
const md5 = require('md5');
process.env.isLogin = false;

module.exports.signup = (req,res,next) => {
    var params = req.body;
    console.log("===== check params ======>>>>>>=====", params);
    con.connect(function (err) {
        con.query('SELECT * FROM ev_to_signup WHERE email = "' + params.email + '"',(err, data) => {
            console.log("====================================",err,data);
            if (err) {
               response.internalError(500,"Internal error",res);
            }
            if(data.length > 0) {
                response.success(200,"Email already exist",data,res);
            } 
            if(data.length == 0) {
                var generated_password =  Math.random().toString(36).split('').filter( function(value, index, self) { 
                    return self.indexOf(value) === index;
               }).join('').substr(2,8);
                params.password = md5(generated_password);
                params.role = "2";
                params.status = "1";
                params.created_at = moment(Date.now()).format('YYYY-MM-DD hh:mm:ss');
                params.user_slug = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + '_' +moment(new Date()).unix()*1000;
                console.log("===== created date ======>>>>>>>>", params.created_at)
                    con.query('INSERT INTO ev_to_signup SET ?', params, (err, data) => {
                        console.log("------===-----==-----second internal error ====", err,data);
                        if (err) {
                            response.internalError(500,"Internal error",res);
                        } else {
                            var data ={
                                subject:'Login password',
                                message:"This is password for login. Do not share with anyone.",
                                text: generated_password,
                                url: "http://52.14.185.147/login?user_slug="+params.user_slug ,
                                type: "verify" 
                            }
                            sendMailer.send(params.email,data,data.type,next,(callback)=>{
                                if(callback == "false"){
                                  console.log("===== signup error ====>>>==",err);
                                  next();
                                }else{

                                    response.success(200,"User created successfully",data,res);
                                }
                            }) 
                        }
                    });
           
            }
        });

    })

}