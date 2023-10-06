const paymentController = require("../controllers/paymentController");

// router
const router = require("express").Router();

// use routers

router.route("/vnpay").post(paymentController.createVnpayUrl);
router.route("/vnpay_test").get((req, res) => {
   let clientId = req.session.clientId;
   return res.send({ clientId });
});
router.route("/vnpay_return").get(paymentController.vnpayReturn);
module.exports = router;