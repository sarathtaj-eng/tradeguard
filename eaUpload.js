const express = require("express");
const multer = require("multer");
const path = require("path");
const adminAuth = require("./adminAuth");

const router = express.Router();

const storage = multer.diskStorage({

    destination:function(req,file,cb){

        cb(null,"uploads/");

    },

    filename:function(req,file,cb){

        cb(

            null,

            "TradeGuardEA_" + Date.now() + path.extname(file.originalname)

        );

    }

});

const upload = multer({

    storage:storage,

    fileFilter:function(req,file,cb){

        if(path.extname(file.originalname).toLowerCase() !== ".ex5"){

            return cb(new Error("Only EX5 files allowed."));

        }

        cb(null,true);

    }

});

router.post(

    "/upload-ea",

    adminAuth,

    upload.single("ea"),

    async(req,res)=>{
res.json({

    success: true,

    message: "EA uploaded successfully.",

    filename: req.file.filename

});
        
    }

);

module.exports = router;
