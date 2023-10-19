var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
const cron = require("node-cron");
const route = require("./routes/Route");
var passport = require("passport");
var session = require("express-session");

// job controller
var jobController = require("./controllers/jobController");

const swaggerUI = require("swagger-ui-express");
const swaggerFile = require("./swagger_output.json");

const connection = require("./config/db");
var app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(function (req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
   );
   next();
});

app.use(
   session({
      secret: "mysecret",
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false },
   })
);

app.use(passport.initialize());
app.use(passport.session());

// swagger
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerFile));

//

cron.schedule("0 0 * * *", function () {
   console.log("---------------------");
   //will run every day at 00:00 AM
   jobController.checkJobEndDate();
});

// router
app.use("/", route);

// view
app.set("view engine", "ejs");

connection.connect(function (err) {
   if (err) {
      return console.error("error: " + err.message);
   }

   console.log("Connected to the MySQL server.");
});

module.exports = app;
