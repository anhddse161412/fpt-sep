const express = require("express");

let router = express();
var accountsRouter = require("./accountRouter");
var categoryRouter = require("./categoryRouter");
var subCategoryRouter = require("./subCategoryRouter");
var jobRouter = require("./jobRouter");
var skillRouter = require("./skillRouter");
var freelancerRouter = require("./freelancerRouter");
var clientRouter = require("./clientRouter");
var proposalRouter = require("./proposalRouter");
var AppointmentRouter = require("./appointmentRouter");
var CertificateRouter = require("./certificateRouter");
var PaymentRouter = require("./paymentRouter");
var NotificationRouter = require("./notificationRouter");

router.use("/accounts", accountsRouter);
router.use("/category", categoryRouter);
router.use("/subCategory", subCategoryRouter);
router.use("/job", jobRouter);
router.use("/skill", skillRouter);
router.use("/freelancer", freelancerRouter);
router.use("/client", clientRouter);
router.use("/proposal", proposalRouter);
router.use("/appointment", AppointmentRouter);
router.use("/certificate", CertificateRouter);
router.use("/payment", PaymentRouter);
router.use("/notification", NotificationRouter);
module.exports = router;
