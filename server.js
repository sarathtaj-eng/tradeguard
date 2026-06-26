const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
require("dotenv").config();

// =====================================
// Admin Credentials
// =====================================

const ADMIN_USERNAME = "sarath";
const ADMIN_PASSWORD = "sarath";


const app = express();

app.use(cors());
app.use(express.json());

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

app.get("/users", async (req, res) => {

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

        // Login Success
        res.json({

            success: true,

            message: "Login successful.",

            token: "TEMP-TOKEN",

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

app.get("/contact-messages", async (req, res) => {

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
// Start Server
// =====================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log("======================================");
    console.log("🚀 TradeGuard Server Started");
    console.log("🌐 Port:", PORT);
    console.log("======================================");

});
