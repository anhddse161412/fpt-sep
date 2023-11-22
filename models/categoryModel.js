module.exports = (sequelize, DataTypes) => {
   const Category = sequelize.define("category", {
      name: {
         type: DataTypes.STRING(100),
      },
      description: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      parentId: {
         type: DataTypes.INTEGER,
      },
   });

   return Category;
};
