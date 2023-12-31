const { checkToken } = require("../auth/token_validation");

// import controllers review, products
const accountController = require("../controllers/accountController");
require("../auth/auth");
// router
const router = require("express").Router();

// login google passport
// const passport = require("passport");

// use routers
// router.post("/create", accountController.createAccount);
router.post("/register", accountController.register);
router.route("/register/confirm").post(accountController.confirmRegister);
router.route("/login").post(accountController.login);
router
   .route("/")
   .get(checkToken, accountController.getAllAccount)
   .post(accountController.searchAccountAndJob);

// router google login
// router.get(
//    "/auth/google",
//    passport.authenticate("google", {
//       scope: ["email", "profile"],
//    })
// );

// router.get(
//    "/auth/google/callback",
//    passport.authenticate("google", {
//       successRedirect: "/accounts/auth/protected",
//       failureRedirect: "/accounts/auth/google/failure",
//    })
// );

// router.get("/auth/google/failure", (req, res) => {
//    res.send("Something went wrong!");
// });

// router.get(
//    "/auth/protected",
//    accountController.isLoggedIn,
//    accountController.loginGoogle
// );

router.get("/auth/logout", (req, res) => {
   console.log(req.session);
   req.session.destroy();
   res.send("See you again!");
});

router.route("/google/login").post(accountController.loginGoogle);

// router with params
router
   .route("/favorite/:accountId")
   .get(accountController.getFavoriteJobOfAccount);

router
   .route("/profile/:accountId")
   .get(accountController.getAccountById)
   .put(accountController.updateAccount)
   .delete(accountController.deactiveAccount);

router
   .route("/active/:accountId").put(accountController.activeAccount);

router.route("/job/:accountId").get(accountController.getAccountWithJobId);

router.route("/forgot_password").post(accountController.forgorPassword);
router.route("/reset_password").post(accountController.resetPassword);

router.route("/verify").post(accountController.verifyEmailOtp);

router.route("/password/:accountId").put(accountController.changePassword);

module.exports = router;
