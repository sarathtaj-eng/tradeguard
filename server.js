const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();
const app = express();

app.use(cors());
app.use(express.json());

const bcrypt = require("bcrypt");
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Create database tables
async function initializeDatabase(){

    try{
await pool.query(`
    CREATE TABLE IF NOT EXISTS users(
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
      

        await pool.query(`
            CREATE TABLE IF NOT EXISTS clients(
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                client_name VARCHAR(100) NOT NULL,
                mt5_account VARCHAR(50),
                broker VARCHAR(100),
                status VARCHAR(20) DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("✅ Database tables ready");

    }catch(err){

        console.error("❌ Database Initialization Error");
        console.error(err);

    }

}

pool.connect()
.then(async ()=>{

    console.log("✅ PostgreSQL Connected");

    await initializeDatabase();

})
.catch(err=>{

    console.error(err);

});

app.get("/",async(req,res)=>{

    const result=await pool.query("SELECT NOW()");

    res.json({
        message:"TradeGuard API Running",
        database:"Connected",
        time:result.rows[0].now
    });

});

// Get All Users
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

        res.json(result.rows);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Server Error"
        });

    }

});

// Register User
app.post("/register", async (req, res) => {

    try {

        const { username, email, password } = req.body;

        // Check empty fields
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Check if email already exists
        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

   
// Encrypt password
const passwordHash = await bcrypt.hash(password, 10);

// Create 21-day free trial
const trialStart = new Date();

const trialEnd = new Date();
trialEnd.setDate(trialEnd.getDate() + 21);

// Save user
await pool.query(
`
INSERT INTO users
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
)
`,
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
    message: "Registration successful. Your 21-day free trial has started."
});

} catch (err) {

    console.error(err);

    res.status(500).json({
        success: false,
        message: "Server Error"
    });

}

});
// One-time database update
app.get("/update-db", async (req, res) => {

    try {

        await pool.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS plan VARCHAR(30) DEFAULT 'FREE TRIAL';
        `);

        await pool.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'ACTIVE';
        `);

        await pool.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS trial_start TIMESTAMP;
        `);

        await pool.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS trial_end TIMESTAMP;
        `);

        res.json({
            success: true,
            message: "Database updated successfully"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

// Login User
app.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        const result = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );

        if(result.rows.length === 0){

            return res.status(401).json({
                success:false,
                message:"Invalid email or password"
            });

        }

        res.json({
            success:true,
            message:"User Found",
            user:result.rows[0]
        });

    }catch(err){

        console.error(err);

        res.status(500).json({
            success:false,
            message:"Server Error"
        });

    }

});



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🚀 Server Started");
});

        
