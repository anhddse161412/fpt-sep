const { checkToken } = require("../auth/token_validation");

// import controllers review, products
const accountController = require("../controllers/accountController");
require("../auth/auth");
// router
const router = require("express").Router();

// login google passport
const passport = require("passport");

// use routers
// router.post("/create", accountController.createAccount);
router.post("/register", accountController.register);
router.route("/login").post(accountController.login);
router.route("/").get(checkToken, accountController.getAllAccount);

// router google login
router.get(
   "/auth/google",
   passport.authenticate("google", {
      scope: ["email", "profile"],
   })
);

router.get(
   "/auth/google/callback",
   passport.authenticate("google", {
      successRedirect: "/accounts/auth/protected",
      failureRedirect: "/accounts/auth/google/failure",
   })
);

router.get("/auth/google/failure", (req, res) => {
   res.send("Something went wrong!");
});

router.get(
   "/auth/protected",
   accountController.isLoggedIn,
   accountController.loginGoogle
);

router.get("/auth/logout", (req, res) => {
   console.log(req.session);
   req.session.destroy();
   res.send("See you again!");
});

// router with params
router
   .route("/favorite/:accountId")
   .get(accountController.getFavoriteJobOfAccount);

router
   .route("/profile/:accountId")
   .get(accountController.getAccountById)
   .post(accountController.updateAccount);

router.route("/job/:accountId").get(accountController.getAccountWithJobId);
module.exports = router;
