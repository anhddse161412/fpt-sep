module.exports = (sequelize, DataTypes) => {
   const JobSkill = sequelize.define("jobskill", {
      jobSkillId: {
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

   return JobSkill;
};
