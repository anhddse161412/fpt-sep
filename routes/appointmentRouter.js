// import controllers review, products
const AppointmentController = require("../controllers/appointmentController");

// router
const router = require("express").Router();
// router.post("/create", AppointmentController.createAppointment);

router
   .route("/")
   .get(AppointmentController.getAllAppointment)
   .post(AppointmentController.createAppointment);

router
   .route("/detail/:appointmentId")
   .get(AppointmentController.getAppointmentById)
   .put(AppointmentController.updateAppointment);

router.route("/job/:jobId").get(AppointmentController.getAppointmentByJobId);
router
   .route("/freelancer/:freelancerId")
   .get(AppointmentController.getAppointmentByFreelancerId);
router
   .route("/client/:clientId")
   .get(AppointmentController.getAppointmentByClientId);

module.exports = router;
