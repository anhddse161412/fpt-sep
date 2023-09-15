module.exports = (sequelize, DataTypes) => {
   const FreelancerSkill = sequelize.define("freelancerskill", {
      freelancerSkillId: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
   });

   return FreelancerSkill;
};
