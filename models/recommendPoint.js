module.exports = (sequelize, DataTypes) => {
   const RecommendPoint = sequelize.define("recommendPoint", {
      point: {
         type: DataTypes.INTEGER,
         allowNull: true,
         defaultValue: 0,
      },
      type: {
         type: DataTypes.STRING,
         allowNull: true,
         defaultValue: "forFreelancers"
      }
   });

   return RecommendPoint;
};
