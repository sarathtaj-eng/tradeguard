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

// Test database connection
pool.connect()
.then(() => console.log("✅ PostgreSQL Connected"))
.catch(err => console.error("❌ Database Error:", err));

app.get("/", async (req, res) => {

    try{
        const result = await pool.query("SELECT NOW()");

        res.json({
            message:"TradeGuard API Running",
            database:"Connected",
            time:result.rows[0].now
        });

    }catch(err){

        res.status(500).json({
            database:"Disconnected",
            error:err.message
        });

    }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🚀 Server Started");
});
