// import controllers review, products
const freelancerController = require("../controllers/freelancerController");

// router
const router = require("express").Router();

// use routers
router.route("/").get(freelancerController.getAllFreelancer);
router
   .route("/profile/:accountId")
   .get(freelancerController.getFreelancerById)
   .post(freelancerController.updateFreelancerAccount);

// update specific field
// introduction
router
   .route("/introduction/:freelancerId")
   .post(freelancerController.updateIntroduction);

// hoursPerWeek
router.route("/hoursPerWeek/:freelancerId")
   .post(freelancerController.updateHoursPerWeek)

// major
router.route("/major/:freelancerId")
   .post(freelancerController.updateMajor)

// basic info
router.route("/basicInfo/:freelancerId")
   .post(freelancerController.updateBasicInfo)

// image and name
router.route("/nameImage/:freelancerId")
   .post(freelancerController.updateNameAndImage)

// skill set
router.route("/skills/:freelancerId")
   .post(freelancerController.updateSkillSet)

// languages
router
   .route("/languages/:freelancerId")
   .get(freelancerController.getLanguagesByFreelancer)
   .post(freelancerController.addLanguages)
   .put(freelancerController.updateLanguages)

// delete language
router
   .route("./language/:languageId")
   .delete(freelancerController.deleteLanguages);


module.exports = router;
