module.exports = (sequelize, DataTypes) => {
   const FeePaymentDeadline = sequelize.define("feepaymentdeadline", {
      name: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      paymentDeadline: {
         type: DataTypes.DATE,
         allowNull: true,
      },
      status: {
         type: DataTypes.STRING,
         allowNull: false,
      },
   });

   return FeePaymentDeadline;
};
