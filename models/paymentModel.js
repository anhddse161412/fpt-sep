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
         type: DataTypes.STRING(1),
         allowNull: false,
      },
      status: {
         type: DataTypes.STRING(5),
         allowNull: false,
      },
      orderId: {
         type: DataTypes.STRING,
      },
      transDate: {
         type: DataTypes.STRING,
      },
      transType: {
         type: DataTypes.STRING,
      },
   });

   return Payment;
};
