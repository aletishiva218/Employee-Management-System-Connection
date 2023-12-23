import bodyParser from "body-parser";
import express from "express";
import axios from "axios";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
dotenv.config();
const app = express()
const PORT = process.env.PORT;
const dirPath = fileURLToPath(import.meta.url)
const __dirname = path.dirname(dirPath)
const createPath = path.join(__dirname,"public/create.html")
const API_URL = "https://api-server-employees.onrender.com/";
let employeesData;
let response;
let employeeId;
let employeeData;
let params;
let filterObj;
let filterMiddleware = (req,res,next) => {
  try{
    if(req.body.position=="" && req.body.department=="")
    throw {"nofilter":"Specify your filter"};
    else if(req.body.position!="" && req.body.department!="")
    filterObj = {"department":req.body.department,"position":req.body.position}
    else if(req.body.position!="")
    filterObj = {"position":req.body.position}
    else 
    filterObj = {"department":req.body.department}
  next();
  }catch(error){
    res.render("searchbyfilters",{error})
  }
}
app.set("view engine","ejs")
app.use(bodyParser.urlencoded({extended:true}))
app.use(morgan("combined"))
app.use(helmet())

app.get("/",async (req,res)=>{
  response = await axios.get(API_URL);
  employeesData = response.data;
  res.render("index",{employeesData})
})

app.get("/searchbyid",(req,res)=>{
  res.render("searchbyId")
})
app.post("/searchbyid",async (req,res)=>{
  employeeId = req.body.id;
  response = await axios.get(API_URL+employeeId)
  employeeData = response.data;
  res.render("searchbyId",{employee:employeeData})
})

app.get("/searchbyfilter",(req,res)=>{
  res.render("searchbyfilters")
})
app.post("/searchbyfilter",filterMiddleware,async (req,res)=>{
  response = await axios.get(API_URL+"filter",{params:filterObj})
  res.render("searchbyfilters",{employees:response.data})
})
app.get("/create",(req,res)=>{
  res.sendFile(createPath)
})
app.post("/createemployee",async (req,res)=>{
  employeeData = req.body;
  params = new URLSearchParams();
  params.append("name",employeeData.name)
  params.append("position",employeeData.position)
  params.append("department",employeeData.department)
  params.append("salary",employeeData.salary)
  response = await axios.post(API_URL+"employee",params);
  employeeData = response.data;
  res.redirect("/")
})
app.post("/delete",async (req,res)=>{
  employeeId = req.body.id;
  response = await axios.delete(API_URL+"employee/"+employeeId);
  employeeData = response.data;
  res.redirect("/")
})
app.post("/update",async (req,res)=>{
  employeeId = req.body.id;
  response = await axios.get(API_URL+employeeId);
  employeeData = response.data;
  res.render("update",{employeeData})
})

app.post("/updateemployee",async (req,res)=>{
  employeeData = req.body;
  params = new URLSearchParams();
  params.append("name",employeeData.name)
  params.append("position",employeeData.position)
  params.append("department",employeeData.department)
  params.append("salary",employeeData.salary)
  response = await axios.put(API_URL+"employee/"+employeeId,params);
  employeeData = response.data;
  res.redirect("/")
})

app.listen(PORT,(req,res)=>{
    console.log(`Server is running on port ${PORT}`)
})