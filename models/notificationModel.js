module.exports = (sequelize, DataTypes) => {
   const Notification = sequelize.define("notification", {
      name: {
         type: DataTypes.STRING(100),
         allowNull: false,
      },
      description: {
         type: DataTypes.STRING(100),
         allowNull: true,
      },
      status: {
         type: DataTypes.STRING(100),
         allowNull: false,
      },
   });

   return Notification;
};
