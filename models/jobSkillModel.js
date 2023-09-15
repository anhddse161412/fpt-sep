module.exports = (sequelize, DataTypes) => {
   const JobSkill = sequelize.define("jobskill", {
      jobSkillId: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
   });

   return JobSkill;
};
