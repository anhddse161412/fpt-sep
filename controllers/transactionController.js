const e = require("express");
const { Model } = require("sequelize");
const db = require("../models");
const Transaction = db.transactions;

const createTransaction = async (req, res) => {
   try {
   } catch (error) {
      console.error(error);
   }
};

const getAllTransaction = async (req, res) => {
   try {
      let transaction = await Transaction.findAll({});
      res.status(200).send(transaction);
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const getTransactionByClientId = async (req, res) => {
   try {
      let transaction = await Transaction.findAll({
         where: { clientId: req.body.clientId },
      });
      res.status(200).send(transaction);
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

module.exports = {
   getAllTransaction,
   getTransactionByClientId,
};
