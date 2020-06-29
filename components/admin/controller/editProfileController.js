
const con = require('../../../config/database');
const response = require('../../../utils/response');
const md5 = require('md5');

module.exports.editProfile = (req, res) => {
    con.connect(function (err) {
        let sqlQuery ='UPDATE  ev_to_signup SET username=?,email=?,password = ?, role = ?, status = ? WHERE id = ?'; 
        req.body.role = "1";
        req.body.status = "1";
        con.query(sqlQuery,[req.body.username,req.body.email,
            md5(req.body.password), req.body.role,req.body.status,req.body.user_id], (err, data) => {
            if (err) {
                response.internalError(500,"Error components:admin:controller:editProfileController:editProfile",res);
            } else {
                response.success(200, "User email exist", data, res);
            }

        })

    })
}


module.exports.getAdminProfile = (req, res) => {
    con.connect(function (err) {
        let sqlQuery ='SELECT * FROM ev_to_signup WHERE id = ?'; 
        con.query(sqlQuery,[req.body.user_id], (err, data) => {
            if (err) {
                response.internalError(500,"Error components:admin:controller:editProfileController:getAdminProfile", res);
            } else {
                
                response.success(200, "User email exist", data, res);
            }

        })

    })
}