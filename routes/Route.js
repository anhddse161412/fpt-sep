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
module.exports = router;
