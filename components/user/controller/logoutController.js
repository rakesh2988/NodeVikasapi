

module.exports.logout = (req,res)=>{
    res.json({
        status: 200,
        message:"Logout successfully",
        token:''
    })
}