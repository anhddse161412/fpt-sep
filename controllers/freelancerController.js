const db = require("../models");

// image Upload

// create main Model
const Account = db.accounts;
const Freelancer = db.freelancers;
const Skill = db.skills
const Certificate = db.certificates
// main work

// 1. register account

// 2. get all account
const getAllFreelancer = async (req, res) => {
   try {
      let freelancers = await Freelancer.findAll({
         include: [
            {
               model: Account,
               as: "accounts",
            },
         ],
      });
      res.status(200).send(freelancers);
   } catch (error) {
      console.log(error);
   }
};

const getFreelancerById = async (req, res) => {
   try {
      let freelancer = await Freelancer.findOne({
         include: [
            {
               model: Account,
               as: "accounts",
            },
            {
               model: Skill,
               as: "skills",
            },
            {
               model: Certificate,
               as: "certificates"
            }
         ],
         where: { accountId: req.params.accountId },
      });
      res.status(200).send(freelancer);
   } catch (error) {
      console.log(error);
   }
};

const updateFreelancerAccount = async (req, res) => {
   try {
      let freelancer = await Freelancer.update(req.body, {
         where: { accountId: req.params.accountId },
      });
      let account = await Account.update(req.body.account, {
         where: { id: req.params.accountId }
      })
      res.status(200).send(freelancer);
   } catch (error) {
      console.log(error);
   }
};

module.exports = {
   getAllFreelancer,
   getFreelancerById,
   updateFreelancerAccount,
};
