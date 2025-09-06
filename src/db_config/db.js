import pkg from "pg" //Pool is not allowed to be extracted directly
const { Pool } = pkg;
import dotenv from "dotenv"

dotenv.config()

const pool=new Pool({
    user:process.env.USER,
    host:process.env.HOST,
    database:process.env.DATABASE,
    password:process.env.PASSWORD,
    port: process.env.DBPORT,
})

pool.on("connect",() => {
    console.log("Connection pool established with Database");
});

export default pool;