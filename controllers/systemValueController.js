const { Model } = require("sequelize");
const db = require("../models");
const SystemValue = db.systemValues;

const getCommissionFee = async (req, res) => {
   try {
      let systemValues = await SystemValue.findOne({
         where: { name: "commissionFee" },
      });
      res.status(200).send(systemValues);
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

const updateCommissionFee = async (req, res) => {
   try {
      let systemValues = await SystemValue.update(req.body.commissionFee, {
         where: { name: "commissionFee" },
      });
      res.status(200).send({ message: "Đã cập nhật phí hoa hồng" });
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

module.exports = {
   getCommissionFee,
   updateCommissionFee,
};
