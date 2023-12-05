const db = require("../models");

// image Upload

// create main Model
const Account = db.accounts;

const Client = db.clients;
const SystemValue = db.systemValues;
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
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const getClientById = async (req, res) => {
   try {
      let client = await Client.findOne({
         include: [
            {
               model: Account,
               as: "accounts",
               attributes: { exclude: ["createdAt", "updatedAt"] },
            },
         ],
         attributes: { exclude: ["createdAt", "updatedAt"] },
         where: { accountId: req.params.accountId },
      });
      res.status(200).send(client);
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const updateClientAccount = async (req, res) => {
   try {
      let client = await Client.update(req.body, {
         where: { accountId: req.params.accountId },
      });
      let account = await Account.update(req.body.account, {
         where: { id: req.params.accountId },
      });
      res.status(200).send(client);
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const getClientByName = async (req, res) => {
   try {
      let client = await Client.findOne({
         include: [
            {
               model: Account,
               as: "accounts",
               where: {
                  status: true,
                  name: {
                     [db.Op.like]: `%${req.params.clientName}%`,
                  },
               },
               attributes: { exclude: ["createdAt", "updatedAt"] },
            },
         ],
         attributes: { exclude: ["createdAt", "updatedAt"] },
      });
      res.status(200).send(client);
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const checkCurrency = async (req, res) => {
   try {
      let { clientId, feeName } = req.body;
      let systemValue = await SystemValue.findOne({
         where: { name: feeName },
      });
      let feeValue = systemValue.value;
      let client = await Client.findOne({
         where: { id: clientId },
         include: [
            {
               model: Account,
               as: "accounts",
            },
         ],
      }).then((result) => {
         if (parseInt(result.currency) >= feeValue) {
            res.status(200).send({
               status: true,
               message: "Tài khoàn đủ số dư để thanh toán",
            });
         } else {
            res.status(200).send({
               status: false,
               message: "Tài khoàn không đủ số dư để thanh toán",
            });
         }
      });
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

module.exports = {
   getAllClient,
   getClientById,
   updateClientAccount,
   getClientByName,
   checkCurrency,
};
