module.exports = (sequelize, DataTypes) => {
   const Job = sequelize.define("job", {
      title: {
         type: DataTypes.STRING,
      },
      description: {
         type: DataTypes.TEXT,
         allowNull: false,
      },
      fileAttachment: {
         type: DataTypes.STRING,
         allowNull: true,
      },
      proposalSubmitDeadline: {
         type: DataTypes.DATE,
         allowNull: true,
      },
      lowestIncome: {
         type: DataTypes.STRING,
         allowNull: true,
      },
      highestIncome: {
         type: DataTypes.STRING,
         allowNull: true,
      },
      applied: {
         type: DataTypes.STRING,
         allowNull: true,
      },
      status: {
         type: DataTypes.STRING(10),
         allowNull: true,
      },
   });

   return Job;
};
