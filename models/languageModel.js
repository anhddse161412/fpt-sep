module.exports = (sequelize, DataTypes) => {
   const Language = sequelize.define("language", {
      name: {
         type: DataTypes.STRING(100),
         allowNull: true,
      },
      level: {
         type: DataTypes.STRING(100),
         allowNull: true,
      },
   });

   return Language;
};
