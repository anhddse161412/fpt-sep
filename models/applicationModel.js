module.exports = (sequelize, DataTypes) => {
   const Application = sequelize.define("application", {
      description: {
         type: DataTypes.TEXT,
         allowNull: true,
      },
      fileAttach: {
         type: DataTypes.STRING,
         allowNull: true,
      },
      sendDate: {
         type: DataTypes.DATE,
      },
      status: {
         type: DataTypes.STRING(10),
         allowNull: false,
      },
   });

   return Application;
};
