const notificationController = require("../controllers/notificationController");

// router
const router = require("express").Router();

// use routers

router
   .route("/")
   .get(notificationController.getAllNotification)
   .post(notificationController.createNotification);

router
   .route("/account/:accountId")
   .get(notificationController.getAllNotificationByAccountId)
   .put(notificationController.markAsReadAllNotification);

router
   .route("/:id")
   .get(notificationController.getNotificationById)
   .put(notificationController.markAsReadNotification);
module.exports = router;
