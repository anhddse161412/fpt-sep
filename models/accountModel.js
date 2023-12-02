module.exports = (sequelize, DataTypes) => {
   const Account = sequelize.define("account", {
      name: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      phone: {
         type: DataTypes.STRING(11),
      },
      email: {
         type: DataTypes.STRING(50),
         allowNull: false,
      },
      address: {
         type: DataTypes.STRING,
      },
      image: {
         type: DataTypes.STRING,
      },
      password: {
         type: DataTypes.STRING(100),
         allowNull: false,
      },
      role: {
         type: DataTypes.STRING(15),
         allowNull: false,
      },
      status: {
         type: DataTypes.BOOLEAN,
         allowNull: false,
      },
   });

   return Account;
};
