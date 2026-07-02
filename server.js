
const adminAuth = require("./adminAuth");
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const auth = require("./auth");

const activationRoutes = require("./activation");
const eaUploadRoutes = require("./eaUpload");

// =====================================
// Admin Credentials
// =====================================

const ADMIN_USERNAME = "sarath";
const ADMIN_PASSWORD = "sarath";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", activationRoutes);
app.use("/api", eaUploadRoutes);
// PostgreSQL Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// =====================================
// Create Database Tables
// =====================================

async function initializeDatabase() {

    try {

        // Users Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                plan VARCHAR(30) DEFAULT 'FREE TRIAL',
                account_status VARCHAR(20) DEFAULT 'ACTIVE',
                trial_start TIMESTAMP,
                trial_end TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Clients Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS clients (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                client_name VARCHAR(100) NOT NULL,
                mt5_account VARCHAR(50),
                broker VARCHAR(100),
                status VARCHAR(20) DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Contact Messages Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS contact_messages (
                id SERIAL PRIMARY KEY,
                fullname VARCHAR(100) NOT NULL,
                email VARCHAR(255) NOT NULL,
                subject VARCHAR(200) NOT NULL,
                message TEXT NOT NULL,
                status VARCHAR(20) DEFAULT 'NEW',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

// =====================================
// EA Licenses Table
// =====================================

await pool.query(`
CREATE TABLE IF NOT EXISTS ea_licenses (

    id SERIAL PRIMARY KEY,

    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,

    activation_code VARCHAR(50) UNIQUE NOT NULL,
    license_number VARCHAR(50) UNIQUE,

    ea_id VARCHAR(50) UNIQUE,

    role VARCHAR(20) DEFAULT 'NONE',

    status VARCHAR(20) DEFAULT 'NOT_ACTIVATED',

    subscription VARCHAR(30) DEFAULT 'FREE TRIAL',

    mt5_account VARCHAR(50),

    broker VARCHAR(100),

    terminal_id VARCHAR(100),

    ea_version VARCHAR(20),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    activated_at TIMESTAMP,


expiry_date TIMESTAMP,

last_online TIMESTAMP
   


);

`);

     await pool.query(`
ALTER TABLE ea_licenses
ADD COLUMN IF NOT EXISTS license_number VARCHAR(50) UNIQUE;
`);

await pool.query(`
ALTER TABLE ea_licenses
ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP;
`);   
        console.log("✅ Database tables ready");

    } catch (err) {

        console.error("❌ Database Initialization Error");
        console.error(err);

    }

}

// Connect Database
pool.connect()
.then(async () => {

    console.log("✅ PostgreSQL Connected");

    await initializeDatabase();

})
.catch(err => {

    console.error(err);

});
// =====================================
// Root API
// =====================================

app.get("/", async (req, res) => {

    try {

        const result = await pool.query("SELECT NOW()");

        res.json({
            success: true,
            message: "TradeGuard API Running",
            database: "Connected",
            time: result.rows[0].now
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Database Error"
        });

    }

});


// =====================================
// Get All Users
// =====================================
app.get("/users", adminAuth, async (req, res) => {


    try {

        const result = await pool.query(`
            SELECT
                id,
                username,
                email,
                plan,
                account_status,
                trial_start,
                trial_end,
                created_at
            FROM users
            ORDER BY id DESC
        `);

        res.json({
            success: true,
            total: result.rows.length,
            users: result.rows
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

});
// =====================================
// Register User
// =====================================

app.post("/register", async (req, res) => {

    try {

        const { username, email, password } = req.body;

        // Validate Input
        if (!username || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });

        }

        // Check Existing User
        const existingUser = await pool.query(

            "SELECT id FROM users WHERE email = $1",

            [email]

        );

        if (existingUser.rows.length > 0) {

            return res.status(400).json({

                success: false,
                message: "Email already registered."

            });

        }

        // Encrypt Password
        const passwordHash = await bcrypt.hash(password, 10);

        // Free Trial Dates
        const trialStart = new Date();

        const trialEnd = new Date();

        trialEnd.setDate(trialEnd.getDate() + 21);

        // Save User
        await pool.query(

            `INSERT INTO users
            (
                username,
                email,
                password_hash,
                plan,
                account_status,
                trial_start,
                trial_end
            )
            VALUES
            (
                $1,$2,$3,$4,$5,$6,$7
            )`,

            [
                username,
                email,
                passwordHash,
                "FREE TRIAL",
                "ACTIVE",
                trialStart,
                trialEnd
            ]

        );

        res.json({

            success: true,
            message: "Registration successful.",
            trial_start: trialStart,
            trial_end: trialEnd

        });

    } catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,
            message: "Server Error"

        });

    }

});
// =====================================
// Login User
// =====================================

app.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        // Validate Input
        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });

        }

        // Find User
        const result = await pool.query(

            "SELECT * FROM users WHERE email = $1",

            [email]

        );

        if (result.rows.length === 0) {

            return res.status(401).json({

                success: false,
                message: "Invalid email or password."

            });

        }

        const user = result.rows[0];

        // Verify Password
        const validPassword = await bcrypt.compare(

            password,

            user.password_hash

        );

        if (!validPassword) {

            return res.status(401).json({

                success: false,
                message: "Invalid email or password."

            });

        }

        // Check Account Status
        if (user.account_status !== "ACTIVE") {

            return res.status(403).json({

                success: false,
                message: "Your account is not active."

            });

        }
// Create JWT Token

const token = jwt.sign(

    {

        id: user.id,
        email: user.email

    },

    process.env.JWT_SECRET,

    {

        expiresIn: "7d"

    }

);

// Login Success

res.json({

    success: true,

    message: "Login successful.",

    token: token,

    user: {

        id: user.id,
        username: user.username,
        email: user.email,
        plan: user.plan,
        account_status: user.account_status,
        trial_start: user.trial_start,
        trial_end: user.trial_end,
        created_at: user.created_at

    }

});
       

    } catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,
            message: "Server Error"

        });

    }

});
// =====================================
// Reset Password
// =====================================

app.post("/reset-password", async (req, res) => {

    try {

        const { email, newPassword } = req.body;

        // Validate Input
        if (!email || !newPassword) {

            return res.status(400).json({
                success: false,
                message: "Email and new password are required."
            });

        }

        // Check User Exists
        const result = await pool.query(

            "SELECT id FROM users WHERE email = $1",

            [email]

        );

        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,
                message: "User not found."

            });

        }

        // Encrypt New Password
        const passwordHash = await bcrypt.hash(newPassword, 10);

        // Update Password
        await pool.query(

            "UPDATE users SET password_hash = $1 WHERE email = $2",

            [passwordHash, email]

        );

        res.json({

            success: true,
            message: "Password reset successfully."

        });

    } catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,
            message: "Server Error"

        });

    }

});

// =====================================
// Admin Login
// =====================================

app.post("/admin-login", async (req, res) => {

    try {

        const { username, password } = req.body;

        if (!username || !password) {

            return res.status(400).json({
                success: false,
                message: "Username and password are required."
            });

        }

        if (
            username !== ADMIN_USERNAME ||
            password !== ADMIN_PASSWORD
        ) {

            return res.status(401).json({
                success: false,
                message: "Invalid administrator credentials."
            });

        }
// Create Admin JWT
const token = jwt.sign(

    {

        username: ADMIN_USERNAME,
        role: "admin"

    },

    process.env.JWT_SECRET,

    {

        expiresIn: "7d"

    }

);

// Login Success
res.json({

    success: true,

    message: "Administrator login successful.",

    token: token,

    admin: {

        username: ADMIN_USERNAME,
        role: "admin"

    }

});
       

    } catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,
            message: "Server Error"

        });

    }

});





// =====================================
// Contact Form
// =====================================

app.post("/contact", async (req, res) => {

    try {

        const { fullname, email, subject, message } = req.body;

        // Validate Input
        if (!fullname || !email || !subject || !message) {

            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });

        }

        // Save Message
        await pool.query(

            `INSERT INTO contact_messages
            (
                fullname,
                email,
                subject,
                message
            )
            VALUES
            (
                $1, $2, $3, $4
            )`,

            [
                fullname,
                email,
                subject,
                message
            ]

        );

        res.json({

            success: true,
            message: "Your message has been sent successfully."

        });

    } catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,
            message: "Server Error"

        });

    }

});

// =====================================
// Get All Contact Messages (Admin)
// =====================================


app.get("/contact-messages", adminAuth, async (req, res) => {
    try {

        const result = await pool.query(

            `SELECT *
             FROM contact_messages
             ORDER BY created_at DESC`

        );

        res.json({

            success: true,
            total: result.rows.length,
            messages: result.rows

        });

    } catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,
            message: "Server Error"

        });

    }

});
// =====================================
// Admin Dashboard Statistics
// =====================================


app.get("/admin-stats", adminAuth, async (req, res) => {
    try {

        const totalUsers = await pool.query(
            "SELECT COUNT(*) FROM users"
        );

        const freeTrial = await pool.query(
            "SELECT COUNT(*) FROM users WHERE plan='FREE TRIAL'"
        );

        const paidUsers = await pool.query(
            "SELECT COUNT(*) FROM users WHERE plan<>'FREE TRIAL'"
        );

        const messages = await pool.query(
            "SELECT COUNT(*) FROM contact_messages"
        );

        res.json({

            success: true,

            totalUsers: Number(totalUsers.rows[0].count),

            freeTrialUsers: Number(freeTrial.rows[0].count),

            paidUsers: Number(paidUsers.rows[0].count),

            totalMessages: Number(messages.rows[0].count)

        });

    } catch(err){

        console.error(err);

        res.status(500).json({

            success:false,

            message:"Server Error"

        });

    }

});

// =====================================
// EA Licenses Table Info (Temporary)
// =====================================
app.get("/table-info", adminAuth, async (req, res) => {


    try {

        const result = await pool.query(`
            SELECT
                column_name,
                data_type
            FROM information_schema.columns
            WHERE table_name = 'ea_licenses'
            ORDER BY ordinal_position
        `);

        res.json(result.rows);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});




// =====================================
// Start Server
// =====================================

const PORT = process.env.PORT || 3000;

// =====================================
// Delete All EA Licenses (Temporary)
// =====================================


app.get("/clear-licenses", adminAuth, async (req, res) => {
    try{

        await pool.query("DELETE FROM ea_licenses");

        res.json({
            success: true,
            message: "All EA licenses deleted."
        });

    }catch(err){

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

// =====================================
// Search Client EA
// =====================================

app.post("/api/client/search", auth, async (req, res) => {

    try{

        const { eaID } = req.body;

        if(!eaID){

            return res.status(400).json({
                success:false,
                message:"EA ID is required."
            });

        }
const result = await pool.query(
    `SELECT
        id,
        user_id,
        ea_id,
        activation_code,
        license_number,
        role,
        status,
        subscription,
        mt5_account,
        broker,
        expiry_date,
        last_online
    FROM ea_licenses
    WHERE ea_id = $1`,
    [eaID]
);
     
if(result.rows.length === 0){

    return res.status(404).json({
        success:false,
        message:"Client EA not found."
    });

}
const client = result.rows[0];

// Prevent adding your own MASTER EA
if(
    client.user_id === req.user.id &&
    client.role === "MASTER"
){

    return res.status(400).json({
        success:false,
        message:"You cannot add your own MASTER EA as a client."
    });

}
res.json({
    success:true,
    client:client
});



        
// Get the client record
const client = result.rows[0];

// Prevent adding your own EA
if(client.user_id === req.user.id){

    return res.status(400).json({
        success:false,
        message:"You cannot add your own EA as a client."
    });

}

// Success
res.json({
    success:true,
    client:client
});
       

    }catch(err){

        console.error(err);

        res.status(500).json({
            success:false,
            message:"Server Error"
        });

    }

});

app.listen(PORT, () => {

    console.log("======================================");
    console.log("🚀 TradeGuard Server Started");
    console.log("🌐 Port:", PORT);
    console.log("======================================");

});
