module.exports = (sequelize, DataTypes) => {
   const Account = sequelize.define("account", {
      name: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      phone: {
         type: DataTypes.STRING,
      },
      email: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      address: {
         type: DataTypes.STRING,
      },
      image: {
         type: DataTypes.STRING,
      },
      password: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      role: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      status: {
         type: DataTypes.BOOLEAN,
         allowNull: false,
      },
   });

   return Account;
};
