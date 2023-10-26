const db = require("../models");

// image Upload

// create main Model
const Account = db.accounts;

const Client = db.clients;
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
      res.status(500).send(`Lỗi server: ${error}`);
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
         where: { accountId: req.params.accountId },
      });
      res.status(200).send(client);
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

const updateClientAccount = async (req, res) => {
   try {
      let client = await Client.update(req.body, {
         where: { accountId: req.params.accountId },
      });
      let account = await Account.update(req.body.account, {
         where: { id: req.params.accountId }
      })
      res.status(200).send(client);
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

module.exports = {
   getAllClient,
   getClientById,
   updateClientAccount,
};
