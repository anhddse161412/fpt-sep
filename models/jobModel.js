module.exports = (sequelize, DataTypes) => {
   const Job = sequelize.define("job", {
      title: {
         type: DataTypes.STRING,
      },
      description: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      fileAttachment: {
         type: DataTypes.STRING,
         allowNull: true,
      },
      proposalSubmitDeadline: {
         type: DataTypes.STRING,
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
      skillSets: {
         type: DataTypes.STRING,
         allowNull: true,
      },
      applied: {
         type: DataTypes.STRING,
         allowNull: true,
      },
      favorite: {
         type: DataTypes.BOOLEAN,
         allowNull: true,
      },
      status: {
         type: DataTypes.BOOLEAN,
         allowNull: true,
      },
   });

   return Job;
};
