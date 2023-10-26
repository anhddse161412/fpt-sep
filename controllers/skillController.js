const { Model } = require("sequelize");
const db = require("../models");
const Skill = db.skills;
const getAllSkill = async (req, res) => {
   try {
      let skills = await Skill.findAll({});
      res.status(200).send(skills);
   } catch (error) {
      console.log(error);
      res.status(500).send(`Lỗi server: ${error}`);
   }
};

module.exports = {
   getAllSkill,
};
