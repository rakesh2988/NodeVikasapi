

const con = require('../../../config/database');
const response = require('../../../utils/response');
const sendMailer = require('../../../helper/smtp');
const jwt = require('jsonwebtoken');
const path = require('path');
const moment = require('moment');
const md5 = require('md5');

module.exports.login =  (req,res) => {
    var params = req.body;
    console.log("=== print params ===>>>===>>>>==", params);
    con.connect(function (err) {
        con.query('SELECT * FROM ev_to_signup WHERE email = ? AND password = ? AND role = 2',[params.email,md5(params.password)], (err, data) => {
            if (err) {
             response.internalError(500,"Internal error",res);
            }
            if(data.length == 0){
                process.env.isLogin = false;
              response.notFound(404,"Incorrect credentials",res);
            }
            if(data.length > 0){
                if(data[0].status == "1" ){
                    console.log("====login success === >>>>>")
                    process.env.isLogin = true;
                  return res.json({
                    status: 200,
                    message: 'Login successfully',
                    data: data,
                    token: jwt.sign({ data: 'event-ticket'}, 'secret', { expiresIn: '9h' }) 
                })
                }
                if(data[0].status == "2"){
                 process.env.isLogin = false;   
                 response.userStatus(201,"Account is not active",res);
                }
            }
        });
    })
}


module.exports.verifyEmail = (req,res,next)=>{
    console.log("===== data from query params in verfiy email =====>>>",req.query);
    console.log("=== get user slug in ====>>>===>>===>>>===>>",req.query.user_slug);
    con.connect(function (err) {
        var emailVerify ='SELECT updated_at FROM ev_to_signup WHERE user_slug = ?'; 
        con.query(emailVerify,[req.query.user_slug],(err, data) => {
            console.log("===== print slug data====>>>",data);
            if(err){
                response.internalError(500,"Something went wrong",res);
            }else{
              var queryVerify = 'UPDATE ev_to_signup  SET verify=? WHERE user_slug = ?';
              con.query(queryVerify,[ "1",req.query.user_slug],(err, data) => {
               if(err){
                response.internalError(500,"Something went wrong",res); 
               }else{
                res.sendFile(path.join (__dirname,'/../../../templates/email-verify.html'));
               }
              }) 
            }

        })

    })

}