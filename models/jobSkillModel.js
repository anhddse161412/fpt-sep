module.exports = (sequelize, DataTypes) => {
   const JobSkill = sequelize.define("jobskill", {
      jobSubcategoryId: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
   });

   return JobSkill;
};
