const jobController = require("../controllers/jobController");

// router
const router = require("express").Router();

// use routers
router.post("/create", jobController.createJob);

router.route("/").get(jobController.paginationJob);
// router.route("/page/job").get(jobController.paginationJob);

// router
//    .route("/subCategory/:subCategory")
//    .get(jobController.getJobBySubCategory);

router.route("/client/:clientId").get(jobController.getJobByClientId);

router.route("/favorite/add").post(jobController.addFavoriteJob);
router.route("/favorite/remove").post(jobController.removeFavoriteJob);

router.route("/apply").post(jobController.applyJob);
router
   .route("/detail/:jobID")
   .get(jobController.getJobById)
   .post(jobController.updateJob)
   .delete(jobController.inactiveJob);

router
   .route("/subCategory/:subCategoryId")
   .get(jobController.paginationJobBySubCategoryId);

module.exports = router;
