import multer from 'multer'

const upload =multer({
    storage:multer.memoryStorage(),
    limits:{
        fileSize:10 * 1024 * 1024
    },
    fileFilter:(req,file,cb)=>{
        const allowedTypes=[ "application/pdf",
      "image/jpeg",
      "image/png",];
    if(allowedTypes.includes(file.mimetype)){
        cb(null,true)
    }
    else{
        cb(new Error("Only PDF,JPG,and PNG files are allowed."));
    }
},
})
export default upload