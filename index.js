import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './database/db.js';

import cors from 'cors'

dotenv.config()



const app = express()
const port = process.env.PORT || 3000
// using middlewares


// It means the data we will send from frontend will be in the form of json.
app.use(express.json())
app.use(cors({
   origin:"https://elearning-frontend-blush.vercel.app",
  methods:"GET, POST, PUT, DELETE",
  credentials: true,
}))
// now we can do cross request


// for home page
app.get("/", (req, res)=>{
  res.status(200).json({message: "Server started"})
})

// importing routes
import userRoutes from './routes/user.js'
import courseRoutes from "./routes/course.js"
import adminRoutes from "./routes/admin.js"


app.use("/uploads", express.static("uploads"))
// using routes
app.use("/api", userRoutes)
app.use("/api", courseRoutes)
// we want to create course and the courses can only be created by admin.
app.use("/api", adminRoutes)



app.listen(port, ()=>{
  console.log(`Server is running on http://localhost:${port}`)
  connectDB();
})
