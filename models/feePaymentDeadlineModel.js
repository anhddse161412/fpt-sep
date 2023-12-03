module.exports = (sequelize, DataTypes) => {
   const FeePaymentDeadline = sequelize.define("feepaymentdeadline", {
      name: {
         type: DataTypes.STRING(100),
         allowNull: false,
      },
      paymentDeadline: {
         type: DataTypes.DATE,
         allowNull: true,
      },
      status: {
         type: DataTypes.STRING(10),
         allowNull: false,
      },
   });

   return FeePaymentDeadline;
};
