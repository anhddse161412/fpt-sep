module.exports = (sequelize, DataTypes) => {
   const RecommendPoint = sequelize.define("recommendPoint", {
      point: {
         type: DataTypes.FLOAT,
         allowNull: true,
         defaultValue: 0,
      },
      type: {
         type: DataTypes.STRING(20),
         allowNull: true,
         defaultValue: "forFreelancers",
      },
   });

   return RecommendPoint;
};
