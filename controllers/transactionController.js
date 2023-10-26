const e = require("express");
const { Model } = require("sequelize");
const db = require("../models");
const Transaction = db.transactions;

const createTransaction = async (req, res) => {
   try {
   } catch (error) {
      console.log(error);
   }
};

const getAllTransaction = async (req, res) => {
   try {
      let transaction = await Transaction.findAll({});
      res.status(200).send(transaction);
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

const getTransactionByClientId = async (req, res) => {
   try {
      let transaction = await Transaction.findAll({
         where: { clientId: req.body.clientId },
      });
      res.status(200).send(transaction);
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

module.exports = {
   getAllTransaction,
   getTransactionByClientId,
};
