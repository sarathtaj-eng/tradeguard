// =====================================
// TradeGuard JWT Authentication
// =====================================

const jwt = require("jsonwebtoken");

module.exports = function(req, res, next) {

    try {

        // Get Authorization Header
        const authHeader = req.headers.authorization;

        if (!authHeader) {

            return res.status(401).json({

                success: false,
                message: "Authorization token missing."

            });

        }

        // Check Bearer Format
        if (!authHeader.startsWith("Bearer ")) {

            return res.status(401).json({

                success: false,
                message: "Invalid authorization format."

            });

        }

        // Extract Token
        const token = authHeader.split(" ")[1];

        // Verify JWT
        const decoded = jwt.verify(

            token,

            process.env.JWT_SECRET

        );

        // Save Logged-in User
        req.user = decoded;

        next();

    } catch (err) {

        return res.status(401).json({

            success: false,
            message: "Invalid or expired token."

        });

    }

};
