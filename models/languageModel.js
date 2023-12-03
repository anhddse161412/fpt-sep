module.exports = (sequelize, DataTypes) => {
   const Language = sequelize.define("language", {
      name: {
         type: DataTypes.STRING(50),
         allowNull: true,
      },
      level: {
         type: DataTypes.STRING(20),
         allowNull: true,
      },
   });

   return Language;
};
