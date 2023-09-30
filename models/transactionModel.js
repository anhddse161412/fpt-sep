module.exports = (sequelize, DataTypes) => {
   const Transaction = sequelize.define("transaction", {
      transactionId: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
      status: {
         type: DataTypes.STRING,
         allowNull: false,
      },
   });

   return Transaction;
};
