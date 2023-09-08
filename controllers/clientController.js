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
const getAllClient = async (req, res) => {
   try {
      let clients = await Client.findAll({
         include: [
            {
               model: Account,
               as: "accounts",
            },
         ],
      });
      res.status(200).send(clients);
   } catch (error) {
      console.log(error);
   }
};

const getClientById = async (req, res) => {
   try {
      let client = await Client.findOne({
         include: [
            {
               model: Account,
               as: "accounts",
            },
         ],
         where: { id: req.params.clientId },
      });
      res.status(200).send(client);
   } catch (error) {
      console.log(error);
   }
};

const updateClientAccount = async (req, res) => {
   try {
      let client = await Client.update(req.body, {
         include: [
            {
               model: Account,
               as: "accounts",
            },
         ],
         where: { id: req.params.clientId },
      });
      res.status(200).send(client);
   } catch (error) {
      console.log(error);
   }
};

module.exports = {
   getAllClient,
   getClientById,
   updateClientAccount,
};
