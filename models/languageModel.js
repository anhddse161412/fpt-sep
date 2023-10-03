module.exports = (sequelize, DataTypes) => {
   const Language = sequelize.define("language", {
      name: {
         type: DataTypes.STRING,
         allowNull: true,
      },
      level: {
         type: DataTypes.STRING,
         allowNull: true,
      },
   });

   return Language;
};