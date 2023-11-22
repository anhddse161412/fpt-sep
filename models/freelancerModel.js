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
         type: DataTypes.STRING(100),
         allowNull: true,
      },
      introduction: {
         type: DataTypes.TEXT,
         allowNull: true,
      },
      major: {
         type: DataTypes.STRING(100),
         allowNull: true,
      },
      title: {
         type: DataTypes.STRING(100),
         allowNull: true,
      },
   });

   return Freelancer;
};
