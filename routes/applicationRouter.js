// import controllers review, products
const applicationController = require("../controllers/applicationController");

// router
const router = require("express").Router();
// router.post("/create", applicationController.createApplication);

router
   .route("/")
   .get(applicationController.getAllApplication)
   .post(applicationController.createApplication);

router
   .route("/approve/:applicationId")
   .put(applicationController.approveApplication);
router
   .route("/decline/:applicationId")
   .put(applicationController.declineApplication);
router
   .route("/interview/:applicationId")
   .put(applicationController.interviewApplication);

router
   .route("/detail/:applicationId")
   .get(applicationController.getApplicationById)
   .put(applicationController.updateApplication);

router.route("/job/:jobId").get(applicationController.getApplicationByJobId);
router
   .route("/freelancer/:freelancerId")
   .get(applicationController.getApplicationByFreelancerId);
router
   .route("/client/:clientId")
   .get(applicationController.getApplicationByClientId);
router
   .route("/recommended/:jobId")
   .get(applicationController.getRecommendApplicationByJobId);

module.exports = router;
