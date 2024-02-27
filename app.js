const express = require("express");
const cors = require("cors");
const dbConnection = require("./config/dbConnect");
require("dotenv").config();
const userRouter = require("./routes/userRoutes");
const passportConfig = require("./utils/passport-config");
const cookieParser = require("cookie-parser");
const { engine } = require("express-handlebars");
const path = require("path");
const createContestRouter = require("./routes/createContestRoute");

const app = express();

const port = process.env.PORT || 7000;

// Configure Express Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set('views', './views');

// // Set views directory
// app.set('views', path.join(__dirname, 'utils', 'emailTemplate'));

// cors configuration
const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Enable credentials (cookies, authorization headers, etc.)
};

//Middleware

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

// Passport middleware

app.use(passportConfig.initialize());

// Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/contest", createContestRouter);
app.get("/", (req, res) => {
  res.status(200).json({
    message:"server runing successfully"
  })
})

app.use((req, res, next) => {
  res.status(404).json({
    message: "route not found",
  });
});

app.use((err, req, res, next) => {
  const errorMessage = err.message;
  // the stack proprty tells what area in the application the error happenz
  const stack = err.stack;
  res.status(500).json({
    message: errorMessage,
    stack,
  });
});

const connectDbAndServer = async function (params) {
  try {
    const db = await dbConnection();
    if (db) {
      app.listen(port, function () {
        console.log(`db connected and server running on port ${port}`);
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};
connectDbAndServer();
