const db = require("../models");

// image Upload

// create main Model
const Account = db.accounts;
const Proposal = db.proposals;
const Freelancer = db.freelancers;
const Job = db.jobs;
// main work

// 1. create proposal
const createProposal = async (req, res) => {
   try {
      let info = {
         fileAttach: req.body.fileAttach,
         description: req.body.description,
         sendDate: req.body.sendDate,
         freelancerId: req.body.freelancerId,
         jobId: req.body.jobId,
         status: req.body.status ? req.body.status : "Sent",
      };
      const job = await Job.findOne({
         where: { id: req.body.jobId },
      });

      const proposal = await Proposal.create(info);
      job.setProposals(proposal);
      let proposalCounter = await job.countProposals();
      job.setDataValue("applied", proposalCounter.toString());
      job.save();

      res.status(200).json({ messsage: "Tạo proposal thành công" });
   } catch (error) {
      console.log(error);
   }
};
// 2. get all proposal
const getAllProposal = async (req, res) => {
   try {
      let propsals = await Proposal.findAndCountAll({
         include: [
            {
               model: Freelancer,
               as: "freelancers",

               include: [
                  {
                     model: Account,
                     as: "accounts",
                     attributes: ["name", "image"],
                  },
               ],
               attributes: ["id"],
            },
         ],
      });
      res.status(200).send(propsals);
   } catch (error) {
      console.log(error);
   }
};

const getProposalById = async (req, res) => {
   try {
      let proposal = await Proposal.findOne({
         include: [
            {
               model: Freelancer,
               as: "freelancers",

               include: [
                  {
                     model: Account,
                     as: "accounts",
                     attributes: ["name", "image"],
                  },
               ],
               attributes: ["id"],
            },
         ],
         where: { id: req.params.proposalId },
      });
      res.status(200).send(proposal);
   } catch (error) {
      console.log(error);
   }
};

const updateProposal = async (req, res) => {
   try {
      let proposal = await Proposal.update(req.body, {
         include: [
            {
               model: Freelancer,
               as: "freelancers",

               include: [
                  {
                     model: Account,
                     as: "accounts",
                     attributes: ["name", "image"],
                  },
               ],
               attributes: ["id"],
            },
         ],
         where: { id: req.params.proposalId },
      });
      res.status(200).send(proposal);
   } catch (error) {
      console.log(error);
   }
};

const getProposalByJobId = async (req, res) => {
   try {
      let proposal = await Proposal.findAll({
         include: [
            {
               model: Freelancer,
               as: "freelancers",

               include: [
                  {
                     model: Account,
                     as: "accounts",
                     attributes: ["name", "image"],
                  },
               ],
               attributes: ["id"],
            },
         ],
         where: { jobId: req.params.jobId },
      });
      res.status(200).send(proposal);
   } catch (error) {
      console.log(error);
   }
};

// approve proposal
const approveProposal = async (req, res) => {
   try {
      let proposal = await Proposal.findOne({
         include: [
            {
               model: Freelancer,
               as: "freelancers",

               include: [
                  {
                     model: Account,
                     as: "accounts",
                     attributes: ["name", "image"],
                  },
               ],
               attributes: ["id"],
            },
         ],
         where: { id: req.params.proposalId },
      });
      proposal.setDataValue("status", "approved");
      proposal.save();
      res.status(200).send(proposal);
   } catch (error) {
      console.log(error);
   }
};

// decline propsal
const declineProposal = async (req, res) => {
   try {
      let proposal = await Proposal.findOne({
         include: [
            {
               model: Freelancer,
               as: "freelancers",

               include: [
                  {
                     model: Account,
                     as: "accounts",
                     attributes: ["name", "image"],
                  },
               ],
               attributes: ["id"],
            },
         ],
         where: { id: req.params.proposalId },
      });
      proposal.setDataValue("status", "declined");
      proposal.save();
      res.status(200).send(proposal);
   } catch (error) {
      console.log(error);
   }
};

module.exports = {
   createProposal,
   getAllProposal,
   getProposalById,
   updateProposal,
   approveProposal,
   declineProposal,
   getProposalByJobId,
};
