module.exports = (sequelize, DataTypes) => {
   const RecommendPoint = sequelize.define("recommendPoint", {
      point: {
         type: DataTypes.INTEGER,
         allowNull: true,
      },
   });

   return RecommendPoint;
};
