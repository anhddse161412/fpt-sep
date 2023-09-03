module.exports = (sequelize, DataTypes) => {
   const Proposal = sequelize.define("proposal", {
      description: {
         type: DataTypes.STRING,
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
         type: DataTypes.BOOLEAN,
         allowNull: false,
      },
   });

   return Proposal;
};
