const paymentController = require("../controllers/paymentController");

// router
const router = require("express").Router();

// use routers
router
   .route("/")
   .get(paymentController.getAllPayment)
   .post(paymentController.createPayment);

router.route("/client/:clientId").get(paymentController.getPaymentByClientId);

router.route("/refund").get(paymentController.getRequestRefundPayment);

router.route("/refund/:clientId").post(paymentController.requestRefundPayemnt);

router
   .route("/refund/approved")
   .get(paymentController.getListApprovedRefundPayment);

router
   .route("/refund/approve/:paymentId")
   .put(paymentController.approveRefundRequest);

router.route("/vnpay").post(paymentController.createVnpayUrl);

router.route("/momo").post(paymentController.createMomoUrl);

router.route("/momo_return").get(paymentController.receiveMomoResult);

router.route("/vnpay_test").get((req, res) => {
   let clientId = req.session.clientId;
   return res.send({ clientId });
});

router.route("/vnpay_return").get(paymentController.receivePaymentResult);

router.route("/vnpay_refund").post(paymentController.refundPayment);

router.route("/revenue").get(paymentController.getRevenue);
router.route("/deposit").get(paymentController.getDeposit);
module.exports = router;
