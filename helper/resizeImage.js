const sharp = require('sharp');

module.exports.resizeImage = (file,callback)=>{
    console.log("=== =print image files in resieimage functiokn -====",file);
    var image_path = 'thumbnail-' + Date.now()+'.' + file.mimetype.split('/')[1];
    sharp(file.path)
     .resize(90,150)
     .toFile('public/thumbnail/'+ image_path, (err, info) => { 
         if(err){
        image_path = "error";
        return callback(image_path);
         }else{
             return callback(image_path);
         }
     });
 
}


module.exports.resizeEventImage = (file,type,callback)=>{
    var width, hight;
    if(type == "banner_image"){
        width = 1980,
        hight = 325
    }else{
        width = 370,
        hight = 222
    }
    var image_path = 'uploads-' + Date.now()+'.' + file.mimetype.split('/')[1];
    sharp(file.path)
     .resize(width,hight)
     .toFile('public/uploads/'+ image_path, (err, info) => { 
         if(err){
        image_path = "error";
        return callback(image_path);
         }else{
             return callback(image_path);
         }
     });

}