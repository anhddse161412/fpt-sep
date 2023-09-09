// import controllers review, products
const proposalController = require("../controllers/proposalController");

// router
const router = require("express").Router();
router.post("/create", proposalController.createProposal);

router.route("/").get(proposalController.getAllProposal);

router.route("/approve/:proposalId").post(proposalController.approveProposal);
router.route("/decline/:proposalId").post(proposalController.declineProposal);
router
   .route("/detail/:proposalId")
   .get(proposalController.getProposalById)
   .post(proposalController.updateProposal);

module.exports = router;
