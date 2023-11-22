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
         type: DataTypes.STRING(50),
         allowNull: false,
      },
   });

   return FeePaymentDeadline;
};
