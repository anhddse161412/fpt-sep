var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
const cron = require("node-cron");
const route = require("./routes/Route");
var passport = require("passport");
var session = require("express-session");
const { createServer } = require("http");
const { Server } = require("socket.io");

// model
const db = require("./models");
const Account = db.accounts;
const Notification = db.notifications;
// Controller
var notificaitonController = require("./controllers/notificationController");
var jobController = require("./controllers/jobController");
var recommendPointController = require("./controllers/recommendPointController");
var feePaymentController = require("./controllers/feePaymentController");

const swaggerUI = require("swagger-ui-express");
const swaggerFile = require("./swagger_output.json");

const connection = require("./config/db");
var app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "js")));
app.use(function (req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
   );
   next();
});

// socket
const httpServer = createServer(app);
const io = new Server(httpServer, {
   /* options */
   cors: {
      // url of connector here
      origin: "http://localhost:3000",
   },
});

let onlineUsers = [];

const addNewUser = (accountId, socketId) => {
   !onlineUsers.some((user) => user.accountId === accountId) &&
      onlineUsers.push({ accountId, socketId });
};

const removeUser = (socketId) => {
   onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (accountId) => {
   return onlineUsers.find((user) => user.accountId === accountId);
};

io.on("connection", (socket) => {
   console.log(`user id ${socket.id} connected`);

   socket.on("newUser", (accountId) => {
      addNewUser(accountId, socket.id);
   });

   socket.on("sendNotification", async (data, accountId) => {
      try {
         let notification = await notificaitonController.createNotificationInfo(
         accountId,
            data.notificationName,
            data.notificationDescription
         );
         const account = getUser(accountId);
         io.to(account.socketId).emit("getNotification", {
            notification: notification,
         });
      } catch (error) {
         console.log(error);
      }
   });

   socket.on("disconnect", () => {
      console.log(`user id ${socket.id} disconnected`);
      removeUser(socket.id);
   });
});

httpServer.listen(3001);

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

cron.schedule("1 0 * * *", function () {
   console.log("---------------------");
   //will run every day at 00:01 AM
   feePaymentController.checkFeePaymentDeadline();
});

cron.schedule("0 * * * *", function () {
   console.log("---------------------");
   //will run every hour
   recommendPointController.createDataForFreelancer();
});

cron.schedule("1 * * * *", function () {
   console.log("---------------------");
   //will run every hour
   recommendPointController.createApplicationDataRecommend();
});

cron.schedule("2 * * * *", function () {
   console.log("---------------------");
   //will run every hour
   recommendPointController.recommendationApplicationForJob();
   recommendPointController.recommendationForFreelancer();
});

// router
app.get("/", (req, res) => {
   res.status(200).send("hello");
});
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
