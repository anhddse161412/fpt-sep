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
      applicationSubmitDeadline: {
         type: DataTypes.DATE,
         allowNull: true,
      },
      lowestIncome: {
         type: DataTypes.STRING(10),
         allowNull: true,
      },
      highestIncome: {
         type: DataTypes.STRING(10),
         allowNull: true,
      },
      applied: {
         type: DataTypes.STRING(5),
         allowNull: true,
         default: "0",
      },
      status: {
         type: DataTypes.STRING(10),
         allowNull: true,
      },
   });

   return Job;
};
