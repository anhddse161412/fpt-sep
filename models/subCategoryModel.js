module.exports = (sequelize, DataTypes) => {
   const SubCategory = sequelize.define("subcategory", {
      name: {
         type: DataTypes.STRING(100),
      },
      description: {
         type: DataTypes.STRING(100),
         allowNull: false,
      },
   });

   return SubCategory;
};
