// import controllers review, products
const jobController = require("../controllers/jobController");

// router
const router = require("express").Router();

// use routers
router.post("/create", jobController.createJob);

router.route("/").get(jobController.getAllJob);
router.route("/page/job").get(jobController.paginationJob);
router
   .route("/subCategory/:subCategory")
   .get(jobController.getJobBySubCategory);

router.route("/client/:jobID").get(jobController.getJobWithClientId);

router.route("/favorite").post(jobController.addFavoriteJob);
router.route("/apply").post(jobController.applyJob);
router
   .route("/detail/:jobID")
   .get(jobController.getJobById)
   .post(jobController.updateJob);
module.exports = router;
