module.exports = (sequelize, DataTypes) => {
   const Transaction = sequelize.define("transaction", {
      transactionId: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
      description: {
         type: DataTypes.TEXT,
         allowNull: false,
      },
      status: {
         type: DataTypes.STRING(100),
         allowNull: false,
      },
   });

   return Transaction;
};
