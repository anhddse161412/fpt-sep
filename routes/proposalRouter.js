// import controllers review, products
const proposalController = require("../controllers/proposalController");

// router
const router = require("express").Router();
// router.post("/create", proposalController.createProposal);

router
   .route("/")
   .get(proposalController.getAllProposal)
   .post(proposalController.createProposal);

router.route("/approve/:proposalId").put(proposalController.approveProposal);
router.route("/decline/:proposalId").put(proposalController.declineProposal);
router.route("/interview/:proposalId").put(proposalController.interviewProposal)

router
   .route("/detail/:proposalId")
   .get(proposalController.getProposalById)
   .put(proposalController.updateProposal);

router.route("/job/:jobId").get(proposalController.getProposalByJobId);
router
   .route("/freelancer/:freelancerId")
   .get(proposalController.getProposalByFreelancerId);
router.route("/client/:clientId").get(proposalController.getProposalByClientId);

module.exports = router;
