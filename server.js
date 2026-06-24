const express = require("express");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
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

        // Save user
        await pool.query(
            `INSERT INTO users(username,email,password_hash)
             VALUES($1,$2,$3)`,
            [username, email, passwordHash]
        );

        res.json({
            success: true,
            message: "User registered successfully"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

});
const PORT=process.env.PORT||3000;

app.listen(PORT,()=>{

    console.log("🚀 Server Started");

});
