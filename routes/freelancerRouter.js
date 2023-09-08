// import controllers review, products
const freelancerController = require("../controllers/freelancerController");

// router
const router = require("express").Router();

// use routers
router.route("/").get(freelancerController.getAllFreelancer);
router
   .route("/profile/:freelancerId")
   .get(freelancerController.getFreelancerById)
   .post(freelancerController.updateFreelancerAccount);
module.exports = router;
