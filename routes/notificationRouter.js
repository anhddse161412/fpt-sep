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
   .get(notificationController.getNotificationByAccountId);

router.route("/delete/:id").delete(notificationController.deleteNotification);
module.exports = router;
