import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js' 
import connectCloudinary from './config/cloudinary.js' 
import userrouter from './routes/userRoute.js'
import adminRouter from './routes/adminRoute.js'
import eventrouter from './routes/eventRoutes.js'
import cloudinaryConfig from './config/cloudinaryConfig.js';
//app config
const app= express()
const port=process.env.PORT || 4000
connectDB()
connectCloudinary() 

//middleware 
app.use(express.json())
app.use(cors())

app.use('/api/user', userrouter)
app.use('/api/event/',eventrouter)
app.use('/api/admin', adminRouter);
app.get('/',(req,res)=>{
    res.send('api working')

})

app.listen(port, ()=> console.log("server started",port))