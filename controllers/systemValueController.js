const { Model } = require("sequelize");
const db = require("../models");
const SystemValue = db.systemValues;

const getCommissionFee = async (req, res) => {
   try {
      let systemValues = await SystemValue.findAll({});
      res.status(200).send(systemValues);
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

const updateCommissionFee = async (req, res) => {
   try {
      let systemValues = await SystemValue.update(req.body, {
         where: { name: req.body.feeName },
      });
      res.status(200).send({ message: "Đã cập nhật phí hoa hồng" });
   } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.toString() });
   }
};

module.exports = {
   getCommissionFee,
   updateCommissionFee,
};
