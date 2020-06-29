
const con = require('../../../config/database');
const jwt = require('jsonwebtoken');
const response = require('../../../utils/response');
const md5 = require('md5');

module.exports.login =async (req,res)=>{
console.log("====>>>>>>====",req.body);
    con.connect(function (err) {
        con.query('SELECT * FROM ev_to_signup WHERE email = ? AND password = ? AND role = ?',[req.body.email,md5(req.body.password),["1"]], (err, data) => {
            if (err) {
             response.internalError(500,"Error in components:admin:controller:loginController:login",res);
            }
            if(data.length == 0){
             response.notFound(404,"User not exist",res);
            }
            if(data.length > 0){
                if(data[0].status == 1){
                return res.json({
                    status: 200,
                    message: 'Login sucessfully',
                    data: data,
                    token: jwt.sign({ data: 'event-ticket'}, 'secret', { expiresIn: '9h' }) 
                })
                }
            }
        });

    })
 
}