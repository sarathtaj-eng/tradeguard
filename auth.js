// =====================================
// TradeGuard JWT Authentication
// =====================================

const jwt = require("jsonwebtoken");

module.exports = function(req, res, next){

    try{

        const authHeader = req.headers.authorization;

        if(!authHeader){

            return res.status(401).json({

                success:false,
                message:"Authorization token missing."

            });

        }

        if(!authHeader.startsWith("Bearer ")){

            return res.status(401).json({

                success:false,
                message:"Invalid authorization format."

            });

        }

        const token = authHeader.substring(7);

        const decoded = jwt.verify(

            token,

            process.env.JWT_SECRET

        );

        // Basic validation
        if(!decoded.id){

            return res.status(401).json({

                success:false,
                message:"Invalid token."

            });

        }

        req.user = decoded;

        next();

    }
    catch(err){

        console.error("JWT Error:", err.message);

        return res.status(401).json({

            success:false,
            message:"Invalid or expired token."

        });

    }

};


