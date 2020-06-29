const con = require('../../../config/database');
const response = require('../../../utils/response');

module.exports.changeStatus = (req,res) =>{
    var params = req.body;
   params.status = params.status == "1"? params.status = "2" : params.status =  "1";
    con.connect(function (err) {  
        let query = 'UPDATE ev_to_signup SET status = ? WHERE id = ?';
        con.query(query,[params.status,params.user_id],(err, data) => {
            if(err){
              response.internalError(500,"Error in components:admin:controller:userController:changeStatus",res);
              }else{
                  response.success(200,"All users",data,res);
              }
        })

    })

}

module.exports.deleteUser = (req,res) =>{
    var params = req.body;
    con.connect(function (err) {  
        let query = 'DELETE FROM ev_to_signup WHERE id = ?';
        con.query(query,[params.user_id],(err, data) => {
            if(err){
              response.internalError(500,"Error in components:admin:controller:userController:deleteUser",res);
              }else{
                  response.success(200,"User deleted ",data,res);
              }
        })

    })

}


module.exports.getUsers = (req, res) => {

    var totalCount = new Promise((resolve, reject) => {
        var countQuery = "SELECT count(*) as total FROM ev_to_signup";
        con.connect(function (err) {
            con.query(countQuery, (err, count) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(count);
                }

            })
        })

    })

    var searchData = (count) => {
        return new Promise((resolve, reject) => {
            var params = req.body;
            params.limit = 5;
            var query;
            value = [];
            var offset = (params.page || 1) * params.limit - params.limit;
            if (params.text == '') {
                query = "SELECT * FROM ev_to_signup WHERE role=2 ORDER BY created_at DESC LIMIT ? OFFSET ?";
                value = [params.limit, offset];
            }
            if (params.text !== '') {
                query = "SELECT * FROM ev_to_signup WHERE username OR email  LIKE ? AND role= 2 ORDER BY created_at DESC LIMIT ? OFFSET ?";
                value = [`${params.text}%`, params.limit, offset];
            }

            con.connect(function (err) {
                con.query(query, value, (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        data.total = count[0].total;
                        data.limit = params.limit;
                        resolve(data)
                    }
                })
            })

        })

    }

    totalCount.then((count) => {
        return searchData(count);
    }).then((data) => {
        var newData ={
            data:data,
            size: Math.ceil(data.total/data.limit),
            limit: data.limit,
            total:data.total
        }
        response.success(200,"List of events",newData,res);
    }).catch((err) => {
        console.log("=========>>>>error ==========",err)
        response.internalError(500, "Error in components:admin:controller:userController:getUsers",res);
    })

}


module.exports.getUser = (req,res)=>{
    var params = req.body;
    con.connect(function (err) {
        let query = 'SELECT * FROM ev_to_signup WHERE id= ?';
        con.query(query,[params.user_id],(err, data) => {
            if(err){
                response.internalError(500,"Error in admin:controller:usercontroller:getUser",res);
            }else{
                response.success(200,"Data of single user",data,res);
            }

        })
    })

}

module.exports.updateUser = (req,res)=>{
    var params = req.body;
    con.connect(function (err) {
        let query = 'UPDATE ev_to_signup SET username=?, email=?,verify=?,status=? WHERE id= ?';
        con.query(query,[params.username,params.email,params.verify,params.status,params.user_id],(err, data) => {
            if(err){
                response.internalError(500,"Error in components:admin:controller:userController:updateUser",res);
            }else{
                response.success(200,"User updated successfully.",data,res);
            }

        })
    })

}


module.exports.userCount = (req,res)=>{
    con.connect(function (err) {
      let query = "SELECT COUNT(*) as total from ev_to_signup";
      con.query(query, (err, count) => {
        if(err){
          response.internalError(500,"Error in components:admin:controller:userController:userCount",res);
        }else{
       response.success(200,"count of users",count,res);
        }
      })
    })
  
  }