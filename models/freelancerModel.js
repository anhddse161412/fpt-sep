module.exports = (sequelize, DataTypes) => {
   const Freelancer = sequelize.define("freelancer", {
      status: {
         type: DataTypes.BOOLEAN,
         allowNull: false,
      },
      cvFile: {
         type: DataTypes.STRING,
         allowNull: true,
      },
      hoursPerWeek: {
         type: DataTypes.STRING,
         allowNull: true,
      },
      languages: {
         type: DataTypes.STRING,
         allowNull: true,
      },
      introduction: {
         type: DataTypes.STRING(5000),
         allowNull: true,
      },
      major: {
         type: DataTypes.STRING,
         allowNull: true,
      },
      title: {
         type: DataTypes.STRING,
         allowNull: true,
      },
   });

   return Freelancer;
};
