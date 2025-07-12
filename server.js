require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const connectDB = require("./db.js");
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173','https://classified-tan.vercel.app/'],
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
   allowedHeaders: ['Content-Type','Authorization'],
  credentials: true
}));

connectDB();


const categoryRoutes = require("./Category/Categories");
const postRoute = require("./post/PostRoute");
const formConfigRoutes=require("./fields/formConfigRoutes")
const UserRoute=require("./user/UserRoute.js")
const statisticsRoute=require("./post/PostStatistic.js")
const paymentRoute=require("./payment/PremiumPayment.js")
app.use("/", categoryRoutes);
app.use("/", postRoute);
app.use("/", formConfigRoutes);
app.use("/",UserRoute)
app.use("/",statisticsRoute)
app.use("/",paymentRoute)

app.listen(3001, (err) => {
  if (err) throw err;
  console.log('> Ready on http://localhost:3001');
});
