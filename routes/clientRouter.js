// import controllers review, products
const clientController = require("../controllers/clientController");

// router
const router = require("express").Router();

// use routers
router.route("/").get(clientController.getAllClient);
router
   .route("/profile/:clientId")
   .get(clientController.getClientById)
   .post(clientController.updateClientAccount);
module.exports = router;
