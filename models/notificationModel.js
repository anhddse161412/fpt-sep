module.exports = (sequelize, DataTypes) => {
   const Notification = sequelize.define("notification", {
      name: {
         type: DataTypes.STRING(100),
         allowNull: false,
      },
      description: {
         type: DataTypes.STRING,
         allowNull: true,
      },
      status: {
         type: DataTypes.STRING(10),
         allowNull: false,
      },
   });

   return Notification;
};
