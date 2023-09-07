module.exports = (sequelize, DataTypes) => {
   const Skill = sequelize.define("skill", {
      name: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      description: {
         type: DataTypes.STRING,
         allowNull: true,
      },
   });

   return Skill;
};
