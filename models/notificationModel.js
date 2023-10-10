module.exports = (sequelize, DataTypes) => {
   const Notification = sequelize.define("notification", {
      name: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      description: {
         type: DataTypes.STRING,
         allowNull: true,
      },
      status: {
         type: DataTypes.STRING,
         allowNull: false,
      },
   });

   return Notification;
};
