require('dotenv').config()
require("./post/updatePosts.js")
require("./post/deletePosts.js")
const express = require('express');
const connectDB = require("./db.js");
const cors = require('cors');
const registerRoutes = require("./routes/routes.js");
const app = express();
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://classified-tan.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

connectDB();


registerRoutes(app);

app.listen(3001, (err) => {
  if (err) throw err;
  console.log('> Ready on http://localhost:3001');
});
