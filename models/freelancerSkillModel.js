module.exports = (sequelize, DataTypes) => {
   const FreelancerSkill = sequelize.define("freelancerskill", {
      freelancerSkillId: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
      level: {
         type: DataTypes.STRING(20),
         allowNull: false,
         defaultValue: "Cơ bản",
      },
   });

   return FreelancerSkill;
};
