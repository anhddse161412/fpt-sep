module.exports = (sequelize, DataTypes) => {
   const JobSubcategory = sequelize.define("jobsubcategory", {
      jobSubcategoryId: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
   });

   return JobSubcategory;
};
