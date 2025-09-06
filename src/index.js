import express from "express";
import dotenv from "dotenv";
import cors from "cors"
import pool from "./db_config/db.js"
import userRouter from "./routes/user.routes.js";
import cookieParser from "cookie-parser";
import passport from "passport";
import { githubStrategy } from "./configs/github.passport.js";

const app=express();
dotenv.config()

//github setup
passport.use(githubStrategy);
app.use(passport.initialize());

//Middlewares
app.use(cors({
  origin: [
    "https://bug-tracker-one-eta.vercel.app",
    "http://localhost:5174"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

app.use(express.json({limit:"16kb"}))     //when you are filling form data, we are allowing that to be accepted.
app.use(express.urlencoded({extended:true,limit:"16kb"}))   //url encoded format data.
app.use(express.static("public"));  //To access public assets, need not necessary public any name can be given
app.use(cookieParser())  //To access cookies from user's browser and make edits as well.

//Error middlewares
app.get("/", (req, res) => {
  res.send("Server is up and he he running!" );
});


//routes
app.use("/api/v1/users",userRouter)
app.get("/postgresCheck",async(req,res) => {
  const result=await pool.query("SELECT current_database()");
  console.log(result)
  res.send(`The databse name is : ${result.rows[0].current_database}`);
})

app.listen(process.env.PORT,()=>{
    console.log(`server is runnning on http://localhost:${process.env.PORT}`)
})
