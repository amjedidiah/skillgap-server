
const express = require('express');
const cors = require('cors');
const dbConnection = require('./config/dbConnect');
require("dotenv").config()
const userRouter = require("./routes/userRoutes");
const passportConfig = require('./utils/passport-config');
const cookieParser = require("cookie-parser")


const app = express();


const port = process.env.PORT || 7000


// cors configuration

const corsOptions = {
    origin:"*",
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Enable credentials (cookies, authorization headers, etc.)
}

//Middleware

app.use(express.json())
app.use(cors(corsOptions))
app.use(cookieParser())

 // Passport middleware

app.use(passportConfig.initialize())

// Routes
app.use("/api/v1/user",userRouter)

app.use((req, res, next) => {
    res.status(404).json({
        message:"route not found"
    })
})

app.use((err, req, res, next) => {
    const errorMessage = err.message
    // the stack proprty tells what area in the application the error happenz
    const stack = err.stack
res.status(500).json({
    message: errorMessage,
    stack
})

})




const connectDbAndServer = async function (params) {
    try {
        const db = await dbConnection()
        if (db){
            app.listen(port, function () {
                console.log(`db connected and server running on port ${port}`)
            }
            
            )
        }
    } catch (error) {
        console.log(error.message)
    }
}
connectDbAndServer()