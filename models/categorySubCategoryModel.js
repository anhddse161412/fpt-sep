module.exports = (sequelize, DataTypes) => {
   const CategorySubCategory = sequelize.define("categorysubcategory", {
      categorySubCategoryId: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
   });
   return CategorySubCategory;
};
