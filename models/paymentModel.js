module.exports = (sequelize, DataTypes) => {
   const Payment = sequelize.define("payment", {
      name: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      description: {
         type: DataTypes.STRING,
         allowNull: true,
      },
      amount: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      type: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      status: {
         type: DataTypes.STRING,
         allowNull: false,
      },
   });

   return Payment;
};
