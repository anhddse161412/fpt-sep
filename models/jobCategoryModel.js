module.exports = (sequelize, DataTypes) => {
   const JobSubcategory = sequelize.define("jobcategory", {
      jobCategoryId: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
   });

   return JobSubcategory;
};
