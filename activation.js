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
    
});    

// =====================================
// Generate Activation Code
// =====================================
function generateActivationCode(prefix = "TG") {

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code = prefix + "-";

    for(let i=0;i<4;i++){
        code += chars.charAt(Math.floor(Math.random()*chars.length));
    }

    code += "-";

    for(let i=0;i<4;i++){
        code += chars.charAt(Math.floor(Math.random()*chars.length));
    }

    code += "-";

    for(let i=0;i<4;i++){
        code += chars.charAt(Math.floor(Math.random()*chars.length));
    }

    return code;

}

// =====================================
// Generate License Number
// =====================================

function generateLicenseNumber(id) {

    return "TG-LIC-" + String(id).padStart(8, "0");

}


async function createLicense(userID, role){

    const existing = await pool.query(

        `SELECT activation_code,license_number,ea_id
         FROM ea_licenses
         WHERE user_id=$1
         AND role=$2
         LIMIT 1`,

        [userID, role]

    );

    if(existing.rows.length>0){

        return {

            success:true,
            existing:true,
            activation_code:existing.rows[0].activation_code,
            license_number:existing.rows[0].license_number,
            ea_id:existing.rows[0].ea_id

        };

    }

    const client = await pool.connect();

    try{

        await client.query("BEGIN");

        const prefix = role==="MASTER" ? "TG-MST" : "TG-CLT";

        const activationCode = generateActivationCode(prefix);

        const result = await client.query(

            `INSERT INTO ea_licenses
            (
                user_id,
                activation_code,
                role
            )
            VALUES
            (
                $1,$2,$3
            )
            RETURNING id`,

            [userID,activationCode,role]

        );

        const id=result.rows[0].id;

        const licenseNumber=generateLicenseNumber(id);

        await client.query(

            `UPDATE ea_licenses
             SET
             license_number=$1,
             ea_id=$2
             WHERE id=$3`,

            [
                licenseNumber,
                activationCode,
                id
            ]

        );

        await client.query("COMMIT");

        return{

            success:true,
            activation_code:activationCode,
            license_number:licenseNumber,
            ea_id:activationCode

        };

    }catch(err){

        await client.query("ROLLBACK");
        throw err;

    }finally{

        client.release();

    }

}
// =====================================
// Generate EA ID
// =====================================


// =====================================
// Test API
// =====================================

router.get("/test", (req, res) => {

    const sampleCode = generateActivationCode();

    res.json({

        success: true,

        message: "TradeGuard Activation API Working",

        sample: {

            activation_code: sampleCode,

            license_number: generateLicenseNumber(1),

            ea_id: sampleCode

        }

    });

});




// =====================================
// Master API
// =====================================

router.post("/generate-master", auth, async(req,res)=>{

    try{

        const result = await createLicense(req.user.id,"MASTER");

        res.json(result);

    }catch(err){

        console.error(err);

        res.status(500).json({
            success:false,
            message:"Server Error"
        });

    }

});

// =====================================
// Client API
// =====================================

router.post("/generate-client", auth, async(req,res)=>{

    try{

        const result = await createLicense(req.user.id,"CLIENT");

        res.json(result);

    }catch(err){

        console.error(err);

        res.status(500).json({
            success:false,
            message:"Server Error"
        });

    }

});

// =====================================
// Export Router
// =====================================

module.exports = router;

