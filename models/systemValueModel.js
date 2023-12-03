module.exports = (sequelize, DataTypes) => {
   const SystemValue = sequelize.define("systemvalue", {
      name: {
         type: DataTypes.STRING(50),
         allowNull: false,
      },
      value: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
   });

   return SystemValue;
};
