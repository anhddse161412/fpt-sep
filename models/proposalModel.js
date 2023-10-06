module.exports = (sequelize, DataTypes) => {
   const Proposal = sequelize.define("proposal", {
      description: {
         type: DataTypes.TEXT,
         allowNull: true,
      },
      fileAttach: {
         type: DataTypes.STRING,
         allowNull: true,
      },
      sendDate: {
         type: DataTypes.STRING,
      },
      status: {
         type: DataTypes.STRING,
         allowNull: false,
      },
   });

   return Proposal;
};
