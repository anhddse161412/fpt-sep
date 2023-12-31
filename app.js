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
var applicationController = require("./controllers/applicationController")

const swaggerUI = require("swagger-ui-express");
const swaggerFile = require("./swagger_output.json");

const connection = require("./config/db");
var app = express();

app.use(cors());
app.use((req, res, next) => {
   // res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
   // const allowedOrigins = [
   //    "http://localhost:3000",
   //    "https://fpt-sep.vercel.app",
   // ];
   // const origin = req.headers.origin;
   // if (allowedOrigins.includes(origin)) {
   //    res.setHeader("Access-Control-Allow-Origin", origin);
   // }
   res.setHeader("Access-Control-Allow-Origin", "*");
   res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE"
   );
   res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Content-Type-Options, Accept, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
   );
   res.setHeader("Access-Control-Allow-Credentials", true);
   res.setHeader("Access-Control-Allow-Private-Network", true);
   //  Firefox caps this at 24 hours (86400 seconds). Chromium (starting in v76) caps at 2 hours (7200 seconds). The default value is 5 seconds.
   res.setHeader("Access-Control-Max-Age", 7200);

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

// socket
const httpServer = createServer(app);
const io = new Server(httpServer, {
   /* options */
   cors: {
      origin: "*",
   },
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "js")));

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
            data.notificationDescription,
            data.context
         );
         const account = getUser(accountId);
         io.to(account.socketId).emit("getNotification", {
            notification: notification,
         });
      } catch (error) {
         console.error(error);
      }
   });

   socket.on("disconnect", () => {
      console.log(`user id ${socket.id} disconnected`);
      removeUser(socket.id);
   });
});

httpServer.listen(3001);

// swagger
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerFile));

//

cron.schedule("0 0 * * *", function () {
   console.log("----------checkJobEndDate-----------");
   //will run every day at 00:00 AM
   jobController.checkJobEndDate();
});

cron.schedule("1 0 * * *", function () {
   console.log("----------checkFeePaymentDeadline-----------");
   //will run every day at 00:01 AM
   feePaymentController.checkFeePaymentDeadline();
});

cron.schedule("0 * * * *", function () {
   console.log("----------declineCloseJobApplication-----------");
   //will run every hour
   applicationController.declineCloseJobApplication();
})

cron.schedule("0,30 * * * *", function () {
   console.log("----------removeRecommendData-----------");
   //will run every 30 minutes
   recommendPointController.removeRecommendData();
});

cron.schedule("1,31 * * * *", function () {
   console.log("----------createDataForFreelancer-----------");
   //will run every 30 minutes
   recommendPointController.createDataForFreelancer();
});

cron.schedule("2,32 * * * *", function () {
   console.log("---------recommendationApplicationForJob------------");
   //will run every 30 minutes
   recommendPointController.recommendationApplicationForJob();
   console.log("---------recommendationForFreelancer------------");
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
