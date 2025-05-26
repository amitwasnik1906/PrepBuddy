const multer = require("multer")

// Configure Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/tmp/my-uploads')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

// File filterer
const fileFilter = (req, file, cb) =>{
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"]
    if(allowedTypes.includes(file.mimitype)){
        cb(null, true)
    }
    else{
        cb(new Error("give type is not allowed"), false)
    }
}

const upload = multer({ storage: storage })

module.exports = upload