module.exports = (sequelize, DataTypes) => {
   const JobSubcategory = sequelize.define("jobsubcategory", {
      jobSubCategoryId: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
   });

   return JobSubcategory;
};
