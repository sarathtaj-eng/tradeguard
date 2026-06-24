const express = require("express");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
app.use(express.json());

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

const PORT=process.env.PORT||3000;

app.listen(PORT,()=>{

    console.log("🚀 Server Started");

});
