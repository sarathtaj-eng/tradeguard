// =====================================
// TradeGuard Activation Routes
// =====================================

const express = require("express");
const { Pool } = require("pg");
const auth = require("./auth");

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
router.post("/generate-activation", auth, async (req, res) => {

    try {
// Logged-in user ID from JWT
const userID = req.user.id;

if(!userID){

    return res.status(400).json({

        success:false,

        message:"User ID missing."

    });

}

// Verify user exists
const userCheck = await pool.query(

    `SELECT id
     FROM users
     WHERE id = $1
     LIMIT 1`,

    [userID]

);

if(userCheck.rows.length === 0){

    return res.status(404).json({

        success:false,

        message:"User not found."

    });

}
    

        // Check whether the user already has a license
        const existing = await pool.query(

            `SELECT
                activation_code,
                license_number,
                ea_id
             FROM ea_licenses
             WHERE user_id = $1
             LIMIT 1`,

            [userID]

        );

        // Return the existing activation code if found
        if(existing.rows.length > 0){

            return res.json({

                success: true,

                activation_code: existing.rows[0].activation_code,

                license_number: existing.rows[0].license_number,

                ea_id: existing.rows[0].ea_id,

                existing: true

            });

        }

const client = await pool.connect();

try {

    await client.query("BEGIN");
         


// No existing license, so create one
const activationCode = generateActivationCode();

const result = await client.query(

    `INSERT INTO ea_licenses
    (
        user_id,
        activation_code
    )
    VALUES
    (
        $1,
        $2
    )
    RETURNING id`,

    [
        userID,
        activationCode
    ]

);

const id = result.rows[0].id;

const licenseNumber = generateLicenseNumber(id);

const eaID = activationCode;


await client.query(

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



     
    await client.query("COMMIT");

        res.json({

            success: true,

            activation_code: activationCode,

            license_number: licenseNumber,

            ea_id: eaID

        });

    

    } catch(err){

    await client.query("ROLLBACK");

    throw err;

} finally {

    client.release();
}
} catch(err){
    console.error(err);

    res.status(500).json({

        success:false,

        message:"Server Error"

    });

}
    
    

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

