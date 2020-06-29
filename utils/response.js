
module.exports.internalError = (status,message,res)=>{
    return res.json({
        status: status,
        message: message,
    })

}

module.exports.success = (status,message,data,res)=>{
    return res.json({
        status:status,
        message:message,
        data:data
    })
}

module.exports.notFound = (status,message,res)=>{
    return res.json({
        status:status,
        message:message
    })
}

module.exports.alreadyExist = (status,message,res)=>{
    return res.json({
        status:status,
        message:message,
    })
}

module.exports.userStatus = (status,message,res)=>{
    return res.json({
        status:status,
        message:message
    })
}

module.exports.allEvents = (status,message,states,cities,categories,data,res)=>{
    return res.json({
        status:status,
        message:message,
        states:states,
        cities:cities,
        categories:categories,
        data:data
    })
}

module.exports.ticketPackage = (status,message,data,type,res)=>{
    return res.json({
        status: status,
        message:message,
        data:data,
        types: type
    })

}

module.exports.notVerified = (status,message,res)=>{
    return res.json({
        status: status,
        message:message
    })
}

module.exports.linkExpire = (status,message,res)=>{
    return res.json({
        status: status,
        message:message
    })
}

module.exports.pdfError = (status,message,res)=>{
    return res.json({
        status: status,
        message:message
    })
}

module.exports.emailSendfError = (status,message,res)=>{
    return res.json({
        status: status,
        message:message
    })
}