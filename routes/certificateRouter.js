// import controllers review, products
const certificateController = require("../controllers/certificateController");

// router
const router = require("express").Router();

// use routers
router.post("/create", certificateController.createCertificate);
// router.route("/").get(certificateController.getAllCertificate);

router
   .route("/freelancer/:freelancerId")
   .get(certificateController.getCertificateByFreelancerId);

router
   .route("/detail/:certificateId")
   .get(certificateController.getCertificateById)
   .post(certificateController.updateCertificate)
   .delete(certificateController.removeCertificate);

module.exports = router;
