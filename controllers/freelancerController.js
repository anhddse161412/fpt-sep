const db = require("../models");

// image Upload

// create main Model
const Account = db.accounts;
const Job = db.jobs;
const Freelancer = db.freelancers;
const Client = db.clients;
const Favorite = db.favorite;
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
         ],
         where: { id: req.params.freelancerId },
      });
      res.status(200).send(freelancer);
   } catch (error) {
      console.log(error);
   }
};

const updateFreelancerAccount = async (req, res) => {
   try {
      let freelancer = await Account.update(req.body, {
         include: [
            {
               model: Account,
               as: "accounts",
            },
         ],
         where: { id: req.params.freelancerId },
      });
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
