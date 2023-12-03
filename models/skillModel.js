module.exports = (sequelize, DataTypes) => {
   const Skill = sequelize.define("skill", {
      name: {
         type: DataTypes.STRING(50),
         allowNull: false,
      },
      description: {
         type: DataTypes.STRING(100),
         allowNull: true,
      },
   });

   return Skill;
};
