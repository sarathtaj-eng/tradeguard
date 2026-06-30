// =====================================
// TradeGuard Activation Routes
// =====================================

const express = require("express");
const { Pool } = require("pg");

const router = express.Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});
// =====================================
// Generate Activation Code
// =====================================

router.post("/generate-activation", async (req, res) => {

    try {

        const activationCode = generateActivationCode();

        const result = await pool.query(

            `INSERT INTO ea_licenses
            (
                activation_code
            )
            VALUES
            (
                $1
            )
            RETURNING id`,

            [activationCode]

        );

        const id = result.rows[0].id;

        const licenseNumber = generateLicenseNumber(id);

        const eaID = generateEAID(id);

        await pool.query(

            `UPDATE ea_licenses

            SET

            license_number = $1,

            ea_id = $2

            WHERE id = $3`,

            [
                licenseNumber,
                eaID,
                id
            ]

        );

        res.json({

            success: true,

            activation_code: activationCode,

            license_number: licenseNumber,

            ea_id: eaID

        });

    }
    catch(err){

        console.error(err);

        res.status(500).json({

            success:false,

            message:"Server Error"

        });

    }

});

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

