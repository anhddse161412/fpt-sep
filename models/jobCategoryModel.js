module.exports = (sequelize, DataTypes) => {
   const JobCategory = sequelize.define("jobcategory", {
      jobCategoryId: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
   });

   return JobCategory;
};
