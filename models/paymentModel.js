module.exports = (sequelize, DataTypes) => {
   const Payment = sequelize.define("payment", {
      name: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      description: {
         type: DataTypes.TEXT,
         allowNull: false,
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
