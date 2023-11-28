const systemValueController = require("../controllers/systemValueController");

// router
const router = require("express").Router();

// use routers

router
   .route("/fee")
   .get(systemValueController.getCommissionFee)
   .put(systemValueController.updateCommissionFee);
module.exports = router;
