// =====================================
// TradeGuard Admin Authentication
// =====================================

const jwt = require("jsonwebtoken");

module.exports = function(req, res, next){

    try{

        // Get Authorization Header
        const authHeader = req.headers.authorization;

        if(!authHeader){

            return res.status(401).json({

                success:false,
                message:"Authorization token missing."

            });

        }

        // Check Bearer Token
        if(!authHeader.startsWith("Bearer ")){

            return res.status(401).json({

                success:false,
                message:"Invalid authorization format."

            });

        }

        // Extract Token
        const token = authHeader.substring(7);

        // Verify JWT
        const decoded = jwt.verify(

            token,

            process.env.JWT_SECRET

        );

        // Verify Admin Role
        if(decoded.role !== "admin"){

            return res.status(403).json({

                success:false,
                message:"Administrator access required."

            });

        }

        // Save Admin Information
        req.admin = decoded;

        next();

    }
    catch(err){

        console.error("Admin JWT Error:", err.message);

        return res.status(401).json({

            success:false,
            message:"Invalid or expired administrator token."

        });

    }

};
