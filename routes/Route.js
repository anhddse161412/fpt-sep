const express = require("express");

let router = express();
var accountsRouter = require("./accountRouter");
var categoryRouter = require("./categoryRouter");
var subCategoryRouter = require("./subCategoryRouter");
var jobRouter = require("./jobRouter");
var skillRouter = require("./skillRouter");

router.use("/accounts", accountsRouter);
router.use("/category", categoryRouter);
router.use("/subCategory", subCategoryRouter);
router.use("/job", jobRouter);
router.use("/skill", skillRouter);

module.exports = router;
