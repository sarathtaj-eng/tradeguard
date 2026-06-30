// =====================================
// TradeGuard Activation Routes
// =====================================

const express = require("express");

const router = express.Router();


// =====================================
// Generate Activation Code
// =====================================

function generateActivationCode() {

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code = "TG-";

    for (let i = 0; i < 4; i++) {
        code += chars.charAt(
            Math.floor(Math.random() * chars.length)
        );
    }

    code += "-";

    for (let i = 0; i < 4; i++) {
        code += chars.charAt(
            Math.floor(Math.random() * chars.length)
        );
    }

    code += "-";

    for (let i = 0; i < 4; i++) {
        code += chars.charAt(
            Math.floor(Math.random() * chars.length)
        );
    }

    return code;

}


// =====================================
// Generate License Number
// =====================================

function generateLicenseNumber(id) {

    return "TG-LIC-" + String(id).padStart(8, "0");

}


// =====================================
// Generate EA ID
// =====================================

function generateEAID(id) {

    return "TG-EA-" + String(id).padStart(8, "0");

}


// =====================================
// Test API
// =====================================

router.get("/test", (req, res) => {

    res.json({

        success: true,

        message: "TradeGuard Activation API Working",

        sample: {

            activation_code: generateActivationCode(),

            license_number: generateLicenseNumber(1),

            ea_id: generateEAID(1)

        }

    });

});


// =====================================
// Export Router
// =====================================

module.exports = router;

