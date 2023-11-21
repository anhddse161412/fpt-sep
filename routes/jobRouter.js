const jobController = require("../controllers/jobController");

// router
const router = require("express").Router();

// use routers
// router.post("/create", jobController.createJob);

router
   .route("/")
   .get(jobController.paginationJob)
   .post(jobController.createJob);

// router.route("/page/job").get(jobController.paginationJob);

// router
//    .route("/subCategory/:subCategory")
//    .get(jobController.getJobBySubCategory);

router.route("/client/:clientId").get(jobController.getJobByClientId);

router.route("/favorite/add").post(jobController.addFavoriteJob);
router.route("/favorite/remove").delete(jobController.removeFavoriteJob);

router.route("/apply").post(jobController.applyJob);
router
   .route("/detail/:jobID")
   .get(jobController.getJobById)
   .put(jobController.updateJob)
   .delete(jobController.inactiveJob);

router
   .route("/subCategory/:subCategoryId")
   .get(jobController.paginationJobBySubCategoryId);

router.route("/close/:jobId").put(jobController.closeJob);

router.route("/extend/:jobId").put(jobController.extendJob);

router
   .route("/appointment/:clientId")
   .get(jobController.getJobHasAppointmentByClientId);

router
   .route("/recommended/:accountId")
   .get(jobController.recommendedJobForFreelancer);

router.route("/:jobName").get(jobController.paginationJobByName);
module.exports = router;
