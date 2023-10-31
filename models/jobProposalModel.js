module.exports = (sequelize, DataTypes) => {
   const JobApplication = sequelize.define("jobapplication", {
      jobApplicationId: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
   });

   return JobApplication;
};
